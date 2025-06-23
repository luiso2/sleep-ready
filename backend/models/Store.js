const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');

class Store extends BaseModel {
  constructor() {
    super('stores', [
      'name', 'code', 'phone', 'status', 'manager_id'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('store');
    
    // Set default values
    data.status = data.status || 'active';
    
    // Convert objects to JSON
    if (data.address && typeof data.address === 'object') {
      data.address = JSON.stringify(data.address);
    }
    
    if (data.hours && typeof data.hours === 'object') {
      data.hours = JSON.stringify(data.hours);
    }
    
    if (data.service_area && typeof data.service_area === 'object') {
      data.service_area = JSON.stringify(data.service_area);
    }
    
    if (data.performance && typeof data.performance === 'object') {
      data.performance = JSON.stringify(data.performance);
    }
    
    return super.create(data);
  }

  async findByCode(code) {
    const query = 'SELECT * FROM stores WHERE code = $1';
    const result = await this.query(query, [code]);
    return result[0];
  }

  async getStoreEmployees(storeId) {
    const query = `
      SELECT 
        id, employee_id, email, first_name, last_name, 
        role, phone_extension, status, shift, avatar
      FROM employees 
      WHERE store_id = $1 AND status = 'active'
      ORDER BY role, first_name, last_name
    `;
    
    return this.query(query, [storeId]);
  }

  async getStorePerformance(storeId, startDate, endDate) {
    const queries = {
      sales: `
        SELECT 
          COUNT(*) as total_sales,
          COALESCE(SUM((amount->>'total')::numeric), 0) as total_revenue,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM sales 
        WHERE store_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `,
      subscriptions: `
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
          COUNT(CASE WHEN plan = 'elite' THEN 1 END) as elite_subscriptions
        FROM subscriptions s
        JOIN employees e ON s.sold_by = e.id
        WHERE e.store_id = $1
        ${startDate ? 'AND s.created_at >= $2' : ''}
        ${endDate ? 'AND s.created_at <= $3' : ''}
      `,
      evaluations: `
        SELECT 
          COUNT(*) as total_evaluations,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_evaluations,
          COALESCE(SUM(credit_approved), 0) as total_credit_issued
        FROM evaluations 
        WHERE store_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `,
      employees: `
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN role = 'agent' THEN 1 END) as agents,
          COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisors
        FROM employees 
        WHERE store_id = $1 AND status = 'active'
      `
    };

    const values = [storeId];
    if (startDate) values.push(startDate);
    if (endDate) values.push(endDate);

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.query(query, values);
      stats[key] = result[0];
    }

    // Calculate conversion rates
    const totalCalls = await this.query(`
      SELECT COUNT(*) as count
      FROM calls c
      JOIN employees e ON c.user_id = e.id
      WHERE e.store_id = $1
      ${startDate ? 'AND c.created_at >= $2' : ''}
      ${endDate ? 'AND c.created_at <= $3' : ''}
    `, values);

    stats.conversionRate = totalCalls[0].count > 0 
      ? (stats.sales.total_sales / totalCalls[0].count * 100).toFixed(2)
      : 0;

    return stats;
  }

  async updatePerformance(storeId, performanceData) {
    const query = `
      UPDATE stores 
      SET performance = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, [storeId, JSON.stringify(performanceData)]);
    return result[0];
  }

  async getNearbyStores(lat, lng, radiusMiles = 50) {
    // This is a simplified version. In production, you'd use PostGIS for accurate distance calculations
    const query = `
      SELECT 
        *,
        SQRT(
          POW(69.1 * ((address->>'lat')::numeric - $1), 2) +
          POW(69.1 * ($2 - (address->>'lng')::numeric) * COS((address->>'lat')::numeric / 57.3), 2)
        ) AS distance
      FROM stores
      WHERE status = 'active'
      HAVING distance < $3
      ORDER BY distance
    `;
    
    return this.query(query, [lat, lng, radiusMiles]);
  }
}

module.exports = new Store();
