const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const storeController = require('../controllers/storeController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('name').notEmpty().withMessage('Store name is required'),
  body('code').notEmpty().withMessage('Store code is required'),
  body('address').isObject().withMessage('Address must be an object'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zip').notEmpty().withMessage('ZIP code is required')
];

const updateValidation = [
  param('id').notEmpty().withMessage('Store ID is required'),
  body('address').optional().isObject().withMessage('Address must be an object')
];

// Routes
router.get('/', storeController.getAll.bind(storeController));
router.get('/:id', storeController.getById.bind(storeController));
router.get('/:id/performance', storeController.getPerformance.bind(storeController));
router.get('/:id/employees', storeController.getEmployees.bind(storeController));
router.post('/', createValidation, storeController.create.bind(storeController));
router.put('/:id', updateValidation, storeController.update.bind(storeController));
router.delete('/:id', storeController.delete.bind(storeController));

module.exports = router;
