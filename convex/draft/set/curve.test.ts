import { expect, test } from "vitest";
import { skeleton } from "./slots";
import { COLORS } from "./types";

test("each color has enough cheap common creatures and affordable interaction", () => {
  for (const total of [135, 270]) {
    const slots = skeleton(total);
    const common = slots.filter((s) => s.rarity === "common");
    expect(
      common.filter((s) => s.type === "Creature").length / common.length
    ).toBeGreaterThanOrEqual(0.5);
    for (const color of COLORS) {
      const colored = common.filter((s) => s.colors.includes(color));
      expect(
        colored.filter((s) => s.type === "Creature" && s.maxMana <= 3).length
      ).toBeGreaterThanOrEqual(4);
      expect(colored.some((s) => s.type === "Instant" && s.maxMana <= 2)).toBe(
        true
      );
      expect(colored.some((s) => s.type === "Creature" && s.maxMana >= 5)).toBe(
        true
      );
    }
    for (const slot of slots) {
      expect(slot.minMana).toBeLessThanOrEqual(slot.maxMana);
      expect(slot.maxMana).toBeGreaterThanOrEqual(slot.colors.length);
      if (slot.type === "Land")
        expect([slot.minMana, slot.maxMana]).toEqual([0, 0]);
      else expect(slot.minMana).toBeGreaterThan(0);
    }
    expect(
      common
        .filter((s) => ["Instant", "Artifact", "Enchantment"].includes(s.type))
        .every((s) => s.minMana <= 2)
    ).toBe(true);
  }
});

test("a generic artifact slot cannot silently require unsupported colorless mana", async () => {
  const { cannedBlueprint, cannedTask } = await import(
    "../../../tests/cannedSet"
  );
  const { parseDesigns } = await import("./parsing");
  const slot = skeleton(135).find((s) => s.type === "Artifact")!;
  const raw = cannedTask({
    stage: "generate",
    total: 135,
    ideas: [],
    blueprint: cannedBlueprint,
    slots: [slot],
  }) as { cards: { face: { mana_cost: string } }[] };
  raw.cards[0].face.mana_cost = "{1}{C}";
  const parsed = parseDesigns(raw, [slot], cannedBlueprint);
  expect(parsed.cards).toHaveLength(0);
  expect(parsed.errors.join(" ")).toContain("dedicated {C}");
});
