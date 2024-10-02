import { parseManaCost } from "~/util/parseManaCost";
import { Card, Deck } from "~/util/types";

const LAND_COLORS: Record<string, string> = {
  plains: "w",
  island: "u",
  swamp: "b",
  mountain: "r",
  forest: "g",
};

export const attemptToAddMana = (amount: string, deck: Deck): Card[] | null => {
  if (!deck.battlefield) return null;

  // count occurrences of mana symbols
  const manaSymbols = parseManaCost(amount.toLowerCase());
  const manaRequirements: Record<string, number> = {};
  for (const symbol of manaSymbols) {
    manaRequirements[symbol] = (manaRequirements[symbol] || 0) + 1;
  }

  const basicLands = deck.battlefield.filter(
    (card) => !card.tapped && card.type.startsWith("Basic Land")
  );
  if (basicLands.length === 0) {
    // No available lands to tap
    return null;
  }

  // Group lands by their basic land type
  const landTypes: Record<string, Card[]> = {};
  for (const land of basicLands) {
    const landType = land.name.toLowerCase(); // e.g., "mountain"
    if (!landTypes[landType]) {
      landTypes[landType] = [];
    }
    landTypes[landType].push(land);
  }

  // Determine the color each basic land produces

  // List to store selected lands to tap
  const selectedLands: Card[] = [];

  // Step 1: Tap lands for colored mana
  for (const colorSymbol of ["w", "u", "b", "r", "g"]) {
    const required = manaRequirements[colorSymbol] || 0;
    for (let i = 0; i < required; i++) {
      // Find an untapped land that produces this color
      const landType = Object.keys(LAND_COLORS).find(
        (type) =>
          LAND_COLORS[type] === colorSymbol &&
          landTypes[type] &&
          landTypes[type].length > 0
      );
      if (landType) {
        // Tap the land
        const land = landTypes[landType].pop()!;
        selectedLands.push(land);
      } else {
        // Not enough lands to produce the required colored mana
        return null;
      }
    }
  }

  // Step 2: Tap lands for colorless mana
  const colorlessSymbols = Object.keys(manaRequirements).filter((symbol) =>
    /\d+/.test(symbol)
  );
  for (const symbol of colorlessSymbols) {
    const requiredColorlessMana = parseInt(symbol, 10);
    let remainingMana = requiredColorlessMana;

    // Get the land types sorted by abundancy, excluding already tapped lands
    const landTypeCounts = Object.keys(landTypes)
      .map((type) => ({
        type,
        count: landTypes[type].length,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);

    let landTypeIndex = 0;
    while (remainingMana > 0 && landTypeIndex < landTypeCounts.length) {
      const { type, count } = landTypeCounts[landTypeIndex];
      const landsToTap = Math.min(remainingMana, count);

      for (let i = 0; i < landsToTap; i++) {
        const land = landTypes[type].pop()!;
        selectedLands.push(land);
        remainingMana--;
      }
      landTypeIndex++;
    }

    if (remainingMana > 0) {
      // Not enough lands to produce the required colorless mana
      return null;
    }
  }

  // Return the list of selected lands to tap
  return selectedLands;
};
