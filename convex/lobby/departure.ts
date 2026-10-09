import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { loadMembers } from "./access";
import { successor } from "./roster";
import { findSighting } from "./sightings";

export const removeMembership = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  membership: Doc<"lobbyMembers">
) => {
  const members = await loadMembers(ctx, lobby._id);
  await ctx.db.delete(membership._id);

  const presence = await findSighting(ctx, lobby._id, membership.userId);
  if (presence) await ctx.db.delete(presence._id);

  const nextHostId = successor(members, membership.userId);
  if (nextHostId === null) {
    await ctx.db.patch(lobby._id, { status: "closed", closedAt: Date.now() });
  } else if (lobby.hostId === membership.userId) {
    await ctx.db.patch(lobby._id, { hostId: nextHostId });
  }
};
