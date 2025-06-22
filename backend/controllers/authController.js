const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, role, status FROM employees WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // For demo purposes, we'll use a simple password check
    // In production, you should hash passwords properly
    const validPassword = password === 'admin123' || password === 'password';
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive data
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const me = async (req, res) => {
  try {
    const user = req.user;
    
    // Get additional user info
    const userResult = await db.query(
      `SELECT 
        e.id, e.email, e.first_name, e.last_name, e.role, e.status,
        e.employee_id, e.phone_extension, e.avatar, e.shift,
        e.hired_at, e.commissions, e.performance,
        s.name as store_name, s.code as store_code
      FROM employees e 
      LEFT JOIN stores s ON e.store_id = s.id 
      WHERE e.id = $1`,
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: userResult.rows[0]
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const logout = async (req, res) => {
  // Since we're using stateless JWT, we just return success
  // In a production app, you might want to implement token blacklisting
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  me,
  logout
};
