/*
 * This file now includes a new route to fetch products by category.
 */
const router = require('express').Router();
const auth = require('../middleware/auth');
let Product = require('../models/product.model');

// --- GET All Products ---
router.route('/').get((req, res) => {
  Product.find()
    .then(products => res.json(products))
    .catch(err => res.status(400).json({ msg: 'Error: ' + err.message }));
});

// --- GET Products by Category --- (NEW)
// Handles GET requests like http://localhost:5000/api/products/category/Fertilizer
router.route('/category/:categoryName').get((req, res) => {
    const categoryName = req.params.categoryName;
    // Use a case-insensitive regex to find matching categories
    Product.find({ category: { $regex: new RegExp(`^${categoryName}$`, 'i') } })
        .then(products => res.json(products))
        .catch(err => res.status(400).json({ msg: 'Error: ' + err.message }));
});


// --- GET Single Product by ID ---
router.route('/:id').get((req, res) => {
  Product.findById(req.params.id)
    .populate('seller', 'name city')
    .then(product => {
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    })
    .catch(err => res.status(400).json({ msg: 'Error: ' + err.message }));
});

// --- ADD a New Product ---
router.route('/add').post(auth, (req, res) => {
  const { name, description, price, costPrice, category, imageUrl, stock } = req.body;
  const sellerId = req.user; 
  if (!name || !description || !price || !costPrice || !category || !stock) {
    return res.status(400).json({ msg: 'Please enter all required fields.' });
  }
  const newProduct = new Product({ name, description, price: Number(price), costPrice: Number(costPrice), category, seller: sellerId, imageUrl, stock: Number(stock) });
  newProduct.save()
    .then(() => res.json({ msg: 'Product added successfully!' }))
    .catch(err => res.status(400).json({ msg: 'Error: ' + err.message }));
});

// --- UPDATE a Product by ID ---
router.route('/update/:id').put(auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) { return res.status(404).json({ msg: 'Error: Product not found' }); }
        if (product.seller.toString() !== req.user) { return res.status(401).json({ msg: 'Authorization denied.' }); }
        const { name, description, price, costPrice, category, imageUrl, stock } = req.body;
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.costPrice = costPrice || product.costPrice;
        product.category = category || product.category;
        product.imageUrl = imageUrl;
        product.stock = stock || product.stock;
        const updatedProduct = await product.save();
        res.json({ msg: 'Product updated!', product: updatedProduct });
    } catch (err) {
        res.status(400).json({ msg: 'Error: ' + err.message });
    }
});

// --- DELETE a Product by ID ---
router.route('/:id').delete(auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) { return res.status(404).json({ msg: 'Error: Product not found' }); }
        if (product.seller.toString() !== req.user) { return res.status(401).json({ msg: 'Authorization denied.' }); }
        await product.remove();
        res.json({ msg: 'Product deleted.' });
    } catch (err) {
        res.status(400).json({ msg: 'Error: ' + err.message });
    }
});

module.exports = router;
