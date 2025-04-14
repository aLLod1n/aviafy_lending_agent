import { Appointment } from "../models/Appointments.js";

/**
 * Check if a time slot is available by checking for overlaps
 * @param {Date} requestedStart - JS Date object for appointment start
 * @param {Number} duration - Duration in minutes
 * @returns {Boolean} - True if available, false if conflict
 */
export async function isTimeSlotAvailable(requestedStart, duration) {
  try {
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    const overlapping = await Appointment.findOne({
      appointment_start: { $lt: requestedEnd },
      $expr: {
        $gt: [
          { $add: ["$appointment_start", { $multiply: ["$duration", 60000] }] },
          requestedStart,
        ],
      },
      status: { $ne: "canceled" },
    });

    return !overlapping; // true if no conflicts
  } catch (error) {
    console.error("❌ Error checking availability:", error.message);
    return false;
  }
}

/**
 * Add a new appointment to the system
 * @param {Object} data - Includes customer_id, pet_name, pet_type, service_type, appointment_start (Date), duration
 * @returns {Object} - Created appointment or error
 */
export async function addAppointment(
  customer_id,
  pet_name,
  pet_type,
  service_type,
  appointment_start,
  duration = 30
) {
  try {
    if (
      !customer_id ||
      !pet_name ||
      !pet_type ||
      !service_type ||
      !appointment_start
    ) {
      throw new Error("Missing required fields");
    }

    const isAvailable = await isTimeSlotAvailable(
      new Date(appointment_start),
      duration
    );
    if (!isAvailable) {
      throw new Error("This time slot is already booked.");
    }

    const newAppointment = new Appointment({
      customer_id,
      pet_name,
      pet_type,
      service_type,
      appointment_start: new Date(appointment_start),
      duration,
      status: "pending",
    });

    const saved = await newAppointment.save();
    return saved;
  } catch (error) {
    console.error("❌ Error adding appointment:", error.message);
    return { error: error.message };
  }
}

/**
 * Get all appointment start times on a specific date
 * @param {String} date - "YYYY-MM-DD"
 * @returns {Array} - Appointment documents
 */
export async function getAppointmentsByDate(date) {
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      appointment_start: { $gte: start, $lte: end },
      status: { $ne: "canceled" },
    });

    return appointments;
  } catch (error) {
    console.error("❌ Error fetching appointments by date:", error.message);
    return [];
  }
}

/**
 * Cancel an appointment by date and time
 */
export async function cancelAppointment(customer_id, date, time) {
  try {
    const appointment_start = new Date(`${date}T${time}:00`);
    const canceled = await Appointment.findOneAndUpdate(
      {
        customer_id,
        appointment_start,
        status: { $ne: "canceled" },
      },
      {
        $set: { status: "canceled" },
      },
      { new: true }
    );

    return canceled;
  } catch (error) {
    console.error("❌ Error canceling appointment:", error);
    return null;
  }
}

export async function getAvailableTimes(appointment_date, duration = 60) {
  const WORK_HOURS = {
    start: 9,
    end: 18,
  };

  const bookedTimes = await getBookedTimesByDate(appointment_date);
  const available = [];

  for (let hour = WORK_HOURS.start; hour < WORK_HOURS.end; hour++) {
    const timeSlot = `${String(hour).padStart(2, "0")}:00`;
    if (!bookedTimes.includes(timeSlot)) {
      available.push(timeSlot);
    }
  }

  return available;
}

/**
 * Get booked time slots on a specific date (returns ["09:00", "10:30", ...])
 * @param {String} date - Format: "YYYY-MM-DD"
 * @returns {Array} - Array of strings representing booked time slots
 */
async function getBookedTimesByDate(date) {
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      appointment_start: { $gte: start, $lte: end },
      status: { $ne: "canceled" },
    });

    const times = appointments.map(
      (appt) => appt.appointment_start.toISOString().substring(11, 16) // e.g., "14:30"
    );

    return times;
  } catch (error) {
    console.error("❌ Error in getBookedTimesByDate:", error.message);
    return [];
  }
}
