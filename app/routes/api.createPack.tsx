import { ActionFunction, json } from "@remix-run/node";
import { sleep } from "openai/core.mjs";
import {
  addCardsToPack,
  addCardsToSetting,
  createPackDoc,
} from "~/.server/draftActions";
import { createImage } from "~/.server/imageActions";
import { getLobbySetting } from "~/.server/lobbyActions";
import { withAuthenticatedUser } from "~/.server/middleware/withAuthenticatedUser";
import { generatePack } from "~/.server/models/openai";
import { randomUid } from "~/util/randomUid";

//========= HANDLER =========//
export const action: ActionFunction = withAuthenticatedUser(
  async ({ request, userId }) => {
    try {
      console.debug("Generating pack...");
      const body = await request.json();
      if (!isValidBody(body))
        return json({ error: "Invalid body" }, { status: 422 });

      const { lobbyId, draftOrder, round } = body;
      const setting = await getLobbySetting(lobbyId);
      const packData = await generatePack(setting);
      if (!packData) throw new Error("Pack generation failed");
      const packId = await createPackDoc(lobbyId, draftOrder, round);

      // create card art
      const cardPromises = [];
      for (const card of packData.cards) {
        cardPromises.push(createImage(card.art_direction, randomUid()));
        await sleep(200); // avoid rate limiting
      }
      const cardImages = await Promise.all(cardPromises);

      // add card images to cards
      packData.cards.forEach((card, index) => {
        card.image_url = cardImages[index];
      });

      // commit the pack to the database
      await addCardsToPack(packId, lobbyId, packData.cards);
      await addCardsToSetting(setting.id, lobbyId, packData.cards);

      if (!packData) throw new Error("Pack generation failed");
      return json({ userId }, { status: 200 });
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

//========= VALIDATION =========//
type Body = {
  lobbyId: string;
  draftOrder: string[];
  round: number;
};
const isValidBody = (body: unknown): body is Body => {
  console.log(body);
  return (
    typeof body === "object" &&
    body !== null &&
    "lobbyId" in body &&
    "draftOrder" in body &&
    "round" in body
  );
};

//========= UTIL =========//
