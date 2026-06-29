require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect((process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt').trim()).then(async () => {
  console.log('Connected');
  
  const products = [
    // Pesticides / Herbicides
    {
      id: 'P-201',
      name: 'Imidacloprid 17.8% SL',
      brand: 'Bayer',
      price: 950,
      unit: '250ml',
      category: 'Pesticides',
      badge: 'Highly Effective',
      image: '🧴',
      stock: 50,
      status: 'In Stock'
    },
    {
      id: 'P-202',
      name: 'Glyphosate 41% SL',
      brand: 'Excel Crop Care',
      price: 600,
      unit: '1L',
      category: 'Pesticides',
      badge: '',
      image: '🧪',
      stock: 40,
      status: 'In Stock'
    },
    {
      id: 'P-203',
      name: 'Monocrotophos 36% SL',
      brand: 'UPL',
      price: 450,
      unit: '1L',
      category: 'Pesticides',
      badge: '',
      image: '🧴',
      stock: 60,
      status: 'In Stock'
    },
    // Seeds
    {
      id: 'P-301',
      name: 'Cotton Seeds (Bt)',
      brand: 'Nuziveedu',
      price: 850,
      unit: '450g packet',
      category: 'Seeds',
      badge: 'High Yield',
      image: '🌱',
      stock: 200,
      status: 'In Stock'
    },
    {
      id: 'P-302',
      name: 'Maize Seeds (Hybrid)',
      brand: 'Pioneer',
      price: 1300,
      unit: '5kg bag',
      category: 'Seeds',
      badge: '',
      image: '🌽',
      stock: 150,
      status: 'In Stock'
    },
    {
      id: 'P-303',
      name: 'Tomato Seeds (Hybrid)',
      brand: 'Syngenta',
      price: 350,
      unit: '10g packet',
      category: 'Seeds',
      badge: '',
      image: '🍅',
      stock: 300,
      status: 'In Stock'
    },
    // Micronutrients
    {
      id: 'P-401',
      name: 'Magnesium Sulphate',
      brand: 'Aries Agro',
      price: 400,
      unit: '10kg bag',
      category: 'Micronutrients',
      badge: '',
      image: '🌿',
      stock: 80,
      status: 'In Stock'
    },
    {
      id: 'P-402',
      name: 'Copper Sulphate',
      brand: 'Local',
      price: 250,
      unit: '1kg bag',
      category: 'Micronutrients',
      badge: '',
      image: '🔵',
      stock: 50,
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
