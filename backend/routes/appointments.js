const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateAppointment = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('appointment_type').isIn(['sleep_study', 'consultation', 'follow_up']).withMessage('Invalid appointment type'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date is required'),
  body('duration_minutes').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Appointment ID is required'),
  handleValidationErrors
];

const validateStatus = [
  param('id').notEmpty().withMessage('Appointment ID is required'),
  body('status').isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  handleValidationErrors
];

const validateCalendar = [
  query('start_date').isISO8601().withMessage('Valid start date is required'),
  query('end_date').isISO8601().withMessage('Valid end date is required'),
  handleValidationErrors
];

const validateAvailableSlots = [
  query('date').isISO8601().withMessage('Valid date is required'),
  query('duration_minutes').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, appointmentController.getAll);
router.get('/calendar', authenticate, validateCalendar, appointmentController.getCalendar);
router.get('/upcoming', authenticate, appointmentController.getUpcoming);
router.get('/available-slots', authenticate, validateAvailableSlots, appointmentController.getAvailableSlots);
router.get('/stats', authenticate, appointmentController.getStats);
router.get('/:id', authenticate, validateId, appointmentController.getById);
router.post('/', authenticate, validateAppointment, appointmentController.create);
router.put('/:id', authenticate, validateId, appointmentController.update);
router.delete('/:id', authenticate, validateId, appointmentController.delete);

// Specialized routes
router.patch('/:id/status', authenticate, validateStatus, appointmentController.updateStatus);
router.post('/:id/reminder', authenticate, validateId, appointmentController.sendReminder);

module.exports = router;
