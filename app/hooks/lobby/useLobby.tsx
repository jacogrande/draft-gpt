import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams } from "@remix-run/react";
import { useQuery } from "convex/react";

export const useLobbyId = () => useParams().lobbyId as Id<"lobbies">;

export const useLobby = () =>
  useQuery(api.lobby.lobbies.get, { lobbyId: useLobbyId() });

export type LobbyView = NonNullable<ReturnType<typeof useLobby>>;
export type LobbyMember = LobbyView["members"][number];

export const isHost = (lobby: LobbyView) => lobby.hostId === lobby.viewerId;

export const viewerMember = (lobby: LobbyView) =>
  lobby.members.find((member) => member.userId === lobby.viewerId) ?? null;
