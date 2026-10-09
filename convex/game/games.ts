import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { displayName } from "../identity/username";
import { findViewer, requireViewer } from "../identity/viewer";
import { loadPlayers, requirePlayer, viewAsPlayer } from "./access";
import { decideSeat, parseCode, STARTING_LIFE } from "./seats";
import { sideSeenBy } from "./table";

export const create = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireViewer(ctx);
    const code = parseCode(args.code) ?? reject("INVALID_GAME_CODE");
    const gameId = await ctx.db.insert("games", { code, status: "open" });
    await ctx.db.insert("gamePlayers", {
      gameId,
      userId,
      seat: 0,
      life: STARTING_LIFE,
      side: null,
    });
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
      await ctx.db.insert("gamePlayers", {
        gameId,
        userId,
        seat: decision.seat,
        life: STARTING_LIFE,
        side: null,
      });
    }
    return decision;
  },
});

export const leave = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const { game, player } = await requirePlayer(ctx, gameId);
    if (game.status !== "open") reject("GAME_NOT_OPEN");
    await ctx.db.delete(player._id);
    if ((await loadPlayers(ctx, gameId)).length === 0) {
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
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const viewerId = await findViewer(ctx);
    const game = viewerId && (await ctx.db.get(gameId));
    if (!game) return null;
    const seats = await loadPlayers(ctx, gameId);
    const isPlayer = seats.some((seat) => seat.userId === viewerId);
    const players = await Promise.all(
      seats
        .sort((a, b) => a.seat - b.seat)
        .map(async (seat) => ({
          userId: seat.userId,
          username: displayName((await ctx.db.get(seat.userId)) ?? {}),
          seat: seat.seat,
          life: seat.life,
          ready: seat.side !== null,
          side:
            seat.side && isPlayer
              ? sideSeenBy(seat.side, seat.userId === viewerId)
              : null,
        }))
    );
    return { id: game._id, code: game.code, status: game.status, viewerId, players };
  },
});

export const extras = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    if (!(await viewAsPlayer(ctx, gameId))) return { tokens: [], counters: [] };
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
      })),
      counters: counters.map((counter) => ({
        id: counter._id,
        ownerId: counter.ownerId,
        value: counter.value,
        color: counter.color,
        position: counter.position,
      })),
    };
  },
});
