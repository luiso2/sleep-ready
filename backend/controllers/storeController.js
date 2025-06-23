const Store = require('../models/Store');
const { parseFilters } = require('../utils/helpers');

const storeController = {
  // Get all stores
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Store.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stores',
        error: error.message
      });
    }
  },

  // Get store by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const store = await Store.findById(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      res.json({
        success: true,
        data: store
      });
    } catch (error) {
      console.error('Error fetching store:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching store',
        error: error.message
      });
    }
  },

  // Get store performance
  async getPerformance(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const performance = await Store.getStorePerformance(id, startDate, endDate);
      
      res.json({
        success: true,
        data: {
          store: {
            id: store.id,
            name: store.name,
            code: store.code
          },
          performance,
          period: {
            start: startDate || 'all time',
            end: endDate || 'current'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching store performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching store performance',
        error: error.message
      });
    }
  },

  // Get store employees
  async getEmployees(req, res) {
    try {
      const { id } = req.params;
      
      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      const employees = await Store.getStoreEmployees(id);
      
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Error fetching store employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching store employees',
        error: error.message
      });
    }
  },

  // Create new store
  async create(req, res) {
    try {
      const storeData = req.body;
      
      // Check if store code already exists
      if (storeData.code) {
        const existingCode = await Store.findByCode(storeData.code);
        if (existingCode) {
          return res.status(400).json({
            success: false,
            message: 'Store with this code already exists'
          });
        }
      }
      
      const store = await Store.create(storeData);
      
      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: store
      });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating store',
        error: error.message
      });
    }
  },

  // Update store
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if store exists
      const existing = await Store.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      // Check if code is being changed and already exists
      if (updateData.code && updateData.code !== existing.code) {
        const codeExists = await Store.findByCode(updateData.code);
        if (codeExists) {
          return res.status(400).json({
            success: false,
            message: 'Store code already in use'
          });
        }
      }
      
      // Handle JSON fields
      if (updateData.address && typeof updateData.address === 'object') {
        updateData.address = JSON.stringify(updateData.address);
      }
      
      if (updateData.hours && typeof updateData.hours === 'object') {
        updateData.hours = JSON.stringify(updateData.hours);
      }
      
      if (updateData.service_area && typeof updateData.service_area === 'object') {
        updateData.service_area = JSON.stringify(updateData.service_area);
      }
      
      if (updateData.performance && typeof updateData.performance === 'object') {
        updateData.performance = JSON.stringify(updateData.performance);
      }
      
      const store = await Store.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Store updated successfully',
        data: store
      });
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating store',
        error: error.message
      });
    }
  },

  // Delete store
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if store has employees
      const employees = await Store.getStoreEmployees(id);
      if (employees.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete store with active employees'
        });
      }
      
      const store = await Store.delete(id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Store deleted successfully',
        data: store
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting store',
        error: error.message
      });
    }
  },

  // Get nearby stores
  async getNearby(req, res) {
    try {
      const { lat, lng, radius = 50 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }
      
      const stores = await Store.getNearbyStores(
        parseFloat(lat), 
        parseFloat(lng), 
        parseInt(radius)
      );
      
      res.json({
        success: true,
        data: stores
      });
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching nearby stores',
        error: error.message
      });
    }
  }
};

module.exports = storeController;
