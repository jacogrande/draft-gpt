export const MAX_ATTEMPTS = 4;

const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60_000;
const JITTER = 0.25;

export class UpstreamFailure extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterMs: number | null,
    provider = "OpenAI"
  ) {
    super(`${provider} responded ${status}`);
  }
}

export const parseRetryAfter = (
  header: string | null,
  now = Date.now()
): number | null => {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(header);
  return Number.isNaN(at) ? null : Math.max(0, at - now);
};

export const retryDelay = (
  attempt: number,
  retryAfterMs = 0,
  random: () => number = Math.random
): number | null => {
  if (attempt >= MAX_ATTEMPTS) return null;
  const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);
  const wait = Math.max(backoff, retryAfterMs) * (1 + random() * JITTER);
  return Math.min(MAX_DELAY_MS, Math.round(wait));
};

export const retryAdvice = (error: unknown): number | undefined =>
  error instanceof UpstreamFailure && error.retryAfterMs !== null
    ? error.retryAfterMs
    : undefined;

export const failureMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Generation failed";

export const generationKey = (random: () => number = Math.random): string =>
  Math.floor(random() * 2 ** 48).toString(36) + Date.now().toString(36);
