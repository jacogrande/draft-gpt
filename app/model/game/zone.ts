import { setDoc } from "firebase/firestore";
import { getGameAndDeck } from "~/model/game/deck";
import { ZONE_MAP } from "~/util/constants";
import { Card, CardZone } from "~/util/types";

/**
 * Moves a card from one zone to another
 * @param gameId - the id of the game to move the card from
 * @param userId - the id of the user to move the card from
 * @param card - the card to move
 * @param originZone - the zone the card is currently in
 * @param targetZone - the zone to move the card to
 */
export const moveCardToZone = async (
  gameId: string,
  userId: string,
  card: Card,
  originZone: CardZone,
  targetZone: CardZone
) => {
  const { gameRef, deck } = await getGameAndDeck(gameId, userId);
  const originZoneField = ZONE_MAP[originZone];
  const targetZoneField = ZONE_MAP[targetZone];
  const cardIndex = deck[originZoneField].findIndex(
    (foundCard: Card) => foundCard.id === card.id
  );
  const shiftedCard = deck[originZoneField].splice(cardIndex, 1)[0];
  shiftedCard.zone = targetZone;
  deck[targetZoneField] = deck[targetZoneField] || [];
  // always put the card at the top of the deck
  if (targetZoneField === "deck") {
    deck[targetZoneField].unshift(shiftedCard);
  } else {
    deck[targetZoneField].push(shiftedCard);
  }
  await setDoc(
    gameRef,
    {
      decks: {
        [userId]: {
          ...deck,
        },
      },
    },
    { merge: true }
  );
  return true;
};

