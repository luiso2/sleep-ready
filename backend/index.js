const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const employeeRoutes = require('./routes/employees');
const saleRoutes = require('./routes/sales');
const callRoutes = require('./routes/calls');
const storeRoutes = require('./routes/stores');
const campaignRoutes = require('./routes/campaigns');
const subscriptionRoutes = require('./routes/subscriptions');
const otherRoutes = require('./routes/other');

// Import database connection
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sleep Ready API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '2.0.0' // Updated version with all CRUD endpoints
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api', otherRoutes); // Other entities

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Sleep Ready API',
    version: '2.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      customers: {
        list: 'GET /api/customers',
        get: 'GET /api/customers/:id',
        create: 'POST /api/customers',
        update: 'PUT /api/customers/:id',
        delete: 'DELETE /api/customers/:id'
      },
      employees: {
        list: 'GET /api/employees',
        get: 'GET /api/employees/:id',
        performance: 'GET /api/employees/:id/performance',
        create: 'POST /api/employees',
        update: 'PUT /api/employees/:id',
        delete: 'DELETE /api/employees/:id'
      },
      sales: {
        list: 'GET /api/sales',
        stats: 'GET /api/sales/stats',
        get: 'GET /api/sales/:id',
        create: 'POST /api/sales',
        update: 'PUT /api/sales/:id',
        delete: 'DELETE /api/sales/:id'
      },
      calls: {
        list: 'GET /api/calls',
        stats: 'GET /api/calls/stats',
        get: 'GET /api/calls/:id',
        create: 'POST /api/calls',
        log: 'POST /api/calls/log',
        update: 'PUT /api/calls/:id',
        delete: 'DELETE /api/calls/:id'
      },
      stores: {
        list: 'GET /api/stores',
        get: 'GET /api/stores/:id',
        performance: 'GET /api/stores/:id/performance',
        employees: 'GET /api/stores/:id/employees',
        create: 'POST /api/stores',
        update: 'PUT /api/stores/:id',
        delete: 'DELETE /api/stores/:id'
      },
      campaigns: {
        list: 'GET /api/campaigns',
        get: 'GET /api/campaigns/:id',
        stats: 'GET /api/campaigns/:id/stats',
        create: 'POST /api/campaigns',
        start: 'POST /api/campaigns/:id/start',
        pause: 'POST /api/campaigns/:id/pause',
        complete: 'POST /api/campaigns/:id/complete',
        update: 'PUT /api/campaigns/:id',
        delete: 'DELETE /api/campaigns/:id'
      },
      subscriptions: {
        list: 'GET /api/subscriptions',
        stats: 'GET /api/subscriptions/stats',
        get: 'GET /api/subscriptions/:id',
        create: 'POST /api/subscriptions',
        cancel: 'POST /api/subscriptions/:id/cancel',
        pause: 'POST /api/subscriptions/:id/pause',
        resume: 'POST /api/subscriptions/:id/resume',
        update: 'PUT /api/subscriptions/:id',
        delete: 'DELETE /api/subscriptions/:id'
      },
      scripts: {
        list: 'GET /api/scripts',
        get: 'GET /api/scripts/:id',
        create: 'POST /api/scripts',
        update: 'PUT /api/scripts/:id',
        delete: 'DELETE /api/scripts/:id'
      },
      commissions: {
        list: 'GET /api/commissions',
        get: 'GET /api/commissions/:id',
        create: 'POST /api/commissions',
        update: 'PUT /api/commissions/:id',
        delete: 'DELETE /api/commissions/:id'
      },
      evaluations: {
        list: 'GET /api/evaluations',
        get: 'GET /api/evaluations/:id',
        create: 'POST /api/evaluations',
        update: 'PUT /api/evaluations/:id',
        delete: 'DELETE /api/evaluations/:id'
      },
      achievements: {
        list: 'GET /api/achievements',
        get: 'GET /api/achievements/:id',
        create: 'POST /api/achievements',
        update: 'PUT /api/achievements/:id',
        delete: 'DELETE /api/achievements/:id'
      },
      shopify: {
        customers: {
          list: 'GET /api/shopify-customers',
          get: 'GET /api/shopify-customers/:id',
          create: 'POST /api/shopify-customers',
          update: 'PUT /api/shopify-customers/:id',
          delete: 'DELETE /api/shopify-customers/:id'
        },
        products: {
          list: 'GET /api/shopify-products',
          get: 'GET /api/shopify-products/:id',
          create: 'POST /api/shopify-products',
          update: 'PUT /api/shopify-products/:id',
          delete: 'DELETE /api/shopify-products/:id'
        },
        settings: {
          list: 'GET /api/shopify-settings',
          get: 'GET /api/shopify-settings/:id',
          create: 'POST /api/shopify-settings',
          update: 'PUT /api/shopify-settings/:id',
          delete: 'DELETE /api/shopify-settings/:id'
        }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`🚀 Sleep Ready API running on ${process.env.HOST || 'localhost'}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://${process.env.HOST || 'localhost'}:${PORT}/health`);
  console.log(`📚 API Documentation: http://${process.env.HOST || 'localhost'}:${PORT}/api`);
});

module.exports = app;
