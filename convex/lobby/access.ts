import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { reject } from "../errors";
import { findViewer, requireViewer } from "../identity/viewer";

type Ctx = QueryCtx | MutationCtx;

export const loadLobby = async (
  ctx: Ctx,
  lobbyId: Id<"lobbies">
): Promise<Doc<"lobbies">> =>
  (await ctx.db.get(lobbyId)) ?? reject("LOBBY_NOT_FOUND");

export const loadMembers = (ctx: Ctx, lobbyId: Id<"lobbies">) =>
  ctx.db
    .query("lobbyMembers")
    .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
    .collect();

export const findMembership = (
  ctx: Ctx,
  lobbyId: Id<"lobbies">,
  userId: Id<"users">
) =>
  ctx.db
    .query("lobbyMembers")
    .withIndex("by_lobby_user", (q) =>
      q.eq("lobbyId", lobbyId).eq("userId", userId)
    )
    .unique();

export const requireMember = async (ctx: Ctx, lobbyId: Id<"lobbies">) => {
  const userId = await requireViewer(ctx);
  const lobby = await loadLobby(ctx, lobbyId);
  const membership =
    (await findMembership(ctx, lobbyId, userId)) ?? reject("NOT_A_MEMBER");
  return { userId, lobby, membership };
};

export const viewAsMember = async (ctx: QueryCtx, lobbyId: Id<"lobbies">) => {
  const userId = await findViewer(ctx);
  const lobby = userId && (await ctx.db.get(lobbyId));
  const membership = lobby && (await findMembership(ctx, lobbyId, userId));
  return membership ? { userId, lobby, membership } : null;
};

export const requireHost = async (ctx: Ctx, lobbyId: Id<"lobbies">) => {
  const access = await requireMember(ctx, lobbyId);
  if (access.lobby.hostId !== access.userId) reject("NOT_THE_HOST");
  return access;
};
