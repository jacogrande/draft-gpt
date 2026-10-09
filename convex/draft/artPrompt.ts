import { School } from "./artSchools";

type World = { name: string; thesis: string };

const MEDIUM =
  "A small, quickly made illustration for a cheap fantasy paperback, pulp magazine, or storybook, which is how early 1990s card art looked. Hand-made with real materials. Loose and economical: big simple shapes, a few confident marks standing in for detail, rough edges, corners left barely finished. A little odd and charming, not polished. Not digital: no airbrushed gloss, no 3D render, no photographic lens effects.";

const RESTRAINT =
  "Keep it simple. Suggest texture with a few marks. No intricate ornament or fine filigree, no swarms of particles, sparks, shards, or debris, no glowing magical effects unless the scene names one.";

const MOOD =
  "Understated and a little strange. The subject is caught in a quiet, ordinary, or odd moment, not striking a heroic pose. No epic scale, no sweeping vista.";

const COMPOSITION =
  "Wide landscape crop. One subject, large in the frame, with a strong silhouette that reads at thumbnail size, against a plain or barely suggested background.";

const CONSTRAINTS =
  "Full-bleed artwork only. No text, letters, borders, card frame, signature, or watermark.";

const capitalise = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const artPrompt = (
  artDirection: string,
  world: World,
  school: School
): string =>
  [
    "Fantasy trading card illustration.",
    `Scene: ${artDirection}`,
    `World: ${world.name}. ${world.thesis}`,
    `Medium: ${MEDIUM}`,
    `Tradition: Made in the tradition of ${school.lineage}.`,
    `Lighting: ${capitalise(school.light)}.`,
    `Palette: Only a few colours: ${school.palette}. Slightly faded, like old printed pages.`,
    `Detail: ${RESTRAINT}`,
    `Mood: ${MOOD}`,
    `Composition: ${COMPOSITION}`,
    `Constraints: ${CONSTRAINTS}`,
  ].join("\n\n");
