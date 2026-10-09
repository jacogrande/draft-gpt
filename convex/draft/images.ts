import { IMAGE_ADDITIVES } from "./prompts/imageAdditives";

const BASE_URL = process.env.GETIMG_BASE_URL ?? "https://api.getimg.ai";

const decodeBase64 = (encoded: string): Uint8Array =>
  Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));

export const paintCard = async (artDirection: string): Promise<Blob | null> => {
  const style =
    IMAGE_ADDITIVES[Math.floor(Math.random() * IMAGE_ADDITIVES.length)];
  const response = await fetch(`${BASE_URL}/v1/flux-schnell/text-to-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.GETIMG_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: `${artDirection} ${style}`,
      width: 400,
      height: 264,
      output_format: "jpeg",
    }),
  });
  if (!response.ok) return null;
  const { image } = await response.json();
  return new Blob([decodeBase64(image)], { type: "image/jpeg" });
};
