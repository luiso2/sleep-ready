const Campaign = require('../models/Campaign');
const { parseFilters } = require('../utils/helpers');

const campaignController = {
  // Get all campaigns
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Campaign.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaigns',
        error: error.message
      });
    }
  },

  // Get campaign by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const campaign = await Campaign.findById(id);
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign',
        error: error.message
      });
    }
  },

  // Get campaign statistics
  async getStats(req, res) {
    try {
      const { id } = req.params;
      
      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      const stats = await Campaign.getCampaignStats(id);
      const targetCustomers = await Campaign.getTargetCustomers(id);
      
      res.json({
        success: true,
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            type: campaign.type
          },
          stats: stats || {
            total_calls: 0,
            unique_contacts: 0,
            successful_calls: 0,
            appointments_set: 0,
            callbacks_scheduled: 0,
            avg_call_duration: 0,
            conversion_rate: 0
          },
          targetAudience: targetCustomers.length,
          targeting: JSON.parse(campaign.targeting || '{}')
        }
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign statistics',
        error: error.message
      });
    }
  },

  // Create new campaign
  async create(req, res) {
    try {
      const campaignData = req.body;
      
      // Validate required fields
      if (!campaignData.name || !campaignData.type) {
        return res.status(400).json({
          success: false,
          message: 'Campaign name and type are required'
        });
      }
      
      // Set created_by from authenticated user
      campaignData.created_by = req.user.id;
      
      const campaign = await Campaign.create(campaignData);
      
      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating campaign',
        error: error.message
      });
    }
  },

  // Update campaign
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if campaign exists
      const existing = await Campaign.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      // Prevent updating active campaigns certain fields
      if (existing.status === 'active' && (updateData.targeting || updateData.script)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update targeting or script for active campaigns'
        });
      }
      
      // Handle JSON fields
      if (updateData.targeting && typeof updateData.targeting === 'object') {
        updateData.targeting = JSON.stringify(updateData.targeting);
      }
      
      if (updateData.script && typeof updateData.script === 'object') {
        updateData.script = JSON.stringify(updateData.script);
      }
      
      if (updateData.offer && typeof updateData.offer === 'object') {
        updateData.offer = JSON.stringify(updateData.offer);
      }
      
      if (updateData.metrics && typeof updateData.metrics === 'object') {
        updateData.metrics = JSON.stringify(updateData.metrics);
      }
      
      if (updateData.assigned_to && Array.isArray(updateData.assigned_to)) {
        updateData.assigned_to = `{${updateData.assigned_to.join(',')}}`;
      }
      
      const campaign = await Campaign.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating campaign',
        error: error.message
      });
    }
  },

  // Delete campaign
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if campaign exists and is not active
      const existing = await Campaign.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      if (existing.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete an active campaign'
        });
      }
      
      const campaign = await Campaign.delete(id);
      
      res.json({
        success: true,
        message: 'Campaign deleted successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting campaign',
        error: error.message
      });
    }
  },

  // Start campaign
  async start(req, res) {
    try {
      const { id } = req.params;
      
      const campaign = await Campaign.updateStatus(id, 'active');
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Campaign started successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error starting campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error starting campaign',
        error: error.message
      });
    }
  },

  // Pause campaign
  async pause(req, res) {
    try {
      const { id } = req.params;
      
      const campaign = await Campaign.updateStatus(id, 'paused');
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Campaign paused successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error pausing campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error pausing campaign',
        error: error.message
      });
    }
  },

  // Complete campaign
  async complete(req, res) {
    try {
      const { id } = req.params;
      
      const campaign = await Campaign.updateStatus(id, 'completed');
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Campaign completed successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error completing campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing campaign',
        error: error.message
      });
    }
  },

  // Assign agents to campaign
  async assignAgents(req, res) {
    try {
      const { id } = req.params;
      const { agentIds } = req.body;
      
      if (!Array.isArray(agentIds) || agentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Agent IDs array is required'
        });
      }
      
      const campaign = await Campaign.assignAgents(id, agentIds);
      
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Agents assigned successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error assigning agents:', error);
      res.status(500).json({
        success: false,
        message: 'Error assigning agents',
        error: error.message
      });
    }
  },

  // Get campaign performance
  async getPerformance(req, res) {
    try {
      const { 
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        endDate = new Date().toISOString()
      } = req.query;
      
      const performance = await Campaign.getCampaignPerformance(startDate, endDate);
      
      res.json({
        success: true,
        data: performance,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error fetching campaign performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching campaign performance',
        error: error.message
      });
    }
  }
};

module.exports = campaignController;
