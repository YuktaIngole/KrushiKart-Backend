/*
 * We are adding a 'password' field to the Seller schema. This is essential
 * for creating a secure login system for our sellers.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  // --- NEW ---
  password: { type: String, required: true, minlength: 6 },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true,
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
