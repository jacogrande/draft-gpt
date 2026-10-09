export const ROUND_COUNT = 3;
export const PACK_SIZE = 15;

export type Passing<U> = {
  order: U[];
  position: number;
  cardCount: number;
  holderId: U | null;
};

export const passPack = <U>(
  pack: Passing<U>
): { position: number; holderId: U | null } => {
  const position = pack.position + 1;
  const exhausted = position >= pack.cardCount;
  return {
    position,
    holderId: exhausted ? null : pack.order[position % pack.order.length],
  };
};

export const currentPack = <P extends Passing<U>, U>(
  packs: P[],
  userId: U
): P | null => {
  const held = packs.filter((pack) => pack.holderId === userId);
  if (held.length === 0) return null;
  return held.reduce((first, pack) =>
    pack.position < first.position ? pack : first
  );
};

export const roundIsOver = <U>(packs: Passing<U>[]): boolean =>
  packs.every((pack) => pack.holderId === null);

export const packsHeld = <U extends string>(
  packs: Passing<U>[]
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const pack of packs) {
    if (pack.holderId === null) continue;
    counts[pack.holderId] = (counts[pack.holderId] ?? 0) + 1;
  }
  return counts;
};

export const topUpCount = (cardCount: number): number =>
  Math.max(0, PACK_SIZE - cardCount);

export const drawFromPool = <C>(
  pool: C[],
  count: number,
  random: () => number
): C[] =>
  pool.length === 0
    ? []
    : Array.from(
        { length: count },
        () => pool[Math.floor(random() * pool.length)]
      );
