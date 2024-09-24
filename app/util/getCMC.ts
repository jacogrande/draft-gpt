export const getCMC = (manaCost: string): number => {
  const manaCostArray = manaCost.split("");
  let cmc = 0;
  for (const char of manaCostArray) {
    // special cases
    if (char === "X") {
      continue; // treat X as 0
    }
    // add non-numerical values to the cmc
    if (isNaN(Number(char))) {
      cmc += 1;
    }
    // add the numerical value of the mana cost
    else {
      cmc += Number(char);
    }
  }

  return cmc;
};
