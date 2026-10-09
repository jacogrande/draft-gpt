import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { rejection, signIn, startBackend } from "../../tests/backend";
import { deckFor, openGame, startedGame, tableOf } from "../../tests/tabletop";
import { api, internal } from "../_generated/api";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const DAY = 24 * 60 * 60 * 1000;

test("a game seats two players at twenty life and refuses a third", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana", "Ben"]);
  const cy = await signIn(backend, "Cy");

  expect(await cy.as.mutation(api.game.games.join, { gameId })).toEqual({
    kind: "refused",
    reason: "full",
  });
  const table = await tableOf(players[0], gameId);
  expect(table.players.map((player) => [player.username, player.life])).toEqual(
    [
      ["Ana", 20],
      ["Ben", 20],
    ]
  );
});

test("rejoining keeps the same seat, deck and life total", async () => {
  const { gameId, ana, ben } = await startedGame();
  await ben.as.mutation(api.game.play.setLife, { gameId, life: 13 });
  await ben.as.mutation(api.game.play.draw, { gameId, amount: 3 });

  expect(await ben.as.mutation(api.game.games.join, { gameId })).toEqual({
    kind: "existing",
    seat: 1,
  });
  const table = await tableOf(ana, gameId);
  expect(table.players).toHaveLength(2);
  expect(table.players[1]).toMatchObject({ life: 13, ready: true });
  expect(table.players[1].side?.handCount).toBe(3);
});

test("the game starts when both players have chosen a deck", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  const choose = async (player: typeof ana) =>
    player.as.mutation(api.game.setup.chooseDeck, {
      gameId,
      deckId: await deckFor(backend, player),
    });

  await choose(ana);
  expect(await tableOf(ben, gameId)).toMatchObject({ status: "open" });
  expect((await tableOf(ben, gameId)).players[0].ready).toBe(true);
  await choose(ben);
  expect(await tableOf(ana, gameId)).toMatchObject({ status: "playing" });
});

test("a player cannot bring someone else's deck", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  const bensDeck = await deckFor(backend, ben);

  await expect(
    ana.as.mutation(api.game.setup.chooseDeck, { gameId, deckId: bensDeck })
  ).rejects.toThrow(rejection("DECK_NOT_FOUND"));
});

test("a player can leave before the game starts, and the last one out closes it", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  const find = () => ana.as.query(api.game.games.findByCode, { code: "ab12" });

  await ben.as.mutation(api.game.games.leave, { gameId });
  expect((await tableOf(ana, gameId)).players).toHaveLength(1);
  expect(await find()).toBe(gameId);

  await ana.as.mutation(api.game.games.leave, { gameId });
  expect(await find()).toBeNull();
  expect(await ben.as.mutation(api.game.games.join, { gameId })).toEqual({
    kind: "refused",
    reason: "closed",
  });
});

test("nobody can leave once the game has started", async () => {
  const { gameId, ben } = await startedGame();

  await expect(
    ben.as.mutation(api.game.games.leave, { gameId })
  ).rejects.toThrow(rejection("GAME_NOT_OPEN"));
});

test("an outsider sees who is seated but none of the table", async () => {
  const { backend, gameId } = await startedGame();
  const outsider = await signIn(backend, "Zed");

  const table = await tableOf(outsider, gameId);
  expect(table.players.map((player) => player.side)).toEqual([null, null]);
  expect(await outsider.as.query(api.game.log.recent, { gameId })).toEqual([]);
  await expect(
    outsider.as.mutation(api.game.play.draw, { gameId, amount: 1 })
  ).rejects.toThrow(rejection("NOT_A_PLAYER"));
});

test("a game is found by its code for a week and then closes", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana"]);
  const find = () =>
    players[0].as.query(api.game.games.findByCode, { code: "AB12" });

  vi.advanceTimersByTime(6 * DAY);
  await backend.mutation(internal.game.cleanup.closeAbandoned, {});
  expect(await find()).toBe(gameId);

  vi.advanceTimersByTime(2 * DAY);
  await backend.mutation(internal.game.cleanup.closeAbandoned, {});
  expect(await find()).toBeNull();
});

test("a heartbeat records when a player was last seen without changing the seats", async () => {
  const { gameId, ana, ben } = await startedGame();

  await ben.as.mutation(api.game.presence.heartbeat, { gameId });

  const sightings = await ana.as.query(api.game.presence.list, { gameId });
  expect(sightings.map((sighting) => sighting.userId)).toEqual([ben.userId]);
  expect((await tableOf(ana, gameId)).players).toHaveLength(2);
});
