// Generate unique IDs
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
};

// Format pagination response
const formatPaginationResponse = (data, page, pageSize, total) => {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total: parseInt(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

// Parse filters from query string
const parseFilters = (query) => {
  const filters = {};
  const { page, pageSize, sort, order, ...rest } = query;
  
  // Remove empty values
  Object.keys(rest).forEach(key => {
    if (rest[key] !== '' && rest[key] !== undefined && rest[key] !== null) {
      filters[key] = rest[key];
    }
  });
  
  return filters;
};

// Build WHERE clause from filters
const buildWhereClause = (filters, allowedFields = []) => {
  const conditions = [];
  const values = [];
  let valueIndex = 1;
  
  Object.keys(filters).forEach(key => {
    if (allowedFields.length === 0 || allowedFields.includes(key)) {
      // Handle different filter types
      if (key.endsWith('_like')) {
        const field = key.replace('_like', '');
        conditions.push(`${field} ILIKE $${valueIndex}`);
        values.push(`%${filters[key]}%`);
        valueIndex++;
      } else if (key.endsWith('_gte')) {
        const field = key.replace('_gte', '');
        conditions.push(`${field} >= $${valueIndex}`);
        values.push(filters[key]);
        valueIndex++;
      } else if (key.endsWith('_lte')) {
        const field = key.replace('_lte', '');
        conditions.push(`${field} <= $${valueIndex}`);
        values.push(filters[key]);
        valueIndex++;
      } else if (key.endsWith('_in')) {
        const field = key.replace('_in', '');
        const inValues = filters[key].split(',');
        const placeholders = inValues.map((_, i) => `$${valueIndex + i}`).join(',');
        conditions.push(`${field} IN (${placeholders})`);
        values.push(...inValues);
        valueIndex += inValues.length;
      } else {
        conditions.push(`${key} = $${valueIndex}`);
        values.push(filters[key]);
        valueIndex++;
      }
    }
  });
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

// Format date for PostgreSQL
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

// Calculate commission based on sale type and amount
const calculateCommission = (saleType, amount, employeeRole) => {
  const commissionRates = {
    subscription: {
      agent: 0.15,
      supervisor: 0.18,
      manager: 0.20
    },
    trade_and_sleep: {
      agent: 0.10,
      supervisor: 0.12,
      manager: 0.15
    },
    direct_sale: {
      agent: 0.08,
      supervisor: 0.10,
      manager: 0.12
    }
  };
  
  const rate = commissionRates[saleType]?.[employeeRole] || 0.08;
  return {
    rate,
    amount: amount * rate,
    type: saleType
  };
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

module.exports = {
  generateId,
  formatPaginationResponse,
  parseFilters,
  buildWhereClause,
  formatDate,
  calculateCommission,
  formatCurrency
};
