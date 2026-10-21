import {
  blueprintSchema,
  designSchema,
  reviewSchema,
  slotPlanSchema,
} from "./contracts";
import { validate } from "./schema";
import {
  Blueprint,
  COLORS,
  Design,
  PAIRS,
  Review,
  Screening,
  Slot,
} from "./types";

export const parseBlueprint = (raw: unknown, ideaCount: number): Blueprint => {
  validate(raw, blueprintSchema);
  const result = raw as Blueprint;
  if (
    new Set(result.colors.map((c) => c.color)).size !== 5 ||
    new Set(result.archetypes.map((a) => a.id)).size !== 10
  )
    throw new Error("Each color and pair must appear once");
  if (
    result.mechanics.filter((m) => m.isNew).length > 1 ||
    new Set(result.mechanics.map((m) => m.id)).size !== result.mechanics.length
  )
    throw new Error("Invalid mechanic vocabulary");
  for (const a of result.archetypes) {
    if (
      new Set(a.neighbors).size < 2 ||
      a.neighbors.some(
        (p) => p === a.id || ![...p].some((c) => a.id.includes(c))
      )
    )
      throw new Error(`Invalid neighbors for ${a.id}`);
  }
  if (
    result.influences.some(
      (i) => !Number.isInteger(i.idea) || i.idea >= ideaCount
    )
  )
    throw new Error("Unknown idea reference");
  return result;
};

export const parseSlots = (
  raw: unknown,
  expected: Slot[],
  blueprint: Blueprint
): Slot[] => {
  validate(raw, {
    ...slotPlanSchema,
    properties: {
      slots: {
        ...slotPlanSchema.properties!.slots,
        minItems: expected.length,
        maxItems: expected.length,
      },
    },
  });
  const slots = (raw as { slots: Slot[] }).slots;
  if (new Set(slots.map((s) => s.id)).size !== expected.length)
    throw new Error("Duplicate slot IDs");
  for (const slot of slots) {
    const original = expected.find((s) => s.id === slot.id);
    if (
      !original ||
      ["rarity", "type", "minMana", "maxMana", "colors", "archetypes"].some(
        (key) =>
          JSON.stringify(slot[key as keyof Slot]) !==
          JSON.stringify(original[key as keyof Slot])
      )
    )
      throw new Error(`Changed fixed slot ${slot.id}`);
    if (
      slot.mechanics.some((id) => !blueprint.mechanics.some((m) => m.id === id))
    )
      throw new Error(`Undefined mechanic in ${slot.id}`);
    if (
      slot.colors.length &&
      slot.archetypes.some((p) => !slot.colors.every((c) => p.includes(c)))
    )
      throw new Error(`Uncastable archetype support in ${slot.id}`);
  }
  return slots;
};

export const parseDesigns = (
  raw: unknown,
  slots: Slot[],
  blueprint: Blueprint,
  reservedNames: string[] = []
): { cards: Design[]; errors: string[] } => {
  const entries =
    raw && typeof raw === "object" && "cards" in raw && Array.isArray(raw.cards)
      ? (raw.cards as unknown[])
      : [];
  const cards: Design[] = [],
    errors: string[] = [];
  const duplicates = entries.map((entry) =>
    entry && typeof entry === "object" && "slotId" in entry
      ? entry.slotId
      : null
  );
  for (const entry of entries) {
    try {
      validate(entry, designSchema);
      const card = entry as Design;
      const slot = slots.find((s) => s.id === card.slotId);
      if (!slot || duplicates.filter((id) => id === card.slotId).length !== 1)
        throw new Error("Unknown or repeated slot");
      const face = card.face;
      if (
        [...reservedNames, ...cards.map((accepted) => accepted.face.name)].some(
          (name) => name.toLowerCase() === face.name.toLowerCase()
        )
      )
        throw new Error(
          `${slot.id}: name "${face.name}" belongs to another slot. Rename this card to a distinct name outside reservedNames, even if the edit plan proposed renaming the other card.`
        );
      if (face.set !== blueprint.world.name)
        throw new Error(
          `${slot.id}: set ${face.set} must be ${blueprint.world.name}`
        );
      if (face.rarity !== slot.rarity)
        throw new Error(
          `${slot.id}: rarity ${face.rarity} violates fixed rarity ${slot.rarity}`
        );
      if (face.type !== slot.type)
        throw new Error(
          `${slot.id}: type ${face.type} violates fixed type ${slot.type}`
        );
      if (
        /Planeswalker|Battle|\/\//i.test(face.type) ||
        !Number.isInteger(face.power) ||
        !Number.isInteger(face.toughness)
      )
        throw new Error("Unsupported card representation");
      if (!/^(?:\{(?:\d+|[WUBRG])\})*$/.test(face.mana_cost))
        throw new Error(
          "Use fixed braced generic or W/U/B/R/G mana; this profile does not support dedicated {C} costs"
        );
      const colors = COLORS.filter((c) => face.mana_cost.includes(`{${c}}`));
      const value = [...face.mana_cost.matchAll(/\{(\d+|[WUBRG])\}/g)].reduce(
        (n, m) => n + (/^\d+$/.test(m[1]) ? Number(m[1]) : 1),
        0
      );
      if (
        JSON.stringify(colors) !==
          JSON.stringify(COLORS.filter((c) => slot.colors.includes(c))) ||
        value < slot.minMana ||
        value > slot.maxMana
      )
        throw new Error(
          `${slot.id}: mana cost ${
            face.mana_cost
          } violates the fixed slot: colors ${
            slot.colors.join(",") || "colorless"
          }, mana value ${slot.minMana}–${
            slot.maxMana
          }. Slot constraints override review suggestions; adjust the effect to suit this mana band.`
        );
      if (slot.type === "Land") {
        const produced = COLORS.filter((color) =>
          face.rules_text.includes(`{${color}}`)
        ).join("");
        const expected = COLORS.filter((color) =>
          slot.archetypes[0].includes(color)
        ).join("");
        if (produced !== expected)
          throw new Error(
            `${slot.id}: fixing must produce exactly ${slot.archetypes[0]}`
          );
      }
      if (face.type.includes("Creature") && face.toughness < 1)
        throw new Error("Creature needs positive toughness");
      if (/\btoken\b/i.test(face.rules_text) && !card.tokens.length)
        throw new Error("Missing token definition");
      cards.push({ ...card, face: { ...face, image_url: null } });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Invalid card");
    }
  }
  for (const slot of slots)
    if (!cards.some((c) => c.slotId === slot.id))
      errors.push(`Missing valid ${slot.id}`);
  return { cards, errors };
};

