const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const campaignController = require('../controllers/campaignController');

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createValidation = [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('type').notEmpty().withMessage('Campaign type is required')
];

const updateValidation = [
  param('id').notEmpty().withMessage('Campaign ID is required')
];

// Routes
router.get('/', campaignController.getAll.bind(campaignController));
router.get('/:id', campaignController.getById.bind(campaignController));
router.get('/:id/stats', campaignController.getStats.bind(campaignController));
router.post('/', createValidation, campaignController.create.bind(campaignController));
router.post('/:id/start', campaignController.start.bind(campaignController));
router.post('/:id/pause', campaignController.pause.bind(campaignController));
router.post('/:id/complete', campaignController.complete.bind(campaignController));
router.put('/:id', updateValidation, campaignController.update.bind(campaignController));
router.delete('/:id', campaignController.delete.bind(campaignController));

module.exports = router;
