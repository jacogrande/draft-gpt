import { ConvexError } from "convex/values";

export type RejectionCode =
  | "UNAUTHENTICATED"
  | "INVALID_USERNAME"
  | "INVALID_LOBBY_NAME"
  | "INVALID_MESSAGE"
  | "LOBBY_NOT_FOUND"
  | "NOT_A_MEMBER"
  | "NOT_THE_HOST"
  | "LOBBY_NOT_OPEN"
  | "NEED_TWO_PLAYERS"
  | "PLAYERS_NOT_READY"
  | "NOT_DRAFTING"
  | "CARD_NOT_AVAILABLE"
  | "NOT_YOUR_PACK"
  | "NOTHING_TO_RETRY"
  | "DECK_NOT_FOUND"
  | "CARD_NOT_IN_DECK";

export function reject(code: RejectionCode): never {
  throw new ConvexError({ code });
}
