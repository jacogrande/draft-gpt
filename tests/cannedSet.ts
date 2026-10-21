import { cannedReview } from "./cannedReview";
import { cannedIntent } from "./cannedIntent";
import { Blueprint, COLORS, PAIRS, Task } from "../convex/draft/set/types";

export const cannedBlueprint: Blueprint = {
  world: {
    name: "Glasswake",
    premise: "A colossal sea serpent is breaking out beneath a glass-covered inlet.",
    description:
      "Winged guardians seal each fracture with their bodies. Their feathers turn to glass, and their stone perches sink beneath the rising water.",
    conflict:
      "The serpent shatters the guardians' seals with each breath. A sorcerer raises shields from its severed scales, but every shield frees another coil beneath the shore.",
    tone: "Wistful, strange, adventurous",
  },
  experience: {
    pace: "Interactive midrange",
    power: "Efficient creatures with earned synergies",
    interaction: "Every engine has ordinary removal as counterplay",
    exclusions: ["infinite combos"],
  },
  colors: COLORS.map((color) => ({
    color,
    role: "A distinct response to the serpent and its binding magic",
    strengths: "Efficient creatures",
    weaknesses: "Requires support",
    visual: "Glass feathers, immense scales and broken seals",
  })),
  archetypes: PAIRS.map((id) => ({
    id,
    name: `${id} Salvagers`,
    earlyGame: "Deploy cheap creatures",
    engine: "Use shared graveyard resources",
    winCondition: "Attack with supported creatures",
    weaknesses: "Removal breaks the engine",
    enablers: "Cheap creatures",
    payoffs: "Conditional bonuses",
    neighbors: PAIRS.filter(
      (p) => p !== id && [...p].some((c) => id.includes(c))
    ).slice(0, 2),
  })),
  mechanics: [],
  creative: {
    materials: "Glass feathers and iridescent serpent scales",
    silhouettes: "Winged guardians above immense submerged coils",
    locations: "Shattered seals and half-submerged guardian perches",
    motifs: "Glass wings sealing cracks above the serpent",
    naming: "Beings, spells and places shaped by the serpent's binding",
    exclusions: "Modern technology",
  },
  influences: [],
};
export const cannedTask = (task: Task): unknown => {
  if (task.stage === "interpret") return cannedIntent(task.conversation ?? []);
  if (task.stage === "brief") return {
    ...cannedBlueprint,
    ...(task.powerLevel === "busted" ? { experience: { ...cannedBlueprint.experience,
      power: "Powered Vintage Cube strength", exclusions: ["unsupported card layouts"] } } : {}),
    ...(task.intent ? { preferencePlan: task.intent.preferences.map(p => ({
      preferenceId: p.id, disposition: p.status === "active" ? "incorporated" : "omitted",
      expression: p.status === "active" ? `The world reflects: ${p.text}` : "",
      reason: p.status === "active" ? "A supported player preference." : p.reason,
      cardGuidance: p.status === "active" ? `Use in suitable motifs: ${p.text}` : "",
    })) } : {}),
  };
  if (task.stage === "slots") return { slots: task.slots?.map(slot => ({ ...slot,
    ...(task.blueprint?.preferencePlan ? { preferenceIds: task.blueprint.preferencePlan.filter(p => p.disposition !== "omitted").filter((_, i, list) => i === Number(slot.id.slice(1)) % list.length).map(p => p.preferenceId) } : {}),
  })) };
  if (task.stage === "generate" || task.stage === "revise")
    return {
      cards: task.slots!.map((slot) => {
        const value =
          slot.type === "Land"
            ? 0
            : Math.max(2, slot.minMana, slot.colors.length);
        return {
          slotId: slot.id,
          tokens: [],
          face: {
            name: `Glass Sentinel ${slot.id}`,
            mana_cost: `${
              value > slot.colors.length
                ? `{${value - slot.colors.length}}`
                : ""
            }${slot.colors.map((c) => `{${c}}`).join("")}`,
            art_direction: "A winged guardian presses glass feathers into a crack above a submerged serpent's eye.",
            type: slot.type,
            subtype: slot.type === "Creature" ? "Human Scout" : "",
            rarity: slot.rarity,
            rules_text:
              slot.type === "Land"
                ? `This land enters tapped. {T}: Add ${[...slot.archetypes[0]]
                    .map((c) => `{${c}}`)
                    .join(" or ")}.`
                : "",
            flavor_text: "Another feather hardened. Below it, the eye opened.",
            power: slot.type === "Creature" ? 2 : 0,
            toughness: slot.type === "Creature" ? 2 : 0,
            set: task.blueprint!.world.name,
            legendary: false,
          },
        };
      }),
    };
  return cannedReview(task);
};
export const cannedResponse = (task: Task) => ({
  id: "fake-response",
  status: "completed",
  output: [
    {
      type: "message",
      content: [
        { type: "output_text", text: JSON.stringify(cannedTask(task)) },
      ],
    },
  ],
  usage: { input_tokens: 100, output_tokens: 100 },
});
export const cannedDecisions = (questions: { name: string }[]) => ({
  answers: questions.map((q) => ({
    type: "choice",
    name: q.name,
    choice: "pass",
    confidence: 0.9,
    probabilities: [
      { value: "pass", probability: 0.95 },
      { value: "review", probability: 0.05 },
    ],
  })),
  usage: { input_tokens: 100, output_tokens: 0 },
});
