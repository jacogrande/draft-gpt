import { withDesignArt } from "../draft/presentation";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, MutationCtx, query } from "../_generated/server";
import { reject } from "../errors";
import { displayName } from "../identity/username";
import { findViewer, requireViewer } from "../identity/viewer";
import {
  loadPlayers,
  normalizeGameId,
  requirePlayer,
  viewAsPlayer,
} from "./access";
import { record } from "./log";
import {
  closesWhenEmpty,
  decideSeat,
  freshCode,
  parseCode,
  STARTING_LIFE,
} from "./seats";
import { sideShownTo } from "./table";

const LIVE_STATUSES = ["open", "playing"] as const;

const liveCodes = async (ctx: MutationCtx) => {
  const codes: string[] = [];
  for (const status of LIVE_STATUSES) {
    const games = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
    codes.push(...games.map((game) => game.code));
  }
  return codes;
};

const seat = async (
  ctx: MutationCtx,
  gameId: Id<"games">,
  userId: Id<"users">,
  seat: number
) => {
  await ctx.db.insert("gamePlayers", {
    gameId,
    userId,
    seat,
    life: STARTING_LIFE,
    side: null,
  });
  await record(ctx, gameId, userId, ["joined"]);
};

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireViewer(ctx);
    const code = freshCode(await liveCodes(ctx), Math.random);
    const gameId = await ctx.db.insert("games", { code, status: "open" });
    await seat(ctx, gameId, userId, 0);
    return gameId;
  },
});

export const join = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const userId = await requireViewer(ctx);
    const game = (await ctx.db.get(gameId)) ?? reject("GAME_NOT_FOUND");
    const decision = decideSeat(
      game.status,
      await loadPlayers(ctx, gameId),
      userId
    );
    if (decision.kind === "seated") {
      await seat(ctx, gameId, userId, decision.seat);
    }
    return decision;
  },
});

export const leave = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const { userId, game, player } = await requirePlayer(ctx, gameId);
    if (game.status !== "open") reject("GAME_NOT_OPEN");
    await ctx.db.delete(player._id);
    await record(ctx, gameId, userId, ["left"]);
    if (closesWhenEmpty(await loadPlayers(ctx, gameId))) {
      await ctx.db.patch(gameId, { status: "closed", closedAt: Date.now() });
    }
  },
});

export const findByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = parseCode(args.code);
    if (!code || !(await findViewer(ctx))) return null;
    const games = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code))
      .order("desc")
      .collect();
    return games.find((game) => game.status !== "closed")?._id ?? null;
  },
});

export const get = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const gameId = normalizeGameId(ctx, args.gameId);
    const viewerId = gameId && (await findViewer(ctx));
    const game = viewerId && (await ctx.db.get(gameId));
    if (!game) return null;
    const seats = await loadPlayers(ctx, gameId);
    const isPlayer = seats.some((seat) => seat.userId === viewerId);
    const players = await Promise.all(
      seats
        .sort((a, b) => a.seat - b.seat)
        .map(async (seat) => {
          const visible = sideShownTo(seat.side, {
            isPlayer,
            isOwner: seat.userId === viewerId,
          });
          const side = visible
            ? {
                ...visible,
                hand: visible.hand
                  ? await withDesignArt(ctx, visible.hand)
                  : null,
                battlefield: await withDesignArt(ctx, visible.battlefield),
                graveyard: await withDesignArt(ctx, visible.graveyard),
              }
            : null;
          return {
            userId: seat.userId,
            username: displayName((await ctx.db.get(seat.userId)) ?? {}),
            seat: seat.seat,
            life: seat.life,
            ready: seat.side !== null,
            side,
          };
        })
    );
    return {
      id: game._id,
      code: game.code,
      status: game.status,
      viewerId,
      players,
    };
  },
});

export const extras = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const view = await viewAsPlayer(ctx, args.gameId);
    if (!view) return { tokens: [], counters: [] };
    const { gameId } = view;
    const tokens = await ctx.db
      .query("gameTokens")
      .withIndex("by_game", (q) => q.eq("gameId", gameId))
      .collect();
    const counters = await ctx.db
      .query("gameCounters")
      .withIndex("by_game", (q) => q.eq("gameId", gameId))
      .collect();
    return {
      tokens: tokens.map((token) => ({
        id: token._id,
        ownerId: token.ownerId,
        name: token.name,
        power: token.power,
        toughness: token.toughness,
        tapped: token.tapped,
        position: token.position,
      })),
      counters: counters.map((counter) => ({
        id: counter._id,
        ownerId: counter.ownerId,
        value: counter.value,
        color: counter.color,
        position: counter.position,
        positionSpace: counter.positionSpace,
      })),
    };
  },
});
