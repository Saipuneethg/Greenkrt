require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect((process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt').trim()).then(async () => {
  console.log('Connected');
  
  const products = [
    {
      id: 'P-108',
      name: 'MOP (Muriate of Potash)',
      brand: 'IPL',
      price: 1050,
      unit: '50kg bag',
      category: 'Fertilizers',
      badge: '',
      image: '🧂',
      stock: 100,
      status: 'In Stock'
    },
    {
      id: 'P-109',
      name: 'SSP (Single Super Phosphate)',
      brand: 'Coromandel',
      price: 450,
      unit: '50kg bag',
      category: 'Fertilizers',
      badge: '',
      image: '🌫️',
      stock: 100,
      status: 'In Stock'
    },
    {
      id: 'P-110',
      name: 'Ammonium Sulphate',
      brand: 'GSFC',
      price: 850,
      unit: '50kg bag',
      category: 'Fertilizers',
      badge: '',
      image: '❄️',
      stock: 100,
      status: 'In Stock'
    },
    {
      id: 'P-111',
      name: 'Calcium Nitrate',
      brand: 'Yara',
      price: 1250,
      unit: '25kg bag',
      category: 'Fertilizers',
      badge: 'Premium',
      image: '✨',
      stock: 100,
      status: 'In Stock'
    }
  ];

  for (let p of products) {
    const exists = await Product.findOne({ id: p.id });
    if (!exists) {
      await Product.create(p);
      console.log('Created ' + p.name);
    } else {
      console.log('Skipped ' + p.name + ' (already exists)');
    }
  }

  process.exit();
}).catch(console.error);
