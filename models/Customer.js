import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CustomerSchema = new Schema(
  {
    full_name: { type: String, required: false, default: "" },

    phone_number: {
      code: { type: String, default: "+995" },
      flag: { type: String, default: "ge" },
      number: { type: String, default: "", required: false },
    },

    email: { type: String, required: false, default: "" },

    country_code: {
      type: String,
      default: "GE", // e.g., "US", "GE", etc.
    },

    timezone: {
      type: String,
      default: "Asia/Tbilisi", // e.g., "America/New_York"
    },

    ip_address: { type: String, default: "" },
    user_agent: { type: String, default: "" },

    source: { type: String, default: "landing_demo" },
    bot_suspended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Customer = model("Customer", CustomerSchema);
