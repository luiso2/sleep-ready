const { validationResult } = require('express-validator');
const db = require('../config/database');

class BaseController {
  constructor(tableName, idPrefix = '') {
    this.tableName = tableName;
    this.idPrefix = idPrefix;
  }

  generateId() {
    return `${this.idPrefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = req.query;
      const offset = (page - 1) * limit;

      // Get data
      const result = await db.query(
        `SELECT * FROM ${this.tableName} 
         ORDER BY ${sort} ${order} 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      // Get total count
      const countResult = await db.query(`SELECT COUNT(*) FROM ${this.tableName}`);
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
      console.error(`Get all ${this.tableName} error:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.tableName} not found`
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error(`Get ${this.tableName} by id error:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const data = req.body;
      
      // Generate ID if not provided
      if (!data.id) {
        data.id = this.generateId();
      }

      // Add timestamps
      data.created_at = new Date();
      data.updated_at = new Date();

      // Build insert query
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await db.query(query, values);

      res.status(201).json({
        success: true,
        message: `${this.tableName} created successfully`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error(`Create ${this.tableName} error:`, error);
      
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.created_at;

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
        `UPDATE ${this.tableName} 
         SET ${setClause} 
         WHERE id = $1 
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.tableName} not found`
        });
      }

      res.json({
        success: true,
        message: `${this.tableName} updated successfully`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error(`Update ${this.tableName} error:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.tableName} not found`
        });
      }

      res.json({
        success: true,
        message: `${this.tableName} deleted successfully`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error(`Delete ${this.tableName} error:`, error);
      
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete: record is referenced by other data'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = BaseController;
