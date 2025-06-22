const { validationResult } = require('express-validator');
const db = require('../config/database');

const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tier = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, phone, email, first_name, last_name, tier, 
             membership_status, lifetime_value, current_credit,
             created_at, updated_at
      FROM customers
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (tier) {
      paramCount++;
      query += ` AND tier = $${paramCount}`;
      params.push(tier);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE 1=1';
    let countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (tier) {
      countParamCount++;
      countQuery += ` AND tier = $${countParamCount}`;
      countParams.push(tier);
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
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT c.*, 
        (SELECT json_agg(s.*) FROM subscriptions s WHERE s.customer_id = c.id) as subscriptions,
        (SELECT json_agg(e.*) FROM evaluations e WHERE e.customer_id = c.id) as evaluations
       FROM customers c 
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      phone, email, first_name, last_name, address,
      tier = 'bronze', source = 'manual', tags = [],
      notes = ''
    } = req.body;

    const id = `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await db.query(
      `INSERT INTO customers 
       (id, phone, email, first_name, last_name, address, tier, source, tags, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [id, phone, email, first_name, last_name, JSON.stringify(address), tier, source, tags, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateCustomer = async (req, res) => {
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
    const updateFields = req.body;

    // Remove id from updateFields if present
    delete updateFields.id;
    delete updateFields.created_at;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build dynamic update query
    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updateFields)];

    const result = await db.query(
      `UPDATE customers SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
};
