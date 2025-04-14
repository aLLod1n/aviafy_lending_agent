/**
 * Returns user's current local time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
 * @param {string} timezone - IANA timezone string (e.g., "America/New_York")
 * @returns {string} - Local time formatted as ISO string
 */
export function getUserLocalTime(timezone = "America/New_York") {
  try {
    const localTime = new Date().toLocaleString("sv-SE", {
      timeZone: timezone,
      hour12: false,
    });
    return localTime.replace(" ", "T"); // => "YYYY-MM-DDTHH:mm:ss"
  } catch (error) {
    console.error("Failed to get user local time:", error.message);
    return new Date().toISOString(); // fallback to server time (UTC)
  }
}
