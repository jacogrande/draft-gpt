import { expect, test } from "vitest";
import { cannedBlueprint, cannedTask } from "../../../tests/cannedSet";
import { parseDesigns } from "./parsing";
import { skeleton } from "./slots";
import { Design } from "./types";

test("name collision feedback identifies the rejected card and required repair", () => {
  const slots = skeleton(135).slice(0, 1);
  const raw = cannedTask({
    stage: "generate",
    total: 135,
    ideas: [],
    blueprint: cannedBlueprint,
    slots,
  }) as { cards: Design[] };
  const card = raw.cards[0];
  const result = parseDesigns(raw, slots, cannedBlueprint, [
    card.face.name.toUpperCase(),
  ]);
  expect(result.cards).toHaveLength(0);
  expect(result.errors[0]).toContain(card.slotId);
  expect(result.errors[0]).toContain(card.face.name);
  expect(result.errors[0]).toContain("Rename this card");
  card.face.name = "Distinct Bridge Guard";
  expect(parseDesigns(raw, slots, cannedBlueprint).cards).toHaveLength(1);
});
