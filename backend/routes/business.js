const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const businessController = require('../controllers/businessController');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// ============= TRADE & SLEEP ENDPOINTS =============
// Evaluar colchón para intercambio
router.post('/trade/evaluate', authenticate, [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('purchase_date').isISO8601().withMessage('Valid purchase date required'),
  body('condition').isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Valid condition required'),
  body('photos').isArray().withMessage('Photos array required'),
  handleValidationErrors
], businessController.