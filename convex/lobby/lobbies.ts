import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { displayName } from "../identity/username";
import { findViewer, requireViewer } from "../identity/viewer";
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
  MAX_LOBBY_NAME_LENGTH,
  parseText,
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
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    await removeMembership(ctx, lobby, membership);
  },
});

export const removeMember = mutation({
  args: { lobbyId: v.id("lobbies"), userId: v.id("users") },
  handler: async (ctx, { lobbyId, userId }) => {
    const { lobby } = await requireHost(ctx, lobbyId);
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    const membership =
      (await findMembership(ctx, lobbyId, userId)) ?? reject("NOT_A_MEMBER");
    await removeMembership(ctx, lobby, membership);
  },
});

export const setReady = mutation({
  args: { lobbyId: v.id("lobbies"), ready: v.boolean() },
  handler: async (ctx, { lobbyId, ready }) => {
    const { lobby, membership } = await requireMember(ctx, lobbyId);
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    await ctx.db.patch(membership._id, { ready });
  },
});

export const get = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const viewerId = await findViewer(ctx);
    const lobby = viewerId && (await ctx.db.get(lobbyId));
    if (!lobby) return null;
    const members = await Promise.all(
      bySeat(await loadMembers(ctx, lobbyId)).map(async (member) => {
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
      id: lobby._id,
      name: lobby.name,
      hostId: lobby.hostId,
      status: lobby.status,
      round: lobby.round,
      generationError: lobby.generationError ?? null,
      members,
      viewerId,
    };
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
