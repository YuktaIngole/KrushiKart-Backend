/*
 * This is the complete and corrected code for the seller routes,
 * including functional registration, login, and protected data endpoints.
 */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
let Seller = require('../models/seller.model');
let Product = require('../models/product.model');
let Order = require('../models/order.model');

// --- Register a New Seller ---
router.route('/register').post(async (req, res) => {
    try {
        const { name, address, city, phone, password } = req.body;

        if (!name || !address || !city || !phone || !password) {
            return res.status(400).json({ msg: "Please enter all fields." });
        }
        if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters." });
        }

        const existingSeller = await Seller.findOne({ phone: phone });
        if (existingSeller) {
            return res.status(400).json({ msg: "A seller with this phone number already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newSeller = new Seller({
            name,
            address,
            city,
            phone,
            password: passwordHash
        });

        const savedSeller = await newSeller.save();
        res.json(savedSeller);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Login Seller ---
router.route('/login').post(async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ msg: "Please enter all fields." });
        }

        const seller = await Seller.findOne({ phone: phone });
        if (!seller) {
            return res.status(400).json({ msg: "No seller found with this phone number." });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials." });
        }

        const token = jwt.sign({ id: seller._id, type: 'seller' }, process.env.JWT_SECRET || "a_secret_key");
        
        res.json({
            token,
            seller: {
                id: seller._id,
                name: seller.name,
                city: seller.city
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Get a Seller's own products ---
router.route('/my-products').get(auth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Get orders containing the seller's products ---
router.route('/my-orders').get(auth, async (req, res) => {
    try {
        const sellerId = req.user;

        // Step 1: Find all products that belong to this seller
        const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        // Step 2: Find all orders that contain any of those product IDs
        const orders = await Order.find({ 'products.product': { $in: productIds } })
            .populate('userId', 'name city')
            .populate('products.product') // Also populate the product details
            .sort({ createdAt: -1 });

        if (!orders) {
            return res.json([]);
        }

        // Step 3: Filter each order to only show the seller's items
        const sellerSpecificOrders = orders.map(order => {
            const filteredProducts = order.products.filter(
                item => productIds.some(pId => pId.equals(item.product._id))
            );
            
            return {
                _id: order._id,
                customer: order.userId,
                status: order.status,
                createdAt: order.createdAt,
                shippingAddress: order.shippingAddress,
                products: filteredProducts,
            };
        });
        
        res.json(sellerSpecificOrders);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
