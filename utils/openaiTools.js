export const tools = [
  {
    type: "function",
    function: {
      name: "get_customer_info",
      description: "Collect customer's full name and phone number if unknown.",
      parameters: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          phone_number: { type: "string" },
        },
        required: ["full_name", "phone_number"],
        additionalProperties: false,
      },
    },
  },
  // {
  //   type: "function",
  //   function: {
  //     name: "book_appointment",
  //     description:
  //       "Book an appointment based on user's provided text for the appointment date/time.",
  //     parameters: {
  //       type: "object",
  //       properties: {
  //         full_name: { type: "string" },
  //         phone_number: { type: "string" },
  //         pet_name: { type: "string" },
  //         pet_type: {
  //           type: "string",
  //           enum: ["dog", "cat", "other"],
  //         },
  //         service_type: { type: "string" },
  //         appointment_text_time: {
  //           type: "string",
  //           description:
  //             "User's appointment time phrase exactly as they stated (e.g., 'tomorrow at noon', 'next Tuesday 3PM'), make shure it is grammatically correct",
  //         },
  //         duration: {
  //           type: "integer",
  //           description: "Duration in minutes",
  //           default: 60,
  //         },
  //       },
  //       required: [
  //         "full_name",
  //         "phone_number",
  //         "pet_name",
  //         "pet_type",
  //         "service_type",
  //         "appointment_text_time",
  //       ],
  //       additionalProperties: false,
  //     },
  //   },
  // },
  // {
  //   type: "function",
  //   function: {
  //     name: "get_available_times",
  //     description:
  //       "Checks available time slots on a date. Include estimated duration based on service type (e.g., grooming = 60 minutes). return time that user provided in grammatically correct form and return it in English.",
  //     parameters: {
  //       type: "object",
  //       properties: {
  //         appointment_date: {
  //           type: "string",
  //           description:
  //             "User's appointment time phrase exactly as they stated but in English and only English (e.g., 'tomorrow at noon', 'next Tuesday 3PM'), make shure it is grammatically correct",
  //         },
  //         duration: {
  //           type: "integer",
  //           description:
  //             "Duration of service in minutes. Should be estimated based on service type.",
  //         },
  //       },
  //       required: ["appointment_date", "duration"],
  //       additionalProperties: false,
  //     },
  //   },
  // },
];
