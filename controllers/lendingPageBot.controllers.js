import {
  addNewMessage,
  getCustomerMessages,
  updateCustomer,
  getCustomerByIP,
} from "../services/customer.service.js";
import {
  addAppointment,
  getAvailableTimes,
} from "../services/appointment.service.js";
import { createChatWithTools } from "../middlewares/LLM.js";
import { parseUserAppointmentTime } from "../utils/dateParser.js";
import { system_instructions } from "../utils/systemInstructions.js";

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

      // Update customer info
      const updatedCustomer = await updateCustomer(
        customer._id,
        phone_number,
        full_name
      );
      if (!updatedCustomer) {
        throw new Error("Customer update failed.");
      }

      // Parse time
      const appointment_start = parseUserAppointmentTime(
        appointment_text_time,
        meta.timezone
      );
      if (!appointment_start || isNaN(appointment_start.getTime())) {
        throw new Error("Invalid appointment time.");
      }

      // Save appointment
      const appointment = await addAppointment(
        customer._id,
        pet_name,
        pet_type,
        service_type,
        appointment_start,
        duration
      );
      if (appointment.error) {
        throw new Error(`Booking failed: ${appointment.error}`);
      }

      const confirmationMessage = {
        text: `✅ Your appointment for ${pet_name} (${service_type}) is booked on ${appointment_start.toLocaleString(
          "en-US",
          { timeZone: meta.timezone }
        )}. Thank you, ${full_name}!`,
        sender: "assistant",
      };

      await addNewMessage(confirmationMessage, meta);
      return { assistant_message: confirmationMessage };
    }

    if (tool_call === "get_available_times" && data) {
      const { appointment_date, duration = 60 } = data;

      const date = parseUserAppointmentTime(appointment_date, meta.timezone);
      const availableSlots = await getAvailableTimes(date, duration);

      const availabilityMessage = {
        text: `📅 Available slots on ${date.toLocaleDateString(
          "en-US"
        )}: ${availableSlots.join(", ")}`,
        sender: "assistant",
      };

      await addNewMessage(availabilityMessage, meta);
      return { assistant_message: availabilityMessage };
    }

    // Final fallback
    return { assistant_message };
  } catch (error) {
    console.error("Error processing conversation:", error.message);
    const errorMsg = {
      text: `❌ Sorry, something went wrong: ${error.message}`,
      sender: "assistant",
    };
    await addNewMessage(errorMsg, meta);
    return { assistant_message: errorMsg };
  }
}

export async function handleIncomingMessage(req, res) {
  try {
    const { message, meta } = req.body;

    const assistantResponse = await processConversation(message, meta);

    if (assistantResponse?.assistant_message) {
      return res.status(200).json({
        message: assistantResponse.assistant_message,
      });
    }

    return res.status(200).json({
      message: {
        text: "✅ Message processed.",
        sender: "assistant",
      },
    });
  } catch (error) {
    console.error("❌ Error in handleIncomingMessage:", error);
    return res.status(500).json({
      message: {
        text: `❗ Error occurred: ${error.message}`,
        sender: "assistant",
      },
    });
  }
}

export async function getCustomersMessage(req, res) {
  try {
    const { ip_address } = req.body;

    if (!ip_address) {
      return res.status(400).json({ error: "Missing ip_address" });
    }

    const customer = await getCustomerByIP(ip_address);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const messages = await getCustomerMessages(customer._id);

    return res.status(200).json({
      customer_id: customer._id,
      full_name: customer.full_name,
      phone_number: customer.phone_number?.number || null,
      messages,
    });
  } catch (error) {
    console.error("❌ Error in getCustomersMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
