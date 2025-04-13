import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PetSchema = new Schema(
  {
    pet_name: { type: String, default: "" },
    pet_type: { type: String, default: "" }, // e.g., Dog, Cat
    breed: { type: String, default: "" },
    size: { type: String, default: "" }, // e.g., Small, Medium, Large
    age: { type: Number, default: 0 },
    gender: { type: String, default: "" }, // e.g., Male, Female
    behavior_notes: { type: String, default: "" },
    medical_info: { type: String, default: "" },
    vaccination_status: { type: String, default: "" }, // e.g., Up-to-date, Expired
    service_preferences: { type: [String], default: [] },
  },
  { _id: false }
);

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

    // 🐶 Pets Info Embedded
    pets: { type: [PetSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Customer = model("Customer", CustomerSchema);
