import { pickFace } from "../card";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { markDrafting, markGenerating } from "../lobby/lifecycle";
import { watchParticipant } from "./absent";
import { drawFromPool, topUpCount } from "./passing";
import { scheduleGeneration } from "./scheduling";
import { packOrders } from "./seating";

import { publishRound } from "./setPacks";

export const PACK_STAGGER_MS = 1000;

export const roundPacks = (
  ctx: QueryCtx | MutationCtx,
  lobbyId: Id<"lobbies">,
  round: number
) =>
  ctx.db
    .query("packs")
    .withIndex("by_lobby_round", (q) =>
      q.eq("lobbyId", lobbyId).eq("round", round)
    )
    .collect();

export const dealRound = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  round: number
) => {
  if (lobby.setRunId) {
    const run = await ctx.db.get(lobby.setRunId);
    if (!run) throw new Error("Set is missing");
    await publishRound(ctx, lobby, run, round);
    return;
  }
  await markGenerating(ctx, lobby._id, round);
  const orders = packOrders(lobby.participantIds ?? [], round);
  for (const [index, order] of orders.entries()) {
    const packId = await ctx.db.insert("packs", {
      lobbyId: lobby._id,
      round,
      order,
      position: 0,
      holderId: order[0],
      cardCount: 0,
      ready: false,
    });
    await scheduleGeneration(ctx, index * PACK_STAGGER_MS, lobby._id, packId, 1);
  }
};

export const openRound = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  settingId: Id<"settings">,
  packs: Doc<"packs">[]
) => {
  const pool = await ctx.db
    .query("cards")
    .withIndex("by_setting", (q) => q.eq("settingId", settingId))
    .collect();
  for (const pack of packs) {
    const extras = drawFromPool(pool, topUpCount(pack.cardCount), Math.random);
    for (const extra of extras) {
      await ctx.db.insert("cards", {
        settingId,
        lobbyId: lobby._id,
        packId: pack._id,
        pickedBy: null,
        ...pickFace(extra),
      });
    }
    await ctx.db.patch(pack._id, {
      cardCount: pack.cardCount + extras.length,
    });
  }
  await markDrafting(ctx, lobby._id);
  for (const userId of lobby.participantIds ?? []) {
    await watchParticipant(ctx, lobby, userId, 0);
  }
};
