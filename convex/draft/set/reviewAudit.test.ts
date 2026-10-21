import { expect, test } from "vitest";
import { cannedBlueprint, cannedTask } from "../../../tests/cannedSet";
import { cannedReview } from "../../../tests/cannedReview";
import { parseDesigns, parseReview } from "./parsing";
import { skeleton } from "./slots";
import { Task } from "./types";
import { uniquenessReport } from "./uniqueness";

const slots = skeleton(135).slice(0, 15);
const base: Task = { stage: "generate", total: 135, ideas: [], slots, blueprint: cannedBlueprint };
const designs = parseDesigns(cannedTask(base), slots, cannedBlueprint).cards;
const task: Task = { ...base, stage: "review", scope: "global", designs, reviewContract: "five-axis" };

test("review audit rejects missing cards, dimensions, pairs and invented evidence", () => {
  const valid = cannedReview(task);
  expect(parseReview(valid, designs, task)).toEqual(valid);
  for (const change of [
    (r: typeof valid) => r.audit!.reviewedSlots.pop(),
    (r: typeof valid) => r.audit!.dimensions.splice(0, 1),
    (r: typeof valid) => r.audit!.dimensions[0].evidenceSlots.push("invented"),
    (r: typeof valid) => r.audit!.archetypes.pop(),
    (r: typeof valid) => r.audit!.archetypes[0].payoffs.push("invented"),
    (r: typeof valid) => r.audit!.dimensions[0].issues.push("invented"),
  ]) {
    const bad = structuredClone(valid);
    change(bad);
    expect(() => parseReview(bad, designs, task)).toThrow(/audit/i);
  }
});

test("every review issue must be covered by the five-axis critique", () => {
  const review = cannedReview(task, [{ id: "weak", slots: ["C001"], severity: "major", evidence: "Current rate", correction: "Increase impact" }]);
  expect(parseReview(review, designs, task).issues).toHaveLength(1);
  review.audit!.dimensions.forEach(d => { d.issues = []; });
  expect(() => parseReview(review, designs, task)).toThrow("every issue");
  expect(parseReview({ summary: "Legacy review", blueprintBroken: false, issues: [] }, designs).issues).toEqual([]);
});

test("duplicate observations recognize normalized names and self-referencing rules without declaring cycles invalid", () => {
  const cards = [structuredClone(designs[0]), structuredClone(designs[5])];
  cards[0].face.name = "Wing Guard";
  cards[1].face.name = "  WING  GUARD ";
  expect(uniquenessReport(cards).duplicateNames).toEqual([["C001", "C006"]]);
  cards[1].face.name = "Shore Guard";
  cards[0].face.rules_text = "When Wing Guard enters, draw a card.";
  cards[1].face.rules_text = "When Shore Guard enters, draw a card.";
  cards[1].face.mana_cost = cards[0].face.mana_cost;
  expect(uniquenessReport(cards).matchingDesigns).toEqual([["C001", "C006"]]);
});

test("a rejected revision keeps its old name reserved for other replacements", async () => {
  const { validateRevisionNames } = await import("./uniqueness");
  const current = designs.slice(0, 3);
  const incoming = current.slice(0, 2).map(card => structuredClone(card));
  incoming[0].face.name = current[2].face.name;
  incoming[1].face.name = current[0].face.name;
  const result = validateRevisionNames({ cards: incoming, errors: [] }, current);
  expect(result.cards).toEqual([]);
  expect(result.errors).toHaveLength(2);
});
