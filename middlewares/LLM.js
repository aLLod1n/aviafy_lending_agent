import OpenAI from "openai";
import dotenv from "dotenv";
import { tools } from "../utils/openaiTools.js";

dotenv.config();

const openai_api_key = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openai_api_key,
});

export async function createChatWithTools(
  messagesFromDb,
  system_instructions,
  tool_choice
) {
  const systemMessage = {
    role: "system",
    content: system_instructions,
  };

  const messages = [systemMessage, ...messagesFromDb];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.28,
      max_completion_tokens: 204,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      tools,
      tool_choice: tool_choice || "auto",
      parallel_tool_calls: true,
      response_format: {
        type: "text",
      },
    });

    const message = response.choices[0].message;

    // ✅ If GPT wants to call a tool
    if (message.tool_calls?.length) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      const toolName = toolCall.function.name;

      // 🔁 Return tool call & args
      return {
        tool_call: toolName,
        data: args,
        assistant_message: null,
      };
    }

    // ✅ GPT gave a plain text message
    return {
      tool_call: null,
      data: null,
      assistant_message: {
        text: message.content || "",
        sender: "assistant",
      },
    };
  } catch (error) {
    console.error("❌ Error in OpenAI call:", error.message);
    return {
      tool_call: null,
      data: null,
      assistant_message: {
        text: "Oops! Something went wrong.",
        sender: "assistant",
      },
    };
  }
}

// export async function createTextChat(messages) {
//   const openai = new OpenAI({
//     apiKey: openai_api_key,
//   });
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [messages],
//     temperature: 1,
//     max_tokens: 2048,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//     response_format: {
//       type: "text",
//     },
//   });
//   const assistant_message = response.choices[0].message.content;
//   return assistant_message;
// }

export async function imageInputLLM(openai_api_key, url) {
  const openai = new OpenAI({
    apiKey: openai_api_key,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "აღწერე სურათი, ტურის მდებარეობა, ფასი, დრო და რამდენ ადამიანზეა გათვლილი",
          },
          {
            type: "image_url",
            image_url: {
              url,
            },
          },
        ],
      },
    ],
  });

  console.log(response.choices[0].message, "response");

  const image_descr = response.choices[0].message.content;
  return image_descr;
}
