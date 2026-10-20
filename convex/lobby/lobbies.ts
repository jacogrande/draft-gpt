import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { displayName } from "../identity/username";
import { findViewer, requireViewer } from "../identity/viewer";
import { powerLevel, powerLevelOf } from "../powerLevel";
import {
  findMembership,
  loadLobby,
  loadMembers,
  requireHost,
  requireMember,
} from "./access";
import { removeMembership } from "./departure";
import {
  bySeat,
  decideJoin,
  leaveBlocker,
  MAX_LOBBY_NAME_LENGTH,
  parseText,
  planPowerChange,
  rosterBlocker,
} from "./roster";

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireViewer(ctx);
    const name =
      parseText(args.name, MAX_LOBBY_NAME_LENGTH) ??
      reject("INVALID_LOBBY_NAME");
    const lobbyId = await ctx.db.insert("lobbies", {
      name,
      powerLevel: "default",
      hostId: userId,
      status: "open",
      round: 0,
    });
    await ctx.db.insert("lobbyMembers", {
      lobbyId,
      userId,
      seat: 0,
      ready: false,
    });
    return lobbyId;
  },
});

export const join = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const userId = await requireViewer(ctx);
    const lobby = await loadLobby(ctx, lobbyId);
    const members = await loadMembers(ctx, lobbyId);
    const decision = decideJoin(lobby.status, members, userId);
    if (decision.kind === "seated") {
      await ctx.db.insert("lobbyMembers", {
        lobbyId,
        userId,
        seat: decision.seat,
        ready: false,
      });
    }
    return decision;
  },
});

export const leave = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { lobby, membership } = await requireMember(ctx, lobbyId);
    const blocker = leaveBlocker(lobby.status);
    if (blocker) reject(blocker);
    await removeMembership(ctx, lobby, membership);
  },
});

export const removeMember = mutation({
  args: { lobbyId: v.id("lobbies"), userId: v.id("users") },
  handler: async (ctx, { lobbyId, userId }) => {
    const { lobby } = await requireHost(ctx, lobbyId);
    const blocker = rosterBlocker(lobby.status);
    if (blocker) reject(blocker);
    const membership =
      (await findMembership(ctx, lobbyId, userId)) ?? reject("NOT_A_MEMBER");
    await removeMembership(ctx, lobby, membership);
  },
});

export const setReady = mutation({
  args: { lobbyId: v.id("lobbies"), ready: v.boolean() },
  handler: async (ctx, { lobbyId, ready }) => {
    const { lobby, membership } = await requireMember(ctx, lobbyId);
    const blocker = rosterBlocker(lobby.status);
    if (blocker) reject(blocker);
    await ctx.db.patch(membership._id, { ready });
  },
});

export const get = query({
  args: { lobbyId: v.string() },
  handler: async (ctx, args) => {
    const viewerId = await findViewer(ctx);
    const lobbyId = ctx.db.normalizeId("lobbies", args.lobbyId);
    const lobby = viewerId && lobbyId && (await ctx.db.get(lobbyId));
    if (!lobby) return null;
    const outline = {
      id: lobby._id,
      name: lobby.name,
      hostId: lobby.hostId,
      status: lobby.status,
      round: lobby.round,
      powerLevel: powerLevelOf(lobby.powerLevel),
      viewerId,
    };
    const membership = await findMembership(ctx, lobby._id, viewerId);
    if (!membership) return { ...outline, generationError: null, members: [] };
    const members = await Promise.all(
      bySeat(await loadMembers(ctx, lobby._id)).map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          userId: member.userId,
          username: displayName(user ?? {}),
          seat: member.seat,
          ready: member.ready,
        };
      })
    );
    return {
      ...outline,
      generationError: lobby.generationError ?? null,
      members,
    };
  },
});

export const setPowerLevel = mutation({
  args: { lobbyId: v.id("lobbies"), powerLevel },
  handler: async (ctx, args) => {
    const { lobby } = await requireHost(ctx, args.lobbyId);
    const change = planPowerChange(lobby.status, lobby.powerLevel, args.powerLevel);
    if (change === "LOBBY_NOT_OPEN") reject(change);
    if (change === "unchanged") return;
    await ctx.db.patch(lobby._id, { powerLevel: args.powerLevel });
    for (const member of await loadMembers(ctx, lobby._id))
      if (member.ready) await ctx.db.patch(member._id, { ready: false });
  },
});

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    if (!(await findViewer(ctx))) return [];
    const lobbies = await ctx.db
      .query("lobbies")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    return Promise.all(
      lobbies.map(async (lobby) => ({
        id: lobby._id,
        name: lobby.name,
        memberCount: (await loadMembers(ctx, lobby._id)).length,
      }))
    );
  },
});
