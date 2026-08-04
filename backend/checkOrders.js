const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt');
  const count = await Order.countDocuments();
  console.log('Order count:', count);
  const orders = await Order.find({}, 'orderId');
  console.log('Orders:', orders);
  process.exit(0);
}
check();
