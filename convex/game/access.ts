import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { reject } from "../errors";
import { findViewer, requireViewer } from "../identity/viewer";
import { playRefusal } from "./seats";

type Ctx = QueryCtx | MutationCtx;

export const normalizeGameId = (ctx: Ctx, rawId: string) =>
  ctx.db.normalizeId("games", rawId);

export const loadPlayers = (ctx: Ctx, gameId: Id<"games">) =>
  ctx.db
    .query("gamePlayers")
    .withIndex("by_game", (q) => q.eq("gameId", gameId))
    .collect();

export const findPlayer = (
  ctx: Ctx,
  gameId: Id<"games">,
  userId: Id<"users">
) =>
  ctx.db
    .query("gamePlayers")
    .withIndex("by_game_user", (q) =>
      q.eq("gameId", gameId).eq("userId", userId)
    )
    .unique();

export const requirePlayer = async (ctx: Ctx, gameId: Id<"games">) => {
  const userId = await requireViewer(ctx);
  const game = (await ctx.db.get(gameId)) ?? reject("GAME_NOT_FOUND");
  const player =
    (await findPlayer(ctx, gameId, userId)) ?? reject("NOT_A_PLAYER");
  return { userId, game, player };
};

export const requireSide = async (ctx: Ctx, gameId: Id<"games">) => {
  const access = await requirePlayer(ctx, gameId);
  const refusal = playRefusal(access.game.status);
  if (refusal) reject(refusal);
  if (!access.player.side) return reject("GAME_NOT_STARTED");
  return { ...access, side: access.player.side };
};

export const viewAsPlayer = async (ctx: QueryCtx, rawId: string) => {
  const gameId = normalizeGameId(ctx, rawId);
  const userId = gameId && (await findViewer(ctx));
  const game = userId && (await ctx.db.get(gameId));
  const player = game && (await findPlayer(ctx, gameId, userId));
  return player ? { userId, gameId, game, player } : null;
};

export type Seat = Doc<"gamePlayers">;
