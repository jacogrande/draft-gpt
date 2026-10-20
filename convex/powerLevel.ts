import { v } from "convex/values";

export const powerLevel = v.union(v.literal("default"), v.literal("busted"));
export type PowerLevel = "default" | "busted";
export const powerLevelOf = (value?: PowerLevel): PowerLevel => value ?? "default";
export const POWER_LEVELS = {
  default: { label: "Default", description: "Modern Horizons strength. Efficient cards, strong synergy, and powerful answers." },
  busted: { label: "Busted", description: "Powered Vintage Cube strength. Fast mana, free spells, and explosive combos." },
};
