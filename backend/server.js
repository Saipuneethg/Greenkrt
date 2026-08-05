require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const soilTestRoutes = require('./routes/soilTests');
const adminRoutes = require('./routes/admin');
const weatherRoutes = require('./routes/weather');
const farmRoutes = require('./routes/farms');
const cartRoutes = require('./routes/cart');
const warehouseRoutes = require('./routes/warehouses');
const transferRoutes = require('./routes/transfers');
const seedDB = require('./seed');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('CORS Policy Error: Origin not allowed'));
  },
  credentials: true
}));
app.use(express.json());

// Request Logger (Incoming)
morgan.token('req-body', (req) => {
  if (req.body && Object.keys(req.body).length) {
    return '\n\x1b[90m' + JSON.stringify(req.body, null, 2) + '\x1b[0m';
  }
  return '\x1b[90mNone\x1b[0m';
});
app.use(morgan('\n\x1b[36m--> :method :url\x1b[0m | Request Body: :req-body'));

// Response Logger (Outgoing)
app.use((req, res, next) => {
  const originalJson = res.json;
  
  res.json = function (body) {
    console.log(`\x1b[32m<-- ${req.method} ${req.url}\x1b[0m | Response Body:\n\x1b[90m${JSON.stringify(body, null, 2)}\x1b[0m`);
    return originalJson.apply(this, arguments);
  };
  
  next();
});

app.use('/uploads', express.static('uploads'));

// MongoDB Connection Middleware for Vercel Serverless
let isConnected = false;
app.use(async (req, res, next) => {
  if (isConnected) {
    return next();
  }
  try {
    const uri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenkrt').trim();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('MongoDB Connected...');
    try { await seedDB(); } catch(e) {}
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ message: 'Database Connection Error' }); 
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/soil-tests', soilTestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/transfers', transferRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Export the app for Vercel Serverless Functions
module.exports = app;
