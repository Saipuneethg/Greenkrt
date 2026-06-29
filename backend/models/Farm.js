const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  crop: {
    type: String,
    required: true
  },
  acres: {
    type: Number,
    required: true
  },
  soilType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farm', FarmSchema);
