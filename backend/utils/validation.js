const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Common validation patterns
const patterns = {
  phone: /^[\d\s\-\+\(\)]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9_-]+$/
};

// Common sanitizers
const sanitizers = {
  trim: (value) => value?.trim() || '',
  normalizeEmail: (value) => value?.toLowerCase().trim() || '',
  normalizePhone: (value) => value?.replace(/\D/g, '') || ''
};

module.exports = {
  handleValidationErrors,
  patterns,
  sanitizers
};
