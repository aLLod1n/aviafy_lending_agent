import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const AppointmentSchema = new Schema(
  {
    customer_id: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    pet_name: {
      type: String,
      required: true,
    },
    pet_type: {
      type: String,
      enum: ["dog", "cat", "other"],
      required: true,
    },
    service_type: {
      type: String,
      required: true, // e.g., "grooming", "vet", "boarding"
    },
    preferred_date: {
      type: Date,
      required: true,
    },
    preferred_time: {
      type: String,
      required: true, // e.g., "14:30"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Appointment = model("Appointment", AppointmentSchema);
