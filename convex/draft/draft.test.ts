import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  openLobby,
  readyEveryone,
  rejection,
  signIn,
  startBackend,
} from "../../tests/backend";
import {
  lobbyOf,
  packOf,
  pass,
  pickFirst,
  seen,
  settle,
  startedDraft,
} from "../../tests/drafting";
import { fakeOutsideWorld } from "../../tests/outsideWorld";
import { api, internal } from "../_generated/api";

let world: ReturnType<typeof fakeOutsideWorld>;

beforeEach(() => {
  vi.useFakeTimers();
  world = fakeOutsideWorld();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("a draft needs two players and everyone ready", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana"]);
  const [ana] = players;
  const start = () => ana.as.mutation(api.draft.start.startDraft, { lobbyId });

  await readyEveryone(lobbyId, players);
  await expect(start()).rejects.toThrow(rejection("NEED_TWO_PLAYERS"));

  const ben = await signIn(backend, "Ben");
  await ben.as.mutation(api.lobby.lobbies.join, { lobbyId });
  await expect(start()).rejects.toThrow(rejection("PLAYERS_NOT_READY"));
});

test("starting generates a setting from the players' ideas and deals everyone a full pack", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  await ana.as.mutation(api.lobby.messages.post, {
    lobbyId,
    text: "an ocean of glass",
  });
  await readyEveryone(lobbyId, players);

  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  expect((await lobbyOf(ana, lobbyId))?.status).toBe("generating");
  await settle(backend);

  expect(world.settingPrompts[0]).toContain("an ocean of glass");
  expect(world.settingPrompts[0]).toContain("<ideas>");
  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "drafting",
    round: 1,
  });
  const setting = await ben.as.query(api.draft.settings.forLobby, { lobbyId });
  expect(setting?.name).toBe("Glasswake");
  for (const player of players) {
    const pack = await packOf(player, lobbyId);
    expect(pack?.cards).toHaveLength(15);
    expect(pack?.cards[0].image_url).toEqual(expect.any(String));
  }
});

test("card art is painted from the card's art direction and the setting, in a named tradition, with no text", async () => {
  await startedDraft(["Ana", "Ben"]);

  expect(world.artPrompts).toHaveLength(24);
  expect(world.artPrompts[0]).toContain("A knight of frosted glass.");
  expect(world.artPrompts[0]).toContain("Glasswake");
  expect(world.artPrompts[0]).toContain("No text");
  for (const prompt of world.artPrompts) {
    expect(prompt).toMatch(/Tradition: Made in the tradition of .+/);
  }
});

test("a picked card joins the picker's deck and the pack passes on", async () => {
  const { lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana, ben] = players;
  const opened = await packOf(ana, lobbyId);
  const chosen = opened!.cards[0];

  await ana.as.mutation(api.draft.picks.pick, { cardId: chosen.id });

  const deck = await ana.as.query(api.deck.decks.forLobby, { lobbyId });
  expect(deck?.cards.map((card) => card.name)).toEqual([chosen.name]);
  expect(await packOf(ana, lobbyId)).toBeNull();
  expect(await ben.as.query(api.draft.picks.held, { lobbyId })).toEqual({
    [ben.userId]: 2,
  });
});

test("a player only sees and picks from the pack at the front of their queue", async () => {
  const { lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana, ben] = players;
  const anasPack = await packOf(ana, lobbyId);
  const bensPack = await packOf(ben, lobbyId);
  await ana.as.mutation(api.draft.picks.pick, { cardId: anasPack!.cards[0].id });

  expect((await packOf(ben, lobbyId))?.packId).toBe(bensPack!.packId);
  await expect(
    ben.as.mutation(api.draft.picks.pick, { cardId: anasPack!.cards[1].id })
  ).rejects.toThrow(rejection("NOT_YOUR_PACK"));
  await expect(
    ana.as.mutation(api.draft.picks.pick, { cardId: anasPack!.cards[0].id })
  ).rejects.toThrow(rejection("CARD_NOT_AVAILABLE"));
});

test("people outside the draft cannot see packs", async () => {
  const { backend, lobbyId } = await startedDraft(["Ana", "Ben"]);
  const outsider = await signIn(backend, "Zed");

  expect(await packOf(outsider, lobbyId)).toBeNull();
  expect(
    await outsider.as.query(api.draft.settings.forLobby, { lobbyId })
  ).toBeNull();
});

