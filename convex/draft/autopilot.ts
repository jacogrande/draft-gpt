import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { hasRunOut, nextAutoPick, pickAtRandom } from "./absence";
import { loadAbsences } from "./absent";
import { takeCard, unpickedCards } from "./picking";
import { roundPacks } from "./rounds";

const PICKS_PER_RUN = 20;

const pickForAbsentee = async (ctx: MutationCtx, lobbyId: Id<"lobbies">) => {
  const lobby = await ctx.db.get(lobbyId);
  if (lobby?.status !== "drafting") return false;
  const absences = await loadAbsences(ctx, lobbyId);
  const now = Date.now();
  const packs = await roundPacks(ctx, lobbyId, lobby.round);
  const pack = nextAutoPick(
    packs,
    lobby.participantIds ?? [],
    absences.map((absence) => absence.userId),
    absences
      .filter((absence) => hasRunOut(absence, now))
      .map((absence) => absence.userId)
  );
  const card =
    pack && pickAtRandom(await unpickedCards(ctx, pack._id), Math.random);
  if (!pack?.holderId || !card) return false;
  await takeCard(ctx, lobby, packs, pack, card, pack.holderId);
  return true;
};

export const runAutopilot = async (ctx: MutationCtx, lobbyId: Id<"lobbies">) => {
  for (let picks = 0; picks < PICKS_PER_RUN; picks++) {
    if (!(await pickForAbsentee(ctx, lobbyId))) return;
  }
  await ctx.scheduler.runAfter(0, internal.draft.absences.autopilot, {
    lobbyId,
  });
};
