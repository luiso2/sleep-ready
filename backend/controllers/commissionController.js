const Commission = require('../models/Commission');
const { parseFilters } = require('../utils/helpers');

const commissionController = {
  // Get all commissions
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Commission.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching commissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching commissions',
        error: error.message
      });
    }
  },

  // Get commission by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const commission = await Commission.findById(id);
      
      if (!commission) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }
      
      res.json({
        success: true,
        data: commission
      });
    } catch (error) {
      console.error('Error fetching commission:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching commission',
        error: error.message
      });
    }
  },

  // Create commission
  async create(req, res) {
    try {
      const commissionData = req.body;
      const commission = await Commission.create(commissionData);
      
      res.status(201).json({
        success: true,
        message: 'Commission created successfully',
        data: commission
      });
    } catch (error) {
      console.error('Error creating commission:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating commission',
        error: error.message
      });
    }
  },

  // Update commission
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const commission = await Commission.update(id, updateData);
      
      if (!commission) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Commission updated successfully',
        data: commission
      });
    } catch (error) {
      console.error('Error updating commission:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating commission',
        error: error.message
      });
    }
  },

  // Delete commission
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const commission = await Commission.delete(id);
      
      if (!commission) {
        return res.status(404).json({
          success: false,
          message: 'Commission not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Commission deleted successfully',
        data: commission
      });
    } catch (error) {
      console.error('Error deleting commission:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting commission',
        error: error.message
      });
    }
  },

  // Calculate commission for a sale
  async calculateSaleCommission(req, res) {
    try {
      const { sale_id } = req.params;
      
      const commission = await Commission.calculateForSale(sale_id);
      
      res.json({
        success: true,
        message: 'Commission calculated successfully',
        data: commission
      });
    } catch (error) {
      console.error('Error calculating commission:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating commission',
        error: error.message
      });
    }
  },

  // Get employee commission summary
  async getEmployeeSummary(req, res) {
    try {
      const { employee_id } = req.params;
      const { date_from, date_to } = req.query;
      
      const summary = await Commission.getEmployeeSummary(employee_id, { date_from, date_to });
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching employee commission summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee commission summary',
        error: error.message
      });
    }
  },

  // Process pending commissions
  async processPending(req, res) {
    try {
      const { employee_id, date_from, date_to } = req.body;
      
      const processed = await Commission.processPending({ employee_id, date_from, date_to });
      
      res.json({
        success: true,
        message: 'Commissions processed successfully',
        data: {
          processed_count: processed.length,
          total_amount: processed.reduce((sum, c) => sum + parseFloat(c.amount), 0),
          commissions: processed
        }
      });
    } catch (error) {
      console.error('Error processing commissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing commissions',
        error: error.message
      });
    }
  },

  // Get commission report
  async getReport(req, res) {
    try {
      const { date_from, date_to, group_by = 'employee' } = req.query;
      
      const report = await Commission.getReport({ date_from, date_to, group_by });
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating commission report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating commission report',
        error: error.message
      });
    }
  }
};

module.exports = commissionController;
