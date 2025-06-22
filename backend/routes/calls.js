const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const callController = require('../controllers/callController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('type').isIn(['inbound', 'outbound']).withMessage('Type must be inbound or outbound'),
  body('status').notEmpty().withMessage('Status is required'),
  body('user_id').notEmpty().withMessage('User ID is required')
];

const logCallValidation = [
  body('type').isIn(['inbound', 'outbound']).withMessage('Type must be inbound or outbound'),
  body('status').notEmpty().withMessage('Status is required'),
  body('disposition').notEmpty().withMessage('Disposition is required'),
  body('duration').isNumeric().withMessage('Duration must be numeric (seconds)')
];

// Routes
router.get('/', callController.getAll.bind(callController));
router.get('/stats', callController.getStats.bind(callController));
router.get('/:id', callController.getById.bind(callController));
router.post('/', createValidation, callController.create.bind(callController));
router.post('/log', logCallValidation, callController.logCall.bind(callController));
router.put('/:id', callController.update.bind(callController));
router.delete('/:id', callController.delete.bind(callController));

module.exports = router;
