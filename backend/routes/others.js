const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  scriptController,
  commissionController,
  evaluationController,
  achievementController,
  shopifyCustomerController,
  shopifyProductController,
  shopifySettingController
} = require('../controllers/otherControllers');

// Apply authentication to all routes
router.use(authenticateToken);

// Script routes
router.get('/scripts', scriptController.getAll.bind(scriptController));
router.get('/scripts/:id', scriptController.getById.bind(scriptController));
router.post('/scripts', scriptController.create.bind(scriptController));
router.put('/scripts/:id', scriptController.update.bind(scriptController));
router.delete('/scripts/:id', scriptController.delete.bind(scriptController));

// Commission routes
router.get('/commissions', commissionController.getAll.bind(commissionController));
router.get('/commissions/:id', commissionController.getById.bind(commissionController));
router.post('/commissions', commissionController.create.bind(commissionController));
router.put('/commissions/:id', commissionController.update.bind(commissionController));
router.delete('/commissions/:id', commissionController.delete.bind(commissionController));

// Evaluation routes
router.get('/evaluations', evaluationController.getAll.bind(evaluationController));
router.get('/evaluations/:id', evaluationController.getById.bind(evaluationController));
router.post('/evaluations', evaluationController.create.bind(evaluationController));
router.put('/evaluations/:id', evaluationController.update.bind(evaluationController));
router.delete('/evaluations/:id', evaluationController.delete.bind(evaluationController));

// Achievement routes
router.get('/achievements', achievementController.getAll.bind(achievementController));
router.get('/achievements/:id', achievementController.getById.bind(achievementController));
router.post('/achievements', achievementController.create.bind(achievementController));
router.put('/achievements/:id', achievementController.update.bind(achievementController));
router.delete('/achievements/:id', achievementController.delete.bind(achievementController));

// Shopify Customer routes
router.get('/shopify/customers', shopifyCustomerController.getAll.bind(shopifyCustomerController));
router.get('/shopify/customers/:id', shopifyCustomerController.getById.bind(shopifyCustomerController));
router.post('/shopify/customers', shopifyCustomerController.create.bind(shopifyCustomerController));
router.put('/shopify/customers/:id', shopifyCustomerController.update.bind(shopifyCustomerController));
router.delete('/shopify/customers/:id', shopifyCustomerController.delete.bind(shopifyCustomerController));

// Shopify Product routes
router.get('/shopify/products', shopifyProductController.getAll.bind(shopifyProductController));
router.get('/shopify/products/:id', shopifyProductController.getById.bind(shopifyProductController));
router.post('/shopify/products', shopifyProductController.create.bind(shopifyProductController));
router.put('/shopify/products/:id', shopifyProductController.update.bind(shopifyProductController));
router.delete('/shopify/products/:id', shopifyProductController.delete.bind(shopifyProductController));

// Shopify Settings routes
router.get('/shopify/settings', shopifySettingController.getAll.bind(shopifySettingController));
router.get('/shopify/settings/:id', shopifySettingController.getById.bind(shopifySettingController));
router.post('/shopify/settings', shopifySettingController.create.bind(shopifySettingController));
router.put('/shopify/settings/:id', shopifySettingController.update.bind(shopifySettingController));
router.delete('/shopify/settings/:id', shopifySettingController.delete.bind(shopifySettingController));

module.exports = router;
