const Evaluation = require('../models/Evaluation');
const Customer = require('../models/Customer');
const { parseFilters } = require('../utils/helpers');

const evaluationController = {
  // Get all evaluations with filters
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Evaluation.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching evaluations',
        error: error.message
      });
    }
  },

  // Get evaluation by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const evaluation = await Evaluation.findById(id);
      
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching evaluation',
        error: error.message
      });
    }
  },

  // Create new Trade & Sleep evaluation
  async create(req, res) {
    try {
      const evaluationData = req.body;
      
      // Verify customer exists
      const customer = await Customer.findById(evaluationData.customer_id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      const evaluation = await Evaluation.create(evaluationData);
      
      res.status(201).json({
        success: true,
        message: 'Evaluation created successfully',
        data: evaluation
      });
    } catch (error) {
      console.error('Error creating evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating evaluation',
        error: error.message
      });
    }
  },

  // Update evaluation
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const evaluation = await Evaluation.update(id, updateData);
      
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Evaluation updated successfully',
        data: evaluation
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating evaluation',
        error: error.message
      });
    }
  },

  // Delete evaluation
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const evaluation = await Evaluation.delete(id);
      
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Evaluation deleted successfully',
        data: evaluation
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting evaluation',
        error: error.message
      });
    }
  },

  // Process AI evaluation
  async processAIEvaluation(req, res) {
    try {
      const { id } = req.params;
      const { photos } = req.body;
      
      const evaluation = await Evaluation.findById(id);
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      // Simulate AI evaluation process
      const aiEvaluation = {
        condition_score: Math.floor(Math.random() * 5) + 1, // 1-5
        estimated_age: Math.floor(Math.random() * 10) + 1, // 1-10 years
        defects: {
          stains: Math.random() > 0.5,
          tears: Math.random() > 0.7,
          sagging: Math.random() > 0.6,
          odor: Math.random() > 0.8
        },
        hygiene_score: Math.floor(Math.random() * 10) + 1, // 1-10
        recommendation: 'approved',
        credit_amount: Math.floor(Math.random() * 300) + 100, // $100-$400
        notes: 'AI evaluation completed successfully'
      };
      
      const updatedEvaluation = await Evaluation.updateAIEvaluation(id, photos, aiEvaluation);
      
      res.json({
        success: true,
        message: 'AI evaluation processed successfully',
        data: updatedEvaluation
      });
    } catch (error) {
      console.error('Error processing AI evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing AI evaluation',
        error: error.message
      });
    }
  },

  // Approve evaluation and generate coupon
  async approveEvaluation(req, res) {
    try {
      const { id } = req.params;
      const { credit_amount, expires_days = 30 } = req.body;
      
      const evaluation = await Evaluation.findById(id);
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      if (evaluation.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Evaluation is not pending approval'
        });
      }
      
      // Generate coupon code
      const couponCode = `TS${Date.now().toString(36).toUpperCase()}`;
      
      const approvedEvaluation = await Evaluation.approve(id, credit_amount, couponCode, expires_days);
      
      // Update customer credits
      await Customer.updateCredits(evaluation.customer_id, credit_amount, 'add');
      
      res.json({
        success: true,
        message: 'Evaluation approved successfully',
        data: approvedEvaluation
      });
    } catch (error) {
      console.error('Error approving evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving evaluation',
        error: error.message
      });
    }
  },

  // Reject evaluation
  async rejectEvaluation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const evaluation = await Evaluation.reject(id, reason);
      
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Evaluation not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Evaluation rejected',
        data: evaluation
      });
    } catch (error) {
      console.error('Error rejecting evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Error rejecting evaluation',
        error: error.message
      });
    }
  },

  // Get evaluation statistics
  async getStats(req, res) {
    try {
      const { store_id, employee_id, date_from, date_to } = req.query;
      const stats = await Evaluation.getStats({ store_id, employee_id, date_from, date_to });
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching evaluation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching evaluation statistics',
        error: error.message
      });
    }
  },

  // Redeem evaluation coupon
  async redeemCoupon(req, res) {
    try {
      const { coupon_code } = req.params;
      
      const evaluation = await Evaluation.findByCouponCode(coupon_code);
      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }
      
      if (evaluation.status === 'redeemed') {
        return res.status(400).json({
          success: false,
          message: 'Coupon has already been redeemed'
        });
      }
      
      if (evaluation.status === 'expired') {
        return res.status(400).json({
          success: false,
          message: 'Coupon has expired'
        });
      }
      
      const redeemedEvaluation = await Evaluation.redeemCoupon(coupon_code);
      
      res.json({
        success: true,
        message: 'Coupon redeemed successfully',
        data: redeemedEvaluation
      });
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      res.status(500).json({
        success: false,
        message: 'Error redeeming coupon',
        error: error.message
      });
    }
  }
};

module.exports = evaluationController;
