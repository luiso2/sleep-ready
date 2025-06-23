const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');
const bcrypt = require('bcryptjs');

class Customer extends BaseModel {
  constructor() {
    super('customers', [
      'phone', 'email', 'first_name', 'last_name', 
      'tier', 'source', 'membership_status', 'do_not_call'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('cust');
    
    // Set default values
    data.lifetime_value = data.lifetime_value || 0;
    data.total_trades = data.total_trades || 0;
    data.total_credit_earned = data.total_credit_earned || 0;
    data.current_credit = data.current_credit || 0;
    data.is_elite_member = data.is_elite_member || false;
    data.do_not_call = data.do_not_call || false;
    
    // Convert arrays and objects to proper format
    if (data.address && typeof data.address === 'object') {
      data.address = JSON.stringify(data.address);
    }
    
    if (data.tags && Array.isArray(data.tags)) {
      data.tags = `{${data.tags.join(',')}}`;
    }
    
    if (data.purchased_items && Array.isArray(data.purchased_items)) {
      data.purchased_items = `{${data.purchased_items.join(',')}}`;
    }
    
    return super.create(data);
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = $1';
    const result = await this.query(query, [email]);
    return result[0];
  }

  async findByPhone(phone) {
    const query = 'SELECT * FROM customers WHERE phone = $1';
    const result = await this.query(query, [phone]);
    return result[0];
  }

  async updateCredits(customerId, creditAmount, operation = 'add') {
    const query = operation === 'add' 
      ? `UPDATE customers 
         SET current_credit = current_credit + $2,
             total_credit_earned = total_credit_earned + $2,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`
      : `UPDATE customers 
         SET current_credit = current_credit - $2,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`;
    
    const result = await this.query(query, [customerId, creditAmount]);
    return result[0];
  }

  async updateLifetimeValue(customerId, amount) {
    const query = `
      UPDATE customers 
      SET lifetime_value = lifetime_value + $2,
          last_purchase_date = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, [customerId, amount]);
    return result[0];
  }

  async getCustomerStats(customerId) {
    const queries = {
      totalPurchases: `
        SELECT COUNT(*) as count, COALESCE(SUM((amount->>'total')::numeric), 0) as total
        FROM sales 
        WHERE customer_id = $1
      `,
      activeSubs: `
        SELECT COUNT(*) as count 
        FROM subscriptions 
        WHERE customer_id = $1 AND status = 'active'
      `,
      totalCalls: `
        SELECT COUNT(*) as count 
        FROM calls 
        WHERE customer_id = $1
      `,
      tradeIns: `
        SELECT COUNT(*) as count, COALESCE(SUM(credit_approved), 0) as total_credit
        FROM evaluations 
        WHERE customer_id = $1 AND status = 'approved'
      `
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.query(query, [customerId]);
      stats[key] = result[0];
    }

    return stats;
  }

  async searchCustomers(searchTerm) {
    const query = `
      SELECT * FROM customers 
      WHERE 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        phone ILIKE $1
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    return this.query(query, [`%${searchTerm}%`]);
  }
}

module.exports = new Customer();
