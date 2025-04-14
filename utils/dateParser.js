import * as chrono from "chrono-node";

export function parseUserAppointmentTime(userText) {
  const referenceDate = new Date(); // Used to resolve "tomorrow", etc.

  // Parse the input, explicitly using UTC
  const results = chrono.parse(userText, referenceDate, {
    forwardDate: true,
  });

  if (!results || results.length === 0) {
    console.warn("❌ Unable to parse date from input:", userText);
    return null;
  }

  const parsed = results[0].start;

  // Extract components to build a UTC datetime
  const appointmentUTC = new Date(
    Date.UTC(
      parsed.get("year"),
      parsed.get("month") - 1,
      parsed.get("day"),
      parsed.get("hour") || 0,
      parsed.get("minute") || 0,
      parsed.get("second") || 0
    )
  );

  console.log("✅ Parsed UTC date:", appointmentUTC.toISOString());
  return appointmentUTC;
}
