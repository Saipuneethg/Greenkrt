const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  basePrice: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  activeBookings: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: 'Active',
  },
  icon: {
    type: String,
    default: 'star',
  },
  color: {
    type: String,
    default: '#0d631b',
  },
  link: {
    type: String,
    default: '#',
  },
  image: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
