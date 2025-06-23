const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Evaluation {
  static async findAll(filters = {}, page = 1, pageSize = 20, sort = 'created_at', order = 'DESC') {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Apply filters
    if (filters.status) {
      whereClause += ` AND e.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.customer_id) {
      whereClause += ` AND e.customer_id = $${valueIndex}`;
      values.push(filters.customer_id);
      valueIndex++;
    }

    if (filters.store_id) {
      whereClause += ` AND e.store_id = $${valueIndex}`;
      values.push(filters.store_id);
      valueIndex++;
    }

    if (filters.employee_id) {
      whereClause += ` AND e.employee_id = $${valueIndex}`;
      values.push(filters.employee_id);
      valueIndex++;
    }

    if (filters.date_from) {
      whereClause += ` AND e.created_at >= $${valueIndex}`;
      values.push(filters.date_from);
      valueIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND e.created_at <= $${valueIndex}`;
      values.push(filters.date_to);
      valueIndex++;
    }

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM evaluations e ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get evaluations with customer info
      const query = `
        SELECT 
          e.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          emp.name as employee_name,
          s.name as store_name
        FROM evaluations e
        LEFT JOIN customers c ON e.customer_id = c.id
        LEFT JOIN employees emp ON e.employee_id = emp.id
        LEFT JOIN stores s ON e.store_id = s.id
        ${whereClause}
        ORDER BY e.${sort} ${order}
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
      console.error('Error in Evaluation.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          e.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          emp.name as employee_name,
          s.name as store_name
        FROM evaluations e
        LEFT JOIN customers c ON e.customer_id = c.id
        LEFT JOIN employees emp ON e.employee_id = emp.id
        LEFT JOIN stores s ON e.store_id = s.id
        WHERE e.id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Evaluation.findById:', error);
      throw error;
    }
  }

  static async findByCouponCode(couponCode) {
    try {
      const query = 'SELECT * FROM evaluations WHERE coupon_code = $1';
      const result = await db.query(query, [couponCode]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Evaluation.findByCouponCode:', error);
      throw error;
    }
  }

  static async create(evaluationData) {
    const id = evaluationData.id || uuidv4();
    const {
      customer_id,
      mattress,
      photos = null,
      ai_evaluation = null,
      credit_approved = null,
      status = 'pending',
      employee_id = null,
      store_id = null,
      customer_info = null
    } = evaluationData;

    try {
      const query = `
        INSERT INTO evaluations (
          id, customer_id, mattress, photos, ai_evaluation,
          credit_approved, status, employee_id, store_id, customer_info
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
      `;

      const values = [
        id, customer_id, mattress, photos, ai_evaluation,
        credit_approved, status, employee_id, store_id, customer_info
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.create:', error);
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
        UPDATE evaluations
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM evaluations WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Evaluation.delete:', error);
      throw error;
    }
  }

  static async updateAIEvaluation(id, photos, aiEvaluation) {
    try {
      const query = `
        UPDATE evaluations
        SET photos = $1, ai_evaluation = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      const result = await db.query(query, [photos, aiEvaluation, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.updateAIEvaluation:', error);
      throw error;
    }
  }

  static async approve(id, creditAmount, couponCode, expiresDays) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    try {
      const query = `
        UPDATE evaluations
        SET 
          status = 'approved',
          credit_approved = $1,
          coupon_code = $2,
          expires_at = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      const result = await db.query(query, [creditAmount, couponCode, expiresAt, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.approve:', error);
      throw error;
    }
  }

  static async reject(id, reason) {
    try {
      const query = `
        UPDATE evaluations
        SET 
          status = 'rejected',
          ai_evaluation = jsonb_set(
            COALESCE(ai_evaluation, '{}'), 
            '{rejection_reason}', 
            $1::jsonb
          ),
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const result = await db.query(query, [JSON.stringify(reason), id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.reject:', error);
      throw error;
    }
  }

  static async redeemCoupon(couponCode) {
    try {
      const query = `
        UPDATE evaluations
        SET 
          status = 'redeemed',
          redeemed_at = NOW(),
          updated_at = NOW()
        WHERE coupon_code = $1 AND status = 'approved'
        RETURNING *
      `;
      const result = await db.query(query, [couponCode]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.redeemCoupon:', error);
      throw error;
    }
  }

  static async getStats(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;

      if (filters.store_id) {
        whereClause += ` AND store_id = $${valueIndex}`;
        values.push(filters.store_id);
        valueIndex++;
      }

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

      const query = `
        SELECT 
          COUNT(*) as total_evaluations,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as redeemed,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
          SUM(credit_approved) as total_credits_approved,
          AVG(credit_approved) as avg_credit_amount,
          COUNT(CASE WHEN ai_evaluation IS NOT NULL THEN 1 END) as ai_evaluated
        FROM evaluations
        ${whereClause}
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Evaluation.getStats:', error);
      throw error;
    }
  }

  // Update expired evaluations
  static async updateExpiredEvaluations() {
    try {
      const query = `
        UPDATE evaluations
        SET status = 'expired', updated_at = NOW()
        WHERE status = 'approved' 
        AND expires_at < NOW()
        RETURNING id
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in Evaluation.updateExpiredEvaluations:', error);
      throw error;
    }
  }
}

module.exports = Evaluation;
