export const MAX_SEATS = 8;
export const MIN_DRAFTERS = 2;
export const MAX_LOBBY_NAME_LENGTH = 48;
export const MAX_MESSAGE_LENGTH = 500;

const HOUR = 60 * 60 * 1000;
const OPEN_LOBBY_LIFETIME = 24 * HOUR;
const DRAFT_LIFETIME = 7 * 24 * HOUR;

export type LobbyStatus =
  | "open"
  | "generating"
  | "drafting"
  | "complete"
  | "closed";

type Seated<U> = { userId: U; seat: number };

export type JoinDecision =
  | { kind: "existing"; seat: number }
  | { kind: "seated"; seat: number }
  | { kind: "refused"; reason: "full" | "in-progress" | "closed" };

const lowestFreeSeat = (taken: number[]): number | null => {
  for (let seat = 0; seat < MAX_SEATS; seat++) {
    if (!taken.includes(seat)) return seat;
  }
  return null;
};

export const decideJoin = <U>(
  status: LobbyStatus,
  members: Seated<U>[],
  userId: U
): JoinDecision => {
  const existing = members.find((member) => member.userId === userId);
  if (existing) return { kind: "existing", seat: existing.seat };
  if (status === "closed") return { kind: "refused", reason: "closed" };
  if (status !== "open") return { kind: "refused", reason: "in-progress" };
  const seat = lowestFreeSeat(members.map((member) => member.seat));
  if (seat === null) return { kind: "refused", reason: "full" };
  return { kind: "seated", seat };
};

export const bySeat = <M extends { seat: number }>(members: M[]): M[] =>
  [...members].sort((a, b) => a.seat - b.seat);

export const successor = <U>(members: Seated<U>[], leavingId: U): U | null =>
  bySeat(members).find((member) => member.userId !== leavingId)?.userId ??
  null;

export const startBlocker = (
  members: { ready: boolean }[]
): "NEED_TWO_PLAYERS" | "PLAYERS_NOT_READY" | null => {
  if (members.length < MIN_DRAFTERS) return "NEED_TWO_PLAYERS";
  if (members.some((member) => !member.ready)) return "PLAYERS_NOT_READY";
  return null;
};

export const isAbandoned = (
  lobby: { status: LobbyStatus; createdAt: number },
  now: number
): boolean => {
  const age = now - lobby.createdAt;
  if (lobby.status === "open") return age > OPEN_LOBBY_LIFETIME;
  if (lobby.status === "generating" || lobby.status === "drafting")
    return age > DRAFT_LIFETIME;
  return false;
};

export const parseText = (raw: string, maxLength: number): string | null => {
  const text = raw.trim();
  return text.length >= 1 && text.length <= maxLength ? text : null;
};
