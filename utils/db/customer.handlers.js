import { Customer } from "../../models/Customer.js";
import { Message } from "../../models/Message.js";

export async function addNewMessage(
  message,
  meta = { user_agent: "", country_code: "", timezone: "", ip_address: "" }
) {
  const { text, sender } = message;
  const { user_agent, country_code, timezone, ip_address } = meta;
  try {
    // 1. Find or create customer by IP address
    let customer = await Customer.findOne({ ip_address });

    if (!customer) {
      customer = await Customer.create({
        ip_address,
        user_agent: user_agent || "",
        country_code: country_code || "GE",
        timezone: timezone || "Asia/Tbilisi",
        phone_number: {
          code: country_code || "+995",
          flag: country_code || "ge",
          number: null,
        },
      });
    }

    // 2. Create new message linked to customer
    const newMessage = await Message.create({
      customer_id: customer._id,
      sender: sender, // should be "user" or "bot"
      message: text,
    });

    return customer;
  } catch (error) {
    console.error(" Error adding new message:", error);
    return false;
  }
}

export async function getCustomerMessages(customer_id) {
  try {
    if (!customer_id) {
      throw new Error("customer_id is required");
    }

    const messages = await Message.find({ customer_id }).sort({ createdAt: 1 });

    // Optional: simplify structure like OpenAI-style
    const simplifiedMessages = messages.map(({ sender, message }) => ({
      role: sender,
      content: message,
    }));

    return simplifiedMessages;
  } catch (error) {
    console.error(" Error fetching customer messages:", error.message);
    return false;
  }
}

export async function updateCustomer(customer_id, phone_number, full_name) {
  try {
    const filter = { _id: customer_id };
    const updateFields = {};

    // Only update full_name if it's provided
    if (full_name) {
      updateFields.full_name = full_name;
    }

    // Only update phone_number if it's provided
    if (phone_number) {
      updateFields.phone_number = {
        code: "+995",
        flag: "ge",
        number: phone_number,
      };
    }

    // Perform the update using findOneAndUpdate with conditions
    const updatedCustomer = await Customer.findOneAndUpdate(
      filter,
      { $set: updateFields }, // Using $set to avoid overwriting entire fields
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure Mongoose validation is applied
      }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer:", error);
    return false;
  }
}
