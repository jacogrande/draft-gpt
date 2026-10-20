import { expect, test } from "vitest";
import { BUSTED_CATALOG, BUSTED_POOL } from "./bustedCatalog";
import { referenceContext } from "./referenceSelection";
import { skeleton } from "./slots";
import { taskInstructions, taskPrompt } from "./prompts";

const powerNine = ["Black Lotus", "Ancestral Recall", "Time Walk", "Timetwister",
  "Mox Pearl", "Mox Sapphire", "Mox Jet", "Mox Ruby", "Mox Emerald"];

test("the Busted pool has 1,000 distinct sourced identities and all nine verified Alpha printings", () => {
  expect(BUSTED_POOL.cards).toHaveLength(1000);
  expect(new Set(BUSTED_POOL.cards.map((c) => c.oracle_id)).size).toBe(1000);
  expect(new Set(BUSTED_POOL.cards.map((c) => c.name)).size).toBe(1000);
  expect(BUSTED_POOL.cards.filter((c) => c.sources.includes("power-nine"))).toHaveLength(9);
  for (const name of powerNine) {
    const card = BUSTED_POOL.cards.find((c) => c.name === name)!;
    expect(card).toMatchObject({ set: "lea", rarity: "rare", digital: false });
    expect(BUSTED_CATALOG.some((c) => c.name === name)).toBe(true);
  }
  const sourceIds = BUSTED_POOL.sources.map((s) => s.id).concat("power-nine");
  for (const card of BUSTED_POOL.cards) {
    expect(card.sources.length).toBeGreaterThan(0);
    expect(card.sources.every((s) => sourceIds.includes(s))).toBe(true);
    expect(card.scryfall_uri).toMatch(/^https:\/\/scryfall.com\/card\//);
  }
});

test("Busted retrieval covers every slot within its bound and never imports Default verdicts", () => {
  for (const total of [15, 135, 270]) {
    const slots = skeleton(total, "busted");
    const context = referenceContext(slots, "busted", 123);
    expect(context.cards.length).toBeLessThanOrEqual(48);
    for (const slot of context.slots) {
      expect(slot.comparisons.length).toBeGreaterThan(0);
      for (const comparison of slot.comparisons) {
        const reference = context.cards.find((c) => c.id === comparison.referenceId)!;
        expect(reference.band).toBe("target");
        expect(reference.id).toMatch(/^busted:/);
        expect(reference.type).toBe(slots.find((s) => s.id === slot.slotId)?.type);
      }
    }
  }
  const slots = skeleton(135, "busted").slice(0, 15);
  expect(referenceContext(slots, "busted", 123)).toEqual(referenceContext(slots, "busted", 123));
  expect(referenceContext(slots, "busted", 123).cards.map((c) => c.id))
    .not.toEqual(referenceContext(slots, "busted", 456).cards.map((c) => c.id));
});

test("the selected target reaches the brief, writing, screening and review without changing Default references", () => {
  for (const stage of ["brief", "slots", "generate", "screen", "review", "editPlan", "revise", "final"] as const) {
    const task = { stage, ideas: [], total: 135, powerLevel: "busted" as const };
    expect(taskInstructions(task)).toContain("Busted powered Vintage Cube");
    expect(taskInstructions(task)).not.toContain("Set experience.power to the supplied Modern Horizons target");
    const input = JSON.parse(taskPrompt(task));
    expect(input.tools.references.pool.size).toBe(1000);
    if (stage === "screen") expect(input.policy.power).toContain("Busted");
  }
  expect(referenceContext(skeleton(135), "default")).toEqual(referenceContext(skeleton(135)));
  expect(taskInstructions({ stage: "generate", ideas: [], total: 135 }))
    .toContain("Design a strong, interactive Modern Horizons-style");
  const slots = skeleton(135, "busted");
  expect(slots.some((s) => s.type === "Artifact" && s.minMana === 0)).toBe(true);
  expect(slots.filter((s) => s.type === "Land")).toHaveLength(10);
});
