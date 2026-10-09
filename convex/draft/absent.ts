import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export const loadAbsences = (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">
) =>
  ctx.db
    .query("absences")
    .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
    .collect();

export const findAbsence = async (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">,
  userId: Id<"users">
) =>
  (await loadAbsences(ctx, lobbyId)).find(
    (absence) => absence.userId === userId
  ) ?? null;

export const watchParticipant = (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  userId: Id<"users">,
  delay: number
) =>
  ctx.scheduler.runAfter(delay, internal.draft.absences.watch, {
    lobbyId: lobby._id,
    userId,
    round: lobby.round,
  });
