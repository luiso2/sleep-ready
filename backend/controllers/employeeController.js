const Employee = require('../models/Employee');
const { parseFilters } = require('../utils/helpers');
const jwt = require('jsonwebtoken');

const employeeController = {
  // Get all employees
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'created_at', order = 'DESC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Employee.findAll(filters, page, pageSize, sort, order);
      
      // Remove passwords from results
      result.data = result.data.map(emp => {
        delete emp.password;
        return emp;
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employees',
        error: error.message
      });
    }
  },

  // Get employee by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Remove password
      delete employee.password;
      
      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee',
        error: error.message
      });
    }
  },

  // Get employee performance
  async getPerformance(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const stats = await Employee.getPerformanceStats(id, startDate, endDate);
      
      res.json({
        success: true,
        data: {
          employee: {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            role: employee.role,
            employee_id: employee.employee_id
          },
          stats,
          period: {
            start: startDate || 'all time',
            end: endDate || 'current'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching performance:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching performance data',
        error: error.message
      });
    }
  },

  // Create new employee
  async create(req, res) {
    try {
      const employeeData = req.body;
      
      // Check if email already exists
      const existingEmail = await Employee.findByEmail(employeeData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
      
      // Check if employee_id already exists
      if (employeeData.employee_id) {
        const existingId = await Employee.findByEmployeeId(employeeData.employee_id);
        if (existingId) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already in use'
          });
        }
      }
      
      const employee = await Employee.create(employeeData);
      
      // Remove password from response
      delete employee.password;
      
      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating employee',
        error: error.message
      });
    }
  },

  // Update employee
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove password from update data (use separate endpoint for password updates)
      delete updateData.password;
      
      // Check if employee exists
      const existing = await Employee.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      // Check if email is being changed and already exists
      if (updateData.email && updateData.email !== existing.email) {
        const emailExists = await Employee.findByEmail(updateData.email);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }
      
      // Check if employee_id is being changed and already exists
      if (updateData.employee_id && updateData.employee_id !== existing.employee_id) {
        const idExists = await Employee.findByEmployeeId(updateData.employee_id);
        if (idExists) {
          return res.status(400).json({
            success: false,
            message: 'Employee ID already in use'
          });
        }
      }
      
      // Handle JSON fields
      if (updateData.commissions && typeof updateData.commissions === 'object') {
        updateData.commissions = JSON.stringify(updateData.commissions);
      }
      
      if (updateData.performance && typeof updateData.performance === 'object') {
        updateData.performance = JSON.stringify(updateData.performance);
      }
      
      const employee = await Employee.update(id, updateData);
      
      // Remove password from response
      delete employee.password;
      
      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating employee',
        error: error.message
      });
    }
  },

  // Delete employee
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.delete(id);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Employee deleted successfully',
        data: employee
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting employee',
        error: error.message
      });
    }
  },

  // Get active agents
  async getActiveAgents(req, res) {
    try {
      const agents = await Employee.getActiveAgents();
      
      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      console.error('Error fetching active agents:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active agents',
        error: error.message
      });
    }
  },

  // Update employee password
  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Verify the user changing the password is either the employee or an admin
      if (req.user.id !== id && req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to change this password'
        });
      }
      
      // If not admin, verify current password
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        const employee = await Employee.findById(id);
        if (!employee) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
        
        const isValid = await Employee.validatePassword(employee.email, currentPassword);
        if (!isValid) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
      }
      
      const result = await Employee.updatePassword(id, newPassword);
      
      res.json({
        success: true,
        message: 'Password updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating password',
        error: error.message
      });
    }
  }
};

module.exports = employeeController;
