const Subscription = require('../models/Subscription');
const { parseFilters } = require('../utils/helpers');

const subscriptionController = {
  // Get all subscriptions
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Subscription.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscriptions',
        error: error.message
      });
    }
  },

  // Get subscription by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const subscription = await Subscription.findById(id);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscription',
        error: error.message
      });
    }
  },

  // Get subscription statistics
  async getStats(req, res) {
    try {
      const planStats = await Subscription.getSubscriptionStats();
      const mrr = await Subscription.getMRR();
      const activeSubscriptions = await Subscription.getActiveSubscriptions();
      
      // Calculate churn rate for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const churnData = await Subscription.getChurnRate(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      res.json({
        success: true,
        data: {
          plans: planStats,
          mrr: mrr.mrr || 0,
          totalActive: activeSubscriptions.length,
          churnRate: churnData.churn_rate || 0,
          summary: {
            basic: planStats.find(p => p.plan === 'basic') || { total: 0, active: 0 },
            premium: planStats.find(p => p.plan === 'premium') || { total: 0, active: 0 },
            elite: planStats.find(p => p.plan === 'elite') || { total: 0, active: 0 }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscription statistics',
        error: error.message
      });
    }
  },

  // Create new subscription
  async create(req, res) {
    try {
      const subscriptionData = req.body;
      
      // Validate required fields
      if (!subscriptionData.customer_id || !subscriptionData.plan || !subscriptionData.pricing || !subscriptionData.billing) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // Set sold_by from authenticated user if not provided
      if (!subscriptionData.sold_by) {
        subscriptionData.sold_by = req.user.id;
      }
      
      // Set default status
      subscriptionData.status = subscriptionData.status || 'active';
      
      // Define default services based on plan
      if (!subscriptionData.services) {
        const defaultServices = {
          basic: {
            delivery: true,
            setup: true,
            warranty: '5 years',
            exchanges: 1
          },
          premium: {
            delivery: true,
            setup: true,
            warranty: '10 years',
            exchanges: 2,
            cleaning: 2,
            inspection: true
          },
          elite: {
            delivery: true,
            setup: true,
            warranty: 'lifetime',
            exchanges: 'unlimited',
            cleaning: 4,
            inspection: true,
            priority_support: true,
            sleep_consultation: true
          }
        };
        
        subscriptionData.services = defaultServices[subscriptionData.plan] || defaultServices.basic;
      }
      
      // Define default credits based on plan
      if (!subscriptionData.credits) {
        const defaultCredits = {
          basic: { monthly: 50, accumulated: 0 },
          premium: { monthly: 100, accumulated: 0 },
          elite: { monthly: 200, accumulated: 0 }
        };
        
        subscriptionData.credits = defaultCredits[subscriptionData.plan] || defaultCredits.basic;
      }
      
      const subscription = await Subscription.create(subscriptionData);
      
      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating subscription',
        error: error.message
      });
    }
  },

  // Update subscription
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if subscription exists
      const existing = await Subscription.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      
      // Handle JSON fields
      if (updateData.pricing && typeof updateData.pricing === 'object') {
        updateData.pricing = JSON.stringify(updateData.pricing);
      }
      
      if (updateData.billing && typeof updateData.billing === 'object') {
        updateData.billing = JSON.stringify(updateData.billing);
      }
      
      if (updateData.services && typeof updateData.services === 'object') {
        updateData.services = JSON.stringify(updateData.services);
      }
      
      if (updateData.credits && typeof updateData.credits === 'object') {
        updateData.credits = JSON.stringify(updateData.credits);
      }
      
      const subscription = await Subscription.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating subscription',
        error: error.message
      });
    }
  },

  // Delete subscription
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const subscription = await Subscription.delete(id);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Subscription deleted successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting subscription',
        error: error.message
      });
    }
  },

  // Cancel subscription
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const subscription = await Subscription.cancelSubscription(id, reason || 'No reason provided');
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or already cancelled'
        });
      }
      
      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling subscription',
        error: error.message
      });
    }
  },

  // Pause subscription
  async pause(req, res) {
    try {
      const { id } = req.params;
      
      const subscription = await Subscription.pauseSubscription(id);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or not active'
        });
      }
      
      res.json({
        success: true,
        message: 'Subscription paused successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error pausing subscription',
        error: error.message
      });
    }
  },

  // Resume subscription
  async resume(req, res) {
    try {
      const { id } = req.params;
      
      const subscription = await Subscription.resumeSubscription(id);
      
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found or not paused'
        });
      }
      
      res.json({
        success: true,
        message: 'Subscription resumed successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error resuming subscription',
        error: error.message
      });
    }
  },

  // Get expiring subscriptions
  async getExpiring(req, res) {
    try {
      const { days = 30 } = req.query;
      
      const subscriptions = await Subscription.getExpiringSubscriptions(parseInt(days));
      
      res.json({
        success: true,
        data: subscriptions,
        count: subscriptions.length
      });
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expiring subscriptions',
        error: error.message
      });
    }
  }
};

module.exports = subscriptionController;
