import {
  PACK_FUNCTION_SCHEMA,
  PACK_SYSTEM_PROMPT,
  PACK_USER_PRMOPT,
} from "./prompts/pack";
import {
  SETTING_JSON_SCHEMA,
  SETTING_SYSTEM_PROMPT,
  SETTING_USER_PROMPT,
} from "./prompts/setting";
import { Setting } from "./tables";

const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com";
const MODEL = "gpt-4o";

const between = (min: number, max: number) =>
  min + Math.random() * (max - min);

const complete = async (body: Record<string, unknown>) => {
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, top_p: 0.9, ...body }),
  });
  if (!response.ok) throw new Error(`OpenAI responded ${response.status}`);
  const completion = await response.json();
  return completion.choices[0].message;
};

const settingPrompt = (ideas: string[]) =>
  ideas.length === 0
    ? SETTING_USER_PROMPT
    : `${SETTING_USER_PROMPT}\nYou've been given these ideas from a brainstorming session:\n- ${ideas.join("\n- ")}`;

export const requestSetting = async (ideas: string[]): Promise<unknown> => {
  const message = await complete({
    messages: [
      { role: "system", content: SETTING_SYSTEM_PROMPT },
      { role: "user", content: settingPrompt(ideas) },
    ],
    response_format: { type: "json_schema", json_schema: SETTING_JSON_SCHEMA },
    temperature: between(1.4, 2),
    frequency_penalty: 0.2,
  });
  return JSON.parse(message.content);
};

export const requestPack = async (setting: Setting): Promise<unknown> => {
  const message = await complete({
    messages: [
      { role: "system", content: PACK_SYSTEM_PROMPT },
      {
        role: "user",
        content: PACK_USER_PRMOPT.replace(
          "<<STRINGIFIED_JSON_DATA>>",
          JSON.stringify(setting)
        ),
      },
    ],
    tools: [{ type: "function", function: PACK_FUNCTION_SCHEMA }],
    temperature: between(1.3, 1.8),
    presence_penalty: 0.2,
    max_tokens: 16000,
  });
  return JSON.parse(message.tool_calls[0].function.arguments);
};
