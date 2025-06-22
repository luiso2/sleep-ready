const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const customerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('first_name')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('last_name')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

// All routes require authentication
router.use(authenticateToken);

// GET /api/customers - Get all customers with pagination
router.get('/', customerController.getAllCustomers);

// GET /api/customers/:id - Get specific customer
router.get('/:id', customerController.getCustomerById);

// POST /api/customers - Create new customer
router.post('/', 
  requireRole(['admin', 'manager', 'agent']),
  customerValidation,
  customerController.createCustomer
);

// PUT /api/customers/:id - Update customer
router.put('/:id',
  requireRole(['admin', 'manager', 'agent']),
  customerValidation,
  customerController.updateCustomer
);

module.exports = router;
