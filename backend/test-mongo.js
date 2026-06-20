require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('URI:', process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Success! Connected.');
    process.exit(0);
  } catch (err) {
    console.error('Error connecting:', err.message);
    process.exit(1);
  }
}

testConnection();
