import OpenAI from "openai";
import {
  PACK_FUNCTION_SCHEMA,
  PACK_SYSTEM_PROMPT,
  PACK_USER_PRMOPT,
} from "~/.server/prompts/pack";
import {
  isPackResponse,
  isSetting,
  PackResponse,
  Setting,
} from "~/.server/prompts/responseTypes";
import {
  SETTING_JSON_SCHEMA,
  SETTING_SYSTEM_PROMPT,
  SETTING_USER_PROMPT,
} from "~/.server/prompts/setting";
import { randomNumberInRange } from "~/util/randomNumberInRange";

export const generateSetData = async (
  worldbuildingMessages: string[]
): Promise<Setting | null> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  let userPrmpt = SETTING_USER_PROMPT;
  if (worldbuildingMessages.length > 0) {
    userPrmpt += `\nYou've been given these ideas from a brainstorming session:\n- ${worldbuildingMessages.join(
      "\n- "
    )}`;
  }
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: SETTING_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userPrmpt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: SETTING_JSON_SCHEMA,
    },
    temperature: randomNumberInRange(1.4, 2),
    top_p: 0.9,
    frequency_penalty: 0.2,
  });
  const response = completion.choices[0].message.content;
  if (!response) return null;
  const jsonResponse = JSON.parse(response);
  if (!isSetting(jsonResponse)) return null;
  return jsonResponse;
};

export const generatePack = async (
  setting: Setting
): Promise<PackResponse | null> => {
  console.log("generating pack");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const userPrompt = PACK_USER_PRMOPT.replace(
    "<<STRINGIFIED_JSON_DATA>>",
    JSON.stringify(setting)
  );
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: PACK_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    tools: [
      {
        type: "function",
        function: PACK_FUNCTION_SCHEMA,
      },
    ],
    temperature: randomNumberInRange(1.3, 1.8),
    top_p: 0.9,
    presence_penalty: 0.2,
    max_tokens: 16000,
  });
  // get function arguments
  const toolCalls = completion.choices[0].message.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    console.error("No tool calls found");
    return null;
  }
  const functionCall = toolCalls[0].function;
  if (!functionCall.arguments || functionCall.arguments.length === 0) {
    console.error("No function arguments found");
    return null;
  }
  console.log("pack generation complete");
  const argumentsJson = JSON.parse(functionCall.arguments);
  if (!isPackResponse(argumentsJson)) return null;
  return argumentsJson;
};
