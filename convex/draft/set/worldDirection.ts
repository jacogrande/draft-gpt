import { seededRandom } from "./collation";

const dimensions = {
  focus: [
    "A civilization whose institutions depend on a specific magical practice",
    "An ecology of supernatural species with incompatible needs",
    "Physical transformations that change what living beings can become",
    "The creation and use of extraordinary constructed objects",
    "Contact between societies or beings with incompatible kinds of magic",
    "A struggle over who may inherit or acquire supernatural power",
    "A campaign fought through magical capabilities and their counters",
    "Exploration of unfamiliar places governed by a specific magical rule",
  ],
  conflict: [
    "Two incompatible uses of the same magical capability",
    "The consequences of deliberately transferring power",
    "A creation becoming independent of its creators",
    "The enforcement or breaking of an unequal supernatural bargain",
    "A spreading change and competing ways to respond to it",
    "A change in which supernatural beings can survive or reproduce",
    "Rival powers trying to alter the rules that constrain each other",
    "An attempt to replace an established magical order",
  ],
  access: [
    "Magic learned through a demanding physical practice",
    "Magic enabled by a relationship between different living beings",
    "Magic acquired through deliberate bodily alteration",
    "Magic concentrated in things that must be made and maintained",
    "Magic granted on specific enforceable terms",
    "Magic that can be taken from a powerful opponent",
    "Magic available only through a coordinated group action",
    "Magic arising from a creature's anatomy or life cycle",
  ],
  visual: [
    "Architecture, inhabited spaces and visible magical alterations",
    "Distinct creature anatomies and interactions",
    "Tools, constructed objects and their physical operation",
    "Clothing, gestures and the visible results of spellcasting",
    "Habitats, movement and relationships between species",
    "Ceremonies with concrete participants, objects and consequences",
    "Weapons, defenses and evidence of how they work",
    "Travel, encounters and the physical traces left by passage",
  ],
};
export type WorldDirection = {
  version: number;
  seed: number;
  focus: string;
  conflict: string;
  access: string;
  visual: string;
};
export const worldDirection = (
  seed: number,
  recent: WorldDirection[] = []
): WorldDirection => {
  const random = seededRandom((seed ^ 0x574f524c) >>> 0);
  const choose = (key: keyof typeof dimensions) => {
    const counts = dimensions[key].map((value) => ({
      value,
      count: recent.slice(0, 12).filter((d) => d[key] === value).length,
    }));
    const least = Math.min(...counts.map((c) => c.count));
    const choices = counts.filter((c) => c.count === least);
    return choices[Math.floor(random() * choices.length)].value;
  };
  return {
    version: 1,
    seed,
    focus: choose("focus"),
    conflict: choose("conflict"),
    access: choose("access"),
    visual: choose("visual"),
  };
};
