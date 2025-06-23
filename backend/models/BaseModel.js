const { pool } = require('../config/database');
const { buildWhereClause, formatPaginationResponse } = require('../utils/helpers');

class BaseModel {
  constructor(tableName, allowedFields = []) {
    this.tableName = tableName;
    this.allowedFields = allowedFields;
  }

  // Get all records with pagination and filters
  async findAll(filters = {}, page = 1, pageSize = 20, sort = 'created_at', order = 'DESC') {
    try {
      const offset = (page - 1) * pageSize;
      const { whereClause, values } = buildWhereClause(filters, this.allowedFields);
      
      // Count total records
      const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);
      
      // Get paginated results
      const query = `
        SELECT * FROM ${this.tableName} 
        ${whereClause}
        ORDER BY ${sort} ${order}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;
      
      const result = await pool.query(query, [...values, pageSize, offset]);
      
      return formatPaginationResponse(result.rows, page, pageSize, total);
    } catch (error) {
      throw error;
    }
  }

  // Get single record by ID
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new record
  async create(data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update record
  async update(id, data) {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id, ...values]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete record
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Execute custom query
  async query(query, values = []) {
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if record exists
  async exists(field, value, excludeId = null) {
    try {
      let query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE ${field} = $1`;
      const values = [value];
      
      if (excludeId) {
        query += ` AND id != $2`;
        values.push(excludeId);
      }
      
      query += ')';
      
      const result = await pool.query(query, values);
      return result.rows[0].exists;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseModel;
