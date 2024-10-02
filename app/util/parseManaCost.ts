type ManaSymbol = string;

/**
 * Helper function to parse the mana cost into symbols
 * @param manaCost - the mana cost to parse
 * @returns an array of mana symbols
 */
export const parseManaCost = (manaCost: string): ManaSymbol[] => {
  const symbols: ManaSymbol[] = [];
  let i = 0;
  while (i < manaCost.length) {
    const char = manaCost[i];
    if (/\d/.test(char)) {
      // Handle multi-digit numbers
      let numStr = "";
      while (/\d/.test(manaCost[i])) {
        numStr += manaCost[i];
        i++;
      }
      symbols.push(numStr);
    } else {
      symbols.push(char);
      i++;
    }
  }
  return symbols;
};
