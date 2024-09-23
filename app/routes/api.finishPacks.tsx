import { ActionFunction, json } from "@remix-run/node";
import {
  addCardsToPack,
  getAllPacksInLobby,
  getAllSettingCards,
} from "~/.server/draftActions";
import { withAuthenticatedUser } from "~/.server/middleware/withAuthenticatedUser";
import { getLobby } from "~/model/lobby";
import { getRandomElement } from "~/util/getRandomElement";

//========= HANDLER =========//
export const action: ActionFunction = withAuthenticatedUser(
  async ({ request }) => {
    try {
      const body = await request.json();
      if (!isValidBody(body)) {
        return json({ error: "Invalid body" }, { status: 422 });
      }
      const { lobbyId } = body;
      await addRemainingCardsToPacks(lobbyId);
      return json({}, { status: 200 });
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

//========= VALIDATION =========//
type Body = {
  lobbyId: string;
};
const isValidBody = (body: unknown): body is Body => {
  console.log(body);
  return typeof body === "object" && body !== null && "lobbyId" in body;
};

//========= UTIL =========//

/**
 * Ensures that each pack has at least 15 cards
 * @param lobbyId - the id of the lobby to add the cards typeof
 * @description this will take random cards from the setting and add them to the packs until all packs have at least 15 cards
 */
const addRemainingCardsToPacks = async (lobbyId: string) => {
  const lobby = await getLobby(lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (!lobby.setting) throw new Error("Lobby has no setting");
  const allCards = await getAllSettingCards(lobby.setting);
  const allPacks = await getAllPacksInLobby(lobbyId);
  const REQUIRED_CARD_COUNT = 15;
  for (const pack of allPacks) {
    const remainingCards = REQUIRED_CARD_COUNT - pack.cardCount;
    if (remainingCards <= 0) continue;
    const newCards = new Array(remainingCards)
      .fill(null)
      .map(() => getRandomElement(allCards));
    await addCardsToPack(pack.id, lobbyId, newCards);
  }
};
