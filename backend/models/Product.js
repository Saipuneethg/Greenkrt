const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '🌿',
  },
  stock: {
    type: Number,
    default: 100,
  },
  status: {
    type: String,
    default: 'In Stock',
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
