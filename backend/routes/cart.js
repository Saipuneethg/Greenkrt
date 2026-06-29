const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/cart/sync
// @desc    Sync user's cart (replaces entire items array)
// @access  Private
router.post('/sync', auth, async (req, res) => {
  const { items } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = items;
      await cart.save();
      return res.json(cart);
    }
    
    cart = new Cart({
      user: req.user.id,
      items
    });
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
