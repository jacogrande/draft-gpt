import { currentPack, Passing } from "./passing";

export const RECONNECT_WINDOW_MS = 2 * 60_000;

export type Countdown = { deadline: number | null; remainingMs: number | null };

export const startCountdown = (now: number): Countdown => ({
  deadline: now + RECONNECT_WINDOW_MS,
  remainingMs: null,
});

export const hasRunOut = (countdown: Countdown, now: number): boolean =>
  countdown.deadline !== null && countdown.deadline <= now;

export const pauseCountdown = (
  countdown: Countdown,
  now: number
): Countdown | null =>
  countdown.deadline === null || hasRunOut(countdown, now)
    ? null
    : { deadline: null, remainingMs: countdown.deadline - now };

export const resumeCountdown = (
  countdown: Countdown,
  now: number
): Countdown | null =>
  countdown.remainingMs === null
    ? null
    : { deadline: now + countdown.remainingMs, remainingMs: null };

export const skipCountdown = (now: number): Countdown => ({
  deadline: now,
  remainingMs: null,
});

export const nextAutoPick = <P extends Passing<U>, U>(
  packs: P[],
  participants: U[],
  away: U[],
  ranOut: U[]
): P | null => {
  if (participants.every((userId) => away.includes(userId))) return null;
  for (const userId of ranOut) {
    const pack = currentPack(packs, userId);
    if (pack) return pack;
  }
  return null;
};

export const pickAtRandom = <C>(cards: C[], random: () => number): C | null =>
  cards[Math.floor(random() * cards.length)] ?? null;
