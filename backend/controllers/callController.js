const BaseController = require('./baseController');
const db = require('../config/database');

class CallController extends BaseController {
  constructor() {
    super('calls', 'call-');
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
        status = '',
        disposition = '',
        user_id = '',
        customer_id = '',
        start_date = '',
        end_date = ''
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.*, 
               cust.first_name as customer_first_name, 
               cust.last_name as customer_last_name,
               cust.phone as customer_phone,
               e.first_name as employee_first_name,
               e.last_name as employee_last_name
        FROM calls c
        LEFT JOIN customers cust ON c.customer_id = cust.id
        LEFT JOIN employees e ON c.user_id = e.id
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

      if (disposition) {
        paramCount++;
        query += ` AND c.disposition = $${paramCount}`;
        params.push(disposition);
      }

      if (user_id) {
        paramCount++;
        query += ` AND c.user_id = $${paramCount}`;
        params.push(user_id);
      }

      if (customer_id) {
        paramCount++;
        query += ` AND c.customer_id = $${paramCount}`;
        params.push(customer_id);
      }

      if (start_date) {
        paramCount++;
        query += ` AND c.start_time >= $${paramCount}`;
        params.push(start_date);
      }

      if (end_date) {
        paramCount++;
        query += ` AND c.start_time <= $${paramCount}`;
        params.push(end_date);
      }

      query += ` ORDER BY c.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM calls c WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset

      if (type) countQuery += ' AND c.type = $1';
      if (status) countQuery += ' AND c.status = $2';
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
      console.error('Get calls error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Log a new call
  async logCall(req, res) {
    try {
      const {
        customer_id,
        user_id,
        type,
        status,
        disposition,
        duration,
        notes,
        script,
        objections = [],
        next_action
      } = req.body;

      const id = this.generateId();
      const start_time = new Date();
      const end_time = new Date(start_time.getTime() + (duration * 1000)); // duration in seconds

      const result = await db.query(
        `INSERT INTO calls 
         (id, customer_id, user_id, type, status, disposition, duration, 
          start_time, end_time, notes, script, objections, next_action, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
         RETURNING *`,
        [id, customer_id, user_id, type, status, disposition, duration,
         start_time, end_time, notes, JSON.stringify(script), objections, 
         JSON.stringify(next_action)]
      );

      // Update customer's last contact date
      if (customer_id) {
        await db.query(
          'UPDATE customers SET last_contact_date = NOW() WHERE id = $1',
          [customer_id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Call logged successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Log call error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get call statistics
  async getStats(req, res) {
    try {
      const { user_id, start_date, end_date } = req.query;

      let query = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(DISTINCT customer_id) as unique_customers,
          AVG(duration) as avg_duration,
          COUNT(CASE WHEN disposition = 'sale' THEN 1 END) as successful_calls,
          COUNT(CASE WHEN disposition = 'no_answer' THEN 1 END) as no_answer,
          COUNT(CASE WHEN disposition = 'callback' THEN 1 END) as callbacks,
          COUNT(CASE WHEN type = 'inbound' THEN 1 END) as inbound_calls,
          COUNT(CASE WHEN type = 'outbound' THEN 1 END) as outbound_calls
        FROM calls
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (user_id) {
        paramCount++;
        query += ` AND user_id = $${paramCount}`;
        params.push(user_id);
      }

      if (start_date) {
        paramCount++;
        query += ` AND start_time >= $${paramCount}`;
        params.push(start_date);
      }

      if (end_date) {
        paramCount++;
        query += ` AND start_time <= $${paramCount}`;
        params.push(end_date);
      }

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Get call stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new CallController();
