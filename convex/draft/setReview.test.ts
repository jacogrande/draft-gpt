import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api } from "../_generated/api";
import { openLobby, readyEveryone, startBackend } from "../../tests/backend";
import { packOf, settleSet } from "../../tests/drafting";
import { fakeOutsideWorld } from "../../tests/outsideWorld";

beforeEach(() => { vi.useFakeTimers(); vi.stubEnv("SET_GENERATION_ENABLED", undefined); fakeOutsideWorld(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

test("a whole-set critique can revise all 270 cards and final review sees the replacements", async () => {
  const world = fakeOutsideWorld();
  world.setReply = (task, response) => {
    const body = JSON.parse(response.output[0].content[0].text);
    if (task.stage === "review" && task.scope === "global") {
      body.issues = task.designs!.map((card, i) => ({ id: `improve-${i}`, slots: [card.slotId], severity: "major",
        evidence: `${card.face.name}: fixture needs stronger world flavor.`, correction: "Replace flavor with a concrete action." }));
      if (body.audit) body.audit.dimensions.find((d: { dimension: string }) => d.dimension === "flavor").issues = body.issues.map((i: { id: string }) => i.id);
    }
    if (task.stage === "revise") for (const card of body.cards) card.face.flavor_text = `A wing struck the stone at ${card.slotId}.`;
    response.output[0].content[0].text = JSON.stringify(body);
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, Array.from({ length: 5 }, (_, i) => `SetReview${i}`));
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  const global = world.setRequests.find(t => t.stage === "review" && t.scope === "global")!;
  expect(global.designs).toHaveLength(270);
  expect(global).toMatchObject({ reviewContract: "five-axis" });
  const revisions = world.setRequests.filter(t => t.stage === "revise");
  expect(revisions).toHaveLength(18);
  expect(new Set(revisions.flatMap(t => t.slots!.map(s => s.id))).size).toBe(270);
  expect(revisions.every(t => t.slots!.length <= 15)).toBe(true);
  const final = world.setRequests.find(t => t.stage === "final")!;
  expect(final.designs).toHaveLength(270);
  expect(final.designs!.every(d => d.face.flavor_text === `A wing struck the stone at ${d.slotId}.`)).toBe(true);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
  const job = await backend.run(async ctx => (await ctx.db.query("setJobs").collect()).find(j => j.stage === "final")!);
  expect(JSON.parse(job.result!).audit.dimensions.map((d: { dimension: string }) => d.dimension)).toEqual([
    "uniqueness", "mechanics", "archetypes", "flavor", "power",
  ]);
}, 20000);

test("an incomplete final critique repairs its missing coverage before publishing", async () => {
  const world = fakeOutsideWorld();
  let attempts = 0;
  world.setReply = (task, response) => {
    if (task.stage === "final" && attempts++ === 0) {
      const body = JSON.parse(response.output[0].content[0].text);
      if (body.audit) body.audit.dimensions.pop();
      response.output[0].content[0].text = JSON.stringify(body);
    }
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["CoverageA", "CoverageB"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(attempts).toBe(2);
  expect(world.setRequests.filter(t => t.stage === "final")[1].feedback).toContain("audit");
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
});

test("parallel revisions that invent the same name repair the later collision before final review", async () => {
  const world = fakeOutsideWorld();
  world.setReply = (task, response) => {
    const body = JSON.parse(response.output[0].content[0].text);
    if (task.stage === "review" && task.scope === "global") {
      body.issues = [{ id: "rename", slots: task.designs!.slice(0, 16).map(d => d.slotId), severity: "major",
        evidence: "Fixture names need distinct subjects.", correction: "Give each card a distinct world-specific name." }];
      body.audit.dimensions[0].issues = ["rename"];
    }
    if (task.stage === "revise" && !task.feedback)
      for (const card of body.cards)
        if (["C001", "C016"].includes(card.slotId)) card.face.name = "New Shared Name";
    response.output[0].content[0].text = JSON.stringify(body);
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["RenameA", "RenameB"]);
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  const repairs = world.setRequests.filter(t => t.stage === "revise" && t.feedback);
  expect(repairs).toHaveLength(1);
  expect(repairs[0].slots).toHaveLength(1);
  expect(repairs[0].feedback).toContain('"New Shared Name"');
  const final = world.setRequests.find(t => t.stage === "final")!;
  expect(new Set(final.designs!.map(d => d.face.name)).size).toBe(135);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
});
