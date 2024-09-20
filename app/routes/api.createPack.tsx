import { ActionFunction, json } from "@remix-run/node";
import { addCardsToPack, createPackDoc } from "~/.server/draftActions";
import { getLobbySetting } from "~/.server/lobbyActions";
import { withAuthenticatedUser } from "~/.server/middleware/withAuthenticatedUser";
import { generatePack } from "~/.server/models/openai";

//========= HANDLER =========//
export const action: ActionFunction = withAuthenticatedUser(
  async ({ request, userId }) => {
    try {
      const body = await request.json();
      if (!isValidBody(body))
        return json({ error: "Invalid body" }, { status: 422 });

      const { lobbyId, draftOrder, round } = body;
      const setting = await getLobbySetting(lobbyId);
      const packData = await generatePack(setting);
      if (!packData) throw new Error("Pack generation failed");

      // commit the pack to the database
      const packId = await createPackDoc(lobbyId, draftOrder, round);
      await addCardsToPack(packId, lobbyId, packData.cards);

      console.log("pack generation complete");
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
