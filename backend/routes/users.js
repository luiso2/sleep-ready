const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['user', 'administrator', 'manager']).withMessage('Invalid role')
];

const updateValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'administrator', 'manager']).withMessage('Invalid role')
];

// Routes
router.get('/', requireRole(['administrator']), userController.getAll.bind(userController));
router.get('/:id', userController.getById.bind(userController));
router.post('/', requireRole(['administrator']), createValidation, userController.create.bind(userController));
router.put('/:id', updateValidation, userController.update.bind(userController));
router.delete('/:id', requireRole(['administrator']), userController.delete.bind(userController));

module.exports = router;
