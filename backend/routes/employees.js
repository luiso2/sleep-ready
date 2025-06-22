const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateValidation = [
  param('id').notEmpty().withMessage('Employee ID is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.get('/', employeeController.getAll.bind(employeeController));
router.get('/:id', employeeController.getById.bind(employeeController));
router.get('/:id/performance', employeeController.getPerformance.bind(employeeController));
router.post('/', createValidation, employeeController.create.bind(employeeController));
router.put('/:id', updateValidation, employeeController.update.bind(employeeController));
router.delete('/:id', employeeController.delete.bind(employeeController));

module.exports = router;
