import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export const findSighting = (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">,
  userId: Id<"users">
) =>
  ctx.db
    .query("lobbyPresence")
    .withIndex("by_lobby_user", (q) =>
      q.eq("lobbyId", lobbyId).eq("userId", userId)
    )
    .unique();
