const BaseController = require('./baseController');
const db = require('../config/database');

class SaleController extends BaseController {
  constructor() {
    super('sales', 'sale-');
  }

  // Override getAll to include related data
  async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'created_at', 
        order = 'DESC',
        type = '',
        channel = '',
        payment_status = '',
        user_id = '',
        customer_id = '',
        store_id = '',
        start_date = '',
        end_date = ''
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT s.*, 
               c.first_name as customer_first_name, 
               c.last_name as customer_last_name,
               e.first_name as employee_first_name,
               e.last_name as employee_last_name,
               st.name as store_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN employees e ON s.user_id = e.id
        LEFT JOIN stores st ON s.store_id = st.id
        WHERE 1=1
      `;
      
      let params = [];
      let paramCount = 0;

      if (type) {
        paramCount++;
        query += ` AND s.type = $${paramCount}`;
        params.push(type);
      }

      if (channel) {
        paramCount++;
        query += ` AND s.channel = $${paramCount}`;
        params.push(channel);
      }

      if (payment_status) {
        paramCount++;
        query += ` AND s.payment_status = $${paramCount}`;
        params.push(payment_status);
      }

      if (user_id) {
        paramCount++;
        query += ` AND s.user_id = $${paramCount}`;
        params.push(user_id);
      }

      if (customer_id) {
        paramCount++;
        query += ` AND s.customer_id = $${paramCount}`;
        params.push(customer_id);
      }

      if (store_id) {
        paramCount++;
        query += ` AND s.store_id = $${paramCount}`;
        params.push(store_id);
      }

      if (start_date) {
        paramCount++;
        query += ` AND s.created_at >= $${paramCount}`;
        params.push(start_date);
      }

      if (end_date) {
        paramCount++;
        query += ` AND s.created_at <= $${paramCount}`;
        params.push(end_date);
      }

      query += ` ORDER BY s.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count with same filters
      let countQuery = 'SELECT COUNT(*) FROM sales s WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset

      if (type) countQuery += ' AND s.type = $1';
      if (channel) countQuery += ' AND s.channel = $2';
      // ... add other conditions

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
      console.error('Get sales error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get sales statistics
  async getStats(req, res) {
    try {
      const { start_date, end_date, group_by = 'day' } = req.query;

      let dateFormat;
      switch (group_by) {
        case 'hour':
          dateFormat = 'YYYY-MM-DD HH24:00:00';
          break;
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        default:
          dateFormat = 'YYYY-MM-DD';
      }

      let query = `
        SELECT 
          TO_CHAR(created_at, '${dateFormat}') as period,
          COUNT(*) as total_sales,
          SUM((amount->>'total')::numeric) as total_revenue,
          AVG((amount->>'total')::numeric) as avg_sale_value,
          COUNT(DISTINCT customer_id) as unique_customers,
          COUNT(DISTINCT user_id) as active_employees
        FROM sales
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (start_date) {
        paramCount++;
        query += ` AND created_at >= $${paramCount}`;
        params.push(start_date);
      }

      if (end_date) {
        paramCount++;
        query += ` AND created_at <= $${paramCount}`;
        params.push(end_date);
      }

      query += ` GROUP BY period ORDER BY period DESC`;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Get sales stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new SaleController();
