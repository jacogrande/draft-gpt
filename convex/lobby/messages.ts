import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { requireMember, viewAsMember } from "./access";
import { MAX_MESSAGE_LENGTH, parseText } from "./roster";

export const post = mutation({
  args: { lobbyId: v.id("lobbies"), text: v.string() },
  handler: async (ctx, args) => {
    const { userId, lobby } = await requireMember(ctx, args.lobbyId);
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    const text =
      parseText(args.text, MAX_MESSAGE_LENGTH) ?? reject("INVALID_MESSAGE");
    await ctx.db.insert("lobbyMessages", {
      lobbyId: args.lobbyId,
      userId,
      text,
    });
  },
});

export const list = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    if (!(await viewAsMember(ctx, lobbyId))) return [];
    const messages = await ctx.db
      .query("lobbyMessages")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .collect();
    return messages.map((message) => ({
      id: message._id,
      userId: message.userId,
      text: message.text,
    }));
  },
});
