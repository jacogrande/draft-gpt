import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import { openLobby, readyEveryone, rejection, signIn, startBackend } from "../../tests/backend";
import { fakeOutsideWorld } from "../../tests/outsideWorld";

beforeEach(() => { vi.useFakeTimers(); fakeOutsideWorld(); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

test("idea support belongs to each member, is idempotent, and freezes at start", async () => {
  const backend = startBackend();
  const { lobbyId, players: [ana, ben] } = await openLobby(backend, ["IdeaAna", "IdeaBen"]);
  await ana.as.mutation(api.lobby.messages.post, { lobbyId, text: "Stars contain dragon eggs" });
  const [message] = await ana.as.query(api.lobby.messages.list, { lobbyId });
  for (const player of [ana, ana, ben])
    await player.as.mutation(api.lobby.messages.support, { lobbyId, messageId: message.id, use: true });
  expect((await ana.as.query(api.lobby.messages.list, { lobbyId }))[0]).toMatchObject({ supportCount: 2, selected: true, sourceId: "m1" });
  await ana.as.mutation(api.lobby.messages.support, { lobbyId, messageId: message.id, use: false });
  expect((await ana.as.query(api.lobby.messages.list, { lobbyId }))[0]).toMatchObject({ supportCount: 1, selected: false });
  const outsider = await signIn(backend, "IdeaOutsider");
  expect(await outsider.as.query(api.lobby.messages.list, { lobbyId })).toEqual([]);
  await expect(outsider.as.mutation(api.lobby.messages.support, { lobbyId, messageId: message.id, use: true })).rejects.toEqual(rejection("NOT_A_MEMBER"));
  const other = await openLobby(backend, ["OtherIdeaA", "OtherIdeaB"]);
  await expect(other.players[0].as.mutation(api.lobby.messages.support, { lobbyId: other.lobbyId, messageId: message.id, use: true })).rejects.toEqual(rejection("INVALID_MESSAGE"));
  await readyEveryone(lobbyId, [ana, ben]);
  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await expect(ben.as.mutation(api.lobby.messages.support, { lobbyId, messageId: message.id, use: false })).rejects.toEqual(rejection("LOBBY_NOT_OPEN"));
});
