import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const MessageSchema = new Schema(
  {
    customer_id: {
      type: Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export const Message = model("Message", MessageSchema);
