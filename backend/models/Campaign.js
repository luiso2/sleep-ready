const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');

class Campaign extends BaseModel {
  constructor() {
    super('campaigns', [
      'name', 'type', 'status', 'created_by'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('camp');
    
    // Set default values
    data.status = data.status || 'draft';
    
    // Convert JSON fields
    if (data.targeting && typeof data.targeting === 'object') {
      data.targeting = JSON.stringify(data.targeting);
    }
    
    if (data.script && typeof data.script === 'object') {
      data.script = JSON.stringify(data.script);
    }
    
    if (data.offer && typeof data.offer === 'object') {
      data.offer = JSON.stringify(data.offer);
    }
    
    if (data.metrics && typeof data.metrics === 'object') {
      data.metrics = JSON.stringify(data.metrics);
    }
    
    if (data.assigned_to && Array.isArray(data.assigned_to)) {
      data.assigned_to = `{${data.assigned_to.join(',')}}`;
    }
    
    return super.create(data);
  }

  async getCampaignsByStatus(status) {
    const query = `
      SELECT 
        c.*,
        e.first_name || ' ' || e.last_name as created_by_name,
        COALESCE(array_length(c.assigned_to, 1), 0) as assigned_agents
      FROM campaigns c
      LEFT JOIN employees e ON c.created_by = e.id
      WHERE c.status = $1
      ORDER BY c.created_at DESC
    `;
    
    return this.query(query, [status]);
  }

  async getCampaignStats(campaignId) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.status,
        COUNT(DISTINCT calls.id) as total_calls,
        COUNT(DISTINCT calls.customer_id) as unique_contacts,
        COUNT(CASE WHEN calls.disposition = 'sale' THEN 1 END) as successful_calls,
        COUNT(CASE WHEN calls.disposition = 'appointment' THEN 1 END) as appointments_set,
        COUNT(CASE WHEN calls.disposition = 'callback' THEN 1 END) as callbacks_scheduled,
        AVG(calls.duration) as avg_call_duration,
        ROUND(
          COUNT(CASE WHEN calls.disposition IN ('sale', 'appointment') THEN 1 END)::numeric / 
          NULLIF(COUNT(calls.id), 0) * 100, 2
        ) as conversion_rate
      FROM campaigns c
      LEFT JOIN calls ON calls.metadata->>'campaign_id' = c.id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.status
    `;
    
    const result = await this.query(query, [campaignId]);
    return result[0];
  }

  async updateStatus(campaignId, newStatus) {
    const validStatuses = ['draft', 'active', 'paused', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid campaign status');
    }
    
    const updateData = { status: newStatus };
    
    if (newStatus === 'active' && !this.start_date) {
      updateData.start_date = new Date().toISOString();
    } else if (newStatus === 'completed') {
      updateData.end_date = new Date().toISOString();
    }
    
    return this.update(campaignId, updateData);
  }

  async assignAgents(campaignId, agentIds) {
    const query = `
      UPDATE campaigns 
      SET assigned_to = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const assigned = `{${agentIds.join(',')}}`;
    const result = await this.query(query, [campaignId, assigned]);
    return result[0];
  }

  async getActiveCampaignsForAgent(agentId) {
    const query = `
      SELECT * FROM campaigns
      WHERE status = 'active' 
        AND $1 = ANY(assigned_to)
      ORDER BY created_at DESC
    `;
    
    return this.query(query, [agentId]);
  }

  async getTargetCustomers(campaignId) {
    const campaign = await this.findById(campaignId);
    if (!campaign) return [];
    
    const targeting = JSON.parse(campaign.targeting || '{}');
    let query = 'SELECT * FROM customers WHERE do_not_call = false';
    const values = [];
    let valueIndex = 1;
    
    // Build dynamic query based on targeting criteria
    if (targeting.tier) {
      query += ` AND tier = $${valueIndex}`;
      values.push(targeting.tier);
      valueIndex++;
    }
    
    if (targeting.minLifetimeValue) {
      query += ` AND lifetime_value >= $${valueIndex}`;
      values.push(targeting.minLifetimeValue);
      valueIndex++;
    }
    
    if (targeting.tags && targeting.tags.length > 0) {
      query += ` AND tags && $${valueIndex}`;
      values.push(`{${targeting.tags.join(',')}}`);
      valueIndex++;
    }
    
    if (targeting.lastPurchaseDays) {
      query += ` AND last_purchase_date >= NOW() - INTERVAL '${targeting.lastPurchaseDays} days'`;
    }
    
    if (targeting.noRecentContact) {
      query += ` AND (last_contact_date IS NULL OR last_contact_date < NOW() - INTERVAL '30 days')`;
    }
    
    query += ' ORDER BY lifetime_value DESC LIMIT 1000';
    
    return this.query(query, values);
  }

  async updateMetrics(campaignId, metrics) {
    const query = `
      UPDATE campaigns 
      SET metrics = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, [campaignId, JSON.stringify(metrics)]);
    return result[0];
  }

  async getCampaignPerformance(startDate, endDate) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.status,
        c.start_date,
        c.end_date,
        COUNT(DISTINCT calls.id) as total_calls,
        COUNT(DISTINCT calls.customer_id) as unique_contacts,
        COUNT(DISTINCT s.id) as total_sales,
        COALESCE(SUM((s.amount->>'total')::numeric), 0) as revenue_generated,
        ROUND(
          COUNT(DISTINCT s.id)::numeric / 
          NULLIF(COUNT(DISTINCT calls.id), 0) * 100, 2
        ) as conversion_rate,
        COUNT(DISTINCT calls.user_id) as agents_involved
      FROM campaigns c
      LEFT JOIN calls ON calls.metadata->>'campaign_id' = c.id
      LEFT JOIN sales s ON s.call_id = calls.id
      WHERE c.created_at >= $1 AND c.created_at <= $2
      GROUP BY c.id
      ORDER BY revenue_generated DESC
    `;
    
    return this.query(query, [startDate, endDate]);
  }
}

module.exports = new Campaign();
