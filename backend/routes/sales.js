const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const saleController = require('../controllers/saleController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('type').notEmpty().withMessage('Sale type is required'),
  body('channel').notEmpty().withMessage('Sale channel is required'),
  body('amount').isObject().withMessage('Amount must be an object'),
  body('amount.total').isNumeric().withMessage('Total amount is required')
];

const updateValidation = [
  param('id').notEmpty().withMessage('Sale ID is required'),
  body('amount.total').optional().isNumeric().withMessage('Total amount must be numeric')
];

// Routes
router.get('/', saleController.getAll.bind(saleController));
router.get('/stats', saleController.getStats.bind(saleController));
router.get('/:id', saleController.getById.bind(saleController));
router.post('/', createValidation, saleController.create.bind(saleController));
router.put('/:id', updateValidation, saleController.update.bind(saleController));
router.delete('/:id', saleController.delete.bind(saleController));

module.exports = router;
