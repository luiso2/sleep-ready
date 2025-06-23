const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Appointment {
  static async findAll(filters = {}, page = 1, pageSize = 20, sort = 'appointment_date', order = 'ASC') {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Apply filters
    if (filters.status) {
      whereClause += ` AND a.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.customer_id) {
      whereClause += ` AND a.customer_id = $${valueIndex}`;
      values.push(filters.customer_id);
      valueIndex++;
    }

    if (filters.store_id) {
      whereClause += ` AND a.store_id = $${valueIndex}`;
      values.push(filters.store_id);
      valueIndex++;
    }

    if (filters.employee_id) {
      whereClause += ` AND a.employee_id = $${valueIndex}`;
      values.push(filters.employee_id);
      valueIndex++;
    }

    if (filters.appointment_type) {
      whereClause += ` AND a.appointment_type = $${valueIndex}`;
      values.push(filters.appointment_type);
      valueIndex++;
    }

    if (filters.date_from) {
      whereClause += ` AND a.appointment_date >= $${valueIndex}`;
      values.push(filters.date_from);
      valueIndex++;
    }

    if (filters.date_to) {
      whereClause += ` AND a.appointment_date <= $${valueIndex}`;
      values.push(filters.date_to);
      valueIndex++;
    }

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM appointments a ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Get appointments with related info
      const query = `
        SELECT 
          a.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          emp.name as employee_name,
          s.name as store_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN employees emp ON a.employee_id = emp.id
        LEFT JOIN stores s ON a.store_id = s.id
        ${whereClause}
        ORDER BY a.${sort} ${order}
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;
      values.push(pageSize, offset);

      const result = await db.query(query, values);

      return {
        data: result.rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Error in Appointment.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          a.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          emp.name as employee_name,
          s.name as store_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN employees emp ON a.employee_id = emp.id
        LEFT JOIN stores s ON a.store_id = s.id
        WHERE a.id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Appointment.findById:', error);
      throw error;
    }
  }

  static async create(appointmentData) {
    const id = appointmentData.id || uuidv4();
    const {
      customer_id,
      store_id = null,
      employee_id = null,
      appointment_type,
      appointment_date,
      duration_minutes = 60,
      status = 'scheduled',
      notes = null,
      symptoms = null,
      created_by = null
    } = appointmentData;

    try {
      const query = `
        INSERT INTO appointments (
          id, customer_id, store_id, employee_id, appointment_type,
          appointment_date, duration_minutes, status, notes, symptoms,
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const values = [
        id, customer_id, store_id, employee_id, appointment_type,
        appointment_date, duration_minutes, status, notes, symptoms,
        created_by
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Appointment.create:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const query = `
        UPDATE appointments
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Appointment.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Appointment.delete:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, notes = null) {
    try {
      const query = `
        UPDATE appointments
        SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      const result = await db.query(query, [status, notes, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Appointment.updateStatus:', error);
      throw error;
    }
  }

  static async checkConflict(appointmentDate, durationMinutes, employeeId, storeId, excludeId = null) {
    try {
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      let query = `
        SELECT id FROM appointments
        WHERE status NOT IN ('cancelled', 'no_show')
        AND (
          (appointment_date <= $1 AND appointment_date + INTERVAL '1 minute' * duration_minutes > $1)
          OR (appointment_date < $2 AND appointment_date + INTERVAL '1 minute' * duration_minutes >= $2)
          OR (appointment_date >= $1 AND appointment_date < $2)
        )
      `;
      const values = [appointmentDate, endTime];
      let valueIndex = 3;

      if (employeeId) {
        query += ` AND employee_id = $${valueIndex}`;
        values.push(employeeId);
        valueIndex++;
      }

      if (storeId) {
        query += ` AND store_id = $${valueIndex}`;
        values.push(storeId);
        valueIndex++;
      }

      if (excludeId) {
        query += ` AND id != $${valueIndex}`;
        values.push(excludeId);
      }

      const result = await db.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in Appointment.checkConflict:', error);
      throw error;
    }
  }

  static async getCalendarView(filters) {
    try {
      let whereClause = `WHERE appointment_date >= $1 AND appointment_date <= $2`;
      const values = [filters.start_date, filters.end_date];
      let valueIndex = 3;

      if (filters.store_id) {
        whereClause += ` AND a.store_id = $${valueIndex}`;
        values.push(filters.store_id);
        valueIndex++;
      }

      if (filters.employee_id) {
        whereClause += ` AND a.employee_id = $${valueIndex}`;
        values.push(filters.employee_id);
        valueIndex++;
      }

      whereClause += ` AND a.status NOT IN ('cancelled')`;

      const query = `
        SELECT 
          a.*,
          c.first_name || ' ' || c.last_name as customer_name,
          emp.name as employee_name,
          s.name as store_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN employees emp ON a.employee_id = emp.id
        LEFT JOIN stores s ON a.store_id = s.id
        ${whereClause}
        ORDER BY a.appointment_date ASC
      `;

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in Appointment.getCalendarView:', error);
      throw error;
    }
  }

  static async getUpcoming(days = 7, filters = {}) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      let whereClause = `WHERE appointment_date >= NOW() AND appointment_date <= $1`;
      const values = [endDate];
      let valueIndex = 2;

      if (filters.store_id) {
        whereClause += ` AND a.store_id = $${valueIndex}`;
        values.push(filters.store_id);
        valueIndex++;
      }

      if (filters.employee_id) {
        whereClause += ` AND a.employee_id = $${valueIndex}`;
        values.push(filters.employee_id);
        valueIndex++;
      }

      whereClause += ` AND a.status IN ('scheduled', 'confirmed')`;

      const query = `
        SELECT 
          a.*,
          c.first_name || ' ' || c.last_name as customer_name,
          c.phone as customer_phone,
          emp.name as employee_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN employees emp ON a.employee_id = emp.id
        ${whereClause}
        ORDER BY a.appointment_date ASC
      `;

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in Appointment.getUpcoming:', error);
      throw error;
    }
  }

  static async getStats(filters = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const values = [];
      let valueIndex = 1;

      if (filters.store_id) {
        whereClause += ` AND store_id = $${valueIndex}`;
        values.push(filters.store_id);
        valueIndex++;
      }

      if (filters.employee_id) {
        whereClause += ` AND employee_id = $${valueIndex}`;
        values.push(filters.employee_id);
        valueIndex++;
      }

      if (filters.date_from) {
        whereClause += ` AND appointment_date >= $${valueIndex}`;
        values.push(filters.date_from);
        valueIndex++;
      }

      if (filters.date_to) {
        whereClause += ` AND appointment_date <= $${valueIndex}`;
        values.push(filters.date_to);
        valueIndex++;
      }

      const query = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show,
          COUNT(CASE WHEN appointment_type = 'sleep_study' THEN 1 END) as sleep_studies,
          COUNT(CASE WHEN appointment_type = 'consultation' THEN 1 END) as consultations,
          COUNT(CASE WHEN appointment_type = 'follow_up' THEN 1 END) as follow_ups,
          ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / NULLIF(COUNT(*), 0), 2) as completion_rate,
          ROUND(100.0 * COUNT(CASE WHEN status = 'no_show' THEN 1 END) / NULLIF(COUNT(*), 0), 2) as no_show_rate
        FROM appointments
        ${whereClause}
      `;

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Appointment.getStats:', error);
      throw error;
    }
  }

  static async getAvailableSlots(date, durationMinutes = 60, filters = {}) {
    try {
      // Get existing appointments for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let whereClause = `WHERE appointment_date >= $1 AND appointment_date <= $2 AND status NOT IN ('cancelled')`;
      const values = [startOfDay, endOfDay];
      let valueIndex = 3;

      if (filters.store_id) {
        whereClause += ` AND store_id = $${valueIndex}`;
        values.push(filters.store_id);
        valueIndex++;
      }

      if (filters.employee_id) {
        whereClause += ` AND employee_id = $${valueIndex}`;
        values.push(filters.employee_id);
        valueIndex++;
      }

      const query = `
        SELECT appointment_date, duration_minutes
        FROM appointments
        ${whereClause}
        ORDER BY appointment_date ASC
      `;

      const result = await db.query(query, values);
      const existingAppointments = result.rows;

      // Generate available slots (9 AM to 5 PM by default)
      const availableSlots = [];
      const slotStart = new Date(date);
      slotStart.setHours(9, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(17, 0, 0, 0);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          const aptEnd = new Date(apt.appointment_date);
          aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration_minutes);
          
          return (
            (slotStart >= new Date(apt.appointment_date) && slotStart < aptEnd) ||
            (slotEnd > new Date(apt.appointment_date) && slotEnd <= aptEnd) ||
            (slotStart <= new Date(apt.appointment_date) && slotEnd >= aptEnd)
          );
        });

        if (!hasConflict && slotEnd <= dayEnd) {
          availableSlots.push({
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString(),
            duration_minutes: durationMinutes
          });
        }

        slotStart.setMinutes(slotStart.getMinutes() + 30); // 30-minute intervals
      }

      return availableSlots;
    } catch (error) {
      console.error('Error in Appointment.getAvailableSlots:', error);
      throw error;
    }
  }
}

module.exports = Appointment;
