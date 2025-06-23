const Customer = require('../models/Customer');
const { parseFilters } = require('../utils/helpers');

const customerController = {
  // Get all customers
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Customer.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching customers',
        error: error.message
      });
    }
  },

  // Get customer by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      // Get customer stats
      const stats = await Customer.getCustomerStats(id);
      
      res.json({
        success: true,
        data: {
          ...customer,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching customer',
        error: error.message
      });
    }
  },

  // Create new customer
  async create(req, res) {
    try {
      const customerData = req.body;
      
      // Check if email or phone already exists
      if (customerData.email) {
        const existingEmail = await Customer.findByEmail(customerData.email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Customer with this email already exists'
          });
        }
      }
      
      if (customerData.phone) {
        const existingPhone = await Customer.findByPhone(customerData.phone);
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: 'Customer with this phone number already exists'
          });
        }
      }
      
      const customer = await Customer.create(customerData);
      
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating customer',
        error: error.message
      });
    }
  },

  // Update customer
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if customer exists
      const existing = await Customer.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      // Check if email is being changed and already exists
      if (updateData.email && updateData.email !== existing.email) {
        const emailExists = await Customer.findByEmail(updateData.email);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }
      
      // Check if phone is being changed and already exists
      if (updateData.phone && updateData.phone !== existing.phone) {
        const phoneExists = await Customer.findByPhone(updateData.phone);
        if (phoneExists) {
          return res.status(400).json({
            success: false,
            message: 'Phone number already in use'
          });
        }
      }
      
      // Handle JSON fields
      if (updateData.address && typeof updateData.address === 'object') {
        updateData.address = JSON.stringify(updateData.address);
      }
      
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = `{${updateData.tags.join(',')}}`;
      }
      
      if (updateData.purchased_items && Array.isArray(updateData.purchased_items)) {
        updateData.purchased_items = `{${updateData.purchased_items.join(',')}}`;
      }
      
      const customer = await Customer.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating customer',
        error: error.message
      });
    }
  },

  // Delete customer
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const customer = await Customer.delete(id);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Customer deleted successfully',
        data: customer
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting customer',
        error: error.message
      });
    }
  },

  // Search customers
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }
      
      const customers = await Customer.searchCustomers(q);
      
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching customers',
        error: error.message
      });
    }
  },

  // Update customer credits
  async updateCredits(req, res) {
    try {
      const { id } = req.params;
      const { amount, operation = 'add', reason } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credit amount'
        });
      }
      
      const customer = await Customer.updateCredits(id, amount, operation);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      res.json({
        success: true,
        message: `Credits ${operation === 'add' ? 'added' : 'deducted'} successfully`,
        data: customer
      });
    } catch (error) {
      console.error('Error updating credits:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating credits',
        error: error.message
      });
    }
  }
};

module.exports = customerController;
