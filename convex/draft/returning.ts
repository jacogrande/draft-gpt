import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { AWAY_AFTER_MS } from "../lobby/away";
import { findAbsence, watchParticipant } from "./absent";
import { runAutopilot } from "./autopilot";

export const noteReturn = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  userId: Id<"users">
) => {
  const absence = await findAbsence(ctx, lobby._id, userId);
  if (!absence) return;
  await ctx.db.delete(absence._id);
  if (lobby.status !== "drafting") return;
  await watchParticipant(ctx, lobby, userId, AWAY_AFTER_MS);
  await runAutopilot(ctx, lobby._id);
};
