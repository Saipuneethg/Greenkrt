const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    // Optional, no unique constraint
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'delivery'],
    default: 'farmer',
  },
  district: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
