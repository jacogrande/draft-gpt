import { cannedReview } from "../../tests/cannedReview";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { openLobby, readyEveryone, signIn, startBackend } from "../../tests/backend";
import { packOf, settleSet } from "../../tests/drafting";
import { fakeOutsideWorld } from "../../tests/outsideWorld";
import { Task } from "./set/types";

beforeEach(() => { vi.useFakeTimers(); vi.stubEnv("SET_GENERATION_ENABLED", undefined); fakeOutsideWorld(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

test("full conversation and support are frozen, interpreted once and carried into card assignments", async () => {
  const world = fakeOutsideWorld();
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["ChatAna", "ChatBen"]);
  for (let i = 0; i < 45; i++)
    await players[i % 2].as.mutation(api.lobby.messages.post, { lobbyId, text: i ? `Discussion ${i}: ${"a".repeat(150)}` : "Moth-mounted knights" });
  const [message] = await players[0].as.query(api.lobby.messages.list, { lobbyId });
  await players[1].as.mutation(api.lobby.messages.support, { lobbyId, messageId: message.id, use: true });
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  const initial = await backend.run(async ctx => ({ run: (await ctx.db.query("setRuns").collect())[0], job: (await ctx.db.query("setJobs").collect())[0] }));
  const task = JSON.parse(initial.job.task) as Task;
  expect(task.stage).toBe("interpret");
  expect(task.conversation).toHaveLength(45);
  expect(task.conversation?.[0]).toMatchObject({ id: "m1", participant: "p1", text: "Moth-mounted knights", supportedBy: ["p2"] });
  expect(JSON.stringify(task.conversation)).not.toContain(players[0].userId);
  await backend.mutation(internal.draft.setJobs.finish, { jobId: initial.job._id, key: "stale", result: "{}", usage: JSON.stringify({ cost: 100 }) });
  expect(await backend.run(ctx => ctx.db.get(initial.job._id))).toEqual(initial.job);
  await settleSet(backend, lobbyId, players);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
  expect(world.setRequests.filter(t => t.stage === "interpret")).toHaveLength(1);
  const brief = world.setRequests.find(t => t.stage === "brief")!;
  expect(brief.intent?.preferences[0].sourceMessages).toContain("m1");
  expect(brief.intent?.signals?.[0]).toEqual({ preferenceId: "p-1", supporters: ["p2"], contributors: ["p1"] });
  expect(brief.conversation).toBeUndefined();
  const writer = world.setRequests.find(t => t.stage === "generate")!;
  expect(writer.slots?.some(s => s.preferenceIds?.includes("p-1"))).toBe(true);
  for (const task of world.setRequests.filter(t => t.stage !== "interpret")) expect(task.conversation).toBeUndefined();
  const view = await players[1].as.query(api.draft.guidance.forLobby, { lobbyId });
  expect(view?.preferences[0]).toMatchObject({ text: "Moth-mounted knights", sources: [{ id: "m1", text: "Moth-mounted knights" }], supportCount: 1 });
  expect(view?.preferences[0].plan?.disposition).toBe("incorporated");
  const outsider = await signIn(backend, "GuidanceOutsider");
  expect(await outsider.as.query(api.draft.guidance.forLobby, { lobbyId })).toBeNull();
}, 20000);

test("invalid source references retry interpretation; fresh candidates reuse the saved intent", async () => {
  const world = fakeOutsideWorld();
  let interpretations = 0;
  world.setReply = (task, response) => {
    const body = JSON.parse(response.output[0].content[0].text);
    if (task.stage === "interpret" && interpretations++ === 0) body.preferences[0].sourceMessages = ["invented-message"];
    if (task.stage === "final") body.issues = [{ id: "reject", slots: ["C001"], severity: "major", evidence: "Fixture defect", correction: "Repair card" }];
    if (task.stage === "final") body.audit = cannedReview(task, body.issues).audit;
    response.output[0].content[0].text = JSON.stringify(body);
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["RetryChatA", "RetryChatB"]);
  await players[0].as.mutation(api.lobby.messages.post, { lobbyId, text: "No merchant guilds" });
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(interpretations).toBe(2);
  const tasks = world.setRequests.filter(t => t.stage === "interpret");
  expect(tasks[1].conversation).toEqual(tasks[0].conversation);
  expect(tasks[1].feedback).toContain("Unknown source");
  expect(await packOf(players[0], lobbyId)).toBeNull();
  world.setReply = null;
  await players[0].as.mutation(api.draft.failures.retryGeneration, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect(world.setRequests.filter(t => t.stage === "interpret")).toHaveLength(2);
  expect((await packOf(players[0], lobbyId))?.cards).toHaveLength(15);
}, 20000);


test("accepted subjects without card assignments stop before writing", async () => {
  const world = fakeOutsideWorld();
  world.setReply = (task, response) => {
    if (task.stage === "slots") {
      const body = JSON.parse(response.output[0].content[0].text);
      for (const slot of body.slots) slot.preferenceIds = [];
      response.output[0].content[0].text = JSON.stringify(body);
    }
    return response;
  };
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, ["UnassignedA", "UnassignedB"]);
  await players[0].as.mutation(api.lobby.messages.post, { lobbyId, text: "Moth-mounted knights" });
  await readyEveryone(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settleSet(backend, lobbyId, players);
  expect((await players[0].as.query(api.lobby.lobbies.get, { lobbyId }))?.generationError).toContain("No card slots express preference");
  expect(world.setRequests.some(t => t.stage === "generate")).toBe(false);
  expect(await packOf(players[0], lobbyId)).toBeNull();
});
