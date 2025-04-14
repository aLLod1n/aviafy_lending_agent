import {
  addNewMessage,
  getCustomerMessages,
  getCustomerMessagesByIP,
  updateCustomer,
} from "../services/customer.service.js";
import {
  addAppointment,
  getAvailableTimes,
} from "../services/appointment.service.js";
import { createChatWithTools } from "../middlewares/LLM.js";
import { parseUserAppointmentTime } from "../utils/dateParser.js";

const system_instructions = `
You are a helpful assistant for a pet care company.
Clearly collect all necessary details from the customer for appointment booking.
If a customer specifies an appointment date/time, return it exactly as given. Do not parse it yourself.
If any required information (full name, phone number, pet details, service type, appointment date/time) is missing, ask explicitly.
Estimate service durations based on these guidelines:
- "Grooming" → 60 minutes
- "Nail trim" → 15 minutes
- "Bath & blow dry" → 30 minutes
- "Boarding" → 120 minutes
- "Vet visit" → 30 minutes

Only call get_available_times AFTER the user provides service type and preferred date. Include the correct estimated duration in the tool call.
`;

async function processConversation(meta) {
  try {
    const { ip_address } = meta;
    const customer = await getCustomerMessagesByIP(ip_address);
    if (!customer)
      return {
        assistant_message: { text: "Customer not found", sender: "assistant" },
      };

    const customerMessages = await getCustomerMessages(customer._id);
    const assistantResponse = await createChatWithTools(
      customerMessages,
      system_instructions
    );

    const { assistant_message, tool_call, data } = assistantResponse;

    if (assistant_message?.text) {
      await addNewMessage(assistant_message, meta);
    }

    if (tool_call === "book_appointment" && data) {
      const {
        full_name,
        phone_number,
        pet_name,
        pet_type,
        service_type,
        appointment_text_time,
        duration = 60,
      } = data;

      await updateCustomer(customer._id, phone_number, full_name);

      const appointment_start = parseUserAppointmentTime(
        appointment_text_time,
        meta.timezone
      );

      if (!appointment_start || isNaN(appointment_start.getTime())) {
        throw new Error("Could not parse appointment time");
      }

      const result = await addAppointment(
        customer._id,
        pet_name,
        pet_type,
        service_type,
        appointment_start,
        duration
      );

      if (result.error) throw new Error(result.error);

      const confirmMessage = {
        text: `✅ Appointment booked for ${pet_name} on ${appointment_start.toLocaleString(
          "en-US",
          { timeZone: meta.timezone }
        )}`,
        sender: "assistant",
      };

      await addNewMessage(confirmMessage, meta);
      return { assistant_message: confirmMessage };
    }

    if (tool_call === "get_available_times" && data) {
      const { appointment_date, duration = 30 } = data;
      const slots = await getAvailableTimes(appointment_date, duration);
      const msg = {
        text: `📅 Available slots on ${appointment_date}: ${slots.join(", ")}`,
        sender: "assistant",
      };

      await addNewMessage(msg, meta);
      return { assistant_message: msg };
    }

    // default return if just assistant response
    return { assistant_message };
  } catch (error) {
    console.error("❌ Error in processConversation:", error);
    const failMsg = {
      text: `❗ Sorry, something went wrong: ${error.message}`,
      sender: "assistant",
    };
    await addNewMessage(failMsg, meta);
    return { assistant_message: failMsg };
  }
}

let debounceTimers = new Map(); // Map by user IP or session ID

export async function handleIncomingMessage(req, res) {
  try {
    const { message, meta } = req.body;

    await addNewMessage(message, meta);

    const response = await processConversation(meta);

    res.status(200).json({ message: response.assistant_message });
  } catch (error) {
    console.error("Error in handleIncomingMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
