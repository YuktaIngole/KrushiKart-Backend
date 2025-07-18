/*
 * We've added the new order routes to our main server file.
 */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI || "YOUR_MONGODB_CONNECTION_STRING";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})
.on('error', (err) => {
    console.log("MongoDB connection error: ", err);
});


// --- API Routes ---
const productsRouter = require('./routes/product.routes');
const sellersRouter = require('./routes/seller.routes');
const usersRouter = require('./routes/user.routes');
const cartRouter = require('./routes/cart.routes');
// --- NEW ---
const orderRouter = require('./routes/order.routes');

app.use('/api/products', productsRouter);
app.use('/api/sellers', sellersRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);
// --- NEW ---
app.use('/api/orders', orderRouter);


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
