import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  openLobby,
  readyEveryone,
  signIn,
  startBackend,
} from "../../tests/backend";
import { packOf, pickFirst, seen, settleSet, pass } from "../../tests/drafting";
import { fakeOutsideWorld } from "../../tests/outsideWorld";
import { api, internal } from "../_generated/api";
import { worldDirection } from "./set/worldDirection";
import { Task } from "./set/types";

vi.setConfig({ testTimeout: 30000 });

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("SET_GENERATION_ENABLED", undefined);
  fakeOutsideWorld();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

test("a draft saves its world direction through brief repair", async () => {
  const world = fakeOutsideWorld();
  let briefCalls = 0;
  world.setReply = (task, response) => {
    if (task.stage === "brief" && briefCalls++ === 0)
      response.output[0].content[0].text = JSON.stringify({ world: {} });
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["SeedAna", "SeedBen"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  const initial = await backend.run(async (ctx) => ({
    run: (await ctx.db.query("setRuns").collect())[0],
    task: JSON.parse((await ctx.db.query("setJobs").collect())[0].task) as Task,
  }));
  expect(initial.task.worldDirection).toEqual(worldDirection(initial.run.seed));
  expect(initial.task.creativeSeed).toBeUndefined();
  expect(JSON.parse(initial.run.worldDirection!)).toEqual(initial.task.worldDirection);
  await settleSet(backend, lobbyId, players);
  const briefs = world.setRequests.filter((task) => task.stage === "brief");
  expect(briefs).toHaveLength(2);
  for (const task of briefs)
    expect(task.worldDirection).toEqual(initial.task.worldDirection);
  expect(world.setRequests.filter((task) => task.stage !== "brief")
    .every((task) => task.worldDirection === undefined)).toBe(true);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
  const setting = await players[0].as.query(api.draft.settings.forLobby, { lobbyId });
  expect(JSON.stringify(setting)).toContain("sea serpent");
});

test("new lobbies rotate structural directions without sharing other lobbies' lore", async () => {
  const world = fakeOutsideWorld();
  world.openaiIsDown = true;
  const backend = startBackend();
  const first = await openLobby(backend, ["FirstA", "FirstB"]);
  const second = await openLobby(backend, ["SecondA", "SecondB"]);
  for (const { lobbyId, players } of [first, second]) {
    await readyEveryone(lobbyId, players);
    await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  }
  const runs = await backend.run((ctx) => ctx.db.query("setRuns").collect());
  const a = JSON.parse(runs[0].worldDirection!);
  const b = JSON.parse(runs[1].worldDirection!);
  for (const key of ["focus", "conflict", "access", "visual"])
    expect(a[key]).not.toBe(b[key]);
  const tasks = await backend.run(async (ctx) =>
    (await ctx.db.query("setJobs").collect()).map((j) => JSON.parse(j.task) as Task));
  expect(tasks[1].worldDirection).toEqual(b);
  expect(Object.keys(b).sort()).toEqual(["access", "conflict", "focus", "seed", "version", "visual"]);
  expect(await second.players[0].as.query(api.draft.setRuns.progress, { lobbyId: first.lobbyId })).toBeNull();
  const own = await second.players[0].as.query(api.draft.setRuns.progress, { lobbyId: second.lobbyId });
  expect(own).not.toHaveProperty("worldDirection");
});

test("new drafts default to a shared set and keep future cards private", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  expect(
    await backend.run(async (ctx) => (await ctx.db.get(lobbyId))?.setRunId)
  ).toBeTruthy();
  const before = await backend.run(
    async (ctx) => (await ctx.db.query("setJobs").collect())[0]
  );
  await backend.mutation(internal.draft.setJobs.finish, {
    jobId: before._id,
    key: "superseded-key",
    result: "null",
    usage: JSON.stringify({ cost: 1000 }),
  });
  expect(await backend.run((ctx) => ctx.db.get(before._id))).toEqual(before);
  await settleSet(backend, lobbyId, players);
  const pack = await packOf(players[0], lobbyId);
  expect(pack?.cards).toHaveLength(15);
  expect(new Set(pack?.cards.map((card) => card.name)).size).toBe(15);
  const setting = await players[0].as.query(api.draft.settings.forLobby, {
    lobbyId,
  });
  expect(setting?.archetypes).toHaveLength(10);
  const outsider = await signIn(backend, "Outsider");
  expect(
    await outsider.as.query(api.draft.setRuns.progress, { lobbyId })
  ).toBeNull();
  const progress = await players[0].as.query(api.draft.setRuns.progress, {
    lobbyId,
  });
  expect(progress).toMatchObject({
    phase: "ready",
    total: 135,
    completed: 135,
  });
  expect(progress).not.toHaveProperty("designs");
  const first = pack!.cards[0];
  await players[0].as.mutation(api.draft.picks.pick, { cardId: first.id });
  const deck = await players[0].as.query(api.deck.decks.forLobby, { lobbyId });
  const picked = deck!.cards[0];
  await backend.run(async (ctx) => {
    const design = (await ctx.db.get(picked.designId!))!;
    await ctx.db.patch(design._id, {
      card: { ...design.card!, image_url: "https://example.test/late-art.jpg" },
    });
  });
  const refreshed = await players[0].as.query(api.deck.decks.forLobby, {
    lobbyId,
  });
  expect(refreshed!.cards[0].image_url).toBe(
    "https://example.test/late-art.jpg"
  );
});

test("all three rounds use the frozen inventory and give independent copies", async () => {
  const world = fakeOutsideWorld();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  const calls = world.setRequests.length;
  vi.stubEnv("SET_GENERATION_ENABLED", "false");
  for (let pick = 0; pick < 45; pick++) {
    for (const player of players)
      expect(await pickFirst(player, lobbyId)).toBe(true);
    await settleSet(backend, lobbyId, players);
    await seen(lobbyId, players);
  }
  expect(world.setRequests.length).toBe(calls);
  for (const player of players) {
    const deck = await player.as.query(api.deck.decks.forLobby, { lobbyId });
    expect(deck?.cards).toHaveLength(45);
    expect(new Set(deck?.cards.map((card) => card.id)).size).toBe(45);
  }
});

test("revision retries protect accepted names and include only unfinished designs", async () => {
  const world = fakeOutsideWorld();
  let repairAttempt = 0;
  world.setReply = (task, response) => {
    if (task.stage === "review" && task.scope === "global")
      response.output[0].content[0].text = JSON.stringify({
        summary: "Repair two cards",
        blueprintBroken: false,
        issues: [{
          id: "two-cards",
          slots: ["C001", "C002"],
          severity: "major",
          evidence: "Two rates need improvement",
          correction: "Improve effects within the fixed slots",
        }],
      });
    if (task.stage === "revise") {
      const body = JSON.parse(response.output[0].content[0].text);
      if (repairAttempt === 0) {
        body.cards[0].face.name = "Revised Bridge Guard";
        body.cards[1].face.type = "Artifact";
      } else if (repairAttempt === 1) {
        body.cards[0].face.name = "Revised Bridge Guard";
      }
      repairAttempt++;
      response.output[0].content[0].text = JSON.stringify(body);
    }
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  const revisions = world.setRequests.filter((t) => t.stage === "revise");
  expect(revisions).toHaveLength(3);
  for (const repair of revisions.slice(1)) {
    expect(repair.slots?.map((s) => s.id)).toEqual(["C002"]);
    expect(repair.designs?.map((d) => d.slotId)).toEqual(["C002"]);
    expect(repair.reservedNames).toContain("Revised Bridge Guard");
  }
  expect(revisions[2].feedback).toContain('C002: name "Revised Bridge Guard"');
  const final = world.setRequests.find((t) => t.stage === "final")!;
  expect(final.designs?.find((d) => d.slotId === "C001")?.face.name).toBe(
    "Revised Bridge Guard"
  );
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
});

test("a missing design repairs only that slot and does not repeat accepted cards", async () => {
  const world = fakeOutsideWorld();
  let damaged = false;
  let missing = "";
  world.setReply = (task, response) => {
    if (task.stage === "generate" && !damaged) {
      damaged = true;
      const body = JSON.parse(response.output[0].content[0].text);
      missing = body.cards.pop().slotId;
      response.output[0].content[0].text = JSON.stringify(body);
    }
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(await packOf(players[0], lobbyId)).not.toBeNull();
  expect(
    world.setRequests
      .filter((t) => t.stage === "generate" && t.slots?.length === 1)
      .map((t) => t.slots![0].id)
  ).toEqual([missing]);
});

test("review issues cause one targeted edit and final review without Decisions", async () => {
  const world = fakeOutsideWorld();
  world.setReply = (task, response) => {
    if (task.stage === "review" && task.scope === "global")
      response.output[0].content[0].text = JSON.stringify({
        summary: "One card needs repair",
        blueprintBroken: false,
        issues: [
          {
            id: "power-C001",
            slots: ["C001"],
            severity: "major",
            evidence: "The effect is too efficient",
            correction: "Reduce the effect within the slot contract",
          },
        ],
      });
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(await packOf(players[0], lobbyId)).not.toBeNull();
  expect(
    world.setRequests
      .filter((t) => t.stage === "revise")
      .flatMap((t) => t.slots!.map((s) => s.id))
  ).toEqual(["C001"]);
  expect(
    world.setRequests.some(
      (t) => t.stage === "screen" || t.stage === "rescreen"
    )
  ).toBe(false);
  const final = world.setRequests.find((t) => t.stage === "final")!;
  expect(final.designs).toHaveLength(135);
  expect(final.issues?.some((issue) => issue.slots.includes("C001"))).toBe(
    true
  );
  expect(final.screens).toBeUndefined();
});

test("a serious final issue blocks drafting and requires a fresh candidate", async () => {
  const world = fakeOutsideWorld();
  world.setReply = (task, response) => {
    if (task.stage === "final")
      response.output[0].content[0].text = JSON.stringify({
        summary: "Broken",
        blueprintBroken: false,
        issues: [
          {
            id: "remaining",
            slots: ["C001"],
            severity: "major",
            evidence: "No counterplay",
            correction: "Needs redesign",
          },
        ],
      });
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(await packOf(players[0], lobbyId)).toBeNull();
  expect(
    await players[0].as.query(api.draft.setRuns.progress, { lobbyId })
  ).toMatchObject({ restartRequired: true, phase: "final" });
  world.setReply = null;
  await players[0].as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(await packOf(players[0], lobbyId)).not.toBeNull();
}, 15000);

test("eight players receive packs from a 270-card inventory", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(
    backend,
    Array.from({ length: 8 }, (_, i) => `Player${i}`)
  );
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  await pass(backend, 100, lobbyId, players);
  expect(
    await players[0].as.query(api.draft.setRuns.progress, { lobbyId })
  ).toMatchObject({ total: 270, completed: 270, phase: "ready" });
  for (const player of players)
    expect((await packOf(player, lobbyId))?.cards).toHaveLength(15);
}, 20000);

test("provider failure resumes the saved run without changing its budget", async () => {
  const world = fakeOutsideWorld();
  world.openaiIsDown = true;
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(
    (await players[0].as.query(api.lobby.lobbies.get, { lobbyId }))
      ?.generationError
  ).toBeTruthy();
  const first = await backend.run(
    async (ctx) => (await ctx.db.query("setRuns").collect())[0]
  );
  world.openaiIsDown = false;
  await players[0].as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settleSet(backend, lobbyId, players);
  const after = await backend.run((ctx) => ctx.db.get(first._id));
  expect(after?.budget).toBe(first.budget);
  expect(after!.spent).toBeGreaterThan(first.spent);
  expect(after?.phase).toBe("ready");
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
});

test("closing a lobby before its job finishes prevents publication", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await backend.run((ctx) => ctx.db.patch(lobbyId, { status: "closed" }));
  await settleSet(backend, lobbyId, players);
  expect(
    await backend.run((ctx) => ctx.db.query("setDesigns").collect())
  ).toHaveLength(0);
  expect(await packOf(players[0], lobbyId)).toBeNull();
});

test("budget exhaustion stops required work instead of bypassing review", async () => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["Ana", "Ben"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await backend.run(async (ctx) => {
    const run = (await ctx.db.query("setRuns").collect())[0];
    await ctx.db.patch(run._id, { budget: 0.00001 });
  });
  await settleSet(backend, lobbyId, players);
  expect(
    (await players[0].as.query(api.lobby.lobbies.get, { lobbyId }))
      ?.generationError
  ).toContain("budget");
  expect(await packOf(players[0], lobbyId)).toBeNull();
});

test("Luna reviews every card with references and no screening calls", async () => {
  const world = fakeOutsideWorld();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, [
    "ReferenceAna",
    "ReferenceBen",
  ]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
  const generation = world.setPayloads.find(
    (p) => JSON.parse(p.input).task.stage === "generate"
  )!;
  const writing = JSON.parse(generation.input);
  expect(generation.instructions).toContain("Modern Horizons");
  expect(writing.tools.references.cards.length).toBeGreaterThan(0);
  expect(writing.tools.references.cards.length).toBeLessThanOrEqual(48);
  expect(writing.tools.references.slots).toHaveLength(
    writing.task.slots.length
  );
  expect(writing.task.ideas).toEqual([]);
  expect(world.setPayloads.some((p) => p.questions)).toBe(false);
  const globalReview = world.setRequests.find(
    (t) => t.stage === "review" && t.scope === "global"
  )!;
  expect(globalReview.designs).toHaveLength(135);
  expect(globalReview.screens).toBeUndefined();
  const final = world.setPayloads.find(
    (p) => JSON.parse(p.input).task.stage === "final"
  )!;
  expect(JSON.parse(final.input).tools.support.coverage).toBe(
    "complete_inventory"
  );
  expect(final.reasoning?.effort).toBe("medium");
});

test("a type repair names the violated slot and preserves accepted designs", async () => {
  const world = fakeOutsideWorld();
  let changed: string | undefined;
  world.setReply = (task, response) => {
    if (task.stage === "generate" && !changed) {
      const body = JSON.parse(response.output[0].content[0].text);
      changed = body.cards[0].slotId;
      body.cards[0].face.type = "Artifact";
      response.output[0].content[0].text = JSON.stringify(body);
    }
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, [
    "RepairAna",
    "RepairBen",
  ]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
  const repair = world.setRequests.find(
    (task) => task.stage === "generate" && task.slots?.length === 1
  );
  expect(repair?.slots?.[0].id).toBe(changed);
  expect(repair?.feedback).toContain(
    `${changed}: type Artifact violates fixed type Creature`
  );
});
