import {
  addNewMessage,
  getCustomerMessages,
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

async function processConversation(message, meta) {
  try {
    const customer = await addNewMessage(message, meta);
    const customerMessages = await getCustomerMessages(customer._id);

    const assistantResponse = await createChatWithTools(
      customerMessages,
      system_instructions
    );

    const { assistant_message, tool_call, data } = assistantResponse;

    console.log("Assistant Response:", assistantResponse);

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

      // Update Customer information
      const updatedCustomer = await updateCustomer(
        customer._id,
        phone_number,
        full_name
      );

      if (!updatedCustomer) {
        throw new Error("Customer update failed.");
      }

      // Reliable Parsing of Appointment Date/Time
      const appointment_start = parseUserAppointmentTime(
        appointment_text_time,
        meta.timezone
      );

      console.log("Parsed appointment_start:", appointment_start);

      if (!appointment_start || isNaN(appointment_start.getTime())) {
        throw new Error(
          "Unable to parse appointment date/time provided by the user."
        );
      }

      // Add Appointment
      const appointment = await addAppointment(
        customer._id,
        pet_name,
        pet_type,
        service_type,
        appointment_start,
        duration
      );

      if (appointment.error) {
        throw new Error(`Appointment booking failed: ${appointment.error}`);
      }

      // Send confirmation message back to the user
      const confirmationMessage = {
        text: `✅ Your appointment for ${pet_name} (${service_type}) is booked on ${appointment_start.toLocaleString(
          "en-US",
          { timeZone: meta.timezone }
        )}. Thank you, ${full_name}!`,
        sender: "assistant",
      };

      console.log("Confirmation message:", confirmationMessage);

      await addNewMessage(confirmationMessage, meta);
    }
    if (tool_call === "get_available_times" && data) {
      const { appointment_date, duration = 60 } = data;
      console.log("Data for available times:", data);

      // Reliable Parsing of Appointment Date/Time
      const appointment_avaiable_times = parseUserAppointmentTime(
        appointment_date,
        meta.timezone
      );

      const availableSlots = await getAvailableTimes(
        appointment_avaiable_times,
        duration
      );

      const availabilityMessage = {
        text: `📅 Available time slots on ${appointment_avaiable_times}: ${availableSlots.join(
          ", "
        )}`,
        sender: "assistant",
      };
      console.log("Availability message:", availabilityMessage);

      await addNewMessage(availabilityMessage, meta);
    }
  } catch (error) {
    console.error("Error processing conversation:", error.message);
    await addNewMessage(
      {
        text: `❌ Sorry, there was an issue: ${error.message}`,
        sender: "assistant",
      },
      meta
    );
  }
}

export { processConversation };

export async function handleIncomingMessage(req, res) {
  try {
    res.send("POST request handled");
    const { body } = req;
    const message = body.message;
    const meta = body.meta;
    // console.log(body, "body");
    await processConversation(message, meta);
  } catch (error) {
    console.error("Error in Telegram handler:", error);
    res.status(500).send("Error handling Telegram request.");
  }
}
