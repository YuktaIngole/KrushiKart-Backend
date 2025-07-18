/*
 * We are adding a new 'costPrice' field. This will store the price
 * at which the seller acquired the product.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // This is the selling price
  // --- NEW ---
  costPrice: { type: Number, required: true }, // This is the cost price
  category: { type: String, required: true, enum: ['Fertilizer', 'Seed', 'Pesticide', 'Tool'] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  imageUrl: { type: String, required: false },
  stock: { type: Number, required: true, default: 0 }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
