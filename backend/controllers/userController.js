const BaseController = require('./baseController');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

class UserController extends BaseController {
  constructor() {
    super('users', 'user-');
  }

  // Override create to hash password
  async create(req, res) {
    try {
      const { email, password, name, role = 'user' } = req.body;

      // Check if user already exists
      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, name, role, is_active, created_at`,
        [email, hashedPassword, name, role, true]
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Override update to handle password changes
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.created_at;

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Add updated_at
      updateData.updated_at = new Date();

      // Build update query
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updateData)];

      const result = await db.query(
        `UPDATE users 
         SET ${setClause} 
         WHERE id = $1 
         RETURNING id, email, name, role, is_active, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Override getAll to exclude passwords
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'created_at', order = 'DESC', role = '', is_active = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT id, email, name, role, is_active, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      
      let params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        query += ` AND role = $${paramCount}`;
        params.push(role);
      }

      if (is_active !== '') {
        paramCount++;
        query += ` AND is_active = $${paramCount}`;
        params.push(is_active === 'true');
      }

      query += ` ORDER BY ${sort} ${order} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams = params.slice(0, -2);

      if (role) countQuery += ' AND role = $1';
      if (is_active !== '') countQuery += ` AND is_active = $${role ? 2 : 1}`;

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
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Override getById to exclude password
  async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new UserController();
