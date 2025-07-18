/*
 * This new file defines the API endpoints for user registration and login.
 */
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

// --- Register a New User ---
// Handles POST requests to http://localhost:5000/api/users/register
router.route('/register').post(async (req, res) => {
  try {
    const { name, phone, password, address, city } = req.body;

    // --- Validation ---
    if (!name || !phone || !password) {
      return res.status(400).json({ msg: "Please enter all required fields." });
    }
    if (password.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 characters long." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res.status(400).json({ msg: "An account with this phone number already exists." });
    }

    // --- Password Hashing ---
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // --- Create and Save New User ---
    const newUser = new User({
      name,
      phone,
      password: passwordHash,
      address,
      city
    });

    const savedUser = await newUser.save();
    res.json(savedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Login User ---
// Handles POST requests to http://localhost:5000/api/users/login
router.route('/login').post(async (req, res) => {
    try {
        const { phone, password } = req.body;

        // --- Validation ---
        if (!phone || !password) {
            return res.status(400).json({ msg: "Please enter all fields." });
        }

        // --- Find User ---
        const user = await User.findOne({ phone: phone });
        if (!user) {
            return res.status(400).json({ msg: "No account with this phone number has been registered." });
        }

        // --- Compare Passwords ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials." });
        }

        // --- Create JWT Token ---
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "a_secret_key");
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
