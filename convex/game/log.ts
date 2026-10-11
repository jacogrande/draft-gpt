import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { MutationCtx, query } from "../_generated/server";
import { viewAsPlayer } from "./access";
import { LOG_LENGTH } from "./extras";

export const record = async (
  ctx: MutationCtx,
  gameId: Id<"games">,
  userId: Id<"users">,
  messages: string[]
) => {
  for (const message of messages) {
    await ctx.db.insert("gameLog", { gameId, userId, message });
  }
};

export const recent = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const view = await viewAsPlayer(ctx, args.gameId);
    if (!view) return [];
    const { gameId } = view;
    const entries = await ctx.db
      .query("gameLog")
      .withIndex("by_game", (q) => q.eq("gameId", gameId))
      .order("desc")
      .take(LOG_LENGTH);
    return entries.reverse().map((entry) => ({
      id: entry._id,
      userId: entry.userId,
      message: entry.message,
    }));
  },
});
