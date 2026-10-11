import { RejectionCode } from "../errors";

export const SEATS = 2;
export const STARTING_LIFE = 20;

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 4;
const CODE = /^[A-Z0-9]{4}$/;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const OPEN_LIFETIME = DAY;
const PLAYING_LIFETIME = 7 * DAY;
const CLOSED_RETENTION = 7 * DAY;

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

const generateCode = (random: () => number): string =>
  Array.from(
    { length: CODE_LENGTH },
    () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]
  ).join("");

export const freshCode = (liveCodes: string[], random: () => number): string => {
  let code = generateCode(random);
  while (liveCodes.includes(code)) code = generateCode(random);
  return code;
};

export const decideSeat = <U>(
  status: GameStatus,
  players: Seated<U>[],
  userId: U
): SeatDecision => {
  if (status === "closed") return { kind: "refused", reason: "closed" };
  const existing = players.find((player) => player.userId === userId);
  if (existing) return { kind: "existing", seat: existing.seat };
  const taken = players.map((player) => player.seat);
  const seat = [...Array(SEATS).keys()].find((free) => !taken.includes(free));
  if (status !== "open" || seat === undefined)
    return { kind: "refused", reason: "full" };
  return { kind: "seated", seat };
};

export const closesWhenEmpty = (remaining: unknown[]): boolean =>
  remaining.length === 0;

export const everyoneHasADeck = (players: { ready: boolean }[]): boolean =>
  players.length === SEATS && players.every((player) => player.ready);

export const playRefusal = (status: GameStatus): RejectionCode | null => {
  if (status === "closed") return "GAME_CLOSED";
  return status === "playing" ? null : "GAME_NOT_STARTED";
};

export const isAbandoned = (
  game: { status: GameStatus; lastActiveAt: number },
  now: number
): boolean => {
  const idle = now - game.lastActiveAt;
  if (game.status === "open") return idle > OPEN_LIFETIME;
  if (game.status === "playing") return idle > PLAYING_LIFETIME;
  return false;
};

export const isPurgeable = (
  game: { status: GameStatus; closedAt: number },
  now: number
): boolean => game.status === "closed" && now - game.closedAt > CLOSED_RETENTION;
