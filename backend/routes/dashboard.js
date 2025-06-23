const dashboardController = require('../controllers/dashboardController');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Dashboard routes
router.get('/overview', authenticate, dashboardController.getOverview);
router.get('/sales-metrics', authenticate, dashboardController.getSalesMetrics);
router.get('/employee-performance', authenticate, dashboardController.getEmployeePerformance);
router.get('/store-performance', authenticate, dashboardController.getStorePerformance);
router.get('/call-center-stats', authenticate, dashboardController.getCallCenterStats);
router.get('/subscription-metrics', authenticate, dashboardController.getSubscriptionMetrics);
router.get('/trade-sleep-metrics', authenticate, dashboardController.getTradeSleepMetrics);
router.get('/revenue-analytics', authenticate, dashboardController.getRevenueAnalytics);
router.get('/customer-insights', authenticate, dashboardController.getCustomerInsights);
router.get('/product-analytics', authenticate, dashboardController.getProductAnalytics);

module.exports = router;
