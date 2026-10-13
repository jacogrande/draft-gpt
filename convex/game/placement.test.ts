import { expect, test } from "vitest";
import { api } from "../_generated/api";
import { rejection } from "../../tests/backend";
import { closeGame, startedGame } from "../../tests/tabletop";
import {
  counterPosition,
  defaultPosition,
  fromPixels,
  toPixels,
  viewPosition,
} from "./placement";

test("piece placement is shared, bounded, owner-only, and preserved across queries", async () => {
  const { backend, gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.tokens.create, {
    gameId,
    name: "Scout",
    power: 1,
    toughness: 1,
    position: { x: 0.25, y: 0.75 },
  });
  await ana.as.mutation(api.game.counters.create, {
    gameId,
    position: { x: 0.3, y: 0.6 },
  });
  const extras = () => ben.as.query(api.game.games.extras, { gameId });
  const {
    tokens: [token],
    counters: [counter],
  } = await extras();
  expect(token.position).toEqual({ x: 0.25, y: 0.75 });
  expect(counter.positionSpace).toBe("battlefield");
  await expect(
    ben.as.mutation(api.game.tokens.move, {
      tokenId: token.id,
      position: { x: 0, y: 0 },
    })
  ).rejects.toThrow(rejection("PIECE_NOT_FOUND"));
  await expect(
    ben.as.mutation(api.game.counters.move, {
      counterId: counter.id,
      position: { x: 0, y: 0 },
    })
  ).rejects.toThrow(rejection("PIECE_NOT_FOUND"));
  await ana.as.mutation(api.game.tokens.move, {
    tokenId: token.id,
    position: { x: 2, y: -1 },
  });
  await ana.as.mutation(api.game.counters.move, {
    counterId: counter.id,
    position: { x: 0.8, y: 0.2 },
  });
  expect((await extras()).tokens[0].position).toEqual({ x: 1, y: 0 });
  expect((await extras()).counters[0].position).toEqual({ x: 0.8, y: 0.2 });
  await expect(
    ana.as.mutation(api.game.tokens.move, {
      tokenId: token.id,
      position: { x: Infinity, y: 0 },
    })
  ).rejects.toThrow(rejection("INVALID_POSITION"));
  await expect(
    ana.as.mutation(api.game.counters.create, {
      gameId,
      position: { x: NaN, y: 0 },
    })
  ).rejects.toThrow(rejection("INVALID_POSITION"));
  await closeGame(backend, gameId);
  await expect(
    ana.as.mutation(api.game.tokens.move, {
      tokenId: token.id,
      position: { x: 0, y: 0 },
    })
  ).rejects.toThrow(rejection("GAME_CLOSED"));
});

test("placement mirrors twice to the original and survives different field sizes", () => {
  const point = { x: 0.25, y: 0.75 };
  expect(viewPosition(viewPosition(point, true), true)).toEqual(point);
  for (const area of [
    { width: 800, height: 200 },
    { width: 300, height: 400 },
  ]) {
    const size = { width: 112, height: 157 };
    expect(fromPixels(toPixels(point, area, size), area, size)).toEqual(point);
    const edge = toPixels({ x: 1, y: 1 }, area, size);
    expect(edge.x + size.width).toBe(area.width);
    expect(edge.y + size.height).toBe(area.height);
  }
  expect(
    fromPixels(
      { x: 50, y: -20 },
      { width: 0, height: 0 },
      { width: 24, height: 24 }
    )
  ).toEqual({ x: 0, y: 0 });
});

test("legacy counters get deterministic placement and save the new coordinate space when moved", async () => {
  const { backend, gameId, ana, ben } = await startedGame();
  await ana.as.mutation(api.game.counters.create, {
    gameId,
    position: { x: 0, y: 0 },
  });
  const {
    counters: [counter],
  } = await ana.as.query(api.game.games.extras, { gameId });
  await backend.run((ctx) =>
    ctx.db.patch(counter.id, {
      position: { x: 800, y: 600 },
      positionSpace: undefined,
    })
  );
  const {
    counters: [legacy],
  } = await ben.as.query(api.game.games.extras, { gameId });
  expect(counterPosition(legacy.position, legacy.positionSpace, 2)).toEqual(
    defaultPosition(2)
  );
  await ana.as.mutation(api.game.counters.move, {
    counterId: counter.id,
    position: { x: 0.2, y: 0.8 },
  });
  const {
    counters: [moved],
  } = await ben.as.query(api.game.games.extras, { gameId });
  expect(moved.positionSpace).toBe("battlefield");
  expect(counterPosition(moved.position, moved.positionSpace, 2)).toEqual({
    x: 0.2,
    y: 0.8,
  });
});
