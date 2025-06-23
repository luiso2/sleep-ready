const BaseModel = require('./BaseModel');
const { generateId, calculateCommission } = require('../utils/helpers');

class Sale extends BaseModel {
  constructor() {
    super('sales', [
      'subscription_id', 'customer_id', 'user_id', 'store_id',
      'type', 'channel', 'payment_status', 'call_id'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('sale');
    
    // Ensure amount is properly formatted
    if (data.amount && typeof data.amount === 'object') {
      data.amount = JSON.stringify(data.amount);
    }
    
    // Calculate commission if employee info is provided
    if (data.user_id && data.amount && data.employeeRole) {
      const amount = typeof data.amount === 'string' 
        ? JSON.parse(data.amount).total 
        : data.amount.total;
      
      const commission = calculateCommission(data.type, amount, data.employeeRole);
      data.commission = JSON.stringify(commission);
      delete data.employeeRole; // Remove from data before saving
    }
    
    // Format contract data
    if (data.contract && typeof data.contract === 'object') {
      data.contract = JSON.stringify(data.contract);
    }
    
    return super.create(data);
  }

  async getSalesByPeriod(startDate, endDate, filters = {}) {
    let query = `
      SELECT 
        s.*,
        c.first_name || ' ' || c.last_name as customer_name,
        e.first_name || ' ' || e.last_name as employee_name,
        st.name as store_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN employees e ON s.user_id = e.id
      LEFT JOIN stores st ON s.store_id = st.id
      WHERE s.created_at >= $1 AND s.created_at <= $2
    `;
    
    const values = [startDate, endDate];
    let valueIndex = 3;
    
    // Add additional filters
    if (filters.store_id) {
      query += ` AND s.store_id = $${valueIndex}`;
      values.push(filters.store_id);
      valueIndex++;
    }
    
    if (filters.user_id) {
      query += ` AND s.user_id = $${valueIndex}`;
      values.push(filters.user_id);
      valueIndex++;
    }
    
    if (filters.type) {
      query += ` AND s.type = $${valueIndex}`;
      values.push(filters.type);
      valueIndex++;
    }
    
    if (filters.channel) {
      query += ` AND s.channel = $${valueIndex}`;
      values.push(filters.channel);
      valueIndex++;
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    return this.query(query, values);
  }

  async getSalesStats(startDate, endDate, groupBy = 'day') {
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-WW',
      month: 'YYYY-MM',
      year: 'YYYY'
    };
    
    const query = `
      SELECT 
        TO_CHAR(created_at, '${dateFormat[groupBy]}') as period,
        COUNT(*) as total_sales,
        SUM((amount->>'total')::numeric) as total_revenue,
        AVG((amount->>'total')::numeric) as average_sale,
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(CASE WHEN type = 'subscription' THEN 1 END) as subscription_sales,
        COUNT(CASE WHEN type = 'trade_and_sleep' THEN 1 END) as trade_sales,
        COUNT(CASE WHEN type = 'direct_sale' THEN 1 END) as direct_sales
      FROM sales
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY period
      ORDER BY period
    `;
    
    return this.query(query, [startDate, endDate]);
  }

  async getTopPerformers(startDate, endDate, limit = 10) {
    const query = `
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name as name,
        e.role,
        COUNT(s.id) as total_sales,
        SUM((s.amount->>'total')::numeric) as total_revenue,
        SUM((s.commission->>'amount')::numeric) as total_commission
      FROM sales s
      JOIN employees e ON s.user_id = e.id
      WHERE s.created_at >= $1 AND s.created_at <= $2
      GROUP BY e.id, e.first_name, e.last_name, e.role
      ORDER BY total_revenue DESC
      LIMIT $3
    `;
    
    return this.query(query, [startDate, endDate, limit]);
  }

  async updatePaymentStatus(saleId, status) {
    const query = `
      UPDATE sales 
      SET payment_status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, [saleId, status]);
    return result[0];
  }

  async getSaleDetails(saleId) {
    const query = `
      SELECT 
        s.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        e.first_name || ' ' || e.last_name as employee_name,
        e.email as employee_email,
        st.name as store_name,
        st.code as store_code,
        sub.plan as subscription_plan,
        sub.status as subscription_status
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN employees e ON s.user_id = e.id
      LEFT JOIN stores st ON s.store_id = st.id
      LEFT JOIN subscriptions sub ON s.subscription_id = sub.id
      WHERE s.id = $1
    `;
    
    const result = await this.query(query, [saleId]);
    return result[0];
  }
}

module.exports = new Sale();
