import { seededRandom } from "./collation";

const terrains = [
  "mountain ranges carried on the backs of migrating titans",
  "a shattered moon whose fragments hang above a forest",
  "a sea suspended above a desert, shedding waterfalls through broken wards",
  "a buried city exposed whenever a colossal serpent sheds its skin",
  "islands growing from the antlers of a sleeping god",
  "a volcanic caldera containing a sealed gate to another plane",
  "a glacier pierced by roots from a tree taller than the clouds",
  "a labyrinth of petrified dragons whose hearts still beat",
];
const powers = [
  "an ancient dragon whose breath changes living flesh into crystal",
  "a host of angels that burns away every enchantment it touches",
  "a drowned god returning through bodies raised from the seabed",
  "an expanding breach that releases creatures from another plane",
  "a colossal elemental that pulls mountains apart to free its young",
  "an immortal sorcerer commanding creatures bound inside fallen stars",
  "a swarm that grows new bodies from the spells cast against it",
  "a living storm that raises dead giants wherever its lightning strikes",
];
const catalysts = [
  "a broken seal that releases a larger creature each time it is repaired",
  "a relic that can bind one immense being, but frees its previous captive",
  "seeds that grow protective stone colossi and drain the rivers around them",
  "a bargain granting borrowed wings while allowing their owner to see through the borrower's eyes",
  "a well that restores destroyed bodies while gradually waking the being beneath it",
  "a crown that commands nearby spirits but gives them control while its wearer sleeps",
  "eggs that absorb hostile spells until the creatures inside hatch",
  "a blade that cuts planar gates and cannot close what it opens",
];
const perspectives = [
  "A chronicler of divine wars: discover how immense powers wound the terrain, what survives their passage, and what can restrain them.",
  "A naturalist of impossible creatures: discover supernatural life cycles, predation, transformations, and vulnerabilities.",
  "An explorer of planar boundaries: discover what crosses over, what changes on contact, and what keeps the breach open.",
  "A scholar of forbidden bargains: discover the exact gift, price, enforcement, and observable mark left on the recipient.",
  "A relic keeper: discover what an ancient object actually does, what can break it, and why a vast power fears it.",
  "A witness to a god's awakening: discover changes in bodies, weather and stone before the god itself appears.",
];

export const creativeSeed = (seed: number) => {
  const random = seededRandom((seed ^ 0x43524541) >>> 0);
  const pick = (values: string[]) => values[Math.floor(random() * values.length)];
  return {
    version: 1,
    seed,
    ingredients: [pick(terrains), pick(powers), pick(catalysts)],
    perspective: pick(perspectives),
  };
};
export type CreativeSeed = ReturnType<typeof creativeSeed>;
