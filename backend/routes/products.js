const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/products
// @desc    Get all products
// @access  Private/Public
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/products
// @desc    Add new product
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  const { name, brand, price, unit, category, badge, image, stock } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, category are required.' });
  }

  try {
    // Generate a unique ID (frontend uses P-XXX)
    const count = await Product.countDocuments();
    const id = `P-${100 + count + 1}`;

    const stockNum = parseInt(stock) || 0;
    const status = stockNum > 20 ? 'In Stock' : (stockNum > 0 ? 'Low Stock' : 'Out of Stock');

    const newProduct = new Product({
      id,
      name,
      brand: brand || 'GreenKrt',
      price,
      unit: unit || '50kg bag',
      category,
      badge: badge || 'New',
      image: image || '🌿',
      stock: stockNum,
      status,
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
// Note: :id is the frontend product string ID (e.g. P-101)
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, brand, price, unit, category, badge, image, stock } = req.body;

  try {
    let product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const stockNum = stock !== undefined ? parseInt(stock) : product.stock;
    const updatedStatus = stockNum > 20 ? 'In Stock' : (stockNum > 0 ? 'Low Stock' : 'Out of Stock');

    const fieldsToUpdate = {
      name: name || product.name,
      brand: brand || product.brand,
      price: price !== undefined ? price : product.price,
      unit: unit || product.unit,
      category: category || product.category,
      badge: badge !== undefined ? badge : product.badge,
      image: image || product.image,
      stock: stockNum,
      status: updatedStatus,
    };

    product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: fieldsToUpdate },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
