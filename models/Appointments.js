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
      required: true, // e.g., "grooming", "boarding", etc.
    },
    appointment_start: {
      type: Date,
      required: true, // Full datetime — e.g., "2024-04-15T14:30:00Z"
    },
    duration: {
      type: Number,
      required: true,
      default: 30, // In minutes (can be customized per service type)
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Appointment = model("Appointment", AppointmentSchema);
