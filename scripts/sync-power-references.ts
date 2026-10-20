import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { PowerReference } from "../convex/draft/set/referenceTypes";

const source = JSON.parse(
  await readFile(
    resolve("docs/research/limited-set-design/power-references/cards.json"),
    "utf8"
  )
);
const directory = resolve("convex/draft/set/catalog");
await mkdir(directory, { recursive: true });
for (const rarity of ["common", "uncommon", "rare", "mythic"]) {
  const cards: PowerReference[] = [...source.entries, ...source.supplemental]
    .filter((c) => c.rarity === rarity)
    .map((c) => {
      if (
        c.rarity !== c.printing.rarity ||
        !c.card_facts.type_line.includes(c.category)
      )
        throw new Error(`Invalid reference printing: ${c.id}`);
      return {
        id: c.id,
        name: c.name,
        rarity: c.rarity,
        type: c.category,
        typeLine: c.card_facts.type_line,
        power: c.card_facts.power ?? null,
        toughness: c.card_facts.toughness ?? null,
        band: c.band === "supplemental_target" ? "target" : c.band,
        mana: c.card_facts.mana_cost,
        value: c.card_facts.cmc,
        colors: c.card_facts.color_identity,
        role: c.role,
        effect: c.effect_summary,
        rationale: c.rationale,
        context: c.context_and_costs,
        scope: c.comparison_scope,
        source: c.sources.card_page,
      };
    });
  const content = `import { PowerReference } from "../referenceTypes";\n\nexport const ${rarity}: PowerReference[] = [\n${cards
    .map((c) => `  ${JSON.stringify(c)},`)
    .join("\n")}\n];\n`;
  const path = `${directory}/${rarity}.ts`;
  if (process.argv.includes("--check")) {
    if ((await readFile(path, "utf8")) !== content)
      throw new Error(`Stale catalog: ${path}`);
  } else await writeFile(path, content);
}
console.log(
  process.argv.includes("--check")
    ? "Reference catalog matches research."
    : "Reference catalog synchronized."
);
