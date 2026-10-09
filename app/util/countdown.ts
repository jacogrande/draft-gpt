type Countdown = { deadline: number | null; remainingMs: number | null };

export const msLeft = (countdown: Countdown, now: number): number =>
  Math.max(0, countdown.remainingMs ?? (countdown.deadline ?? now) - now);

export const formatCountdown = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
