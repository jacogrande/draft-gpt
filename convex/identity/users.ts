import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { parseUsername } from "./username";
import { requireViewer } from "./viewer";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId && (await ctx.db.get(userId));
    if (!user) return null;
    return {
      id: user._id,
      username: user.username ?? null,
      suggestedUsername: user.name ?? "",
      email: user.email ?? "",
    };
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireViewer(ctx);
    const username = parseUsername(args.username) ?? reject("INVALID_USERNAME");
    await ctx.db.patch(userId, { username });
  },
});
