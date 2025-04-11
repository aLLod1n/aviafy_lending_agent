import { createChatWithTools, imageInputLLM } from "../services/LLM.js";

import {
  addNewMessage,
  getCustomerMessages,
  updateCustomer,
} from "../utils/db/customer.handlers.js";

// Utility function to create a delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processConversation(message, meta) {
  try {
    const customer = await addNewMessage(message, meta);
    const { _id } = customer;

    const customerMessages = await getCustomerMessages(_id);

    const system_instructions = `You are a helpful assistant. You are a groomingYou are a helpful assistant working for a pet care business. Help users make appointments..`;
    const assistant_resp = await createChatWithTools(
      customerMessages,
      system_instructions
    );

    const { assistant_message, phone_number, full_name } = assistant_resp;

    console.log(assistant_resp, "arg");

    if (assistant_message?.text) {
      await addNewMessage(assistant_message, meta);
    } else {
      let updatedCustomer = await updateCustomer(_id, phone_number, full_name);
      console.log(updatedCustomer, "updatedCustomer");

      let tool_choice = "none";
      let assistant_resp = await createChatWithTools(
        customerMessages,
        system_instructions,
        tool_choice
      );
      const { assistant_message } = assistant_resp;

      await addNewMessage(assistant_message, meta);
    }
  } catch (error) {
    console.error("Error processing conversation:", error);
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
