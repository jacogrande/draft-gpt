import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  Backend,
  openLobby,
  Player,
  readyEveryone,
  rejection,
  signIn,
  startBackend,
} from "../../tests/backend";
import { fakeOutsideWorld } from "../../tests/outsideWorld";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

let world: ReturnType<typeof fakeOutsideWorld>;

beforeEach(() => {
  vi.useFakeTimers();
  world = fakeOutsideWorld();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const settle = async (backend: Backend) => {
  while (vi.getTimerCount() > 0) {
    vi.advanceTimersToNextTimer();
    await backend.finishInProgressScheduledFunctions();
  }
};

const startedDraft = async (usernames: string[]) => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, usernames);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);
  return { backend, lobbyId, players };
};

const lobbyOf = (player: Player, lobbyId: Id<"lobbies">) =>
  player.as.query(api.lobby.lobbies.get, { lobbyId });

const packOf = (player: Player, lobbyId: Id<"lobbies">) =>
  player.as.query(api.draft.picks.current, { lobbyId });

const pickFirst = async (player: Player, lobbyId: Id<"lobbies">) => {
  const pack = await packOf(player, lobbyId);
  if (!pack) return false;
  await player.as.mutation(api.draft.picks.pick, { cardId: pack.cards[0].id });
  return true;
};

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