test("three rounds of picks finish the draft with a 45-card deck each", async () => {
  const { backend, lobbyId, players } = await startedDraft(["Ana", "Ben", "Cy"]);
  const status = async () => (await lobbyOf(players[0], lobbyId))?.status;

  while ((await status()) !== "complete") {
    for (const player of players) await pickFirst(player, lobbyId);
    await settle(backend);
    await seen(lobbyId, players);
  }

  for (const player of players) {
    const deck = await player.as.query(api.deck.decks.forLobby, { lobbyId });
    expect(deck?.cards).toHaveLength(45);
  }
  expect(world.packRequests).toBe(9);
  expect((await lobbyOf(players[0], lobbyId))?.round).toBe(3);
});

test("when generation keeps failing the host is told and can retry", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  await readyEveryone(lobbyId, players);
  world.openaiIsDown = true;

  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);

  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "generating",
    generationError: "OpenAI responded 500",
  });
  await expect(
    ben.as.mutation(api.draft.failures.retryGeneration, { lobbyId })
  ).rejects.toThrow(rejection("NOT_THE_HOST"));

  world.openaiIsDown = false;
  await ana.as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settle(backend);

  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "drafting",
    generationError: null,
  });
  expect((await packOf(ben, lobbyId))?.cards).toHaveLength(15);
});

test("a round that failed to generate is retried from where it stopped", async () => {
  const { backend, lobbyId, players } = await startedDraft(["Ana", "Ben"]);
  const [ana] = players;
  world.openaiIsDown = true;
  for (let pick = 0; pick < 15; pick++) {
    for (const player of players) await pickFirst(player, lobbyId);
  }
  await settle(backend);
  expect((await lobbyOf(ana, lobbyId))?.generationError).toBeTruthy();

  world.openaiIsDown = false;
  await ana.as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settle(backend);

  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "drafting",
    round: 2,
  });
  for (const player of players) {
    expect((await packOf(player, lobbyId))?.cards).toHaveLength(15);
    const deck = await player.as.query(api.deck.decks.forLobby, { lobbyId });
    expect(deck?.cards).toHaveLength(15);
  }
});

test("a rate-limited request waits as long as OpenAI asks before trying again", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana] = players;
  await readyEveryone(lobbyId, players);
  world.rateLimitNextSeconds = 8;

  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await pass(backend, 6);
  expect(world.settingPrompts).toHaveLength(1);
  expect((await lobbyOf(ana, lobbyId))?.generationError).toBeNull();

  await settle(backend);
  expect(world.settingPrompts).toHaveLength(2);
  expect((await lobbyOf(ana, lobbyId))?.status).toBe("drafting");
});

test("cards are kept when their art cannot be painted", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana] = players;
  await readyEveryone(lobbyId, players);
  world.artIsDown = true;

  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);

  expect((await lobbyOf(ana, lobbyId))?.status).toBe("drafting");
  expect(world.packRequests).toBe(2);
  const pack = await packOf(ana, lobbyId);
  expect(pack?.cards).toHaveLength(15);
  expect(pack?.cards.every((card) => card.image_url === null)).toBe(true);
});

test("a pack with too few cards is designed again, and the host can retry after the last failure", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana] = players;
  await readyEveryone(lobbyId, players);
  world.packSize = 3;

  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);

  expect(await lobbyOf(ana, lobbyId)).toMatchObject({
    status: "generating",
    generationError: "The pack came back with too few cards",
  });
  expect(world.packRequests).toBe(8);

  world.packSize = 12;
  await ana.as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settle(backend);
  expect((await lobbyOf(ana, lobbyId))?.status).toBe("drafting");
  expect(world.artPrompts).toHaveLength(24);
});

test("a generation step from a superseded attempt is ignored", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  const [ana] = players;
  await readyEveryone(lobbyId, players);
  world.openaiIsDown = true;
  await ana.as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);
  expect((await lobbyOf(ana, lobbyId))?.generationError).toBeTruthy();

  world.openaiIsDown = false;
  await ana.as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await backend.mutation(internal.draft.failures.record, {
    lobbyId,
    attempt: 4,
    key: "an-old-attempt",
    message: "stale failure",
  });

  expect((await lobbyOf(ana, lobbyId))?.generationError).toBeNull();
  await settle(backend);
  expect((await lobbyOf(ana, lobbyId))?.status).toBe("drafting");
});
