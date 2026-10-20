import { expect, test } from "vitest";
import { cannedBlueprint, cannedTask } from "../../../tests/cannedSet";
import { collate } from "./collation";
import { parseDesigns, parseScreens } from "./parsing";
import { skeleton } from "./slots";
import { COLORS } from "./types";

test("collation is reproducible and preserves rarity, uniqueness and color coverage", () => {
  for (const total of [135, 270]) {
    const slots = skeleton(total);
    const cards = parseDesigns(
      cannedTask({
        stage: "generate",
        total,
        ideas: [],
        blueprint: cannedBlueprint,
        slots,
      }),
      slots,
      cannedBlueprint
    ).cards;
    const packs = collate(cards, 24, 1234);
    expect(collate(cards, 24, 1234)).toEqual(packs);
    expect(collate(cards, 24, 5678)).not.toEqual(packs);
    for (const pack of packs) {
      expect(new Set(pack).size).toBe(15);
      const faces = pack.map((id) => cards.find((c) => c.slotId === id)!.face);
      expect(faces.filter((c) => c.rarity === "common")).toHaveLength(10);
      expect(faces.filter((c) => c.rarity === "uncommon")).toHaveLength(4);
      expect(
        faces.filter((c) => ["rare", "mythic"].includes(c.rarity))
      ).toHaveLength(1);
      for (const color of COLORS)
        expect(
          faces.some(
            (c) =>
              c.rarity === "common" &&
              COLORS.filter((x) => c.mana_cost.includes(`{${x}}`)).join("") ===
                color
          )
        ).toBe(true);
    }
  }
});

test("screening rejects missing choices and unnormalized probabilities", () => {
  const answer = {
    name: "C001.power",
    type: "choice",
    choice: "pass",
    confidence: 0.9,
    probabilities: [
      { value: "pass", probability: 0.9 },
      { value: "review", probability: 0.1 },
    ],
  };
  expect(parseScreens({ answers: [answer] }, [answer.name])).toHaveLength(1);
  expect(() =>
    parseScreens({ answers: [answer, answer] }, [answer.name, "C002.power"])
  ).toThrow();
  expect(() =>
    parseScreens(
      {
        answers: [
          { ...answer, probabilities: [{ value: "pass", probability: 0.9 }] },
        ],
      },
      [answer.name]
    )
  ).toThrow();
  expect(() =>
    parseScreens(
      {
        answers: [
          {
            ...answer,
            probabilities: answer.probabilities.map((p) => ({
              ...p,
              probability: 0.8,
            })),
          },
        ],
      },
      [answer.name]
    )
  ).toThrow();
});
