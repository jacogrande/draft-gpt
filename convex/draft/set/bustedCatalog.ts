import pool from "./catalog/busted.json";
import { PowerReference } from "./referenceTypes";
import { Color, Rarity, Slot } from "./types";

export const BUSTED_POOL = pool;
const TYPES: Slot["type"][] = ["Creature", "Land", "Artifact", "Enchantment", "Instant", "Sorcery"];
const roles = (text: string, type: Slot["type"], value: number) => [
  type === "Creature" ? (value <= 2 ? "early attacker cheap enabler" : "threat finisher") : "",
  type === "Land" ? "land fixing mana source" : "",
  /add .*mana|add \{|additional land|land card.*battlefield/i.test(text) ? "ramp acceleration" : "",
  /destroy|exile target|deals? .*damage|counter target|gets? -/i.test(text) ? "removal interaction answer" : "",
  /draw|scry|surveil|look at the top/i.test(text) ? "draw selection card advantage" : "",
  /search your library/i.test(text) ? "tutor selection" : "",
  /graveyard|flashback|escape/i.test(text) ? "graveyard recursion reanimation" : "",
  /token/i.test(text) ? "token multiple bodies fodder" : "",
  /sacrifice|dies/i.test(text) ? "sacrifice death" : "",
  /equip/i.test(text) ? "equipment combat bonus" : "",
  /\+1\/\+1 counter/i.test(text) ? "counters growth" : "",
  /whenever|at the beginning/i.test(text) ? "engine payoff" : "",
  /flying|can't be blocked|cannot be blocked/i.test(text) ? "evasion" : "",
].filter(Boolean).join("; ");

export const BUSTED_CATALOG: PowerReference[] = pool.cards.flatMap((card) => {
  const type = TYPES.find((type) => card.type_line.split(" — ")[0].split(" ").includes(type));
  if (!type || card.layout !== "normal" || !card.oracle_text) return [];
  return [{
    id: `busted:${card.oracle_id}`,
    name: card.name,
    rarity: card.rarity as Rarity,
    type,
    typeLine: card.type_line,
    power: card.power,
    toughness: card.toughness,
    band: "target",
    mana: card.mana_cost ?? "",
    value: card.cmc,
    colors: card.color_identity as Color[],
    role: roles(`${card.type_line}\n${card.oracle_text}`, type, card.cmc),
    effect: card.oracle_text,
    rationale: `High-power pool evidence: ${card.sources.join(", ")}. Compare its actual role; inclusion does not mean equal standalone strength.`,
    context: "Printed rules include costs and restrictions. Evaluate setup, alternate costs, color commitment and available support. Source rarity is not a generated-power ceiling.",
    scope: "Busted only. Powered-cube/constructed comparison; create an original design inside the assigned slot.",
    source: card.scryfall_uri,
  }];
});
