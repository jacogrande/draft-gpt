import { setDoc } from "firebase/firestore";
import { getGameAndDeck } from "~/model/game/deck";
import { logInteraction } from "~/model/loggers";
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
  logInteraction(`moved ${card.name} to ${targetZone}`)(gameId, userId);
  return true;
};

/**
 * Moves multiple cards from their current zones to a target zone
 * @param gameId - The ID of the current game
 * @param userId - The ID of the user moving cards
 * @param cards - An array of cards to move
 * @param targetZone - The zone to move the cards to
 * @note Cards can come from different zones
 * @returns A promise that resolves to true if the operation is successful
 */
export const moveManyCardsToZone = async (
  gameId: string,
  userId: string,
  cards: Card[],
  targetZone: CardZone
): Promise<boolean> => {
  const { gameRef, deck } = await getGameAndDeck(gameId, userId);
  const updatedDeck = { ...deck };
  const targetZoneField = ZONE_MAP[targetZone];
  updatedDeck[targetZoneField] = updatedDeck[targetZoneField] || [];
  for (const card of cards) {
    // Validate the card's zone
    const originZoneField = ZONE_MAP[card.zone || "deck"];
    if (!originZoneField || !updatedDeck[originZoneField]) {
      console.warn(`Card ${card.id} is in an invalid origin zone: ${card.zone}`);
      continue; // Skip to the next card
    }

    const cardIndex = updatedDeck[originZoneField].findIndex(
      (foundCard: Card) => foundCard.id === card.id
    );
    if (cardIndex === -1) {
      console.warn(`Card ${card.id} not found in zone ${originZoneField}`);
      continue; // Skip to the next card
    }

    // move the card to the target zone
    const [movedCard] = updatedDeck[originZoneField].splice(cardIndex, 1);
    movedCard.zone = targetZone;
    if (targetZoneField === "deck") {
      // Place the card on top of the deck
      updatedDeck[targetZoneField].unshift(movedCard);
    } else {
      updatedDeck[targetZoneField].push(movedCard);
    }
  }

  await setDoc(
    gameRef,
    {
      decks: {
        [userId]: updatedDeck,
      },
    },
    { merge: true }
  );

  return true;
};
