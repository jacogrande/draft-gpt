import { afterEach, expect, test, vi } from "vitest";
import { openLobby, readyEveryone, rejection, signIn, startBackend } from "../../tests/backend";
import { api } from "../_generated/api";

afterEach(() => vi.useRealTimers());

test("the host changes power for everyone and clears readiness only on a change", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["PowerAna", "PowerBen"]);
  const get = () => players[1].as.query(api.lobby.lobbies.get, { lobbyId });
  expect((await get())?.powerLevel).toBe("default");
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.lobby.lobbies.setPowerLevel, { lobbyId, powerLevel: "default" });
  expect((await get())?.members.every((m) => m.ready)).toBe(true);
  await players[0].as.mutation(api.lobby.lobbies.setPowerLevel, { lobbyId, powerLevel: "busted" });
  expect((await get())?.powerLevel).toBe("busted");
  expect((await get())?.members.every((m) => !m.ready)).toBe(true);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.lobby.lobbies.setPowerLevel, { lobbyId, powerLevel: "default" });
  expect((await get())?.powerLevel).toBe("default");
  expect((await get())?.members.every((m) => !m.ready)).toBe(true);
});

test("only the host of an open lobby may change power", async () => {
  vi.useFakeTimers();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["PowerHost", "PowerGuest"]);
  const outsider = await signIn(backend, "PowerOutsider");
  const args = { lobbyId, powerLevel: "busted" as const };
  await expect(backend.mutation(api.lobby.lobbies.setPowerLevel, args))
    .rejects.toThrow(rejection("UNAUTHENTICATED"));
  await expect(outsider.as.mutation(api.lobby.lobbies.setPowerLevel, args))
    .rejects.toThrow(rejection("NOT_A_MEMBER"));
  await expect(players[1].as.mutation(api.lobby.lobbies.setPowerLevel, args))
    .rejects.toThrow(rejection("NOT_THE_HOST"));
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await expect(players[0].as.mutation(api.lobby.lobbies.setPowerLevel, args))
    .rejects.toThrow(rejection("LOBBY_NOT_OPEN"));
});

test("old lobbies without a saved power level read as Default", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["OldPower"]);
  await backend.run((ctx) => ctx.db.patch(lobbyId, { powerLevel: undefined }));
  expect((await players[0].as.query(api.lobby.lobbies.get, { lobbyId }))?.powerLevel)
    .toBe("default");
});
