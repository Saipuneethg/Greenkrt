require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/greenkrt';

const resetUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // 1. Delete all users
    console.log('Deleting all current users...');
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users.`);

    // 2. Drop the email_1 index if it exists
    console.log('Checking for email_1 index...');
    try {
      await mongoose.connection.collection('users').dropIndex('email_1');
      console.log('Dropped unique email index.');
    } catch (err) {
      if (err.code === 27) {
        console.log('email_1 index does not exist, nothing to drop.');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }

    console.log('Database reset complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

resetUsers();
