const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('warranty_months').optional().isInt({ min: 0 }).withMessage('Warranty months must be a non-negative integer'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Product ID is required'),
  handleValidationErrors
];

const validateStock = [
  param('id').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('operation').isIn(['add', 'subtract', 'set']).withMessage('Operation must be add, subtract, or set'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, productController.getAll);
router.get('/search', authenticate, productController.search);
router.get('/low-stock', authenticate, productController.getLowStock);
router.get('/categories', authenticate, productController.getCategories);
router.get('/:id', authenticate, validateId, productController.getById);
router.post('/', authenticate, validateProduct, productController.create);
router.put('/:id', authenticate, validateId, validateProduct, productController.update);
router.delete('/:id', authenticate, validateId, productController.delete);
router.post('/:id/stock', authenticate, validateStock, productController.updateStock);

module.exports = router;
