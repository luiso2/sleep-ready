const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Commission {
  static async findAll(filters = {}, page = 1, pageSize = 20, sort = 'created_at', order = 'DESC') {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Apply filters
    if (filters.employee_id) {
      whereClause += ` AND c.employee_id = $${valueIndex}`;
      values.push(filters.employee_id);
      valueIndex++;
    }

    if (filters.status) {
      whereClause += ` AND c.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.type) {
      whereClause += ` AND c.type = $${valueIndex}`;
      values.push(filters.type);
      valueIndex++;
    }

    if (filters.date_from) {
      whereClause += ` AND c.created_at >= $${valueIndex}`;
      values.push(filters.date_from);
      valueIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND c.created_at <= $${valueIndex}`;
      values.push(filters.date_to);
      valueIndex++;
    }

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM commissions c ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get commissions with employee info
      const query = `
        SELECT 
          c.*,
          e.name as employee_name,
          e.role as employee_role
        FROM commissions c
        LEFT JOIN employees e ON c.employee_id = e.id
        ${whereClause}
        ORDER BY c.${sort} ${order}
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;
      values.push(pageSize, offset);

      const result = await db.query(query, values);

      return {
        data: result.rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Error in Commission.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          c.*,
          e.name as employee_name,
          e.role as employee_role
        FROM commissions c
        LEFT JOIN employees e ON c.employee_id = e.id
        WHERE c.id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Commission.findById:', error);
      throw error;
    }
  }

  static async create(commissionData) {
    const id = commissionData.id || uuidv4();
    const {
      employee_id,
      sale_id = null,
      subscription_id = null,
      type,
      amount,
      rate,
      status = 'pending',
      notes = null,
      period_start = null,
      period_end = null
    } = commissionData;

    try {
      const query = `
        INSERT INTO commissions (
          id, employee_id, sale_id, subscription_id, type,
          amount, rate, status, notes, period_start, period_end
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const values = [
        id, employee_id, sale_id, subscription_id, type,
        amount, rate, status, notes, period_start, period_end
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Commission.create:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const query = `
        UPDATE commissions
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Commission.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM commissions WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Commission.delete:', error);
      throw error;
    }
  }

  // Calculate commission for a sale
  static async calculateForSale(saleId) {
    try {
      // Get sale details
      const saleQuery = `
        SELECT 
          s.*,
          e.commission_rate as employee_rate,
          e.role as employee_role
        FROM sales s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.id = $1
      `;
      const saleResult = await db.query(saleQuery, [saleId]);
      
      if (!saleResult.rows[0]) {
        throw new Error('Sale not found');
      }
      
      const sale = saleResult.rows[0];
      
      // Check if commission already exists
      const existingQuery = 'SELECT id FROM commissions WHERE sale_id = $1';
      const existing = await db.query(existingQuery, [saleId]);
      
      if (existing.rows.length > 0) {
        return existing.rows[0];
      }
      
      // Calculate commission based on sale type and employee role
      let commissionRate = sale.employee_rate || 5.0; // Default 5%
      let commissionAmount = 0;
      
      // Different rates based on sale type
      switch (sale.sale_type) {
        case 'in_store':
          commissionRate = sale.employee_rate || 5.0;
          break;
        case 'phone':
          commissionRate = (sale.employee_rate || 5.0) + 2.0; // +2% for phone sales
          break;
        case 'online':
          commissionRate = (sale.employee_rate || 5.0) + 3.0; // +3% for online sales
          break;
      }
      
      // Calculate base commission
      commissionAmount = (sale.total_amount * commissionRate) / 100;
      
      // Add bonuses for high-value sales
      if (sale.total_amount >= 5000) {
        commissionAmount += 100; // $100 bonus for sales over $5000
      } else if (sale.total_amount >= 2000) {
        commissionAmount += 50; // $50 bonus for sales over $2000
      }
      
      // Create commission record
      const commissionData = {
        employee_id: sale.employee_id,
        sale_id: saleId,
        type: 'sale',
        amount: commissionAmount,
        rate: commissionRate,
        status: 'pending',
        notes: `Commission for ${sale.sale_type} sale #${saleId}`
      };
      
      return await this.create(commissionData);
    } catch (error) {
      console.error('Error in Commission.calculateForSale:', error);
      throw error;
    }
  }

  // Get employee commission summary
  static async getEmployeeSummary(employeeId, filters = {}) {
    try {
      let whereClause = 'WHERE employee_id = $1';
      const values = [employeeId];
      let valueIndex = 2;

      if (filters.date_from) {
        whereClause += ` AND created_at >= $${valueIndex}`;
        values.push(filters.date_from);
        valueIndex++;
      }

      if (filters.date_to) {
        whereClause += ` AND created_at <= $${valueIndex}`;
        values.push(filters.date_to);
        valueIndex++;
      }

      const query = `
        SELECT 
          COUNT(*) as total_commissions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as approved_amount,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
          COALESCE(AVG(amount), 0) as average_commission,
          COALESCE(AVG(rate), 0) as average_rate
        FROM commissions
        ${whereClause}
      `;

      const result = await db.query(query, values);

      // Get commission breakdown by type
      const breakdownQuery = `
        SELECT 
          type,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total
        FROM commissions
        ${whereClause}
        GROUP BY type
      `;

      const breakdown = await db.query(breakdownQuery, values);

      return {
        summary: result.rows[0],
        breakdown: breakdown.rows
      };
    } catch (error) {
      console.error('Error in Commission.getEmployeeSummary:', error);
      throw error;
    }
  }

  // Process pending commissions
  static async processPending(filters = {}) {
    try {
      let whereClause = 'WHERE status = \'pending\'';
      const values = [];
      let valueIndex = 1;

      if (filters.employee_id) {
        whereClause += ` AND employee_id = $${valueIndex}`;
        values.push(filters.employee_id);
        valueIndex++;
      }

      if (filters.date_from) {
        whereClause += ` AND created_at >= $${valueIndex}`;
        values.push(filters.date_from);
        valueIndex++;
      }

      if (filters.date_to) {
        whereClause += ` AND created_at <= $${valueIndex}`;
        values.push(filters.date_to);
        valueIndex++;
      }

      // Update pending commissions to approved
      const query = `
        UPDATE commissions
        SET status = 'approved', updated_at = NOW()
        ${whereClause}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in Commission.processPending:', error);
      throw error;
    }
  }

  // Get commission report
  static async getReport(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;

      if (filters.date_from) {
        whereClause += ` AND c.created_at >= $${valueIndex}`;
        values.push(filters.date_from);
        valueIndex++;
      }

      if (filters.date_to) {
        whereClause += ` AND c.created_at <= $${valueIndex}`;
        values.push(filters.date_to);
        valueIndex++;
      }

      let groupBy = '';
      let selectFields = '';

      switch (filters.group_by) {
        case 'employee':
          groupBy = 'GROUP BY e.id, e.name, e.role';
          selectFields = 'e.id as employee_id, e.name as employee_name, e.role,';
          break;
        case 'type':
          groupBy = 'GROUP BY c.type';
          selectFields = 'c.type,';
          break;
        case 'month':
          groupBy = 'GROUP BY month';
          selectFields = 'DATE_TRUNC(\'month\', c.created_at) as month,';
          break;
        default:
          groupBy = 'GROUP BY e.id, e.name, e.role';
          selectFields = 'e.id as employee_id, e.name as employee_name, e.role,';
      }

      const query = `
        SELECT 
          ${selectFields}
          COUNT(*) as commission_count,
          COUNT(DISTINCT c.sale_id) as sales_count,
          COUNT(DISTINCT c.subscription_id) as subscription_count,
          COALESCE(SUM(c.amount), 0) as total_amount,
          COALESCE(AVG(c.amount), 0) as avg_amount,
          COALESCE(AVG(c.rate), 0) as avg_rate,
          COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN c.status = 'paid' THEN 1 END) as paid_count
        FROM commissions c
        LEFT JOIN employees e ON c.employee_id = e.id
        ${whereClause}
        ${groupBy}
        ORDER BY total_amount DESC
      `;

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in Commission.getReport:', error);
      throw error;
    }
  }
}

module.exports = Commission;
