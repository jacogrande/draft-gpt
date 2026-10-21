import { conversationSnapshot } from "./worldbuilding";
import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { selectIdeas } from "./roster";

export const loadMessages = (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">
) =>
  ctx.db
    .query("lobbyMessages")
    .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
    .collect();

export const listIdeas = async (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">
): Promise<string[]> =>
  selectIdeas((await loadMessages(ctx, lobbyId)).map((message) => message.text));

export const snapshotConversation = async (ctx: QueryCtx | MutationCtx, lobbyId: Id<"lobbies">) =>
  conversationSnapshot(await loadMessages(ctx, lobbyId));
