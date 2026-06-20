const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Service = require('./models/Service');

const seedDB = async () => {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default users...');
      const salt = await bcrypt.genSalt(10);
      
      const adminPass = await bcrypt.hash('adminpassword', salt);
      const farmerPass = await bcrypt.hash('farmerpassword', salt);
      const deliveryPass = await bcrypt.hash('deliverypassword', salt);

      await User.create([
        {
          firstName: 'Admin',
          lastName: 'GreenKrt',
          phone: '9999999999',
          email: 'admin@greenkrt.com',
          password: adminPass,
          role: 'admin',
          district: 'Guntur',
        },
        {
          firstName: 'Ramesh',
          lastName: 'Kumar',
          phone: '8888888888',
          email: 'farmer@greenkrt.com',
          password: farmerPass,
          role: 'farmer',
          district: 'Guntur',
        },
        {
          firstName: 'Suresh',
          lastName: 'Rao',
          phone: '7777777777',
          email: 'delivery@greenkrt.com',
          password: deliveryPass,
          role: 'delivery',
          district: 'Krishna',
        }
      ]);
      console.log('Default users seeded.');
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding default products...');
      const defaultProducts = [
        {
          id: 'P-101',
          name: 'Urea (Granular)',
          brand: 'IFFCO',
          price: 320,
          unit: '50kg bag',
          category: 'Fertilizers',
          badge: 'Best Seller',
          image: '🌿',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-102',
          name: 'DAP Fertilizer',
          brand: 'Coromandel',
          price: 1450,
          unit: '50kg bag',
          category: 'Fertilizers',
          badge: '',
          image: '🌾',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-103',
          name: 'NPK 20:20:20',
          brand: 'Yara',
          price: 890,
          unit: '25kg bag',
          category: 'Fertilizers',
          badge: 'AI Recommended',
          image: '🌱',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-104',
          name: 'Neem Oil Pesticide',
          brand: 'AgroNeem',
          price: 450,
          unit: '1L bottle',
          category: 'Pesticides',
          badge: 'Organic',
          image: '🌿',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-105',
          name: 'Chlorpyrifos 20 EC',
          brand: 'Bayer',
          price: 320,
          unit: '500ml',
          category: 'Pesticides',
          badge: '',
          image: '🧴',
          stock: 15,
          status: 'Low Stock'
        },
        {
          id: 'P-106',
          name: 'Zinc Sulphate',
          brand: 'Deepak Fert',
          price: 280,
          unit: '10kg bag',
          category: 'Micronutrients',
          badge: '',
          image: '⚗️',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-107',
          name: 'Boron Powder',
          brand: 'National Fert',
          price: 180,
          unit: '5kg bag',
          category: 'Micronutrients',
          badge: '',
          image: '🔬',
          stock: 100,
          status: 'In Stock'
        },
        {
          id: 'P-108',
          name: 'Paddy Seeds (BPT)',
          brand: 'APSDCA',
          price: 1200,
          unit: '30kg bag',
          category: 'Seeds',
          badge: 'Certified',
          image: '🌾',
          stock: 100,
          status: 'In Stock'
        }
      ];
      await Product.create(defaultProducts);
      console.log('Default products seeded.');
    }

    // 3. Seed Services if empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log('Seeding default services...');
      const defaultServices = [
        {
          id: 'S-01',
          name: 'Drone Spraying Service',
          title: 'Drone Spraying Service',
          desc: 'GPS-guided precision drone application of pesticides and fertilizers by certified pilots.',
          basePrice: '₹800/acre',
          price: '₹800/acre',
          activeBookings: 12,
          status: 'Active',
          icon: 'flight',
          color: '#0d631b',
          link: '/dashboard/book-drone',
          image: '/drone.png'
        },
        {
          id: 'S-02',
          name: 'Land Measurement',
          title: 'Land Measurement',
          desc: 'Accurate drone-based land surveys with certified reports for legal and insurance purposes.',
          basePrice: '₹500/acre',
          price: '₹500/acre',
          activeBookings: 8,
          status: 'Active',
          icon: 'straighten',
          color: '#126d27',
          link: '/dashboard/book-land',
          image: '/land.png'
        },
        {
          id: 'S-03',
          name: 'Soil Test & AI Analysis',
          title: 'Soil Test & AI Analysis',
          desc: 'Submit soil samples for lab testing with AI-powered nutrient reports and crop recommendations.',
          basePrice: '₹350/sample',
          price: '₹350/sample',
          activeBookings: 15,
          status: 'Active',
          icon: 'biotech',
          color: '#1B6B2F',
          link: '/dashboard/soil-test',
          image: '/soil.png'
        },
        {
          id: 'S-04',
          name: 'Irrigation Setup',
          title: 'Irrigation Setup',
          desc: 'Professional drip and sprinkler irrigation system design and installation.',
          basePrice: '₹2,500/setup',
          price: '₹2,500/setup',
          activeBookings: 0,
          status: 'Active',
          icon: 'water_drop',
          color: '#0d631b',
          link: '#'
        }
      ];
      await Service.create(defaultServices);
      console.log('Default services seeded.');
    }
  } catch (err) {
    console.error('Error seeding DB:', err.message);
  }
};

module.exports = seedDB;
