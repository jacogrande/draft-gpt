export const SEATS = 2;
export const STARTING_LIFE = 20;

const CODE = /^[A-Z0-9]{4}$/;
const GAME_LIFETIME = 7 * 24 * 60 * 60 * 1000;

export type GameStatus = "open" | "playing" | "closed";

type Seated<U> = { userId: U; seat: number };

export type SeatDecision =
  | { kind: "existing"; seat: number }
  | { kind: "seated"; seat: number }
  | { kind: "refused"; reason: "full" | "closed" };

export const parseCode = (raw: string): string | null => {
  const code = raw.trim().toUpperCase();
  return CODE.test(code) ? code : null;
};

export const decideSeat = <U>(
  status: GameStatus,
  players: Seated<U>[],
  userId: U
): SeatDecision => {
  const existing = players.find((player) => player.userId === userId);
  if (existing) return { kind: "existing", seat: existing.seat };
  if (status === "closed") return { kind: "refused", reason: "closed" };
  const taken = players.map((player) => player.seat);
  const seat = [...Array(SEATS).keys()].find((free) => !taken.includes(free));
  if (status !== "open" || seat === undefined)
    return { kind: "refused", reason: "full" };
  return { kind: "seated", seat };
};

export const everyoneHasADeck = (players: { ready: boolean }[]): boolean =>
  players.length === SEATS && players.every((player) => player.ready);

export const isAbandoned = (
  game: { status: GameStatus; createdAt: number },
  now: number
): boolean => game.status !== "closed" && now - game.createdAt > GAME_LIFETIME;
