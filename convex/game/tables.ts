import { defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { cardFace } from "../card";

export const gameStatus = v.union(
  v.literal("open"),
  v.literal("playing"),
  v.literal("closed")
);

export const gameCard = v.object({
  id: v.string(),
  tapped: v.boolean(),
  ...cardFace,
});

export type GameCard = Infer<typeof gameCard>;

export const zone = v.union(
  v.literal("library"),
  v.literal("hand"),
  v.literal("battlefield"),
  v.literal("graveyard")
);

const cards = v.array(gameCard);

export const gameTables = {
  games: defineTable({
    code: v.string(),
    status: gameStatus,
    closedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"]),

  gamePlayers: defineTable({
    gameId: v.id("games"),
    userId: v.id("users"),
    seat: v.number(),
    life: v.number(),
    side: v.union(
      v.object({
        library: cards,
        hand: cards,
        battlefield: cards,
        graveyard: cards,
      }),
      v.null()
    ),
  })
    .index("by_game", ["gameId"])
    .index("by_game_user", ["gameId", "userId"]),

  gameTokens: defineTable({
    gameId: v.id("games"),
    ownerId: v.id("users"),
    name: v.string(),
    power: v.union(v.number(), v.null()),
    toughness: v.union(v.number(), v.null()),
    tapped: v.boolean(),
  }).index("by_game", ["gameId"]),

  gameCounters: defineTable({
    gameId: v.id("games"),
    ownerId: v.id("users"),
    value: v.string(),
    color: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
  }).index("by_game", ["gameId"]),

  gameLog: defineTable({
    gameId: v.id("games"),
    userId: v.id("users"),
    message: v.string(),
  }).index("by_game", ["gameId"]),

  gamePresence: defineTable({
    gameId: v.id("games"),
    userId: v.id("users"),
    lastSeenAt: v.number(),
  })
    .index("by_game", ["gameId"])
    .index("by_game_user", ["gameId", "userId"]),
};
