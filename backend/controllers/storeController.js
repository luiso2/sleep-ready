const BaseController = require('./baseController');
const db = require('../config/database');

class StoreController extends BaseController {
  constructor() {
    super('stores', 'store-');
  }

  // Override getAll to include manager information
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'created_at', order = 'DESC', status = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT s.*, 
               e.first_name as manager_first_name,
               e.last_name as manager_last_name,
               (SELECT COUNT(*) FROM employees WHERE store_id = s.id) as employee_count
        FROM stores s
        LEFT JOIN employees e ON s.manager_id = e.id
        WHERE 1=1
      `;
      
      let params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND s.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY s.${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM stores WHERE 1=1';
      const countParams = [];
      
      if (status) {
        countQuery += ' AND status = $1';
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
      console.error('Get stores error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get store performance
  async getPerformance(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      // Get store info
      const store = await db.query(
        'SELECT * FROM stores WHERE id = $1',
        [id]
      );

      if (store.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      // Get sales performance
      let salesQuery = `
        SELECT 
          COUNT(*) as total_sales,
          SUM((amount->>'total')::numeric) as total_revenue,
          AVG((amount->>'total')::numeric) as avg_sale_value,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM sales 
        WHERE store_id = $1
      `;

      const params = [id];
      let paramCount = 1;

      if (start_date) {
        paramCount++;
        salesQuery += ` AND created_at >= $${paramCount}`;
        params.push(start_date);
      }

      if (end_date) {
        paramCount++;
        salesQuery += ` AND created_at <= $${paramCount}`;
        params.push(end_date);
      }

      const salesResult = await db.query(salesQuery, params);

      // Get employee performance
      const employeeQuery = `
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees
        FROM employees 
        WHERE store_id = $1
      `;

      const employeeResult = await db.query(employeeQuery, [id]);

      res.json({
        success: true,
        data: {
          store: store.rows[0],
          sales: salesResult.rows[0],
          employees: employeeResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Get store performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get store employees
  async getEmployees(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT id, employee_id, first_name, last_name, role, status, phone_extension
         FROM employees 
         WHERE store_id = $1
         ORDER BY last_name, first_name`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Get store employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new StoreController();
