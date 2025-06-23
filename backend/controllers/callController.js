const Call = require('../models/Call');
const { parseFilters } = require('../utils/helpers');

const callController = {
  // Get all calls
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Call.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching calls:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching calls',
        error: error.message
      });
    }
  },

  // Get call by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const call = await Call.findById(id);
      
      if (!call) {
        return res.status(404).json({
          success: false,
          message: 'Call not found'
        });
      }
      
      res.json({
        success: true,
        data: call
      });
    } catch (error) {
      console.error('Error fetching call:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching call',
        error: error.message
      });
    }
  },

  // Get call statistics
  async getStats(req, res) {
    try {
      const { 
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate = new Date().toISOString(),
        groupBy = 'agent'
      } = req.query;
      
      const stats = await Call.getCallStats(startDate, endDate, groupBy);
      const activeCallsCount = await Call.getActiveCallsCount();
      
      res.json({
        success: true,
        data: {
          stats,
          activeCalls: activeCallsCount,
          period: { startDate, endDate },
          groupBy
        }
      });
    } catch (error) {
      console.error('Error fetching call stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching call statistics',
        error: error.message
      });
    }
  },

  // Create new call (start call)
  async create(req, res) {
    try {
      const callData = req.body;
      
      // Validate required fields
      if (!callData.customer_id || !callData.type) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID and call type are required'
        });
      }
      
      // Set user_id from authenticated user if not provided
      if (!callData.user_id) {
        callData.user_id = req.user.id;
      }
      
      const call = await Call.create(callData);
      
      res.status(201).json({
        success: true,
        message: 'Call started successfully',
        data: call
      });
    } catch (error) {
      console.error('Error creating call:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating call',
        error: error.message
      });
    }
  },

  // Update call
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if call exists
      const existing = await Call.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Call not found'
        });
      }
      
      // Handle JSON fields
      if (updateData.script && typeof updateData.script === 'object') {
        updateData.script = JSON.stringify(updateData.script);
      }
      
      if (updateData.objections && Array.isArray(updateData.objections)) {
        updateData.objections = `{${updateData.objections.join(',')}}`;
      }
      
      if (updateData.next_action && typeof updateData.next_action === 'object') {
        updateData.next_action = JSON.stringify(updateData.next_action);
      }
      
      if (updateData.metadata && typeof updateData.metadata === 'object') {
        updateData.metadata = JSON.stringify(updateData.metadata);
      }
      
      const call = await Call.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Call updated successfully',
        data: call
      });
    } catch (error) {
      console.error('Error updating call:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating call',
        error: error.message
      });
    }
  },

  // Delete call
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const call = await Call.delete(id);
      
      if (!call) {
        return res.status(404).json({
          success: false,
          message: 'Call not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Call deleted successfully',
        data: call
      });
    } catch (error) {
      console.error('Error deleting call:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting call',
        error: error.message
      });
    }
  },

  // Log a completed call
  async log(req, res) {
    try {
      const callData = req.body;
      
      // Validate required fields
      if (!callData.customer_id || !callData.type || !callData.disposition) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID, call type, and disposition are required'
        });
      }
      
      // Set user_id from authenticated user if not provided
      if (!callData.user_id) {
        callData.user_id = req.user.id;
      }
      
      const call = await Call.logCall(callData);
      
      res.status(201).json({
        success: true,
        message: 'Call logged successfully',
        data: call
      });
    } catch (error) {
      console.error('Error logging call:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging call',
        error: error.message
      });
    }
  },

  // End an active call
  async end(req, res) {
    try {
      const { id } = req.params;
      const { disposition, notes, next_action } = req.body;
      
      if (!disposition) {
        return res.status(400).json({
          success: false,
          message: 'Call disposition is required'
        });
      }
      
      const call = await Call.endCall(id, {
        disposition,
        notes,
        next_action
      });
      
      if (!call) {
        return res.status(404).json({
          success: false,
          message: 'Call not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Call ended successfully',
        data: call
      });
    } catch (error) {
      console.error('Error ending call:', error);
      res.status(500).json({
        success: false,
        message: 'Error ending call',
        error: error.message
      });
    }
  },

  // Get call queue
  async getQueue(req, res) {
    try {
      const { campaignId } = req.query;
      
      const queue = await Call.getCallQueue(campaignId);
      
      res.json({
        success: true,
        data: queue,
        count: queue.length
      });
    } catch (error) {
      console.error('Error fetching call queue:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching call queue',
        error: error.message
      });
    }
  },

  // Get recent calls
  async getRecent(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const calls = await Call.getRecentCalls(parseInt(limit));
      
      res.json({
        success: true,
        data: calls
      });
    } catch (error) {
      console.error('Error fetching recent calls:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching recent calls',
        error: error.message
      });
    }
  },

  // Get agent calls
  async getAgentCalls(req, res) {
    try {
      const { agentId } = req.params;
      const { startDate, endDate } = req.query;
      
      const calls = await Call.getCallsByAgent(agentId, startDate, endDate);
      
      res.json({
        success: true,
        data: calls,
        count: calls.length
      });
    } catch (error) {
      console.error('Error fetching agent calls:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching agent calls',
        error: error.message
      });
    }
  }
};

module.exports = callController;
