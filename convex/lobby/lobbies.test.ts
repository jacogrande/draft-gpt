import { afterEach, expect, test, vi } from "vitest";
import {
  openLobby,
  readyEveryone,
  rejection,
  signIn,
  startBackend,
} from "../../tests/backend";
import { api, internal } from "../_generated/api";

afterEach(() => vi.useRealTimers());

const usernames = (count: number) =>
  Array.from({ length: count }, (_, index) => `player-${index}`);

test("members are seated in the order they join", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben", "Cy"]);

  const lobby = await players[0].as.query(api.lobby.lobbies.get, { lobbyId });

  expect(lobby?.members.map((member) => [member.username, member.seat])).toEqual(
    [
      ["Ana", 0],
      ["Ben", 1],
      ["Cy", 2],
    ]
  );
  expect(lobby?.hostId).toBe(players[0].userId);
});

test("rejoining keeps the same seat and ready state", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const ben = players[1];
  await ben.as.mutation(api.lobby.lobbies.setReady, { lobbyId, ready: true });

  const decision = await ben.as.mutation(api.lobby.lobbies.join, { lobbyId });

  expect(decision).toEqual({ kind: "existing", seat: 1 });
  const lobby = await ben.as.query(api.lobby.lobbies.get, { lobbyId });
  expect(lobby?.members).toHaveLength(2);
  expect(lobby?.members[1].ready).toBe(true);
});

test("a ninth player is refused", async () => {
  const backend = startBackend();
  const { lobbyId } = await openLobby(backend, usernames(8));
  const latecomer = await signIn(backend, "ninth");

  const decision = await latecomer.as.mutation(api.lobby.lobbies.join, {
    lobbyId,
  });

  expect(decision).toEqual({ kind: "refused", reason: "full" });
});

test("a freed seat is reused by the next player to join", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben", "Cy"]);
  await players[1].as.mutation(api.lobby.lobbies.leave, { lobbyId });
  const dee = await signIn(backend, "Dee");

  const decision = await dee.as.mutation(api.lobby.lobbies.join, { lobbyId });

  expect(decision).toEqual({ kind: "seated", seat: 1 });
});

test("when the host leaves, the next seat becomes host", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben", "Cy"]);

  await players[0].as.mutation(api.lobby.lobbies.leave, { lobbyId });

  const lobby = await players[1].as.query(api.lobby.lobbies.get, { lobbyId });
  expect(lobby?.hostId).toBe(players[1].userId);
  expect(lobby?.members.map((member) => member.username)).toEqual(["Ben", "Cy"]);
});

test("when the last member leaves, the lobby closes and is no longer listed", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana"]);

  await players[0].as.mutation(api.lobby.lobbies.leave, { lobbyId });

  const lobby = await players[0].as.query(api.lobby.lobbies.get, { lobbyId });
  expect(lobby?.status).toBe("closed");
  expect(await players[0].as.query(api.lobby.lobbies.listOpen, {})).toEqual([]);
});

test("only the host can remove a member", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben", "Cy"]);
  const [ana, ben, cy] = players;

  await expect(
    ben.as.mutation(api.lobby.lobbies.removeMember, {
      lobbyId,
      userId: cy.userId,
    })
  ).rejects.toThrow(rejection("NOT_THE_HOST"));

  await ana.as.mutation(api.lobby.lobbies.removeMember, {
    lobbyId,
    userId: cy.userId,
  });
  const lobby = await ana.as.query(api.lobby.lobbies.get, { lobbyId });
  expect(lobby?.members.map((member) => member.username)).toEqual(["Ana", "Ben"]);
});

test("open lobbies are listed with their member counts", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);

  const listed = await players[0].as.query(api.lobby.lobbies.listOpen, {});

  expect(listed).toEqual([
    { id: lobbyId, name: "tattered-kithkin", memberCount: 2 },
  ]);
});

test("outsiders cannot read or post worldbuilding messages", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana"]);
  const outsider = await signIn(backend, "Zed");
  await players[0].as.mutation(api.lobby.messages.post, {
    lobbyId,
    text: "  a world of glass  ",
  });

  const messages = await players[0].as.query(api.lobby.messages.list, {
    lobbyId,
  });
  expect(messages.map((message) => message.text)).toEqual(["a world of glass"]);
  expect(await outsider.as.query(api.lobby.messages.list, { lobbyId })).toEqual(
    []
  );
  await expect(
    outsider.as.mutation(api.lobby.messages.post, { lobbyId, text: "hi" })
  ).rejects.toThrow(rejection("NOT_A_MEMBER"));
});

test("a heartbeat records when a member was last seen without changing the roster", async () => {
  vi.useFakeTimers();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;

  vi.setSystemTime(1_000_000);
  await ben.as.mutation(api.lobby.presence.heartbeat, { lobbyId });
  vi.setSystemTime(2_000_000);
  await ben.as.mutation(api.lobby.presence.heartbeat, { lobbyId });

  expect(await ana.as.query(api.lobby.presence.list, { lobbyId })).toEqual([
    { userId: ben.userId, lastSeenAt: 2_000_000 },
  ]);
  const lobby = await ana.as.query(api.lobby.lobbies.get, { lobbyId });
  expect(lobby?.members).toHaveLength(2);
});

test("an open lobby is still listed after a quiet hour and closed after a day", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  const backend = startBackend();
  const { players } = await openLobby(backend, ["Ana"]);
  const listed = () => players[0].as.query(api.lobby.lobbies.listOpen, {});

  vi.setSystemTime(new Date("2026-01-01T01:00:00Z"));
  await backend.mutation(internal.lobby.cleanup.closeAbandoned, {});
  expect(await listed()).toHaveLength(1);

  vi.setSystemTime(new Date("2026-01-02T00:00:01Z"));
  await backend.mutation(internal.lobby.cleanup.closeAbandoned, {});
  expect(await listed()).toHaveLength(0);
});

test("members cannot leave or be removed once the draft has started", async () => {
  vi.useFakeTimers();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });

  await expect(
    players[1].as.mutation(api.lobby.lobbies.leave, { lobbyId })
  ).rejects.toThrow(rejection("LOBBY_NOT_OPEN"));
  const latecomer = await signIn(backend, "Cy");
  expect(
    await latecomer.as.mutation(api.lobby.lobbies.join, { lobbyId })
  ).toEqual({ kind: "refused", reason: "in-progress" });
});
