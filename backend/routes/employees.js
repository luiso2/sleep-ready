const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateEmployee = [
  body('employee_id').trim().notEmpty().withMessage('Employee ID is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('role').isIn(['agent', 'supervisor', 'manager', 'admin']).withMessage('Invalid role'),
  body('store_id').optional().notEmpty().withMessage('Store ID cannot be empty'),
  handleValidationErrors
];

const validatePasswordUpdate = [
  param('id').notEmpty().withMessage('Employee ID is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('currentPassword').optional().notEmpty().withMessage('Current password is required'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Employee ID is required'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, employeeController.getAll);
router.get('/active-agents', authenticate, employeeController.getActiveAgents);
router.get('/:id', authenticate, validateId, employeeController.getById);
router.get('/:id/performance', authenticate, validateId, employeeController.getPerformance);
router.post('/', authenticate, authorize(['admin', 'manager']), validateEmployee, employeeController.create);
router.put('/:id', authenticate, authorize(['admin', 'manager']), validateId, employeeController.update);
router.put('/:id/password', authenticate, validatePasswordUpdate, employeeController.updatePassword);
router.delete('/:id', authenticate, authorize(['admin']), validateId, employeeController.delete);

module.exports = router;
