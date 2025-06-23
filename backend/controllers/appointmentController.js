const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const { parseFilters } = require('../utils/helpers');

const appointmentController = {
  // Get all appointments
  async getAll(req, res) {
    try {
      const { page = 1, pageSize = 20, sort = 'appointment_date', order = 'ASC' } = req.query;
      const filters = parseFilters(req.query);
      
      const result = await Appointment.findAll(filters, page, pageSize, sort, order);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error.message
      });
    }
  },

  // Get appointment by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointment',
        error: error.message
      });
    }
  },

  // Create new appointment
  async create(req, res) {
    try {
      const appointmentData = req.body;
      appointmentData.created_by = req.user.id;
      
      // Verify customer exists
      const customer = await Customer.findById(appointmentData.customer_id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      // Check for scheduling conflicts
      const conflict = await Appointment.checkConflict(
        appointmentData.appointment_date,
        appointmentData.duration_minutes,
        appointmentData.employee_id,
        appointmentData.store_id
      );
      
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Schedule conflict: Another appointment exists at this time'
        });
      }
      
      const appointment = await Appointment.create(appointmentData);
      
      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating appointment',
        error: error.message
      });
    }
  },

  // Update appointment
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if appointment exists
      const existing = await Appointment.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Check for conflicts if date/time is being changed
      if (updateData.appointment_date || updateData.duration_minutes) {
        const conflict = await Appointment.checkConflict(
          updateData.appointment_date || existing.appointment_date,
          updateData.duration_minutes || existing.duration_minutes,
          updateData.employee_id || existing.employee_id,
          updateData.store_id || existing.store_id,
          id // Exclude current appointment
        );
        
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: 'Schedule conflict: Another appointment exists at this time'
          });
        }
      }
      
      const appointment = await Appointment.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appointment',
        error: error.message
      });
    }
  },

  // Delete appointment
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const appointment = await Appointment.delete(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Appointment deleted successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting appointment',
        error: error.message
      });
    }
  },

  // Update appointment status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      const appointment = await Appointment.updateStatus(id, status, notes);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Appointment status updated successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating appointment status',
        error: error.message
      });
    }
  },

  // Get appointments for calendar view
  async getCalendar(req, res) {
    try {
      const { start_date, end_date, store_id, employee_id } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      const appointments = await Appointment.getCalendarView({
        start_date,
        end_date,
        store_id,
        employee_id
      });
      
      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching calendar',
        error: error.message
      });
    }
  },

  // Get upcoming appointments
  async getUpcoming(req, res) {
    try {
      const { days = 7, store_id, employee_id } = req.query;
      
      const appointments = await Appointment.getUpcoming(days, { store_id, employee_id });
      
      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming appointments',
        error: error.message
      });
    }
  },

  // Get appointment statistics
  async getStats(req, res) {
    try {
      const { store_id, employee_id, date_from, date_to } = req.query;
      
      const stats = await Appointment.getStats({
        store_id,
        employee_id,
        date_from,
        date_to
      });
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching appointment statistics',
        error: error.message
      });
    }
  },

  // Send appointment reminder
  async sendReminder(req, res) {
    try {
      const { id } = req.params;
      
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
      
      // Mark reminder as sent
      await Appointment.update(id, { reminder_sent: true });
      
      // In a real implementation, send email/SMS here
      
      res.json({
        success: true,
        message: 'Reminder sent successfully'
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending reminder',
        error: error.message
      });
    }
  },

  // Get available time slots
  async getAvailableSlots(req, res) {
    try {
      const { date, store_id, employee_id, duration_minutes = 60 } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }
      
      const slots = await Appointment.getAvailableSlots(
        date,
        duration_minutes,
        { store_id, employee_id }
      );
      
      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available slots',
        error: error.message
      });
    }
  }
};

module.exports = appointmentController;
