const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateSubscription = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('plan').isIn(['basic', 'premium', 'elite']).withMessage('Invalid plan type'),
  body('pricing').isObject().withMessage('Pricing must be an object'),
  body('pricing.amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('pricing.currency').optional().isIn(['USD', 'EUR']).withMessage('Invalid currency'),
  body('billing').isObject().withMessage('Billing must be an object'),
  body('billing.frequency').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid billing frequency'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Subscription ID is required'),
  handleValidationErrors
];

const validateCancel = [
  param('id').notEmpty().withMessage('Subscription ID is required'),
  body('reason').optional().trim().notEmpty().withMessage('Cancel reason cannot be empty'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, subscriptionController.getAll);
router.get('/stats', authenticate, subscriptionController.getStats);
router.get('/expiring', authenticate, subscriptionController.getExpiring);
router.get('/:id', authenticate, validateId, subscriptionController.getById);
router.post('/', authenticate, validateSubscription, subscriptionController.create);
router.put('/:id', authenticate, validateId, subscriptionController.update);
router.delete('/:id', authenticate, authorize(['admin', 'manager']), validateId, subscriptionController.delete);

// Subscription actions
router.post('/:id/cancel', authenticate, validateCancel, subscriptionController.cancel);
router.post('/:id/pause', authenticate, validateId, subscriptionController.pause);
router.post('/:id/resume', authenticate, validateId, subscriptionController.resume);

module.exports = router;
