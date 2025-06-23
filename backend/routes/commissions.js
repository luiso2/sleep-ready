const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateCommission = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('type').isIn(['sale', 'subscription', 'bonus', 'other']).withMessage('Invalid commission type'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Rate must be between 0 and 100'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Commission ID is required'),
  handleValidationErrors
];

const validateProcessing = [
  body('employee_id').optional(),
  body('date_from').optional().isISO8601().withMessage('Invalid start date'),
  body('date_to').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, commissionController.getAll);
router.get('/report', authenticate, commissionController.getReport);
router.get('/:id', authenticate, validateId, commissionController.getById);
router.post('/', authenticate, validateCommission, commissionController.create);
router.put('/:id', authenticate, validateId, commissionController.update);
router.delete('/:id', authenticate, validateId, commissionController.delete);

// Specialized routes
router.post('/calculate/sale/:sale_id', authenticate, commissionController.calculateSaleCommission);
router.get('/employee/:employee_id/summary', authenticate, commissionController.getEmployeeSummary);
router.post('/process-pending', authenticate, validateProcessing, commissionController.processPending);

module.exports = router;
