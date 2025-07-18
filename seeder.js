/*
 * This is an expanded seeder script with a lot more realistic data
 * and more legitimate-looking image URLs for a better testing experience.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Seller = require('./models/seller.model');
const Product = require('./models/product.model');
const User = require('./models/user.model');

dotenv.config();

const connectDB = async () => {
    try {
        const connString = process.env.ATLAS_URI;
        if (!connString) {
            console.error("ERROR: ATLAS_URI not found in .env file. Please ensure the file exists and the variable is set correctly.");
            process.exit(1);
        }
        await mongoose.connect(connString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error("MongoDB Connection FAILED:", err.message);
        process.exit(1);
    }
};

const sellers = [
    { name: 'Gupta Fertilisers', address: '123, Main Bazaar', city: 'Rampur', phone: '9876543210', password: 'password123' },
    { name: 'Kisan Seva Kendra', address: '45, Mandi Road', city: 'Sitapur', phone: '9876543211', password: 'password123' },
    { name: 'Agri Junction', address: '78, NH-24', city: 'Bareilly', phone: '9876543212', password: 'password123' },
    { name: 'Haryana Beej Bhandar', address: 'Karnal Market', city: 'Karnal', phone: '9876543213', password: 'password123' }
];

const products = [
    // Fertilizers
    { name: 'IFFCO Urea (45kg Bag)', description: '46% Nitrogen fertilizer for robust plant growth.', price: 266, costPrice: 220, category: 'Fertilizer', stock: 150, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2025/2/492067835/YW/JZ/BY/43810317/hybrid-seeds-250x250.jpeg' },
    { name: 'DAP (50kg Bag)', description: 'Di-Ammonium Phosphate for strong root development.', price: 1350, costPrice: 1200, category: 'Fertilizer', stock: 80, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/7/323944824/VV/AI/FU/77240790/3f-1--250x250.jpg' },
    { name: 'Muriate of Potash (MOP) (50kg)', description: 'Improves plant immunity and fruit quality.', price: 1700, costPrice: 1550, category: 'Fertilizer', stock: 60, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/10/350124457/CJ/QH/QI/110168361/muriate-of-potash-mop-fertilizer-250x250.png' },
    { name: 'Zinc Sulphate (10kg)', description: 'Essential micronutrient for preventing zinc deficiency.', price: 450, costPrice: 400, category: 'Fertilizer', stock: 120, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2022/3/YE/RU/HB/19026124/158452344-271721534446583-1969809113806255285-n-250x250.jpg' }, 
    //Seeds
    { name: 'Pioneer Hybrid Maize P3396', description: 'High yield maize seeds for Kharif season.', price: 1250, costPrice: 1100, category: 'Seed', stock: 200, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2021/12/XC/PW/MO/26575618/seed-bag-250x250.jpg' },
    { name: 'Mahyco Paddy Seeds (1kg)', description: 'High-yielding variety for paddy cultivation.', price: 400, costPrice: 350, category: 'Seed', stock: 300, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/1/BX/ZK/HT/74599461/15kg-soyabean-seeds-bopp-packaging-bags-250x250.jpg' },
    { name: 'Syngenta Tomato Seeds', description: 'Hybrid tomato seeds for better disease resistance.', price: 350, costPrice: 300, category: 'Seed', stock: 250, imageUrl: 'https://5.imimg.com/data5/OS/OX/MY-6752838/natural-tomato-plant-250x250.jpg' },

    // Pesticides
    { name: 'Bayer Confidor Insecticide (1L)', description: 'Systemic insecticide for sucking pests.', price: 2200, costPrice: 2000, category: 'Pesticide', stock: 40, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/5/311137759/WI/FZ/LQ/158366308/bayer-confidor-insecticide-250x250.jpg' },
    { name: 'Tata Rallis Contaf Plus (1L)', description: 'Broad-spectrum fungicide for crop protection.', price: 750, costPrice: 680, category: 'Pesticide', stock: 70, imageUrl: 'https://5.imimg.com/data5/ANDROID/Default/2025/4/503213926/ZJ/VG/QK/109058602/product-jpeg-250x250.jpg' },
    { name: 'Roundup Herbicide (1L)', description: 'Non-selective herbicide for weed control.', price: 900, costPrice: 820, category: 'Pesticide', stock: 90, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/6/428404872/HQ/HS/IP/108306730/whatsapp-image-2024-06-19-at-4-16-40-pm-250x250.jpeg' },
    { name: 'Neem Oil (1L)', description: 'Organic pest control and fungicide.', price: 600, costPrice: 520, category: 'Pesticide', stock: 110, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/11/363929533/SQ/ZM/GP/12696172/azadirachtin-10000-ppm-250x250.png' },

    // Tools
    { name: 'Neptune Knapsack Sprayer (16L)', description: 'Manual sprayer for fertilizers and pesticides.', price: 1500, costPrice: 1300, category: 'Tool', stock: 30, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/12/368104633/ML/LI/YY/43271368/neptune-power-sprayer-250x250.jpg' },
    { name: 'Falcon Garden Rake', description: 'Heavy-duty soil rake with 14 teeth.', price: 350, costPrice: 300, category: 'Tool', stock: 50, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2023/7/321870412/FH/MR/NM/25036571/601e4a79b42ed800011a4a41-250x250.jpg' },
    { name: 'Tata Agrico Spade', description: 'Durable and ergonomic spade for digging.', price: 450, costPrice: 380, category: 'Tool', stock: 60, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2025/5/512155348/VN/RY/BK/13340134/driver-set-250x250.jpg' },
    { name: 'KISANKRAFT Water Pump 2HP', description: 'Petrol water pump for irrigation.', price: 8500, costPrice: 7800, category: 'Tool', stock: 10, imageUrl: 'https://5.imimg.com/data5/LJ/LY/AN/SELLER-3348135/1-hp-petrol-engine-water-pump-250x250.jpg' }
];


const importData = async () => {
    await connectDB();
    try {
        // Clear existing data
        await Product.deleteMany();
        await Seller.deleteMany();
        await User.deleteMany();

        // Hash passwords for sellers
        const salt = await bcrypt.genSalt(10);
        const sellersWithHashedPasswords = await Promise.all(sellers.map(async (seller) => {
            const hashedPassword = await bcrypt.hash(seller.password, salt);
            return { ...seller, password: hashedPassword };
        }));
        
        // Create sellers
        const createdSellers = await Seller.insertMany(sellersWithHashedPasswords);

        // Assign sellers to products in a round-robin fashion
        const productsWithSellers = products.map((product, index) => {
            return { ...product, seller: createdSellers[index % createdSellers.length]._id };
        });
        
        // Insert products
        await Product.insertMany(productsWithSellers);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    await connectDB();
    try {
        await Product.deleteMany();
        await Seller.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

