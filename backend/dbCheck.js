const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Booking = require('./models/Booking');

async function runCheck() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt');
    console.log('--- DB HEALTH CHECK ---');
    
    // 1. Check Users
    const users = await User.find({});
    console.log(`Users count: ${users.length}`);
    if (users.length > 0) {
      console.log('User roles:', users.map(u => u.role));
      
      // Check for null or invalid fields in users
      let userErrors = 0;
      users.forEach(u => {
        if (!u.phone || !u.password) {
          console.log(`Warning: User ${u._id} missing required fields.`);
          userErrors++;
        }
      });
      if (userErrors === 0) console.log('✓ All users have required fields.');
    } else {
      console.log('Warning: No users found. (Seed might not have run)');
    }

    // 2. Check Products
    const products = await Product.find({});
    console.log(`Products count: ${products.length}`);
    if (products.length > 0) {
      console.log('✓ Products collection is populated.');
    } else {
      console.log('Warning: No products found.');
    }

    // 3. Check Orders
    const orders = await Order.find({});
    console.log(`Orders count: ${orders.length}`);
    if (orders.length > 0) {
      console.log('Warning: Orders found. They should have been cleared.');
    } else {
      console.log('✓ Orders collection is clean.');
    }

    // 4. Check Indexes on User model
    const db = mongoose.connection.db;
    const userIndexes = await db.collection('users').indexes();
    console.log('User Collection Indexes:');
    userIndexes.forEach(idx => {
      console.log(` - ${idx.name} (unique: ${idx.unique || false})`);
    });
    
    const emailIndex = userIndexes.find(idx => idx.name === 'email_1' || Object.keys(idx.key).includes('email'));
    if (emailIndex && emailIndex.unique) {
      console.log('❌ ERROR: Unique email index is still present!');
    } else {
      console.log('✓ No strict unique email index found. (Good for optional emails)');
    }

    console.log('-----------------------');
    process.exit(0);
  } catch (err) {
    console.error('DB Check Error:', err);
    process.exit(1);
  }
}

runCheck();
