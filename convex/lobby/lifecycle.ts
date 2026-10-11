import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export const isLive = (
  lobby: Doc<"lobbies"> | null | undefined
): lobby is Doc<"lobbies"> => !!lobby && lobby.status !== "closed";

export const beginDraft = (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  participantIds: Id<"users">[]
) => ctx.db.patch(lobbyId, { status: "generating", participantIds });

export const markGenerating = (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  round: number
) => ctx.db.patch(lobbyId, { status: "generating", round });

export const markDrafting = (ctx: MutationCtx, lobbyId: Id<"lobbies">) =>
  ctx.db.patch(lobbyId, { status: "drafting" });

export const markComplete = (ctx: MutationCtx, lobbyId: Id<"lobbies">) =>
  ctx.db.patch(lobbyId, { status: "complete" });

export const attachSetting = (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  settingId: Id<"settings">
) => ctx.db.patch(lobbyId, { settingId });

export const trackSettingJob = (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  settingJobId: Id<"_scheduled_functions">,
  settingKey: string
) => ctx.db.patch(lobbyId, { settingJobId, settingKey });

export const reportGenerationError = (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  generationError: string | undefined
) => ctx.db.patch(lobbyId, { generationError });
