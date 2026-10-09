import { expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/!(*.*.*)*.*s");

export const startBackend = () => convexTest(schema, modules);

export type Backend = ReturnType<typeof startBackend>;

export const signIn = async (backend: Backend, username: string) => {
  const userId = await backend.run((ctx) =>
    ctx.db.insert("users", { username })
  );
  return {
    userId,
    as: backend.withIdentity({ subject: `${userId}|test-session` }),
  };
};

export type Player = Awaited<ReturnType<typeof signIn>>;

export const openLobby = async (backend: Backend, usernames: string[]) => {
  const players: Player[] = [];
  for (const username of usernames) players.push(await signIn(backend, username));
  const [host, ...guests] = players;
  const lobbyId: Id<"lobbies"> = await host.as.mutation(
    api.lobby.lobbies.create,
    { name: "tattered-kithkin" }
  );
  for (const guest of guests) {
    await guest.as.mutation(api.lobby.lobbies.join, { lobbyId });
  }
  return { lobbyId, players };
};

export const readyEveryone = async (
  lobbyId: Id<"lobbies">,
  players: Player[]
) => {
  for (const player of players) {
    await player.as.mutation(api.lobby.lobbies.setReady, {
      lobbyId,
      ready: true,
    });
  }
};

export const rejection = (code: string) =>
  expect.objectContaining({ data: { code } });
