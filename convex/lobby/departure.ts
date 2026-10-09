import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { loadMembers } from "./access";
import { successor } from "./roster";

export const removeMembership = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  membership: Doc<"lobbyMembers">
) => {
  const members = await loadMembers(ctx, lobby._id);
  await ctx.db.delete(membership._id);

  const presence = await ctx.db
    .query("lobbyPresence")
    .withIndex("by_lobby_user", (q) =>
      q.eq("lobbyId", lobby._id).eq("userId", membership.userId)
    )
    .unique();
  if (presence) await ctx.db.delete(presence._id);

  const nextHostId = successor(members, membership.userId);
  if (nextHostId === null) {
    await ctx.db.patch(lobby._id, { status: "closed", closedAt: Date.now() });
  } else if (lobby.hostId === membership.userId) {
    await ctx.db.patch(lobby._id, { hostId: nextHostId });
  }
};
