const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Booking = require('./models/Booking');
const Cart = require('./models/Cart');
const Farm = require('./models/Farm');
const SoilTest = require('./models/SoilTest');

async function clearData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt');
    console.log('Connected to MongoDB.');

    await Order.deleteMany({});
    console.log('Cleared all Orders.');

    await Booking.deleteMany({});
    console.log('Cleared all Bookings.');

    await Cart.deleteMany({});
    console.log('Cleared all Carts.');

    await Farm.deleteMany({});
    console.log('Cleared all Farms.');

    await SoilTest.deleteMany({});
    console.log('Cleared all SoilTests.');

    console.log('All orphaned data cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
}

clearData();
