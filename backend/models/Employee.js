const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

class Employee extends BaseModel {
  constructor() {
    super('employees', [
      'employee_id', 'email', 'first_name', 'last_name', 
      'role', 'store_id', 'status', 'shift'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('emp');
    
    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    // Set default values
    data.status = data.status || 'active';
    
    // Convert objects to JSON
    if (data.commissions && typeof data.commissions === 'object') {
      data.commissions = JSON.stringify(data.commissions);
    }
    
    if (data.performance && typeof data.performance === 'object') {
      data.performance = JSON.stringify(data.performance);
    }
    
    return super.create(data);
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM employees WHERE email = $1';
    const result = await this.query(query, [email]);
    return result[0];
  }

  async findByEmployeeId(employeeId) {
    const query = 'SELECT * FROM employees WHERE employee_id = $1';
    const result = await this.query(query, [employeeId]);
    return result[0];
  }

  async validatePassword(email, password) {
    const employee = await this.findByEmail(email);
    if (!employee || !employee.password) return null;
    
    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) return null;
    
    // Remove password from response
    delete employee.password;
    return employee;
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE employees 
      SET password = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, first_name, last_name
    `;
    
    const result = await this.query(query, [id, hashedPassword]);
    return result[0];
  }

  async getPerformanceStats(employeeId, startDate, endDate) {
    const queries = {
      sales: `
        SELECT 
          COUNT(*) as total_sales,
          COALESCE(SUM((amount->>'total')::numeric), 0) as total_revenue,
          COALESCE(AVG((amount->>'total')::numeric), 0) as avg_sale
        FROM sales 
        WHERE user_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `,
      calls: `
        SELECT 
          COUNT(*) as total_calls,
          AVG(duration) as avg_duration,
          COUNT(CASE WHEN disposition = 'sale' THEN 1 END) as successful_calls
        FROM calls 
        WHERE user_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `,
      subscriptions: `
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions
        FROM subscriptions 
        WHERE sold_by = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `,
      commissions: `
        SELECT 
          COALESCE(SUM((earnings->>'total')::numeric), 0) as total_commissions
        FROM commissions 
        WHERE user_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? 'AND created_at <= $3' : ''}
      `
    };

    const values = [employeeId];
    if (startDate) values.push(startDate);
    if (endDate) values.push(endDate);

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.query(query, values);
      stats[key] = result[0];
    }

    return stats;
  }

  async getActiveAgents() {
    const query = `
      SELECT 
        e.*,
        s.name as store_name,
        COUNT(DISTINCT c.id) as active_calls
      FROM employees e
      LEFT JOIN stores s ON e.store_id = s.id
      LEFT JOIN calls c ON e.id = c.user_id AND c.status = 'in_progress'
      WHERE e.status = 'active' 
        AND e.role IN ('agent', 'supervisor')
      GROUP BY e.id, s.name
      ORDER BY e.first_name, e.last_name
    `;
    
    return this.query(query);
  }

  async updatePerformance(employeeId, performanceData) {
    const query = `
      UPDATE employees 
      SET performance = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, [employeeId, JSON.stringify(performanceData)]);
    return result[0];
  }
}

module.exports = new Employee();
