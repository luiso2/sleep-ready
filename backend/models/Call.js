const BaseModel = require('./BaseModel');
const { generateId } = require('../utils/helpers');

class Call extends BaseModel {
  constructor() {
    super('calls', [
      'customer_id', 'user_id', 'type', 'status', 'disposition'
    ]);
  }

  async create(data) {
    // Generate unique ID
    data.id = generateId('call');
    
    // Set default values
    data.status = data.status || 'in_progress';
    data.start_time = data.start_time || new Date().toISOString();
    
    // Convert JSON fields
    if (data.script && typeof data.script === 'object') {
      data.script = JSON.stringify(data.script);
    }
    
    if (data.objections && Array.isArray(data.objections)) {
      data.objections = `{${data.objections.join(',')}}`;
    }
    
    if (data.next_action && typeof data.next_action === 'object') {
      data.next_action = JSON.stringify(data.next_action);
    }
    
    if (data.metadata && typeof data.metadata === 'object') {
      data.metadata = JSON.stringify(data.metadata);
    }
    
    return super.create(data);
  }

  async endCall(callId, endData) {
    const endTime = new Date();
    const call = await this.findById(callId);
    
    if (!call) return null;
    
    const startTime = new Date(call.start_time);
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds
    
    const updateData = {
      status: 'completed',
      end_time: endTime.toISOString(),
      duration,
      disposition: endData.disposition,
      notes: endData.notes
    };
    
    if (endData.next_action) {
      updateData.next_action = JSON.stringify(endData.next_action);
    }
    
    return this.update(callId, updateData);
  }

  async getCallsByAgent(userId, startDate, endDate) {
    let query = `
      SELECT 
        c.*,
        cust.first_name || ' ' || cust.last_name as customer_name,
        cust.phone as customer_phone
      FROM calls c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE c.user_id = $1
    `;
    
    const values = [userId];
    let valueIndex = 2;
    
    if (startDate) {
      query += ` AND c.created_at >= $${valueIndex}`;
      values.push(startDate);
      valueIndex++;
    }
    
    if (endDate) {
      query += ` AND c.created_at <= $${valueIndex}`;
      values.push(endDate);
      valueIndex++;
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    return this.query(query, values);
  }

  async getCallStats(startDate, endDate, groupBy = 'agent') {
    let query;
    
    if (groupBy === 'agent') {
      query = `
        SELECT 
          e.id as agent_id,
          e.first_name || ' ' || e.last_name as agent_name,
          COUNT(c.id) as total_calls,
          AVG(c.duration) as avg_duration,
          COUNT(CASE WHEN c.disposition = 'sale' THEN 1 END) as successful_calls,
          COUNT(CASE WHEN c.disposition = 'appointment' THEN 1 END) as appointments_set,
          COUNT(CASE WHEN c.disposition = 'callback' THEN 1 END) as callbacks,
          COUNT(CASE WHEN c.disposition = 'not_interested' THEN 1 END) as not_interested,
          ROUND(
            COUNT(CASE WHEN c.disposition IN ('sale', 'appointment') THEN 1 END)::numeric / 
            NULLIF(COUNT(c.id), 0) * 100, 2
          ) as conversion_rate
        FROM calls c
        JOIN employees e ON c.user_id = e.id
        WHERE c.created_at >= $1 AND c.created_at <= $2
        GROUP BY e.id, e.first_name, e.last_name
        ORDER BY total_calls DESC
      `;
    } else if (groupBy === 'disposition') {
      query = `
        SELECT 
          disposition,
          COUNT(*) as count,
          ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
        FROM calls
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY disposition
        ORDER BY count DESC
      `;
    } else { // groupBy === 'hour'
      query = `
        SELECT 
          EXTRACT(HOUR FROM start_time) as hour,
          COUNT(*) as total_calls,
          AVG(duration) as avg_duration,
          COUNT(CASE WHEN disposition = 'sale' THEN 1 END) as successful_calls
        FROM calls
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY hour
        ORDER BY hour
      `;
    }
    
    return this.query(query, [startDate, endDate]);
  }

  async getActiveCallsCount() {
    const query = `
      SELECT COUNT(*) as count 
      FROM calls 
      WHERE status = 'in_progress'
    `;
    
    const result = await this.query(query);
    return result[0].count;
  }

  async getCallQueue(campaignId = null) {
    let query = `
      SELECT 
        c.id,
        c.first_name || ' ' || c.last_name as name,
        c.phone,
        c.last_contact_date,
        c.tier,
        c.tags,
        COUNT(calls.id) as previous_calls,
        MAX(calls.created_at) as last_call_date
      FROM customers c
      LEFT JOIN calls ON c.id = calls.customer_id
      WHERE c.do_not_call = false
    `;
    
    const values = [];
    
    if (campaignId) {
      // Filter by campaign targeting criteria
      query += ` AND c.id IN (
        SELECT customer_id 
        FROM campaign_customers 
        WHERE campaign_id = $1
      )`;
      values.push(campaignId);
    }
    
    query += `
      GROUP BY c.id
      HAVING COUNT(calls.id) = 0 OR MAX(calls.created_at) < NOW() - INTERVAL '30 days'
      ORDER BY c.tier DESC, c.lifetime_value DESC
      LIMIT 100
    `;
    
    return this.query(query, values);
  }

  async logCall(callData) {
    // Quick log for completed calls
    const data = {
      ...callData,
      status: 'completed',
      start_time: callData.start_time || new Date().toISOString(),
      end_time: callData.end_time || new Date().toISOString()
    };
    
    // Calculate duration if not provided
    if (!data.duration && data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      data.duration = Math.floor((end - start) / 1000);
    }
    
    return this.create(data);
  }

  async getRecentCalls(limit = 10) {
    const query = `
      SELECT 
        c.*,
        cust.first_name || ' ' || cust.last_name as customer_name,
        e.first_name || ' ' || e.last_name as agent_name
      FROM calls c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN employees e ON c.user_id = e.id
      ORDER BY c.created_at DESC
      LIMIT $1
    `;
    
    return this.query(query, [limit]);
  }
}

module.exports = new Call();
