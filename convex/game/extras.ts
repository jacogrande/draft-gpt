export const MAX_TOKEN_NAME_LENGTH = 40;
export const MAX_COUNTER_VALUE_LENGTH = 4;
export const LOG_LENGTH = 100;

export const COUNTER_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export const parseTokenName = (raw: string): string | null => {
  const name = raw.trim();
  return name.length >= 1 && name.length <= MAX_TOKEN_NAME_LENGTH ? name : null;
};

export const parseCounterValue = (raw: string): string | null =>
  raw.length <= MAX_COUNTER_VALUE_LENGTH ? raw : null;

export const parseLife = (life: number): number | null =>
  Number.isInteger(life) && Math.abs(life) <= 9999 ? life : null;
