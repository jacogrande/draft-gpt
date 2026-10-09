import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { rejection } from "../../tests/backend";
import {
  deckSize,
  lobbyOf,
  packOf,
  pass,
  pickFirst,
  seen,
  settle,
  startedDraft,
} from "../../tests/drafting";
import { fakeOutsideWorld } from "../../tests/outsideWorld";
import { api } from "../_generated/api";

const AWAY_SECONDS = 61;
const WINDOW_SECONDS = 120;

beforeEach(() => {
  vi.useFakeTimers();
  fakeOutsideWorld();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const draftWithBenAway = async () => {
  const draft = await startedDraft(["Ana", "Ben"]);
  const [ana, ben] = draft.players;
  await seen(draft.lobbyId, draft.players);
  await pass(draft.backend, AWAY_SECONDS, draft.lobbyId, [ana]);
  const countdowns = () =>
    ana.as.query(api.draft.absences.list, { lobbyId: draft.lobbyId });
  const target = { lobbyId: draft.lobbyId, userId: ben.userId };
  return { ...draft, ana, ben, countdowns, target };
};

test("a player who disconnects gets a countdown, and nothing is picked for them while it runs", async () => {
  const { backend, lobbyId, ana, ben, countdowns } = await draftWithBenAway();

  expect(await countdowns()).toEqual([
    { userId: ben.userId, deadline: expect.any(Number), remainingMs: null },
  ]);
  await pass(backend, WINDOW_SECONDS - 10, lobbyId, [ana]);
  expect(await deckSize(ben, lobbyId)).toBe(0);
});

test("when the countdown runs out, the absent player's picks are made for them", async () => {
  const { backend, lobbyId, ana, ben } = await draftWithBenAway();

  await pass(backend, WINDOW_SECONDS, lobbyId, [ana]);
  expect(await deckSize(ben, lobbyId)).toBe(1);

  await pickFirst(ana, lobbyId);
  expect(await deckSize(ben, lobbyId)).toBe(2);
  expect(await ana.as.query(api.draft.picks.held, { lobbyId })).toEqual({
    [ana.userId]: 2,
  });
});

test("a draft finishes with a full deck for a player who never comes back", async () => {
  const { backend, lobbyId, ana, ben } = await draftWithBenAway();
  await pass(backend, WINDOW_SECONDS, lobbyId, [ana]);

  while ((await lobbyOf(ana, lobbyId))?.status !== "complete") {
    await pickFirst(ana, lobbyId);
    await settle(backend);
    await seen(lobbyId, [ana]);
  }

  expect(await deckSize(ana, lobbyId)).toBe(45);
  expect(await deckSize(ben, lobbyId)).toBe(45);
});

test("a player who returns in time keeps their own picks", async () => {
  const { backend, lobbyId, ana, ben, countdowns } = await draftWithBenAway();

  await seen(lobbyId, [ben]);
  expect(await countdowns()).toEqual([]);
  await pass(backend, WINDOW_SECONDS, lobbyId, [ana, ben]);

  expect(await deckSize(ben, lobbyId)).toBe(0);
  expect((await packOf(ben, lobbyId))?.cards).toHaveLength(15);
});

test("a returning player takes over from the automatic picks and can leave again", async () => {
  const { backend, lobbyId, ana, ben, countdowns } = await draftWithBenAway();
  await pass(backend, WINDOW_SECONDS, lobbyId, [ana]);

  await seen(lobbyId, [ben]);
  await pickFirst(ana, lobbyId);
  expect(await deckSize(ben, lobbyId)).toBe(1);
  expect((await packOf(ben, lobbyId))?.cards).toHaveLength(14);

  await pass(backend, AWAY_SECONDS, lobbyId, [ana]);
  expect(await countdowns()).toHaveLength(1);
});

test("the host can pause the countdown and resume it where it stopped", async () => {
  const { backend, lobbyId, ana, ben, countdowns, target } =
    await draftWithBenAway();
  await pass(backend, 20, lobbyId, [ana]);

  await expect(
    ben.as.mutation(api.draft.absences.pause, target)
  ).rejects.toThrow(rejection("NOT_THE_HOST"));
  await ana.as.mutation(api.draft.absences.pause, target);
  await pass(backend, 10 * 60, lobbyId, [ana]);

  expect(await deckSize(ben, lobbyId)).toBe(0);
  const [paused] = await countdowns();
  expect(paused.deadline).toBeNull();
  expect(paused.remainingMs).toBeGreaterThan(90_000);
  expect(paused.remainingMs).toBeLessThan(110_000);

  await ana.as.mutation(api.draft.absences.resume, target);
  await pass(backend, 80, lobbyId, [ana]);
  expect(await deckSize(ben, lobbyId)).toBe(0);
  await pass(backend, 40, lobbyId, [ana]);
  expect(await deckSize(ben, lobbyId)).toBe(1);
});

test("the host can skip the countdown", async () => {
  const { lobbyId, ana, ben, target } = await draftWithBenAway();

  await expect(
    ben.as.mutation(api.draft.absences.skip, target)
  ).rejects.toThrow(rejection("NOT_THE_HOST"));
  await ana.as.mutation(api.draft.absences.skip, target);

  expect(await deckSize(ben, lobbyId)).toBe(1);
});

test("a player who is present has no countdown to pause or skip", async () => {
  const { lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana, ben] = players;
  const target = { lobbyId, userId: ben.userId };

  await expect(
    ana.as.mutation(api.draft.absences.skip, target)
  ).rejects.toThrow(rejection("NOT_AWAY"));
  await expect(
    ana.as.mutation(api.draft.absences.pause, target)
  ).rejects.toThrow(rejection("NOT_AWAY"));
});

test("no picks are made while every player is away, and they resume when one returns", async () => {
  const { backend, lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana, ben] = players;

  await pass(backend, 10 * 60);
  expect(await deckSize(ana, lobbyId)).toBe(0);
  expect(await deckSize(ben, lobbyId)).toBe(0);

  await seen(lobbyId, [ana]);
  expect(await deckSize(ana, lobbyId)).toBe(0);
  expect(await deckSize(ben, lobbyId)).toBe(1);
});

test("a generation step that never reports back is retried", async () => {
  const { backend, lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana] = players;
  for (let pick = 0; pick < 15; pick++) {
    for (const player of players) await pickFirst(player, lobbyId);
  }
  await backend.run(async (ctx) => {
    const jobs = await ctx.db.system.query("_scheduled_functions").collect();
    const packJob = jobs.find(
      (job) =>
        job.state.kind === "pending" &&
        job.name === "draft/generation:createPack"
    );
    await ctx.scheduler.cancel(packJob!._id);
  });

  await settle(backend);
  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "generating",
    generationError: null,
  });

  await pass(backend, 11 * 60 + 10);
  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "drafting",
    round: 2,
  });
});
