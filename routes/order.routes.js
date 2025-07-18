/*
 * The 'add' route now saves the correct data structure.
 * The GET route for user history now correctly populates the product details,
 * which will fix the 'NaN' bug on the frontend.
 */
const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Seller = require('../models/seller.model');

// --- Place a New Order ---
router.post('/add', auth, async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId).populate('cart.product');

        if (!user || user.cart.length === 0) {
            return res.status(400).json({ msg: "Cannot place order. Cart is empty." });
        }
        
        const totalAmount = user.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) + 50;

        const shippingAddress = req.body.shippingAddress || `${user.address}, ${user.city}`;
        if (!shippingAddress) {
             return res.status(400).json({ msg: "Shipping address is required." });
        }

        // --- FIX --- Create a new array with just the product ID and quantity
        const orderProducts = user.cart.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        }));

        const newOrder = new Order({
            userId,
            products: orderProducts, // Use the correctly structured array
            totalAmount,
            shippingAddress
        });

        const savedOrder = await newOrder.save();

        user.cart = [];
        await user.save();

        res.json({ msg: "Order placed successfully!", order: savedOrder });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Get User's Order History ---
router.get('/', auth, async (req, res) => {
    try {
        // --- FIX --- We now populate the product details within the products array.
        const orders = await Order.find({ userId: req.user })
            .populate('products.product') // This fetches all product data
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Update Order Status (for Sellers) ---
router.put('/status/:id', auth, async (req, res) => {
    try {
        const sellerId = req.user;
        const { status } = req.body;
        const orderId = req.params.id;

        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(403).json({ msg: "Authorization denied. Not a seller." });
        }

        const order = await Order.findById(orderId).populate('products.product'); // Populate to check seller
        if (!order) {
            return res.status(404).json({ msg: "Order not found." });
        }
        
        const isSellerInOrder = order.products.some(p => p.product.seller.toString() === sellerId.toString());
        if (!isSellerInOrder) {
             return res.status(403).json({ msg: "Authorization denied. Order does not contain your products." });
        }

        order.status = status;
        await order.save();
        
        res.json({ msg: "Order status updated.", order });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
