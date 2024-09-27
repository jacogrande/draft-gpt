import { SYMBOL_MAP } from "~/util/constants";
import { createBasicLand } from "~/util/createBasicLand";
import { Card } from "~/util/types";

const TOTAL_LANDS = 17; // this is the default amount of lands

export const calculateManaBase = (cards: Card[]) => {
  const existingLands = cards.filter(
    (card) => card.type === "Land" || card.type === "Basic Land"
  ).length;
  const missingLands = TOTAL_LANDS - existingLands;
  if (missingLands <= 0) return cards;
  const symbolOccurrences = countSymbolOccurrences(cards);
  const totalManaCost = Object.values(symbolOccurrences).reduce(
    (a, b) => a + b,
    0
  );
  const lands = [];
  for (const symbol of Object.keys(symbolOccurrences)) {
    const manaCount = symbolOccurrences[symbol];
    const newLands = createColorCards(
      totalManaCost,
      manaCount,
      symbol.toLowerCase(),
      missingLands
    );
    lands.push(...newLands);
  }
  const allLands = addRemainingLands(lands, symbolOccurrences, missingLands);
  return allLands;
};

const countSymbolOccurrences = (cards: Card[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    const manaCost = card.mana_cost;
    for (const char of manaCost) {
      // skip numbers
      if (char.match(/^\d$/) || char === "X") continue;
      if (char in counts) {
        counts[char] += 1;
      } else {
        counts[char] = 1;
      }
    }
  }
  return counts;
};

const createColorCards = (
  totalManaCount: number,
  manaCount: number,
  symbol: string,
  totalLandsRequired: number
): Card[] => {
  const landType = SYMBOL_MAP[symbol];
  const newLandsRequired = Math.floor(
    (totalLandsRequired * manaCount) / totalManaCount
  );
  // create an array of card objects
  const newCards = new Array(Math.max(newLandsRequired, 1))
    .fill(null)
    .map(() => createBasicLand(landType));
  return newCards;
};

const addRemainingLands = (
  lands: Card[],
  symbolOccurrences: Record<string, number>,
  totalLandsRequired: number
): Card[] => {
  const newLands = [];
  const missingLands = totalLandsRequired - lands.length;
  // sort the symbol occurrences in ascending order
  const orderedSymbols = Object.keys(symbolOccurrences).sort((a, b) => {
    return symbolOccurrences[a] - symbolOccurrences[b];
  });

  for (let i = 0; i < missingLands; i++) {
    const symbol = orderedSymbols[i % orderedSymbols.length];
    const type = SYMBOL_MAP[symbol.toLowerCase()];
    const newLand = createBasicLand(type);
    newLands.push(newLand);
    symbolOccurrences[symbol] -= 1;
  }
  return lands.concat(newLands);
};
