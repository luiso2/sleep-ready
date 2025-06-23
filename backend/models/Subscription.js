const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');

class Subscription extends BaseModel {
  constructor() {
    super('subscriptions', [
      'customer_id', 'plan', 'status', 'sold_by'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('sub');
    
    // Set start date if not provided
    data.start_date = data.start_date || new Date().toISOString();
    
    // Ensure JSON fields are properly formatted
    if (data.pricing && typeof data.pricing === 'object') {
      data.pricing = JSON.stringify(data.pricing);
    }
    
    if (data.billing && typeof data.billing === 'object') {
      data.billing = JSON.stringify(data.billing);
    }
    
    if (data.services && typeof data.services === 'object') {
      data.services = JSON.stringify(data.services);
    }
    
    if (data.credits && typeof data.credits === 'object') {
      data.credits = JSON.stringify(data.credits);
    }
    
    return super.create(data);
  }

  async findByCustomer(customerId) {
    const query = `
      SELECT 
        s.*,
        c.first_name || ' ' || c.last_name as customer_name,
        e.first_name || ' ' || e.last_name as sold_by_name
      FROM subscriptions s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN employees e ON s.sold_by = e.id
      WHERE s.customer_id = $1
      ORDER BY s.created_at DESC
    `;
    
    return this.query(query, [customerId]);
  }

  async getActiveSubscriptions() {
    const query = `
      SELECT 
        s.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone
      FROM subscriptions s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.status = 'active'
      ORDER BY s.created_at DESC
    `;
    
    return this.query(query);
  }

  async getSubscriptionStats() {
    const query = `
      SELECT 
        plan,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
        AVG(CASE 
          WHEN status = 'active' THEN EXTRACT(EPOCH FROM (NOW() - start_date))/86400
          WHEN cancelled_at IS NOT NULL THEN EXTRACT(EPOCH FROM (cancelled_at - start_date))/86400
          ELSE NULL
        END) as avg_lifetime_days
      FROM subscriptions
      GROUP BY plan
      ORDER BY total DESC
    `;
    
    return this.query(query);
  }

  async cancelSubscription(subscriptionId, reason) {
    const query = `
      UPDATE subscriptions 
      SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancel_reason = $2,
        updated_at = NOW()
      WHERE id = $1 AND status IN ('active', 'paused')
      RETURNING *
    `;
    
    const result = await this.query(query, [subscriptionId, reason]);
    return result[0];
  }

  async pauseSubscription(subscriptionId) {
    const query = `
      UPDATE subscriptions 
      SET 
        status = 'paused',
        paused_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 AND status = 'active'
      RETURNING *
    `;
    
    const result = await this.query(query, [subscriptionId]);
    return result[0];
  }

  async resumeSubscription(subscriptionId) {
    const query = `
      UPDATE subscriptions 
      SET 
        status = 'active',
        paused_at = NULL,
        updated_at = NOW()
      WHERE id = $1 AND status = 'paused'
      RETURNING *
    `;
    
    const result = await this.query(query, [subscriptionId]);
    return result[0];
  }

  async getExpiringSubscriptions(days = 30) {
    const query = `
      SELECT 
        s.*,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        CASE 
          WHEN billing->>'frequency' = 'monthly' THEN start_date + INTERVAL '1 month'
          WHEN billing->>'frequency' = 'quarterly' THEN start_date + INTERVAL '3 months'
          WHEN billing->>'frequency' = 'yearly' THEN start_date + INTERVAL '1 year'
        END as next_billing_date
      FROM subscriptions s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 
        s.status = 'active' AND
        CASE 
          WHEN billing->>'frequency' = 'monthly' THEN start_date + INTERVAL '1 month'
          WHEN billing->>'frequency' = 'quarterly' THEN start_date + INTERVAL '3 months'  
          WHEN billing->>'frequency' = 'yearly' THEN start_date + INTERVAL '1 year'
        END <= NOW() + INTERVAL '${days} days'
      ORDER BY next_billing_date
    `;
    
    return this.query(query);
  }

  async getMRR() {
    const query = `
      SELECT 
        SUM(
          CASE 
            WHEN billing->>'frequency' = 'monthly' THEN (pricing->>'amount')::numeric
            WHEN billing->>'frequency' = 'quarterly' THEN (pricing->>'amount')::numeric / 3
            WHEN billing->>'frequency' = 'yearly' THEN (pricing->>'amount')::numeric / 12
            ELSE 0
          END
        ) as mrr,
        COUNT(*) as active_subscriptions
      FROM subscriptions
      WHERE status = 'active'
    `;
    
    const result = await this.query(query);
    return result[0];
  }

  async getChurnRate(startDate, endDate) {
    const query = `
      WITH period_data AS (
        SELECT 
          COUNT(CASE WHEN status = 'active' AND created_at < $1 THEN 1 END) as start_active,
          COUNT(CASE WHEN status = 'cancelled' AND cancelled_at BETWEEN $1 AND $2 THEN 1 END) as churned
        FROM subscriptions
      )
      SELECT 
        start_active,
        churned,
        CASE 
          WHEN start_active > 0 THEN ROUND((churned::numeric / start_active) * 100, 2)
          ELSE 0
        END as churn_rate
      FROM period_data
    `;
    
    const result = await this.query(query, [startDate, endDate]);
    return result[0];
  }
}

module.exports = new Subscription();
