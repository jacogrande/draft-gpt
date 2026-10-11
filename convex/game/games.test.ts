import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { rejection, signIn, startBackend } from "../../tests/backend";
import {
  closeGame,
  deckFor,
  openGame,
  startedGame,
  startGame,
  tableOf,
} from "../../tests/tabletop";
import { api, internal } from "../_generated/api";
import { freshCode } from "./seats";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

test("the server gives each game a four-character code that finds it", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana"]);
  const other = await players[0].as.mutation(api.game.games.create, {});

  const { code } = await tableOf(players[0], gameId);
  expect(code).toMatch(/^[A-Z0-9]{4}$/);
  expect((await tableOf(players[0], other)).code).not.toBe(code);
  expect(
    await players[0].as.query(api.game.games.findByCode, {
      code: code.toLowerCase(),
    })
  ).toBe(gameId);
});

test("a fresh code is drawn again while a live game already has it", () => {
  const rolls = [0, 0, 0, 0, 0.99, 0.99, 0.99, 0.99];
  expect(freshCode(["AAAA"], () => rolls.shift()!)).toBe("9999");
});

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
  expect(
    (await ana.as.query(api.game.log.recent, { gameId })).map((e) => e.message)
  ).toEqual(["joined", "joined", "chose tattered-kithkin", "chose tattered-kithkin"]);
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
  const { code } = await tableOf(ana, gameId);
  const find = () => ana.as.query(api.game.games.findByCode, { code });

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

test("a former player cannot rejoin a closed game", async () => {
  const { backend, gameId, ana } = await startedGame();
  await closeGame(backend, gameId);

  expect(await ana.as.mutation(api.game.games.join, { gameId })).toEqual({
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
  const refused = (call: Promise<unknown>) =>
    expect(call).rejects.toThrow(rejection("NOT_A_PLAYER"));

  const table = await tableOf(outsider, gameId);
  expect(table.players.map((player) => player.side)).toEqual([null, null]);
  expect(await outsider.as.query(api.game.log.recent, { gameId })).toEqual([]);
  expect(await outsider.as.query(api.game.presence.list, { gameId })).toEqual([]);
  expect(await outsider.as.query(api.game.games.extras, { gameId })).toEqual({
    tokens: [],
    counters: [],
  });
  await refused(outsider.as.mutation(api.game.play.draw, { gameId, amount: 1 }));
  await refused(outsider.as.mutation(api.game.play.setLife, { gameId, life: 1 }));
  await refused(
    outsider.as.mutation(api.game.tokens.create, {
      gameId,
      name: "Shard",
      power: 1,
      toughness: 1,
    })
  );
  await refused(
    outsider.as.mutation(api.game.counters.create, {
      gameId,
      position: { x: 0, y: 0 },
    })
  );
  await refused(
    outsider.as.mutation(api.game.setup.chooseDeck, {
      gameId,
      deckId: await deckFor(backend, outsider),
    })
  );
});

test("a signed-out viewer or a malformed id gets nothing", async () => {
  const { backend, gameId, ana } = await startedGame();

  expect(await backend.query(api.game.games.get, { gameId })).toBeNull();
  expect(
    await ana.as.query(api.game.games.get, { gameId: "not-an-id" })
  ).toBeNull();
  expect(
    await ana.as.query(api.game.log.recent, { gameId: "not-an-id" })
  ).toEqual([]);
  expect(
    await ana.as.query(api.game.presence.list, { gameId: "not-an-id" })
  ).toEqual([]);
});

test("an open game closes after a day without anyone around", async () => {
  const backend = startBackend();
  const { gameId, players } = await openGame(backend, ["Ana"]);
  const status = async () => (await tableOf(players[0], gameId)).status;

  vi.advanceTimersByTime(23 * HOUR);
  await players[0].as.mutation(api.game.presence.heartbeat, { gameId });
  vi.advanceTimersByTime(2 * HOUR);
  await backend.mutation(internal.game.cleanup.closeAbandoned, {});
  expect(await status()).toBe("open");

  vi.advanceTimersByTime(DAY);
  await backend.mutation(internal.game.cleanup.closeAbandoned, {});
  expect(await status()).toBe("closed");
});

test("a game in play lasts a week after it was last seen", async () => {
  const backend = startBackend();
  const stale = await startGame(backend, ["Ana", "Ben"]);
  const active = await startGame(backend, ["Cy", "Di"]);
  const status = async (game: typeof stale) =>
    (await tableOf(game.players[0], game.gameId)).status;

  vi.advanceTimersByTime(6 * DAY);
  await active.players[1].as.mutation(api.game.presence.heartbeat, {
    gameId: active.gameId,
  });
  vi.advanceTimersByTime(2 * DAY);
  await backend.mutation(internal.game.cleanup.closeAbandoned, {});

  expect(await status(stale)).toBe("closed");
  expect(await status(active)).toBe("playing");
});

test("a game closed for a week is purged with everything on its table", async () => {
  const { backend, gameId, ana } = await startedGame();
  await ana.as.mutation(api.game.tokens.create, {
    gameId,
    name: "Shard",
    power: 1,
    toughness: 1,
  });
  await ana.as.mutation(api.game.counters.create, {
    gameId,
    position: { x: 0, y: 0 },
  });
  await ana.as.mutation(api.game.presence.heartbeat, { gameId });
  await closeGame(backend, gameId);
  const rowCounts = () =>
    backend.run(async (ctx) => ({
      games: (await ctx.db.query("games").collect()).length,
      players: (await ctx.db.query("gamePlayers").collect()).length,
      log: (await ctx.db.query("gameLog").collect()).length,
      tokens: (await ctx.db.query("gameTokens").collect()).length,
      counters: (await ctx.db.query("gameCounters").collect()).length,
      presence: (await ctx.db.query("gamePresence").collect()).length,
    }));

  vi.advanceTimersByTime(6 * DAY);
  const recent = await startGame(backend, ["Cy", "Di"]);
  await closeGame(backend, recent.gameId);
  await backend.mutation(internal.game.cleanup.purgeClosed, {});
  expect((await rowCounts()).games).toBe(2);

  vi.advanceTimersByTime(2 * DAY);
  await backend.mutation(internal.game.cleanup.purgeClosed, {});
  expect(await rowCounts()).toEqual({
    games: 1,
    players: 2,
    log: 4,
    tokens: 0,
    counters: 0,
    presence: 0,
  });
  expect(await backend.run((ctx) => ctx.db.get(gameId))).toBeNull();
});

test("a heartbeat records when a player was last seen without changing the seats", async () => {
  const { gameId, ana, ben } = await startedGame();

  await ben.as.mutation(api.game.presence.heartbeat, { gameId });

  const sightings = await ana.as.query(api.game.presence.list, { gameId });
  expect(sightings.map((sighting) => sighting.userId)).toEqual([ben.userId]);
  expect((await tableOf(ana, gameId)).players).toHaveLength(2);
});
