/*
 * This new file defines all API endpoints related to the shopping cart.
 * Notice that every route uses the 'auth' middleware first.
 */
const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// --- Get User's Cart ---
// Handles GET requests to http://localhost:5000/api/cart/
// This will return the cart items for the logged-in user.
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).populate('cart.product');
        if (!user) return res.status(404).json({ msg: "User not found." });
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Add Item to Cart ---
// Handles POST requests to http://localhost:5000/api/cart/add
router.post("/add", auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const user = await User.findById(req.user);
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ msg: "Product not found." });

        const itemIndex = user.cart.findIndex(p => p.product.toString() === productId);

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            user.cart[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            user.cart.push({ product: productId, quantity });
        }
        
        await user.save();
        res.json({ msg: "Item added to cart.", cart: user.cart });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Remove Item from Cart ---
// Handles DELETE requests to http://localhost:5000/api/cart/remove/:productId
router.delete("/remove/:productId", auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user);

        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        
        await user.save();
        res.json({ msg: "Item removed from cart.", cart: user.cart });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
