const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateCustomer = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone format'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Customer ID is required'),
  handleValidationErrors
];

const validateCredits = [
  param('id').notEmpty().withMessage('Customer ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('operation').optional().isIn(['add', 'subtract']).withMessage('Operation must be add or subtract'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, customerController.getAll);
router.get('/search', authenticate, customerController.search);
router.get('/:id', authenticate, validateId, customerController.getById);
router.post('/', authenticate, validateCustomer, customerController.create);
router.put('/:id', authenticate, validateId, validateCustomer, customerController.update);
router.delete('/:id', authenticate, validateId, customerController.delete);
router.post('/:id/credits', authenticate, validateCredits, customerController.updateCredits);

module.exports = router;
