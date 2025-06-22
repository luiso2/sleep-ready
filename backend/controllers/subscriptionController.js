const BaseController = require('./baseController');
const db = require('../config/database');

class SubscriptionController extends BaseController {
  constructor() {
    super('subscriptions', 'sub-');
  }

  // Override getAll to include customer information
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'created_at', 
        order = 'DESC',
        plan = '',
        status = '',
        customer_id = ''
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT s.*,
               c.first_name as customer_first_name,
               c.last_name as customer_last_name,
               c.email as customer_email,
               c.phone as customer_phone,
               e.first_name as seller_first_name,
               e.last_name as seller_last_name
        FROM subscriptions s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN employees e ON s.sold_by = e.id
        WHERE 1=1
      `;
      
      let params = [];
      let paramCount = 0;

      if (plan) {
        paramCount++;
        query += ` AND s.plan = $${paramCount}`;
        params.push(plan);
      }

      if (status) {
        paramCount++;
        query += ` AND s.status = $${paramCount}`;
        params.push(status);
      }

      if (customer_id) {
        paramCount++;
        query += ` AND s.customer_id = $${paramCount}`;
        params.push(customer_id);
      }

      query += ` ORDER BY s.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM subscriptions s WHERE 1=1';
      const countParams = params.slice(0, -2);

      if (plan) countQuery += ' AND s.plan = $1';
      if (status) countQuery += ' AND s.status = $2';
      if (customer_id) countQuery += ' AND s.customer_id = $3';

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cancel a subscription
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason = '' } = req.body;

      const result = await db.query(
        `UPDATE subscriptions 
         SET status = 'cancelled',
             cancelled_at = NOW(),
             cancel_reason = $2,
             updated_at = NOW()
         WHERE id = $1 AND status = 'active'
         RETURNING *`,
        [id, reason]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Subscription not found or not active'
        });
      }

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Pause a subscription
  async pause(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE subscriptions 
         SET status = 'paused',
             paused_at = NOW(),
             updated_at = NOW()
         WHERE id = $1 AND status = 'active'
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Subscription not found or not active'
        });
      }

      res.json({
        success: true,
        message: 'Subscription paused successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Pause subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Resume a subscription
  async resume(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE subscriptions 
         SET status = 'active',
             paused_at = NULL,
             updated_at = NOW()
         WHERE id = $1 AND status = 'paused'
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Subscription not found or not paused'
        });
      }

      res.json({
        success: true,
        message: 'Subscription resumed successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Resume subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get subscription statistics
  async getStats(req, res) {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
          SUM(CASE WHEN status = 'active' THEN (pricing->>'monthly')::numeric ELSE 0 END) as monthly_recurring_revenue,
          AVG((pricing->>'monthly')::numeric) as avg_subscription_value
        FROM subscriptions
      `);

      // Get plan distribution
      const planStats = await db.query(`
        SELECT plan, COUNT(*) as count
        FROM subscriptions
        WHERE status = 'active'
        GROUP BY plan
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: {
          overview: stats.rows[0],
          planDistribution: planStats.rows
        }
      });

    } catch (error) {
      console.error('Get subscription stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new SubscriptionController();
