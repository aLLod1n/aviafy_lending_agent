export const tools = [
  {
    type: "function",
    function: {
      name: "get_customer_info",
      description:
        "Collect the customer's full name and phone number if missing.",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "Customer's full name.",
          },
          phone_number: {
            type: "string",
            description: "Phone number without country code (e.g., 4567890).",
          },
        },
        required: ["full_name", "phone_number"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function", // ✅ This is required
    function: {
      name: "book_appointment",
      description: "Books a pet appointment",
      parameters: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          phone_number: { type: "string" },
          pet_name: { type: "string" },
          pet_type: {
            type: "string",
            enum: ["dog", "cat", "other"],
          },
          service_type: { type: "string" },
          preferred_date: { type: "string" },
          preferred_time: { type: "string" },
          duration: {
            type: "integer",
            description: "Duration of the appointment in minutes",
          },
        },
        required: [
          "full_name",
          "phone_number",
          "pet_name",
          "pet_type",
          "service_type",
          "preferred_date",
          "preferred_time",
        ],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancel an upcoming appointment for a customer.",
      parameters: {
        type: "object",
        properties: {
          preferred_date: {
            type: "string",
            description: "Date of appointment (YYYY-MM-DD)",
          },
          preferred_time: {
            type: "string",
            description: "Time of appointment (HH:mm)",
          },
        },
        required: ["preferred_date", "preferred_time"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];
