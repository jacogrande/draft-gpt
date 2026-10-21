import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { collate } from "../../convex/draft/set/collation";
import { COLORS, Design, PAIRS, Slot } from "../../convex/draft/set/types";

const out = resolve(process.argv[2] ?? ".artifacts/release-eval-v10");
const { results } = JSON.parse(await readFile(join(out, "results.json"), "utf8")) as {
  results: { trial: { id: string; total: number }; structurallyComplete: boolean; ready: boolean; designs: Design[]; slots: Slot[] }[] };
const range = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  return { min: s[0], p05: s[Math.floor(s.length * .05)], median: s[Math.floor(s.length * .5)],
    p95: s[Math.floor(s.length * .95)], max: s.at(-1), zeroFraction: s.filter(value => value === 0).length / s.length, mean: s.reduce((a, b) => a + b, 0) / s.length };
};
const output = results.filter(r => r.designs.length === r.trial.total && new Set(r.designs.map(d => d.slotId)).size === r.trial.total).flatMap(result =>
  (result.trial.total === 135 ? [2, 4] : [8]).map(players => {
    const byId = new Map(result.designs.map(d => [d.slotId, d]));
    const slots = new Map(result.slots.map(s => [s.id, s]));
    const counts: Record<string, number[]> = {};
    const record = (key: string, value: number) => { (counts[key] ??= []).push(value); };
    let packsChecked = 0, mythics = 0, packsWithRepeatedNames = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      const packs = collate(result.designs, players * 3, seed);
      const ids = packs.flat();
      const dealt = ids.map(id => byId.get(id)!);
      for (const pack of packs) {
        packsChecked++;
        if (pack.length !== 15 || new Set(pack).size !== 15) throw new Error("Pack count/duplicates");
        const cards = pack.map(id => byId.get(id)!);
        if (new Set(cards.map(c => c.face.name.toLowerCase())).size !== cards.length) packsWithRepeatedNames++;
        const count = (rarity: string) => cards.filter(c => c.face.rarity === rarity).length;
        if (count("common") !== 10 || count("uncommon") !== 4 || count("rare") + count("mythic") !== 1)
          throw new Error("Rarity distribution");
        mythics += count("mythic");
        for (const color of COLORS) if (!cards.some(c => c.face.rarity === "common"
          && COLORS.filter(x => c.face.mana_cost.includes(`{${x}}`)).join("") === color)) throw new Error("Color guarantee");
      }
      record("uniqueDesigns", new Set(ids).size);
      record("repeatedCopies", ids.length - new Set(ids).size);
      record("fixingLands", dealt.filter(d => d.face.type === "Land").length);
      record("removalTextMatches", dealt.filter(d => /(?:destroy|exile) target (?:creature|nonland|permanent)|deals \d+ damage to (?:any target|target creature)/i.test(d.face.rules_text)).length);
      const spells = dealt.filter(d => d.face.type !== "Land");
      record("meanSpellManaValue", spells.reduce((sum, d) => sum + [...d.face.mana_cost.matchAll(/\{(\d+|[WUBRG])\}/g)]
        .reduce((n, m) => n + (/^\d+$/.test(m[1]) ? Number(m[1]) : 1), 0), 0) / spells.length);
      for (const pair of PAIRS) {
        const support = ids.map(id => slots.get(id)!).filter(s => s.archetypes.includes(pair));
        record(`${pair}:assignedSupportCopies`, support.length);
        record(`${pair}:commonSupportCopies`, support.filter(s => s.rarity === "common").length);
        record(`${pair}:fixingCopies`, support.filter(s => s.type === "Land").length);
        record(`${pair}:enablerRoleMatches`, support.filter(s => /enabl|fuel|setup|set.up/i.test(s.role)).length);
        record(`${pair}:payoffRoleMatches`, support.filter(s => /payoff|finish|win.condition/i.test(s.role)).length);
      }
    }
    return { id: result.trial.id, ready: result.ready, structurallyComplete: result.structurallyComplete, players, seeds: 1000, packsChecked, packsWithRepeatedNames,
      mythicFraction: mythics / packsChecked, metrics: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, range(v)])) };
  }));
await writeFile(join(out, "distribution.json"), JSON.stringify({ results: output,
  limitation: "Pod-wide exposure across three rounds, not individual picks or drafted decks. Replacement between packs is intentional. Pair coverage uses frozen slot assignments; enabler/payoff/removal text matches are inspectable proxies, not proof of synergy or playability. Rejected and interrupted complete inventories are diagnostic inputs only. Distinct slot IDs do not guarantee distinct names; packsWithRepeatedNames records that defect separately." }, null, 2));
console.log(JSON.stringify(output.map(({ id, players, packsChecked, mythicFraction, metrics }) =>
  ({ id, players, packsChecked, mythicFraction, unique: metrics.uniqueDesigns, copies: metrics.repeatedCopies, fixing: metrics.fixingLands })), null, 2));
