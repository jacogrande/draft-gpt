import { Design, COLORS } from "./types";

export const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
export const collate = (
  cards: Design[],
  count: number,
  seed: number
): string[][] => {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => {
    const pack: Design[] = [];
    const take = (eligible: Design[]) => {
      const pool = eligible.filter((c) => !pack.includes(c));
      if (!pool.length)
        throw new Error("Inventory cannot satisfy pack constraints");
      pack.push(pool[Math.floor(random() * pool.length)]);
    };
    const commons = cards.filter((c) => c.face.rarity === "common");
    for (const color of COLORS)
      take(
        commons.filter(
          (c) =>
            COLORS.filter((x) => c.face.mana_cost.includes(`{${x}}`)).join(
              ""
            ) === color
        )
      );
    for (let n = 0; n < 5; n++) take(commons);
    for (let n = 0; n < 4; n++)
      take(cards.filter((c) => c.face.rarity === "uncommon"));
    const mythics = cards.filter((c) => c.face.rarity === "mythic");
    take(
      mythics.length && random() < 1 / 8
        ? mythics
        : cards.filter((c) => c.face.rarity === "rare")
    );
    for (let i = pack.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pack[i], pack[j]] = [pack[j], pack[i]];
    }
    return pack.map((c) => c.slotId);
  });
};
