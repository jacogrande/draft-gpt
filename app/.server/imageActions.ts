import { storage } from "~/.server/firebase-admin";
import { IMAGE_ADDITIVES } from "~/.server/prompts/imageAdditives";
import { DEFAULT_IMAGE_EXTENSION } from "~/util/constants";
import { getRandomElement } from "~/util/getRandomElement";

type Base64String = string;

/**
 * Generates a card image using the Getimg API
 * @param artDirection - the art direction for the card (will be used as the prompt)
 * @param cardId - the id of the card to generate the image for
 * @returns the public url of the generated image
 * @description this will save the generated image to Firebase Storage and return the public url
 */
export const createImage = async (
  artDirection: string,
  cardId: string
): Promise<string | null> => {
  console.log("generating image");
  const URL = "https://api.getimg.ai/v1/flux-schnell/text-to-image";
  const API_KEY = process.env.GETIMG_API_KEY;
  const randomAdd = getRandomElement(IMAGE_ADDITIVES);
  const body = {
    prompt: `${artDirection} ${randomAdd}`,
    width: 400,
    height: 264,
    output_format: DEFAULT_IMAGE_EXTENSION,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accpet: "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  };
  const response = await fetch(URL, options);
  if (!response.ok) {
    console.error(response.status);
    console.error("Image generation failed");
    console.log(await response.text());
    return null;
  }
  const json = await response.json();
  const base64String = json.image;
  const publicUrl = await uploadImage(base64String, cardId);
  return publicUrl;
};

const uploadImage = async (image: Base64String, cardId: string) => {
  const buffer = Buffer.from(image, "base64");
  const bucket = storage.bucket();
  const file = bucket.file(`images/${cardId}.${DEFAULT_IMAGE_EXTENSION}`);

  // Upload the buffer to Firebase Storage with the appropriate metadata
  await file.save(buffer, {
    metadata: {
      contentType: `image/${DEFAULT_IMAGE_EXTENSION}`,
    },
    public: true,
    validation: "md5", // Optional: ensures data integrity
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/${cardId}.${DEFAULT_IMAGE_EXTENSION}`;
  return publicUrl;
};
