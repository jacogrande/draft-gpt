import { CardColor } from "~/util/types";

const INDICATORS: Record<string, CardColor> = {
  r: "red",
  w: "white",
  u: "blue",
  b: "black",
  g: "green",
};

export const getCardColor = (manaCost: string): CardColor => {
  const allChars = manaCost.toLowerCase().split("");
  const colors = new Set<CardColor>(
    allChars
      .filter((char) => char in INDICATORS)
      .map((char) => INDICATORS[char])
  ); // get color indicators and remove duplicates
  if (colors.size === 0) return "colorless";
  if (colors.size > 1) return "multi";
  return Array.from(colors)[0];
};
