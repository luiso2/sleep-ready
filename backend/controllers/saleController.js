const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const { parseFilters } = require('../utils/helpers');

const saleController = {
  // Get all sales
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Sale.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales',
        error: error.message
      });
    }
  },

  // Get sale by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const sale = await Sale.getSaleDetails(id);
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      console.error('Error fetching sale:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sale',
        error: error.message
      });
    }
  },

  // Get sales statistics
  async getStats(req, res) {
    try {
      const { 
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate = new Date().toISOString(),
        groupBy = 'day'
      } = req.query;
      
      const stats = await Sale.getSalesStats(startDate, endDate, groupBy);
      
      // Calculate totals
      const totals = stats.reduce((acc, curr) => {
        acc.totalSales += parseInt(curr.total_sales);
        acc.totalRevenue += parseFloat(curr.total_revenue || 0);
        acc.uniqueCustomers = Math.max(acc.uniqueCustomers, parseInt(curr.unique_customers));
        return acc;
      }, { totalSales: 0, totalRevenue: 0, uniqueCustomers: 0 });
      
      res.json({
        success: true,
        data: {
          stats,
          totals,
          period: { startDate, endDate },
          groupBy
        }
      });
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales statistics',
        error: error.message
      });
    }
  },

  // Create new sale
  async create(req, res) {
    try {
      const saleData = req.body;
      
      // Validate required fields
      if (!saleData.customer_id || !saleData.type || !saleData.channel || !saleData.amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // Set user_id from authenticated user if not provided
      if (!saleData.user_id) {
        saleData.user_id = req.user.id;
      }
      
      // Add employee role for commission calculation
      saleData.employeeRole = req.user.role;
      
      // Create the sale
      const sale = await Sale.create(saleData);
      
      // Update customer lifetime value
      if (saleData.amount && saleData.amount.total) {
        await Customer.updateLifetimeValue(saleData.customer_id, saleData.amount.total);
      }
      
      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: sale
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating sale',
        error: error.message
      });
    }
  },

  // Update sale
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if sale exists
      const existing = await Sale.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      // Handle JSON fields
      if (updateData.amount && typeof updateData.amount === 'object') {
        updateData.amount = JSON.stringify(updateData.amount);
      }
      
      if (updateData.commission && typeof updateData.commission === 'object') {
        updateData.commission = JSON.stringify(updateData.commission);
      }
      
      if (updateData.contract && typeof updateData.contract === 'object') {
        updateData.contract = JSON.stringify(updateData.contract);
      }
      
      const sale = await Sale.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Sale updated successfully',
        data: sale
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating sale',
        error: error.message
      });
    }
  },

  // Delete sale
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const sale = await Sale.delete(id);
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Sale deleted successfully',
        data: sale
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting sale',
        error: error.message
      });
    }
  },

  // Get top performers
  async getTopPerformers(req, res) {
    try {
      const { 
        startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        endDate = new Date().toISOString(),
        limit = 10
      } = req.query;
      
      const performers = await Sale.getTopPerformers(startDate, endDate, limit);
      
      res.json({
        success: true,
        data: performers,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error fetching top performers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching top performers',
        error: error.message
      });
    }
  },

  // Update payment status
  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      
      const sale = await Sale.updatePaymentStatus(id, status);
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: sale
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment status',
        error: error.message
      });
    }
  }
};

module.exports = saleController;
