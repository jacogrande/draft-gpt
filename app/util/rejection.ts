import { ConvexError } from "convex/values";

export const rejectionCode = (error: unknown): string | null =>
  error instanceof ConvexError
    ? (error.data as { code?: string }).code ?? null
    : null;
