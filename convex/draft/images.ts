import { failureMessage, parseRetryAfter } from "./retry";

const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com";
const MODEL = "gpt-image-2.5-flare";
const SIZE = "1008x656";
const RATE_LIMITED = 429;
const SERVER_ERROR = 500;
const MAX_TRIES = 6;
const DEFAULT_WAIT_MS = 10_000;
const MAX_WAIT_MS = 30_000;
const REPLY_TIMEOUT_MS = 90_000;

const decodeBase64 = (encoded: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const pause = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isWorthRetrying = (status: number) =>
  status === RATE_LIMITED || status >= SERVER_ERROR;

const request = (prompt: string, timeoutMs: number) =>
  fetch(`${BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      size: SIZE,
      quality: "low",
      output_format: "jpeg",
      output_compression: 85,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

const toImage = async (response: Response): Promise<Blob> => {
  const { data } = await response.json();
  const encoded = data?.[0]?.b64_json;
  if (typeof encoded !== "string") throw new Error("the reply had no image");
  return new Blob([decodeBase64(encoded)], { type: "image/jpeg" });
};

const giveUp = (reason: string): null => {
  console.warn(`Card art was skipped: ${reason}`);
  return null;
};

export const paintCard = async (
  prompt: string,
  deadline: number
): Promise<Blob | null> => {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const timeLeft = deadline - Date.now();
    if (timeLeft <= 0) return giveUp("the pack ran out of time");
    let wait = DEFAULT_WAIT_MS;
    try {
      const response = await request(prompt, Math.min(REPLY_TIMEOUT_MS, timeLeft));
      if (response.ok) return await toImage(response);
      if (!isWorthRetrying(response.status)) {
        return giveUp(`OpenAI responded ${response.status}`);
      }
      console.warn(`Card art attempt ${attempt} got ${response.status}`);
      wait = parseRetryAfter(response.headers.get("retry-after")) ?? wait;
    } catch (error) {
      console.warn(`Card art attempt ${attempt} failed: ${failureMessage(error)}`);
    }
    wait = Math.min(wait, MAX_WAIT_MS);
    if (Date.now() + wait > deadline) return giveUp("the pack ran out of time");
    await pause(wait);
  }
  return giveUp("every attempt failed");
};
