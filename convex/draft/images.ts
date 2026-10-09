const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com";
const MODEL = "gpt-image-2.5-flare";
const SIZE = "1008x656";
const RATE_LIMITED = 429;
const SERVER_ERROR = 500;
const MAX_TRIES = 6;
const DEFAULT_WAIT_SECONDS = 10;

const decodeBase64 = (encoded: string): Uint8Array =>
  Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));

const pause = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const isWorthRetrying = (status: number) =>
  status === RATE_LIMITED || status >= SERVER_ERROR;

const request = (prompt: string) =>
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
  });

export const paintCard = async (prompt: string): Promise<Blob | null> => {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const response = await request(prompt);
    if (response.ok) {
      const { data } = await response.json();
      return new Blob([decodeBase64(data[0].b64_json)], { type: "image/jpeg" });
    }
    if (!isWorthRetrying(response.status)) {
      console.warn(`Card art request failed with ${response.status}`);
      return null;
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await pause(retryAfter || DEFAULT_WAIT_SECONDS);
  }
  console.warn("Card art request failed on every attempt");
  return null;
};
