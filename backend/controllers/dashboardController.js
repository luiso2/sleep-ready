const db = require('../config/database');

const dashboardController = {
  // Get general overview metrics
  async getOverview(req, res) {
    try {
      const { date_from, date_to, store_id } = req.query;
      
      // Build date filter
      let dateFilter = '';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        dateFilter = `WHERE created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        dateFilter += (dateFilter ? ' AND ' : 'WHERE ') + `created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      // Get overview metrics
      const queries = {
        totalSales: `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(total_amount), 0) as total,
            COALESCE(AVG(total_amount), 0) as average
          FROM sales 
          ${dateFilter}
        `,
        totalCustomers: `
          SELECT COUNT(*) as count 
          FROM customers 
          ${dateFilter}
        `,
        activeSubscriptions: `
          SELECT COUNT(*) as count 
          FROM subscriptions 
          WHERE status = 'active'
        `,
        totalRevenue: `
          SELECT COALESCE(SUM(total_amount), 0) as revenue 
          FROM sales 
          ${dateFilter}
        `,
        todaySales: `
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(total_amount), 0) as total
          FROM sales 
          WHERE DATE(created_at) = CURRENT_DATE
        `,
        pendingEvaluations: `
          SELECT COUNT(*) as count 
          FROM evaluations 
          WHERE status = 'pending'
        `,
        upcomingAppointments: `
          SELECT COUNT(*) as count 
          FROM appointments 
          WHERE appointment_date >= NOW() 
          AND appointment_date <= NOW() + INTERVAL '7 days'
          AND status IN ('scheduled', 'confirmed')
        `,
        lowStockProducts: `
          SELECT COUNT(*) as count 
          FROM products 
          WHERE stock_quantity <= min_stock 
          AND status = 'active'
        `
      };
      
      const results = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const result = await db.query(query, values);
        results[key] = result.rows[0];
      }
      
      res.json({
        success: true,
        data: {
          sales: {
            total: results.totalSales.count,
            revenue: results.totalSales.total,
            average: results.totalSales.average,
            today: results.todaySales
          },
          customers: {
            total: results.totalCustomers.count
          },
          subscriptions: {
            active: results.activeSubscriptions.count
          },
          revenue: {
            total: results.totalRevenue.revenue
          },
          evaluations: {
            pending: results.pendingEvaluations.count
          },
          appointments: {
            upcoming: results.upcomingAppointments.count
          },
          inventory: {
            lowStock: results.lowStockProducts.count
          }
        }
      });
    } catch (error) {
      console.error('Error fetching overview:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard overview',
        error: error.message
      });
    }
  },

  // Get sales metrics
  async getSalesMetrics(req, res) {
    try {
      const { date_from, date_to, group_by = 'day', store_id, employee_id } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        whereClause += ` AND s.created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        whereClause += ` AND s.created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      if (store_id) {
        whereClause += ` AND s.store_id = $${valueIndex}`;
        values.push(store_id);
        valueIndex++;
      }
      
      if (employee_id) {
        whereClause += ` AND s.employee_id = $${valueIndex}`;
        values.push(employee_id);
        valueIndex++;
      }
      
      // Determine grouping
      let dateGroup = '';
      switch (group_by) {
        case 'hour':
          dateGroup = `DATE_TRUNC('hour', s.created_at)`;
          break;
        case 'day':
          dateGroup = `DATE_TRUNC('day', s.created_at)`;
          break;
        case 'week':
          dateGroup = `DATE_TRUNC('week', s.created_at)`;
          break;
        case 'month':
          dateGroup = `DATE_TRUNC('month', s.created_at)`;
          break;
        default:
          dateGroup = `DATE_TRUNC('day', s.created_at)`;
      }
      
      // Sales over time
      const salesOverTimeQuery = `
        SELECT 
          ${dateGroup} as period,
          COUNT(*) as sales_count,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_sale_value,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM sales s
        ${whereClause}
        GROUP BY period
        ORDER BY period ASC
      `;
      
      // Sales by type
      const salesByTypeQuery = `
        SELECT 
          sale_type,
          COUNT(*) as count,
          SUM(total_amount) as total,
          AVG(total_amount) as average
        FROM sales s
        ${whereClause}
        GROUP BY sale_type
      `;
      
      // Top products
      const topProductsQuery = `
        SELECT 
          p.name as product_name,
          p.category,
          COUNT(*) as sales_count,
          SUM(si.quantity) as units_sold,
          SUM(si.subtotal) as revenue
        FROM sales s
        JOIN sales_items si ON s.id = si.sale_id
        JOIN products p ON si.product_id = p.id
        ${whereClause}
        GROUP BY p.id, p.name, p.category
        ORDER BY revenue DESC
        LIMIT 10
      `;
      
      // Conversion metrics
      const conversionQuery = `
        SELECT 
          COUNT(DISTINCT c.id) as total_calls,
          COUNT(DISTINCT s.id) as converted_sales,
          ROUND(100.0 * COUNT(DISTINCT s.id) / NULLIF(COUNT(DISTINCT c.id), 0), 2) as conversion_rate
        FROM calls c
        LEFT JOIN sales s ON c.customer_id = s.customer_id 
          AND s.created_at >= c.created_at 
          AND s.created_at <= c.created_at + INTERVAL '30 days'
        ${whereClause.replace(/s\./g, 'c.')}
      `;
      
      const [salesOverTime, salesByType, topProducts, conversion] = await Promise.all([
        db.query(salesOverTimeQuery, values),
        db.query(salesByTypeQuery, values),
        db.query(topProductsQuery, values),
        db.query(conversionQuery, values)
      ]);
      
      res.json({
        success: true,
        data: {
          salesOverTime: salesOverTime.rows,
          salesByType: salesByType.rows,
          topProducts: topProducts.rows,
          conversion: conversion.rows[0]
        }
      });
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales metrics',
        error: error.message
      });
    }
  },

  // Get employee performance metrics
  async getEmployeePerformance(req, res) {
    try {
      const { date_from, date_to, store_id, limit = 10 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        whereClause += ` AND s.created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        whereClause += ` AND s.created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      if (store_id) {
        whereClause += ` AND e.store_id = $${valueIndex}`;
        values.push(store_id);
        valueIndex++;
      }
      
      const query = `
        SELECT 
          e.id,
          e.name,
          e.role,
          e.store_id,
          st.name as store_name,
          COUNT(DISTINCT s.id) as total_sales,
          COALESCE(SUM(s.total_amount), 0) as total_revenue,
          COALESCE(AVG(s.total_amount), 0) as avg_sale_value,
          COUNT(DISTINCT s.customer_id) as unique_customers,
          COUNT(DISTINCT c.id) as total_calls,
          ROUND(100.0 * COUNT(DISTINCT s.id) / NULLIF(COUNT(DISTINCT c.id), 0), 2) as conversion_rate,
          COUNT(DISTINCT sub.id) as subscriptions_sold,
          COUNT(DISTINCT ev.id) as evaluations_processed,
          COALESCE(SUM(cm.amount), 0) as total_commissions
        FROM employees e
        LEFT JOIN stores st ON e.store_id = st.id
        LEFT JOIN sales s ON e.id = s.employee_id ${whereClause}
        LEFT JOIN calls c ON e.id = c.employee_id ${whereClause.replace(/s\./g, 'c.')}
        LEFT JOIN subscriptions sub ON e.id = sub.employee_id ${whereClause.replace(/s\./g, 'sub.')}
        LEFT JOIN evaluations ev ON e.id = ev.employee_id ${whereClause.replace(/s\./g, 'ev.')}
        LEFT JOIN commissions cm ON e.id = cm.employee_id ${whereClause.replace(/s\./g, 'cm.')}
        GROUP BY e.id, e.name, e.role, e.store_id, st.name
        ORDER BY total_revenue DESC
        LIMIT $${valueIndex}
      `;
      values.push(limit);
      
      const result = await db.query(query, values);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching employee performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee performance',
        error: error.message
      });
    }
  },

  // Get store performance metrics
  async getStorePerformance(req, res) {
    try {
      const { date_from, date_to } = req.query;
      
      let whereClause = '';
      const values = [];
      let valueIndex = 1;
      
      if (date_from || date_to) {
        whereClause = 'WHERE ';
        if (date_from) {
          whereClause += `s.created_at >= $${valueIndex}`;
          values.push(date_from);
          valueIndex++;
        }
        
        if (date_to) {
          whereClause += (date_from ? ' AND ' : '') + `s.created_at <= $${valueIndex}`;
          values.push(date_to);
          valueIndex++;
        }
      }
      
      const query = `
        SELECT 
          st.id,
          st.name,
          st.code,
          COUNT(DISTINCT s.id) as total_sales,
          COALESCE(SUM(s.total_amount), 0) as total_revenue,
          COALESCE(AVG(s.total_amount), 0) as avg_sale_value,
          COUNT(DISTINCT s.customer_id) as unique_customers,
          COUNT(DISTINCT e.id) as total_employees,
          COUNT(DISTINCT sub.id) as active_subscriptions,
          COUNT(DISTINCT ev.id) as evaluations_processed,
          COALESCE(AVG(e.performance->>'sales_conversion_rate'), 0) as avg_conversion_rate
        FROM stores st
        LEFT JOIN sales s ON st.id = s.store_id ${whereClause}
        LEFT JOIN employees e ON st.id = e.store_id
        LEFT JOIN subscriptions sub ON st.id = sub.store_id AND sub.status = 'active'
        LEFT JOIN evaluations ev ON st.id = ev.store_id ${whereClause.replace(/s\./g, 'ev.')}
        GROUP BY st.id, st.name, st.code
        ORDER BY total_revenue DESC
      `;
      
      const result = await db.query(query, values);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching store performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching store performance',
        error: error.message
      });
    }
  },

  // Get call center statistics
  async getCallCenterStats(req, res) {
    try {
      const { date_from, date_to, employee_id, campaign_id } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        whereClause += ` AND c.created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        whereClause += ` AND c.created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      if (employee_id) {
        whereClause += ` AND c.employee_id = $${valueIndex}`;
        values.push(employee_id);
        valueIndex++;
      }
      
      if (campaign_id) {
        whereClause += ` AND c.campaign_id = $${valueIndex}`;
        values.push(campaign_id);
        valueIndex++;
      }
      
      // Call statistics
      const callStatsQuery = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
          COUNT(CASE WHEN status = 'no_answer' THEN 1 END) as no_answer,
          COUNT(CASE WHEN status = 'busy' THEN 1 END) as busy,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          AVG(EXTRACT(EPOCH FROM duration)/60)::numeric(10,2) as avg_duration_minutes,
          SUM(EXTRACT(EPOCH FROM duration)/60)::numeric(10,2) as total_minutes,
          COUNT(CASE WHEN converted_to_sale = true THEN 1 END) as converted_sales,
          ROUND(100.0 * COUNT(CASE WHEN converted_to_sale = true THEN 1 END) / NULLIF(COUNT(*), 0), 2) as conversion_rate
        FROM calls c
        ${whereClause}
      `;
      
      // Calls by hour
      const callsByHourQuery = `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as call_count,
          AVG(EXTRACT(EPOCH FROM duration)/60)::numeric(10,2) as avg_duration
        FROM calls c
        ${whereClause}
        GROUP BY hour
        ORDER BY hour
      `;
      
      // Top performers
      const topPerformersQuery = `
        SELECT 
          e.id,
          e.name,
          COUNT(c.id) as total_calls,
          COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_calls,
          AVG(EXTRACT(EPOCH FROM c.duration)/60)::numeric(10,2) as avg_call_duration,
          COUNT(CASE WHEN c.converted_to_sale = true THEN 1 END) as conversions,
          ROUND(100.0 * COUNT(CASE WHEN c.converted_to_sale = true THEN 1 END) / NULLIF(COUNT(c.id), 0), 2) as conversion_rate
        FROM employees e
        JOIN calls c ON e.id = c.employee_id
        ${whereClause}
        GROUP BY e.id, e.name
        ORDER BY conversions DESC
        LIMIT 10
      `;
      
      // Campaign performance
      const campaignPerformanceQuery = `
        SELECT 
          cp.id,
          cp.name,
          cp.type,
          COUNT(c.id) as total_calls,
          COUNT(CASE WHEN c.converted_to_sale = true THEN 1 END) as conversions,
          ROUND(100.0 * COUNT(CASE WHEN c.converted_to_sale = true THEN 1 END) / NULLIF(COUNT(c.id), 0), 2) as conversion_rate
        FROM campaigns cp
        LEFT JOIN calls c ON cp.id = c.campaign_id
        ${whereClause.replace('WHERE 1=1', 'WHERE cp.status = \'active\'')}
        GROUP BY cp.id, cp.name, cp.type
        ORDER BY conversion_rate DESC
      `;
      
      const [callStats, callsByHour, topPerformers, campaignPerformance] = await Promise.all([
        db.query(callStatsQuery, values),
        db.query(callsByHourQuery, values),
        db.query(topPerformersQuery, values),
        db.query(campaignPerformanceQuery, values)
      ]);
      
      res.json({
        success: true,
        data: {
          summary: callStats.rows[0],
          callsByHour: callsByHour.rows,
          topPerformers: topPerformers.rows,
          campaignPerformance: campaignPerformance.rows
        }
      });
    } catch (error) {
      console.error('Error fetching call center stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching call center statistics',
        error: error.message
      });
    }
  },

  // Get subscription metrics
  async getSubscriptionMetrics(req, res) {
    try {
      const { date_from, date_to } = req.query;
      
      let whereClause = '';
      const values = [];
      let valueIndex = 1;
      
      if (date_from || date_to) {
        whereClause = 'WHERE ';
        if (date_from) {
          whereClause += `created_at >= $${valueIndex}`;
          values.push(date_from);
          valueIndex++;
        }
        
        if (date_to) {
          whereClause += (date_from ? ' AND ' : '') + `created_at <= $${valueIndex}`;
          values.push(date_to);
          valueIndex++;
        }
      }
      
      // Subscription overview
      const overviewQuery = `
        SELECT 
          COUNT(*) as total_subscriptions,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
          SUM(CASE WHEN status = 'active' THEN monthly_amount ELSE 0 END) as monthly_recurring_revenue,
          AVG(CASE WHEN status = 'active' THEN monthly_amount END) as avg_subscription_value
        FROM subscriptions
        ${whereClause}
      `;
      
      // Subscriptions by plan
      const byPlanQuery = `
        SELECT 
          plan_name,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          SUM(CASE WHEN status = 'active' THEN monthly_amount ELSE 0 END) as mrr
        FROM subscriptions
        ${whereClause}
        GROUP BY plan_name
        ORDER BY mrr DESC
      `;
      
      // Churn analysis
      const churnQuery = `
        SELECT 
          DATE_TRUNC('month', cancelled_at) as month,
          COUNT(*) as churned_subscriptions,
          AVG(EXTRACT(EPOCH FROM (cancelled_at - start_date))/86400)::integer as avg_lifetime_days
        FROM subscriptions
        WHERE status = 'cancelled' AND cancelled_at IS NOT NULL
        ${whereClause ? whereClause + ' AND' : 'WHERE'} cancelled_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month DESC
      `;
      
      // Growth metrics
      const growthQuery = `
        SELECT 
          DATE_TRUNC('month', start_date) as month,
          COUNT(*) as new_subscriptions,
          SUM(monthly_amount) as new_mrr
        FROM subscriptions
        ${whereClause}
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `;
      
      const [overview, byPlan, churn, growth] = await Promise.all([
        db.query(overviewQuery, values),
        db.query(byPlanQuery, values),
        db.query(churnQuery, values),
        db.query(growthQuery, values)
      ]);
      
      res.json({
        success: true,
        data: {
          overview: overview.rows[0],
          byPlan: byPlan.rows,
          churn: churn.rows,
          growth: growth.rows
        }
      });
    } catch (error) {
      console.error('Error fetching subscription metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscription metrics',
        error: error.message
      });
    }
  },

  // Get Trade & Sleep metrics
  async getTradeSleepMetrics(req, res) {
    try {
      const { date_from, date_to, store_id } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        whereClause += ` AND created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        whereClause += ` AND created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      if (store_id) {
        whereClause += ` AND store_id = $${valueIndex}`;
        values.push(store_id);
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
          COALESCE(SUM(credit_approved), 0) as total_credits_issued,
          COALESCE(AVG(credit_approved), 0) as avg_credit_amount,
          ROUND(100.0 * COUNT(CASE WHEN status = 'approved' THEN 1 END) / NULLIF(COUNT(*), 0), 2) as approval_rate,
          ROUND(100.0 * COUNT(CASE WHEN status = 'redeemed' THEN 1 END) / NULLIF(COUNT(CASE WHEN status IN ('approved', 'redeemed') THEN 1 END), 0), 2) as redemption_rate
        FROM evaluations
        ${whereClause}
      `;
      
      const result = await db.query(query, values);
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching Trade & Sleep metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching Trade & Sleep metrics',
        error: error.message
      });
    }
  },

  // Get revenue analytics
  async getRevenueAnalytics(req, res) {
    try {
      const { date_from, date_to, group_by = 'month' } = req.query;
      
      let whereClause = '';
      const values = [];
      let valueIndex = 1;
      
      if (date_from || date_to) {
        whereClause = 'WHERE ';
        if (date_from) {
          whereClause += `created_at >= $${valueIndex}`;
          values.push(date_from);
          valueIndex++;
        }
        
        if (date_to) {
          whereClause += (date_from ? ' AND ' : '') + `created_at <= $${valueIndex}`;
          values.push(date_to);
          valueIndex++;
        }
      }
      
      // Determine date grouping
      const dateGroup = group_by === 'day' ? 'day' : group_by === 'week' ? 'week' : 'month';
      
      const query = `
        WITH revenue_data AS (
          SELECT 
            DATE_TRUNC('${dateGroup}', created_at) as period,
            SUM(total_amount) as sales_revenue,
            0 as subscription_revenue,
            'sales' as source
          FROM sales
          ${whereClause}
          GROUP BY period
          
          UNION ALL
          
          SELECT 
            DATE_TRUNC('${dateGroup}', created_at) as period,
            0 as sales_revenue,
            SUM(monthly_amount) as subscription_revenue,
            'subscriptions' as source
          FROM subscriptions
          WHERE status = 'active'
          ${whereClause}
          GROUP BY period
        )
        SELECT 
          period,
          SUM(sales_revenue) as sales_revenue,
          SUM(subscription_revenue) as subscription_revenue,
          SUM(sales_revenue + subscription_revenue) as total_revenue
        FROM revenue_data
        GROUP BY period
        ORDER BY period DESC
      `;
      
      const result = await db.query(query, values);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching revenue analytics',
        error: error.message
      });
    }
  },

  // Get customer insights
  async getCustomerInsights(req, res) {
    try {
      const { date_from, date_to } = req.query;
      
      let whereClause = '';
      const values = [];
      let valueIndex = 1;
      
      if (date_from || date_to) {
        whereClause = 'WHERE ';
        if (date_from) {
          whereClause += `c.created_at >= $${valueIndex}`;
          values.push(date_from);
          valueIndex++;
        }
        
        if (date_to) {
          whereClause += (date_from ? ' AND ' : '') + `c.created_at <= $${valueIndex}`;
          values.push(date_to);
          valueIndex++;
        }
      }
      
      // Customer segments
      const segmentsQuery = `
        SELECT 
          CASE 
            WHEN purchase_count = 0 THEN 'Prospects'
            WHEN purchase_count = 1 THEN 'First-time Buyers'
            WHEN purchase_count BETWEEN 2 AND 3 THEN 'Repeat Customers'
            ELSE 'VIP Customers'
          END as segment,
          COUNT(*) as customer_count,
          AVG(lifetime_value) as avg_lifetime_value,
          AVG(credits_balance) as avg_credits
        FROM customers c
        ${whereClause}
        GROUP BY segment
        ORDER BY avg_lifetime_value DESC
      `;
      
      // Top customers
      const topCustomersQuery = `
        SELECT 
          c.id,
          c.first_name || ' ' || c.last_name as name,
          c.email,
          c.purchase_count,
          c.lifetime_value,
          c.credits_balance,
          COUNT(DISTINCT s.id) as total_orders,
          COALESCE(SUM(s.total_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        ${whereClause}
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.purchase_count, c.lifetime_value, c.credits_balance
        ORDER BY total_spent DESC
        LIMIT 10
      `;
      
      // Customer acquisition
      const acquisitionQuery = `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_customers,
          AVG(lifetime_value) as avg_initial_value
        FROM customers
        ${whereClause}
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `;
      
      const [segments, topCustomers, acquisition] = await Promise.all([
        db.query(segmentsQuery, values),
        db.query(topCustomersQuery, values),
        db.query(acquisitionQuery, values)
      ]);
      
      res.json({
        success: true,
        data: {
          segments: segments.rows,
          topCustomers: topCustomers.rows,
          acquisition: acquisition.rows
        }
      });
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching customer insights',
        error: error.message
      });
    }
  },

  // Get product analytics
  async getProductAnalytics(req, res) {
    try {
      const { date_from, date_to, category } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;
      
      if (date_from) {
        whereClause += ` AND s.created_at >= $${valueIndex}`;
        values.push(date_from);
        valueIndex++;
      }
      
      if (date_to) {
        whereClause += ` AND s.created_at <= $${valueIndex}`;
        values.push(date_to);
        valueIndex++;
      }
      
      if (category) {
        whereClause += ` AND p.category = $${valueIndex}`;
        values.push(category);
        valueIndex++;
      }
      
      // Product performance
      const productPerformanceQuery = `
        SELECT 
          p.id,
          p.name,
          p.category,
          p.price,
          p.stock_quantity,
          COUNT(DISTINCT si.sale_id) as times_sold,
          COALESCE(SUM(si.quantity), 0) as units_sold,
          COALESCE(SUM(si.subtotal), 0) as revenue,
          COALESCE(AVG(si.price), 0) as avg_selling_price,
          p.stock_quantity as current_stock,
          CASE 
            WHEN p.stock_quantity = 0 THEN 'Out of Stock'
            WHEN p.stock_quantity <= p.min_stock THEN 'Low Stock'
            ELSE 'In Stock'
          END as stock_status
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        ${whereClause}
        GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity, p.min_stock
        ORDER BY revenue DESC
      `;
      
      // Category performance
      const categoryPerformanceQuery = `
        SELECT 
          p.category,
          COUNT(DISTINCT p.id) as product_count,
          COUNT(DISTINCT si.sale_id) as total_sales,
          COALESCE(SUM(si.quantity), 0) as units_sold,
          COALESCE(SUM(si.subtotal), 0) as revenue,
          COALESCE(AVG(si.subtotal), 0) as avg_order_value
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        ${whereClause}
        GROUP BY p.category
        ORDER BY revenue DESC
      `;
      
      const [productPerformance, categoryPerformance] = await Promise.all([
        db.query(productPerformanceQuery, values),
        db.query(categoryPerformanceQuery, values)
      ]);
      
      res.json({
        success: true,
        data: {
          products: productPerformance.rows,
          categories: categoryPerformance.rows
        }
      });
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product analytics',
        error: error.message
      });
    }
  }
};

module.exports = dashboardController;
