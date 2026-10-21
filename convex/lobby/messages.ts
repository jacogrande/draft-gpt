import { supportBy } from "./worldbuilding";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { requireMember, viewAsMember } from "./access";
import { loadMessages } from "./ideas";
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_LOBBY,
  parseText,
  rosterBlocker,
} from "./roster";

export const post = mutation({
  args: { lobbyId: v.id("lobbies"), text: v.string() },
  handler: async (ctx, args) => {
    const { userId, lobby } = await requireMember(ctx, args.lobbyId);
    const blocker = rosterBlocker(lobby.status);
    if (blocker) reject(blocker);
    const text =
      parseText(args.text, MAX_MESSAGE_LENGTH) ?? reject("INVALID_MESSAGE");
    const posted = await loadMessages(ctx, args.lobbyId);
    if (posted.length >= MAX_MESSAGES_PER_LOBBY) reject("TOO_MANY_MESSAGES");
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
    const view = await viewAsMember(ctx, lobbyId);
    if (!view) return [];
    const messages = await loadMessages(ctx, lobbyId);
    return messages.map((message, index) => ({
      sourceId: `m${index + 1}`,
      supportCount: new Set(message.supportedBy ?? []).size,
      selected: (message.supportedBy ?? []).includes(view.userId),
      id: message._id,
      userId: message.userId,
      text: message.text,
    }));
  },
});

export const support = mutation({
  args: { lobbyId: v.id("lobbies"), messageId: v.id("lobbyMessages"), use: v.boolean() },
  handler: async (ctx, { lobbyId, messageId, use }) => {
    const { userId, lobby } = await requireMember(ctx, lobbyId);
    const blocker = rosterBlocker(lobby.status);
    if (blocker) reject(blocker);
    const message = await ctx.db.get(messageId);
    if (!message || message.lobbyId !== lobbyId) reject("INVALID_MESSAGE");
    await ctx.db.patch(messageId, { supportedBy: supportBy(message.supportedBy ?? [], userId, use) });
  },
});
