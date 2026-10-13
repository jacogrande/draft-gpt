import { manaSymbols } from "../mana";
import { DeckCard } from "./tables";
import { BasicLand, MAX_DECK_SIZE } from "./zones";

export const TARGET_LANDS = 17;
const COLORS = ["W", "U", "B", "R", "G"] as const;
const LANDS: BasicLand[] = ["plains", "island", "swamp", "mountain", "forest"];
export const isLand = (card: Pick<DeckCard, "type">) =>
  /\bland\b/i.test(card.type);

export const planBasics = (cards: DeckCard[]) => {
  const lands = cards.filter(isLand);
  const missing = Math.max(
    0,
    Math.min(TARGET_LANDS - lands.length, MAX_DECK_SIZE - cards.length)
  );
  const weights = COLORS.map((color) =>
    cards
      .filter((card) => !isLand(card))
      .reduce(
        (sum, card) =>
          sum +
          manaSymbols(card.mana_cost).reduce((count, symbol) => {
            const colors = symbol
              .split("/")
              .filter((part) => COLORS.some((candidate) => candidate === part));
            return count + (colors.includes(color) ? 1 / colors.length : 0);
          }, 0),
        0
      )
  );
  const total = weights.reduce((sum, value) => sum + value, 0);
  const added: BasicLand[] = [];
  if (!missing) return { lands: added, reason: "enough" as const };
  if (!total) return { lands: added, reason: "no-colors" as const };
  const existing = LANDS.map(
    (type) =>
      lands.filter(
        (card) =>
          card.type === "Basic Land" && card.subtype.toLowerCase() === type
      ).length
  );
  const desiredSources =
    existing.reduce((sum, count) => sum + count, 0) + missing;
  for (let index = 0; index < missing; index++) {
    let best = -1;
    let deficit = -Infinity;
    for (let color = 0; color < COLORS.length; color++) {
      if (!weights[color]) continue;
      const need = (weights[color] / total) * desiredSources - existing[color];
      if (need > deficit) {
        best = color;
        deficit = need;
      }
    }
    added.push(LANDS[best]);
    existing[best]++;
  }
  return { lands: added, reason: "added" as const };
};
