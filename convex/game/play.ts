import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { reject } from "../errors";
import { requirePlayer, requireSide } from "./access";
import { parseLife } from "./extras";
import { record } from "./log";
import {
  describeMove,
  draw as drawFrom,
  moveCards as move,
  shuffleLibrary,
  toggleTapped,
  untapAll as untap,
} from "./table";
import { zone } from "./tables";

export const moveCards = mutation({
  args: { gameId: v.id("games"), cardIds: v.array(v.string()), to: zone },
  handler: async (ctx, { gameId, cardIds, to }) => {
    const { userId, player, side } = await requireSide(ctx, gameId);
    const moved = move(side, cardIds, to);
    await ctx.db.patch(player._id, { side: moved.side });
    await record(ctx, gameId, userId, moved.moves.map(describeMove));
  },
});

export const tapCards = mutation({
  args: { gameId: v.id("games"), cardIds: v.array(v.string()) },
  handler: async (ctx, { gameId, cardIds }) => {
    const { userId, player, side } = await requireSide(ctx, gameId);
    const turned = toggleTapped(side, cardIds);
    await ctx.db.patch(player._id, { side: turned.side });
    await record(
      ctx,
      gameId,
      userId,
      turned.toggled.map(
        (card) => `${card.tapped ? "tapped" : "untapped"} ${card.name}`
      )
    );
  },
});

export const untapAll = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const { userId, player, side } = await requireSide(ctx, gameId);
    const result = untap(side);
    await ctx.db.patch(player._id, { side: result.side });
    await record(
      ctx,
      gameId,
      userId,
      result.untapped.map((card) => `untapped ${card.name}`)
    );
  },
});

export const draw = mutation({
  args: { gameId: v.id("games"), amount: v.number() },
  handler: async (ctx, { gameId, amount }) => {
    const { userId, player, side } = await requireSide(ctx, gameId);
    const result = drawFrom(side, amount);
    await ctx.db.patch(player._id, { side: result.side });
    const cards = result.drawn === 1 ? "card" : "cards";
    await record(ctx, gameId, userId, [`drew ${result.drawn} ${cards}`]);
  },
});

export const shuffle = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const { userId, player, side } = await requireSide(ctx, gameId);
    await ctx.db.patch(player._id, { side: shuffleLibrary(side, Math.random) });
    await record(ctx, gameId, userId, ["shuffled"]);
  },
});

export const setLife = mutation({
  args: { gameId: v.id("games"), life: v.number() },
  handler: async (ctx, { gameId, life }) => {
    const { player } = await requirePlayer(ctx, gameId);
    await ctx.db.patch(player._id, {
      life: parseLife(life) ?? reject("INVALID_LIFE_TOTAL"),
    });
  },
});