export const parseReview = (raw: unknown, designs: Design[]): Review => {
  validate(raw, reviewSchema);
  const review = raw as Review;
  if (
    review.blueprintBroken &&
    !review.issues.some((i) => i.severity === "blocker")
  )
    throw new Error(
      "blueprintBroken requires a blocker issue identifying the frozen world/mechanic that cannot be repaired at card level. Card-level power or wording fixes are not blueprint failures."
    );
  if (
    review.issues.some((issue) =>
      issue.slots.some((id) => !designs.some((card) => card.slotId === id))
    )
  )
    throw new Error("Review refers to unknown cards");
  return review;
};

export const parseScreens = (raw: unknown, names: string[]): Screening[] => {
  const answers =
    raw &&
    typeof raw === "object" &&
    "answers" in raw &&
    Array.isArray(raw.answers)
      ? raw.answers
      : [];
  if (
    answers.length !== names.length ||
    new Set(answers.map((a) => a?.name)).size !== names.length
  )
    throw new Error("Incomplete or repeated screening");
  return names.map((name) => {
    const a = answers.find((answer) => answer?.name === name);
    if (
      !a ||
      a.type !== "choice" ||
      !["pass", "review"].includes(a.choice) ||
      !Number.isFinite(a.confidence) ||
      a.confidence < 0 ||
      a.confidence > 1 ||
      !Array.isArray(a.probabilities) ||
      a.probabilities.length !== 2 ||
      new Set(a.probabilities.map((p: { value: string }) => p.value)).size !==
        2 ||
      Math.abs(
        a.probabilities.reduce(
          (n: number, p: { probability: number }) => n + p.probability,
          0
        ) - 1
      ) > 0.001
    )
      throw new Error(`Invalid screening ${name}`);
    return {
      name,
      choice: a.choice,
      confidence: a.confidence,
      probabilities: a.probabilities.map(
        (p: { value: string; probability: number }) => {
          if (
            !["pass", "review"].includes(p.value) ||
            !Number.isFinite(p.probability) ||
            p.probability < 0 ||
            p.probability > 1
          )
            throw new Error("Invalid probability");
          return { value: p.value, probability: p.probability };
        }
      ),
    };
  });
};

export const inventoryProblems = (
  slots: Slot[],
  designs: Design[]
): string[] => {
  const problems: string[] = [];
  if (
    new Set(designs.map((c) => c.slotId)).size !== slots.length ||
    designs.length !== slots.length
  )
    problems.push("Incomplete inventory");
  if (
    new Set(designs.map((c) => c.face.name.toLowerCase())).size !==
    designs.length
  )
    problems.push("Duplicate card names");
  for (const pair of PAIRS) {
    const support = slots.filter(
      (s) => s.archetypes.includes(pair) && s.rarity === "common"
    );
    if (slots.length > 15 && support.length < 6)
      problems.push(`${pair} has fewer than six common support slots`);
  }
  return problems;
};

export const duplicateIssues = (designs: Design[]): Review["issues"] => {
  const groups = new Map<string, string[]>();
  for (const card of designs) {
    const name = card.face.name.toLowerCase();
    groups.set(name, [...(groups.get(name) ?? []), card.slotId]);
  }
  return [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([name, ids], index) => ({
      id: `duplicate-${index}`,
      slots: ids,
      severity: "major",
      evidence: `These different slots share the name ${name}.`,
      correction:
        "Give each design a distinct, world-specific name. Preserve its gameplay unless another issue requires a change. Do not reuse another card's name.",
    }));
};
