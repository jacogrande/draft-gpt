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
  | "NOT_AWAY"
  | "TIMER_NOT_RUNNING"
  | "TIMER_NOT_PAUSED"
  | "DECK_NOT_FOUND"
  | "CARD_NOT_IN_DECK"
  | "INVALID_GAME_CODE"
  | "GAME_NOT_FOUND"
  | "NOT_A_PLAYER"
  | "GAME_NOT_OPEN"
  | "GAME_NOT_STARTED"
  | "INVALID_LIFE_TOTAL"
  | "INVALID_TOKEN"
  | "INVALID_COUNTER"
  | "PIECE_NOT_FOUND";

export function reject(code: RejectionCode): never {
  throw new ConvexError({ code });
}
