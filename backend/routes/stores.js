const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateStore = [
  body('name').trim().notEmpty().withMessage('Store name is required'),
  body('code').trim().notEmpty().isAlphanumeric().withMessage('Store code is required and must be alphanumeric'),
  body('address').isObject().withMessage('Address must be an object'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zip').notEmpty().withMessage('ZIP code is required'),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone format'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Store ID is required'),
  handleValidationErrors
];

const validateNearby = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  query('radius').optional().isInt({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 miles'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, storeController.getAll);
router.get('/nearby', authenticate, validateNearby, storeController.getNearby);
router.get('/:id', authenticate, validateId, storeController.getById);
router.get('/:id/performance', authenticate, validateId, storeController.getPerformance);
router.get('/:id/employees', authenticate, validateId, storeController.getEmployees);
router.post('/', authenticate, authorize(['admin']), validateStore, storeController.create);
router.put('/:id', authenticate, authorize(['admin', 'manager']), validateId, storeController.update);
router.delete('/:id', authenticate, authorize(['admin']), validateId, storeController.delete);

module.exports = router;
