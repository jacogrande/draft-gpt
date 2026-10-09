export const AWAY_AFTER_MS = 60_000;

export const awayAt = (lastSeenAt: number | null): number =>
  (lastSeenAt ?? 0) + AWAY_AFTER_MS;
