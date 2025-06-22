const BaseController = require('./baseController');

// Simple controllers for remaining entities
const scriptController = new BaseController('scripts', 'script-');
const commissionController = new BaseController('commissions', 'comm-');
const evaluationController = new BaseController('evaluations', 'eval-');
const achievementController = new BaseController('achievements', 'ach-');

// Shopify related controllers
const shopifyCustomerController = new BaseController('shopify_customers', 'shop-cust-');
const shopifyProductController = new BaseController('shopify_products', 'shop-prod-');
const shopifySettingController = new BaseController('shopify_settings', 'shop-set-');

module.exports = {
  scriptController,
  commissionController,
  evaluationController,
  achievementController,
  shopifyCustomerController,
  shopifyProductController,
  shopifySettingController
};
