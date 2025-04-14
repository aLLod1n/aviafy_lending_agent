import * as chrono from "chrono-node";

export function parseUserAppointmentTime(
  userText,
  userTimezone = "Asia/Tbilisi"
) {
  const parsedDate = chrono.parseDate(userText, new Date(), {
    timezone: userTimezone,
  });
  console.log("Parsed date:", parsedDate); // Debugging line to check the parsed date
  return parsedDate; // returns a JS Date object
}
