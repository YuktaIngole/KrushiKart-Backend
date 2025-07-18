/*
 * We are updating the User schema to include a 'cart'.
 * The cart will be an array of items, stored directly within the user document.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  address: { type: String, required: false, trim: true },
  city: { type: String, required: false, trim: true },
  // --- NEW ---
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 }
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
