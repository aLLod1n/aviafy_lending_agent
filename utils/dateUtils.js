// utils/dateUtils.js

/**
 * Convert date and time strings to a full JavaScript Date object
 * @param {String} date - Format: "YYYY-MM-DD"
 * @param {String} time - Format: "HH:mm"
 * @returns {Date}
 */
export function createAppointmentTimestamp(date, time) {
  return new Date(`${date}T${time}:00`);
}
