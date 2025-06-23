const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');

// Validation rules
const validateCall = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('type').isIn(['inbound', 'outbound', 'followup']).withMessage('Invalid call type'),
  handleValidationErrors
];

const validateCallLog = [
  body('customer_id').notEmpty().withMessage('Customer ID is required'),
  body('type').isIn(['inbound', 'outbound', 'followup']).withMessage('Invalid call type'),
  body('disposition').isIn(['sale', 'appointment', 'callback', 'not_interested', 'no_answer', 'voicemail', 'other'])
    .withMessage('Invalid disposition'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be positive'),
  handleValidationErrors
];

const validateEndCall = [
  param('id').notEmpty().withMessage('Call ID is required'),
  body('disposition').isIn(['sale', 'appointment', 'callback', 'not_interested', 'no_answer', 'voicemail', 'other'])
    .withMessage('Invalid disposition'),
  handleValidationErrors
];

const validateId = [
  param('id').notEmpty().withMessage('Call ID is required'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, callController.getAll);
router.get('/stats', authenticate, callController.getStats);
router.get('/queue', authenticate, callController.getQueue);
router.get('/recent', authenticate, callController.getRecent);
router.get('/agent/:agentId', authenticate, callController.getAgentCalls);
router.get('/:id', authenticate, validateId, callController.getById);

router.post('/', authenticate, validateCall, callController.create);
router.post('/log', authenticate, validateCallLog, callController.log);
router.post('/:id/end', authenticate, validateEndCall, callController.end);

router.put('/:id', authenticate, validateId, callController.update);
router.delete('/:id', authenticate, validateId, callController.delete);

module.exports = router;
