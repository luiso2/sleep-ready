const BaseController = require('./baseController');
const db = require('../config/database');

class CampaignController extends BaseController {
  constructor() {
    super('campaigns', 'camp-');
  }

  // Override getAll to include creator information
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'created_at', 
        order = 'DESC',
        type = '',
        status = '',
        created_by = ''
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.*,
               e.first_name as creator_first_name,
               e.last_name as creator_last_name,
               (SELECT COUNT(*) FROM calls WHERE calls.metadata->>'campaign_id' = c.id) as total_calls,
               (SELECT COUNT(*) FROM sales WHERE sales.metadata->>'campaign_id' = c.id) as total_sales
        FROM campaigns c
        LEFT JOIN employees e ON c.created_by = e.id
        WHERE 1=1
      `;
      
      let params = [];
      let paramCount = 0;

      if (type) {
        paramCount++;
        query += ` AND c.type = $${paramCount}`;
        params.push(type);
      }

      if (status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }

      if (created_by) {
        paramCount++;
        query += ` AND c.created_by = $${paramCount}`;
        params.push(created_by);
      }

      query += ` ORDER BY c.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM campaigns c WHERE 1=1';
      const countParams = params.slice(0, -2);

      if (type) countQuery += ' AND c.type = $1';
      if (status) countQuery += ' AND c.status = $2';
      if (created_by) countQuery += ' AND c.created_by = $3';

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
      console.error('Get campaigns error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Start a campaign
  async start(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE campaigns 
         SET status = 'active', 
             start_date = COALESCE(start_date, NOW()),
             updated_at = NOW()
         WHERE id = $1 AND status IN ('draft', 'paused')
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Campaign not found or cannot be started'
        });
      }

      res.json({
        success: true,
        message: 'Campaign started successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Start campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Pause a campaign
  async pause(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE campaigns 
         SET status = 'paused',
             updated_at = NOW()
         WHERE id = $1 AND status = 'active'
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Campaign not found or not active'
        });
      }

      res.json({
        success: true,
        message: 'Campaign paused successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Pause campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Complete a campaign
  async complete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE campaigns 
         SET status = 'completed',
             end_date = COALESCE(end_date, NOW()),
             updated_at = NOW()
         WHERE id = $1 AND status IN ('active', 'paused')
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Campaign not found or already completed'
        });
      }

      res.json({
        success: true,
        message: 'Campaign completed successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Complete campaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get campaign statistics
  async getStats(req, res) {
    try {
      const { id } = req.params;

      // Get campaign
      const campaign = await db.query(
        'SELECT * FROM campaigns WHERE id = $1',
        [id]
      );

      if (campaign.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // Get call stats
      const callStats = await db.query(
        `SELECT 
          COUNT(*) as total_calls,
          COUNT(DISTINCT customer_id) as unique_customers,
          AVG(duration) as avg_call_duration,
          COUNT(CASE WHEN disposition = 'sale' THEN 1 END) as successful_calls
         FROM calls 
         WHERE metadata->>'campaign_id' = $1`,
        [id]
      );

      // Get sales stats
      const salesStats = await db.query(
        `SELECT 
          COUNT(*) as total_sales,
          SUM((amount->>'total')::numeric) as total_revenue,
          AVG((amount->>'total')::numeric) as avg_sale_value
         FROM sales 
         WHERE metadata->>'campaign_id' = $1`,
        [id]
      );

      // Get assigned employees
      const employees = await db.query(
        `SELECT id, first_name, last_name, role
         FROM employees 
         WHERE id = ANY($1::varchar[])`,
        [campaign.rows[0].assigned_to || []]
      );

      res.json({
        success: true,
        data: {
          campaign: campaign.rows[0],
          calls: callStats.rows[0],
          sales: salesStats.rows[0],
          employees: employees.rows
        }
      });

    } catch (error) {
      console.error('Get campaign stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new CampaignController();
