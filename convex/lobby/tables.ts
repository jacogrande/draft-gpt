import { defineTable } from "convex/server";
import { v } from "convex/values";

export const lobbyStatus = v.union(
  v.literal("open"),
  v.literal("generating"),
  v.literal("drafting"),
  v.literal("complete"),
  v.literal("closed")
);

export const lobbyTables = {
  lobbies: defineTable({
    name: v.string(),
    hostId: v.id("users"),
    status: lobbyStatus,
    round: v.number(),
    participantIds: v.optional(v.array(v.id("users"))),
    settingId: v.optional(v.id("settings")),
    generationError: v.optional(v.string()),
    closedAt: v.optional(v.number()),
  }).index("by_status", ["status"]),

  lobbyMembers: defineTable({
    lobbyId: v.id("lobbies"),
    userId: v.id("users"),
    seat: v.number(),
    ready: v.boolean(),
  })
    .index("by_lobby", ["lobbyId"])
    .index("by_lobby_user", ["lobbyId", "userId"])
    .index("by_user", ["userId"]),

  lobbyMessages: defineTable({
    lobbyId: v.id("lobbies"),
    userId: v.id("users"),
    text: v.string(),
  }).index("by_lobby", ["lobbyId"]),

  lobbyPresence: defineTable({
    lobbyId: v.id("lobbies"),
    userId: v.id("users"),
    lastSeenAt: v.number(),
  })
    .index("by_lobby", ["lobbyId"])
    .index("by_lobby_user", ["lobbyId", "userId"]),
};
