const BaseController = require('./baseController');
const db = require('../config/database');

class EmployeeController extends BaseController {
  constructor() {
    super('employees', 'emp-');
  }

  // Override getAll to include store information
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'created_at', order = 'DESC', role = '', store_id = '', status = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT e.*, s.name as store_name 
        FROM employees e
        LEFT JOIN stores s ON e.store_id = s.id
        WHERE 1=1
      `;
      let params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        query += ` AND e.role = $${paramCount}`;
        params.push(role);
      }

      if (store_id) {
        paramCount++;
        query += ` AND e.store_id = $${paramCount}`;
        params.push(store_id);
      }

      if (status) {
        paramCount++;
        query += ` AND e.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY e.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM employees WHERE 1=1';
      let countParams = [];
      let countParamCount = 0;

      if (role) {
        countParamCount++;
        countQuery += ` AND role = $${countParamCount}`;
        countParams.push(role);
      }

      if (store_id) {
        countParamCount++;
        countQuery += ` AND store_id = $${countParamCount}`;
        countParams.push(store_id);
      }

      if (status) {
        countParamCount++;
        countQuery += ` AND status = $${countParamCount}`;
        countParams.push(status);
      }

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
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get employee performance
  async getPerformance(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      const employee = await db.query(
        'SELECT id, first_name, last_name, performance FROM employees WHERE id = $1',
        [id]
      );

      if (employee.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Get sales data
      const salesQuery = `
        SELECT COUNT(*) as total_sales, 
               SUM((amount->>'total')::numeric) as total_revenue,
               AVG((amount->>'total')::numeric) as avg_sale_value
        FROM sales 
        WHERE user_id = $1
        ${start_date ? 'AND created_at >= $2' : ''}
        ${end_date ? 'AND created_at <= $3' : ''}
      `;

      const salesParams = [id];
      if (start_date) salesParams.push(start_date);
      if (end_date) salesParams.push(end_date);

      const salesResult = await db.query(salesQuery, salesParams);

      // Get calls data
      const callsQuery = `
        SELECT COUNT(*) as total_calls,
               AVG(duration) as avg_call_duration,
               COUNT(CASE WHEN disposition = 'sale' THEN 1 END) as successful_calls
        FROM calls 
        WHERE user_id = $1
        ${start_date ? 'AND created_at >= $2' : ''}
        ${end_date ? 'AND created_at <= $3' : ''}
      `;

      const callsResult = await db.query(callsQuery, salesParams);

      res.json({
        success: true,
        data: {
          employee: employee.rows[0],
          sales: salesResult.rows[0],
          calls: callsResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Get employee performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new EmployeeController();
