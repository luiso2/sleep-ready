const Product = require('../models/Product');
const { parseFilters } = require('../utils/helpers');

const productController = {
  // Get all products
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Product.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },

  // Get product by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  },

  // Create new product
  async create(req, res) {
    try {
      const productData = req.body;
      
      // Check if SKU already exists
      if (productData.sku) {
        const existingSku = await Product.findBySku(productData.sku);
        if (existingSku) {
          return res.status(400).json({
            success: false,
            message: 'Product with this SKU already exists'
          });
        }
      }
      
      const product = await Product.create(productData);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },

  // Update product
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if product exists
      const existing = await Product.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Check if SKU is being changed and already exists
      if (updateData.sku && updateData.sku !== existing.sku) {
        const skuExists = await Product.findBySku(updateData.sku);
        if (skuExists) {
          return res.status(400).json({
            success: false,
            message: 'SKU already in use'
          });
        }
      }
      
      // Handle JSON fields
      if (updateData.features && typeof updateData.features === 'object') {
        updateData.features = JSON.stringify(updateData.features);
      }
      
      if (updateData.specifications && typeof updateData.specifications === 'object') {
        updateData.specifications = JSON.stringify(updateData.specifications);
      }
      
      if (updateData.images && Array.isArray(updateData.images)) {
        updateData.images = `{${updateData.images.join(',')}}`;
      }
      
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateData.tags = `{${updateData.tags.join(',')}}`;
      }
      
      const product = await Product.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  },

  // Delete product
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const product = await Product.delete(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  },

  // Search products
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }
      
      const products = await Product.searchProducts(q);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching products',
        error: error.message
      });
    }
  },

  // Get low stock products
  async getLowStock(req, res) {
    try {
      const products = await Product.getLowStock();
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock products',
        error: error.message
      });
    }
  },

  // Get product categories
  async getCategories(req, res) {
    try {
      const categories = await Product.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  },

  // Update product stock
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation, reason } = req.body;
      
      const product = await Product.updateStock(id, quantity, operation);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        message: `Stock ${operation === 'add' ? 'added' : operation === 'subtract' ? 'deducted' : 'updated'} successfully`,
        data: product
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stock',
        error: error.message
      });
    }
  }
};

module.exports = productController;
