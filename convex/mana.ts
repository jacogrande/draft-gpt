export const manaSymbols = (cost: string): string[] =>
  Array.from(cost.toUpperCase().matchAll(/\{([^}]+)\}|\d+|[A-Z]/g), (match) =>
    (match[1] ?? match[0]).trim()
  );

export const manaValue = (cost: string): number =>
  manaSymbols(cost).reduce((total, symbol) => {
    if (/^\d+$/.test(symbol)) return total + Number(symbol);
    if (/^[XYZ]$/.test(symbol)) return total;
    const parts = symbol.split("/");
    const generic = parts.find((part) => /^\d+$/.test(part));
    return total + (generic ? Number(generic) : 1);
  }, 0);
