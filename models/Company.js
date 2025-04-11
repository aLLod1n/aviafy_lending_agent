import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    address: { type: String, required: false },
    web_page: { type: String, required: false },
    phone_number: {
      code: { type: String, default: "+995" },
      flag: { type: String, default: "ge" },
      number: { type: String, required: false }, // Pattern for 9-digit numbers
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

export const Company = mongoose.model("Company", CompanySchema);
