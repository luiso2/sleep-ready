const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('plan').notEmpty().withMessage('Plan is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('pricing').isObject().withMessage('Pricing must be an object'),
  body('pricing.monthly').isNumeric().withMessage('Monthly price is required'),
  body('billing').isObject().withMessage('Billing must be an object'),
  body('start_date').isISO8601().withMessage('Valid start date is required')
];

const updateValidation = [
  param('id').notEmpty().withMessage('Subscription ID is required')
];

const cancelValidation = [
  param('id').notEmpty().withMessage('Subscription ID is required'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

// Routes
router.get('/', subscriptionController.getAll.bind(subscriptionController));
router.get('/stats', subscriptionController.getStats.bind(subscriptionController));
router.get('/:id', subscriptionController.getById.bind(subscriptionController));
router.post('/', createValidation, subscriptionController.create.bind(subscriptionController));
router.post('/:id/cancel', cancelValidation, subscriptionController.cancel.bind(subscriptionController));
router.post('/:id/pause', subscriptionController.pause.bind(subscriptionController));
router.post('/:id/resume', subscriptionController.resume.bind(subscriptionController));
router.put('/:id', updateValidation, subscriptionController.update.bind(subscriptionController));
router.delete('/:id', subscriptionController.delete.bind(subscriptionController));

module.exports = router;
