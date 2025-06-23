const express = require('express');
const router = express.Router();

// Placeholder - Subscriptions routes to be implemented
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Subscriptions endpoints coming soon',
    data: []
  });
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    message: 'Subscriptions stats endpoint coming soon',
    data: {}
  });
});

module.exports = router;
