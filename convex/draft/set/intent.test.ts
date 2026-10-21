import { expect, test } from "vitest";
import { conversationSnapshot } from "../../lobby/worldbuilding";
import { parseIntent, validatePreferencePlan } from "./intent";
import { cannedIntent } from "../../../tests/cannedIntent";
import { creativeGuidance, preferenceCoverageProblems } from "./guidance";
import { cannedBlueprint } from "../../../tests/cannedSet";
import { skeleton } from "./slots";
import { parseSlots } from "./parsing";

const conversation = conversationSnapshot([
  { userId: "ana", text: "Dragons" }, { userId: "ana", text: "Actually no dragons" }, { userId: "ben", text: "I still want dragons" },
]);
test("intent provenance covers every message and conflicts cannot revive retractions", () => {
  const intent = cannedIntent(conversation);
  intent.preferences[0].status = "superseded";
  intent.conflicts = [{ preferences: ["p-2", "p-3"], explanation: "Different players disagree about dragons." }];
  expect(parseIntent(intent, conversation)).toMatchObject(intent);
  expect(() => parseIntent({ ...intent, preferences: intent.preferences.slice(1) }, conversation)).toThrow("Every message");
  expect(() => parseIntent({ ...intent, conflicts: [{ preferences: ["p-1", "p-2"], explanation: "Wrong" }] }, conversation)).toThrow("active preferences");
  const plan = intent.preferences.map(p => ({ preferenceId: p.id, disposition: "incorporated" as const, expression: "Dragons in the sky", cardGuidance: "Some creatures", reason: "Player idea" }));
  expect(() => validatePreferencePlan(plan, intent)).toThrow("Do not revive superseded");
  expect(() => validatePreferencePlan(plan.slice(1), intent)).toThrow("every preference");
});

test("preference support comes from distinct players in the snapshot, not message volume", () => {
  const messages = conversationSnapshot([
    { userId: "ana", text: "Moths", supportedBy: ["ana", "ben"] },
    { userId: "ana", text: "More moths", supportedBy: ["ben"] },
  ]);
  const intent = cannedIntent(messages);
  intent.preferences = [{ ...intent.preferences[0], sourceMessages: ["m1", "m2"] }];
  expect(parseIntent(intent, messages).signals).toEqual([
    { preferenceId: "p-1", supporters: ["p1", "p2"], contributors: ["p1"] },
  ]);
});

test("writers get global exclusions and assigned subjects; omitted ideas cannot be assigned", () => {
  const intent = cannedIntent(conversation);
  intent.preferences[1].kind = "avoid";
  intent.preferences[2].status = "unsupported";
  const blueprint = { ...cannedBlueprint, preferencePlan: intent.preferences.map(p => ({ preferenceId: p.id,
    disposition: p.status === "active" ? "incorporated" as const : "omitted" as const,
    expression: p.text, cardGuidance: p.text, reason: "Fixture" })) };
  const slots = skeleton(135).slice(0, 15).map(s => ({ ...s, preferenceIds: [] as string[] }));
  expect(creativeGuidance({ stage: "generate", ideas: [], total: 135, slots, blueprint, intent }).map(p => p.id)).toEqual(["p-2"]);
  expect(preferenceCoverageProblems(slots, blueprint, intent)).toEqual(["No card slots express preference p-1"]);
  slots[0].preferenceIds = ["p-1"];
  expect(preferenceCoverageProblems(slots, blueprint, intent)).toEqual([]);
  expect(creativeGuidance({ stage: "generate", ideas: [], total: 135, slots, blueprint, intent }).map(p => p.id)).toEqual(["p-1", "p-2"]);
  slots[0].preferenceIds = ["p-3"];
  expect(() => parseSlots({ slots }, skeleton(135).slice(0, 15), blueprint)).toThrow("omitted preference");
});
