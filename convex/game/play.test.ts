import { expect, test } from "vitest";
import { rejection, startBackend } from "../../tests/backend";
import {
  logOf,
  openGame,
  sideOf,
  startedGame,
  tableOf,
} from "../../tests/tabletop";
import { api } from "../_generated/api";

test("both players see the same table, with the other's hand and library as counts only", async () => {
  const { gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 7 });
  const [first] = (await sideOf(ana, gameId)).hand!;
  await ana.as.mutation(api.game.play.moveCards, {
    gameId,
    cardIds: [first.id],
    to: "battlefield",
  });

  const own = await sideOf(ana, gameId);
  const seen = await sideOf(ben, gameId, ana);
  expect(own.hand).toHaveLength(6);
  expect(seen.hand).toBeNull();
  expect(seen).toMatchObject({ handCount: 6, libraryCount: 3 });
  expect(seen.battlefield).toEqual(own.battlefield);
  expect(seen.battlefield.map((card) => card.name)).toEqual([first.name]);
  expect(JSON.stringify(await tableOf(ben, gameId))).not.toContain(
    own.hand![0].name
  );
});

test("drawing takes cards from the top of the library and stops when it is empty", async () => {
  const { gameId, ana } = await startedGame();

  await ana.as.mutation(api.game.play.draw, { gameId, amount: 7 });
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 7 });

  expect(await sideOf(ana, gameId)).toMatchObject({
    libraryCount: 0,
    handCount: 10,
  });
  expect(await logOf(ana, gameId)).toEqual(["drew 7 cards", "drew 3 cards"]);
});

test("tapping turns a card on the battlefield and untap straightens all of them", async () => {
  const { gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 2 });
  const cardIds = (await sideOf(ana, gameId)).hand!.map((card) => card.id);
  await ana.as.mutation(api.game.play.moveCards, {
    gameId,
    cardIds,
    to: "battlefield",
  });
  const tapped = async () =>
    (await sideOf(ben, gameId, ana)).battlefield.map((card) => card.tapped);

  await ana.as.mutation(api.game.play.tapCards, { gameId, cardIds });
  expect(await tapped()).toEqual([true, true]);
  await ana.as.mutation(api.game.play.tapCards, { gameId, cardIds: [cardIds[0]] });
  expect(await tapped()).toEqual([false, true]);
  await ana.as.mutation(api.game.play.untapAll, { gameId });
  expect(await tapped()).toEqual([false, false]);
});

test("a card that leaves the battlefield untaps, and one put on the library goes on top", async () => {
  const { gameId, ana } = await startedGame();
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 1 });
  const [card] = (await sideOf(ana, gameId)).hand!;
  const move = (to: "battlefield" | "library") =>
    ana.as.mutation(api.game.play.moveCards, { gameId, cardIds: [card.id], to });

  await move("battlefield");
  await ana.as.mutation(api.game.play.tapCards, { gameId, cardIds: [card.id] });
  await move("library");
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 1 });

  expect((await sideOf(ana, gameId)).hand).toEqual([card]);
});

test("a player cannot move the other player's cards", async () => {
  const { gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 1 });
  const [card] = (await sideOf(ana, gameId)).hand!;
  await ana.as.mutation(api.game.play.moveCards, {
    gameId,
    cardIds: [card.id],
    to: "battlefield",
  });

  await ben.as.mutation(api.game.play.moveCards, {
    gameId,
    cardIds: [card.id],
    to: "graveyard",
  });
  await ben.as.mutation(api.game.play.tapCards, { gameId, cardIds: [card.id] });

  expect((await sideOf(ana, gameId)).battlefield).toEqual([card]);
});

test("the log names cards the table has seen and keeps hidden ones secret", async () => {
  const { gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.play.draw, { gameId, amount: 2 });
  const [played, kept] = (await sideOf(ana, gameId)).hand!;
  const move = (cardId: string, to: "battlefield" | "library") =>
    ana.as.mutation(api.game.play.moveCards, { gameId, cardIds: [cardId], to });

  await move(played.id, "battlefield");
  await move(kept.id, "library");
  await ana.as.mutation(api.game.play.shuffle, { gameId });

  expect(await logOf(ben, gameId)).toEqual([
    "drew 2 cards",
    `moved ${played.name} to battlefield`,
    "moved a card to library",
    "shuffled",
  ]);
});

test("life totals are each player's own to change", async () => {
  const { gameId, ana, ben } = await startedGame();

  await ana.as.mutation(api.game.play.setLife, { gameId, life: 17 });

  const table = await tableOf(ben, gameId);
  expect(table.players.map((player) => player.life)).toEqual([17, 20]);
  await expect(
    ana.as.mutation(api.game.play.setLife, { gameId, life: 1.5 })
  ).rejects.toThrow(rejection("INVALID_LIFE_TOTAL"));
});

test("tokens and counters appear for both players and only their owner can change them", async () => {
  const { gameId, ana, ben } = await startedGame();
  const extras = (viewer: typeof ana) =>
    viewer.as.query(api.game.games.extras, { gameId });

  await ana.as.mutation(api.game.tokens.create, {
    gameId,
    name: "Shard",
    power: 1,
    toughness: 1,
  });
  await ana.as.mutation(api.game.counters.create, {
    gameId,
    position: { x: 40, y: 60 },
  });
  const { tokens, counters } = await extras(ben);
  expect(tokens).toMatchObject([{ name: "Shard", power: 1, tapped: false }]);
  expect(counters).toMatchObject([{ value: "0", position: { x: 40, y: 60 } }]);

  await expect(
    ben.as.mutation(api.game.tokens.remove, { tokenId: tokens[0].id })
  ).rejects.toThrow(rejection("PIECE_NOT_FOUND"));
  await expect(
    ben.as.mutation(api.game.counters.setValue, {
      counterId: counters[0].id,
      value: "9",
    })
  ).rejects.toThrow(rejection("PIECE_NOT_FOUND"));

  await ana.as.mutation(api.game.tokens.setTapped, {
    tokenId: tokens[0].id,
    tapped: true,
  });
  await ana.as.mutation(api.game.counters.setValue, {
    counterId: counters[0].id,
    value: "3",
  });
  await ana.as.mutation(api.game.counters.move, {
    counterId: counters[0].id,
    position: { x: 5, y: 6 },
  });
  expect(await extras(ben)).toMatchObject({
    tokens: [{ tapped: true }],
    counters: [{ value: "3", position: { x: 5, y: 6 } }],
  });

  await ana.as.mutation(api.game.tokens.remove, { tokenId: tokens[0].id });
  await ana.as.mutation(api.game.counters.remove, { counterId: counters[0].id });
  expect(await extras(ana)).toEqual({ tokens: [], counters: [] });
});

test("the table cannot be used before both decks are chosen", async () => {
  const { gameId, players } = await openGame(startBackend(), ["Ana", "Ben"]);

  await expect(
    players[0].as.mutation(api.game.play.draw, { gameId, amount: 1 })
  ).rejects.toThrow(rejection("GAME_NOT_STARTED"));
});
