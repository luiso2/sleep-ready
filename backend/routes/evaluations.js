const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateEvaluation = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('mattress').isObject().withMessage('Mattress information is required'),
  body('mattress.brand').notEmpty().withMessage('Mattress brand is required'),
  body('mattress.model').optional(),
  body('mattress.age_years').isInt({ min: 0 }).withMessage('Mattress age must be a positive number'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Evaluation ID is required'),
  handleValidationErrors
];

const validateAIEvaluation = [
  param('id').notEmpty().withMessage('Evaluation ID is required'),
  body('photos').isArray().withMessage('Photos array is required'),
  handleValidationErrors
];

const validateApproval = [
  param('id').notEmpty().withMessage('Evaluation ID is required'),
  body('credit_amount').isFloat({ min: 0 }).withMessage('Credit amount must be positive'),
  body('expires_days').optional().isInt({ min: 1 }).withMessage('Expiry days must be at least 1'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, evaluationController.getAll);
router.get('/stats', authenticate, evaluationController.getStats);
router.get('/:id', authenticate, validateId, evaluationController.getById);
router.post('/', authenticate, validateEvaluation, evaluationController.create);
router.put('/:id', authenticate, validateId, evaluationController.update);
router.delete('/:id', authenticate, validateId, evaluationController.delete);

// Specialized routes
router.post('/:id/ai-evaluate', authenticate, validateAIEvaluation, evaluationController.processAIEvaluation);
router.post('/:id/approve', authenticate, validateApproval, evaluationController.approveEvaluation);
router.post('/:id/reject', authenticate, validateId, evaluationController.rejectEvaluation);
router.post('/redeem/:coupon_code', authenticate, evaluationController.redeemCoupon);

module.exports = router;
