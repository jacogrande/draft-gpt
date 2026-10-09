export const MAX_ATTEMPTS = 3;

const BASE_DELAY_MS = 2000;

export const retryDelay = (attempt: number): number | null =>
  attempt >= MAX_ATTEMPTS ? null : BASE_DELAY_MS * 2 ** (attempt - 1);

export const failureMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Generation failed";
