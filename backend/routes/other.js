const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');
const {
  scriptController,
  commissionController,
  evaluationController,
  achievementController,
  shopifyCustomerController,
  shopifyProductController,
  shopifySettingController
} = require('../controllers/otherControllers');

// Validation middleware
const validateId = [
  param('id').notEmpty().withMessage('ID is required'),
  handleValidationErrors
];

// Scripts endpoints
router.get('/scripts', authenticate, scriptController.getAll);
router.get('/scripts/:id', authenticate, validateId, scriptController.getById);
router.post('/scripts', authenticate, scriptController.create);
router.put('/scripts/:id', authenticate, validateId, scriptController.update);
router.delete('/scripts/:id', authenticate, validateId, scriptController.delete);

// Commissions endpoints
router.get('/commissions', authenticate, commissionController.getAll);
router.get('/commissions/:id', authenticate, validateId, commissionController.getById);
router.post('/commissions', authenticate, commissionController.create);
router.put('/commissions/:id', authenticate, validateId, commissionController.update);
router.delete('/commissions/:id', authenticate, validateId, commissionController.delete);

// Evaluations endpoints
router.get('/evaluations', authenticate, evaluationController.getAll);
router.get('/evaluations/:id', authenticate, validateId, evaluationController.getById);
router.post('/evaluations', authenticate, evaluationController.create);
router.put('/evaluations/:id', authenticate, validateId, evaluationController.update);
router.delete('/evaluations/:id', authenticate, validateId, evaluationController.delete);

// Achievements endpoints
router.get('/achievements', authenticate, achievementController.getAll);
router.get('/achievements/:id', authenticate, validateId, achievementController.getById);
router.post('/achievements', authenticate, achievementController.create);
router.put('/achievements/:id', authenticate, validateId, achievementController.update);
router.delete('/achievements/:id', authenticate, validateId, achievementController.delete);

// Shopify endpoints
router.get('/shopify-customers', authenticate, shopifyCustomerController.getAll);
router.get('/shopify-customers/:id', authenticate, validateId, shopifyCustomerController.getById);
router.post('/shopify-customers', authenticate, shopifyCustomerController.create);
router.put('/shopify-customers/:id', authenticate, validateId, shopifyCustomerController.update);
router.delete('/shopify-customers/:id', authenticate, validateId, shopifyCustomerController.delete);

router.get('/shopify-products', authenticate, shopifyProductController.getAll);
router.get('/shopify-products/:id', authenticate, validateId, shopifyProductController.getById);
router.post('/shopify-products', authenticate, shopifyProductController.create);
router.put('/shopify-products/:id', authenticate, validateId, shopifyProductController.update);
router.delete('/shopify-products/:id', authenticate, validateId, shopifyProductController.delete);

router.get('/shopify-settings', authenticate, shopifySettingController.getAll);
router.get('/shopify-settings/:id', authenticate, validateId, shopifySettingController.getById);
router.post('/shopify-settings', authenticate, shopifySettingController.create);
router.put('/shopify-settings/:id', authenticate, validateId, shopifySettingController.update);
router.delete('/shopify-settings/:id', authenticate, validateId, shopifySettingController.delete);

module.exports = router;
