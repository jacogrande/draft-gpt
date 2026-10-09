export const ZONES = ["library", "hand", "battlefield", "graveyard"] as const;

export type Zone = (typeof ZONES)[number];

type Piece = { id: string; name: string; tapped: boolean };

export type Side<C extends Piece> = Record<Zone, C[]>;

const PUBLIC_ZONES: Zone[] = ["battlefield", "graveyard"];

export const shuffled = <C>(cards: C[], random: () => number): C[] => {
  const deck = [...cards];
  for (let index = deck.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }
  return deck;
};

export const dealIn = <C extends Piece>(
  cards: C[],
  random: () => number
): Side<C> => ({
  library: shuffled(cards, random),
  hand: [],
  battlefield: [],
  graveyard: [],
});

const zoneOf = <C extends Piece>(side: Side<C>, cardId: string): Zone | null =>
  ZONES.find((zone) => side[zone].some((card) => card.id === cardId)) ?? null;

export type Move<C> = { card: C; from: Zone; to: Zone };

export const moveCards = <C extends Piece>(
  side: Side<C>,
  cardIds: string[],
  to: Zone
): { side: Side<C>; moves: Move<C>[] } => {
  const next = { ...side };
  const moves: Move<C>[] = [];
  for (const cardId of cardIds) {
    const from = zoneOf(next, cardId);
    if (!from || from === to) continue;
    const found = next[from].find((card) => card.id === cardId) as C;
    const card = { ...found, tapped: false };
    next[from] = next[from].filter((other) => other.id !== cardId);
    next[to] = to === "library" ? [card, ...next[to]] : [...next[to], card];
    moves.push({ card, from, to });
  }
  return { side: next, moves };
};

export const describeMove = <C extends Piece>(move: Move<C>): string => {
  const seen = PUBLIC_ZONES.includes(move.from) || PUBLIC_ZONES.includes(move.to);
  return `moved ${seen ? move.card.name : "a card"} to ${move.to}`;
};

export const toggleTapped = <C extends Piece>(
  side: Side<C>,
  cardIds: string[]
): { side: Side<C>; toggled: C[] } => {
  const toggled: C[] = [];
  const battlefield = side.battlefield.map((card) => {
    if (!cardIds.includes(card.id)) return card;
    const turned = { ...card, tapped: !card.tapped };
    toggled.push(turned);
    return turned;
  });
  return { side: { ...side, battlefield }, toggled };
};

export const untapAll = <C extends Piece>(
  side: Side<C>
): { side: Side<C>; untapped: C[] } => ({
  side: {
    ...side,
    battlefield: side.battlefield.map((card) => ({ ...card, tapped: false })),
  },
  untapped: side.battlefield.filter((card) => card.tapped),
});

export const draw = <C extends Piece>(
  side: Side<C>,
  amount: number
): { side: Side<C>; drawn: number } => {
  const drawn = Math.max(0, Math.min(Math.floor(amount), side.library.length));
  return {
    side: {
      ...side,
      library: side.library.slice(drawn),
      hand: [...side.hand, ...side.library.slice(0, drawn)],
    },
    drawn,
  };
};

export const shuffleLibrary = <C extends Piece>(
  side: Side<C>,
  random: () => number
): Side<C> => ({ ...side, library: shuffled(side.library, random) });

export const sideSeenBy = <C extends Piece>(side: Side<C>, isOwner: boolean) => ({
  libraryCount: side.library.length,
  handCount: side.hand.length,
  hand: isOwner ? side.hand : null,
  battlefield: side.battlefield,
  graveyard: side.graveyard,
});
