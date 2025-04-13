import { addAppointment } from "../services/appointment.service.js";
import {
  addNewMessage,
  getCustomerMessages,
  updateCustomer,
} from "../services/customer.service.js";
import { createChatWithTools } from "../middlewares/LLM.js";

export async function processConversation(message, meta) {
  try {
    const customer = await addNewMessage(message, meta);
    const customer_id = customer._id;

    const customerMessages = await getCustomerMessages(customer_id);

    // ⏰ Add current datetime for GPT
    const timezone = meta.timezone || "America/Los_Angeles"; // adjust as needed
    const now = new Date().toLocaleString("en-US", {
      timeZone: timezone,
      hour12: false,
    });

    const system_instructions = `
You are a helpful assistant for a pet care business.
Current local datetime is: ${now}.
Use this to understand expressions like "today", "tomorrow", "next week", or "in 2 hours".
Only trigger 'book_appointment' when all data is collected.
If the user wants to cancel, use the correct time based on this context.
`;

    const { tool_call, data, assistant_message } = await createChatWithTools(
      customerMessages,
      system_instructions
    );

    if (assistant_message?.text) {
      await addNewMessage(assistant_message, meta);
    }
    console.log(assistant_message, "assistant_message");

    if (tool_call === "book_appointment") {
      const {
        full_name,
        phone_number,
        pet_name,
        pet_type,
        service_type,
        preferred_date,
        preferred_time,
        duration = 30,
      } = data;

      const appointment_start = new Date(
        `${preferred_date}T${preferred_time}:00`
      );
      console.log(appointment_start, "appointment_start");

      await updateCustomer(customer_id, phone_number, full_name);

      const appointment = await addAppointment(
        customer_id,
        pet_name,
        pet_type,
        service_type,
        appointment_start,
        duration
      );

      const confirmation = {
        text: `✅ Appointment booked for ${preferred_date} at ${preferred_time}.`,
        sender: "assistant",
      };

      await addNewMessage(confirmation, meta);
    }

    if (tool_call === "cancel_appointment") {
      const { preferred_date, preferred_time } = data;

      const result = await cancelAppointment(
        customer_id,
        preferred_date,
        preferred_time
      );

      const cancellationMessage = {
        text: result
          ? `❌ Appointment on ${preferred_date} at ${preferred_time} has been canceled.`
          : `⚠️ No matching appointment found to cancel.`,
        sender: "assistant",
      };
      console.log(cancellationMessage, "cancellationMessage");
      await addNewMessage(cancellationMessage, meta);
    }
  } catch (error) {
    console.error("❌ Error processing conversation:", error);
  }
}

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
