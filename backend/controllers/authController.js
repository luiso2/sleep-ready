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

    // Find user by email in users table
    const userResult = await db.query(
      'SELECT id, email, name, role, is_active, password FROM users WHERE email = $1',
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
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // For demo purposes, we're using plain text passwords
    // In production, passwords should be hashed with bcrypt
    const validPassword = password === user.password;
    
    // Uncomment this for production with hashed passwords:
    // const validPassword = await bcrypt.compare(password, user.password);
    
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

    // Split name into first_name and last_name for frontend compatibility
    const nameParts = (user.name || '').split(' ');
    const userData = {
      id: user.id,
      email: user.email,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      role: user.role,
      status: user.is_active ? 'active' : 'inactive'
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
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
    
    // Get user info from users table
    const userResult = await db.query(
      `SELECT 
        id, email, name, role, is_active,
        created_at, updated_at
      FROM users 
      WHERE id = $1`,
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userResult.rows[0];
    
    // Split name for frontend compatibility
    const nameParts = (userData.name || '').split(' ');
    const responseData = {
      id: userData.id,
      email: userData.email,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      role: userData.role,
      status: userData.is_active ? 'active' : 'inactive',
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    res.json({
      success: true,
      data: responseData
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
