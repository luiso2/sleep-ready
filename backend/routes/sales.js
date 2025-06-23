const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateSale = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('type').isIn(['subscription', 'trade_and_sleep', 'direct_sale']).withMessage('Invalid sale type'),
  body('channel').isIn(['phone', 'in_store', 'online']).withMessage('Invalid channel'),
  body('amount').isObject().withMessage('Amount must be an object'),
  body('amount.total').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Sale ID is required'),
  handleValidationErrors
];

const validatePaymentStatus = [
  param('id').notEmpty().withMessage('Sale ID is required'),
  body('status').isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, saleController.getAll);
router.get('/stats', authenticate, saleController.getStats);
router.get('/top-performers', authenticate, saleController.getTopPerformers);
router.get('/:id', authenticate, validateId, saleController.getById);
router.post('/', authenticate, validateSale, saleController.create);
router.put('/:id', authenticate, validateId, saleController.update);
router.put('/:id/payment-status', authenticate, validatePaymentStatus, saleController.updatePaymentStatus);
router.delete('/:id', authenticate, authorize(['admin', 'manager']), validateId, saleController.delete);

module.exports = router;
