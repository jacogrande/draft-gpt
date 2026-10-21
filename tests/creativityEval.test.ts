import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, expect, test, vi } from "vitest";
import { Task } from "../convex/draft/set/types";
import { taskInstructions } from "../convex/draft/set/prompts";
import { executeTask } from "../convex/draft/set/execute";
import { createCaller } from "../scripts/batch-eval/calls";
import { arms, blocks, suffix } from "../scripts/creativity-eval/protocol";
import { generateSample, reviewSample } from "../scripts/creativity-eval/run";
import { cannedResponse } from "./cannedSet";

afterEach(() => vi.unstubAllGlobals());

test("creativity trials preserve accepted cards, audit prompts, and resume without more calls", async () => {
  const out = await mkdtemp(join(tmpdir(), "creativity-eval-test-"));
  const requests: { instructions: string; input: string; reasoning: { effort: string } }[] = [];
  vi.stubGlobal("fetch", async (_url: unknown, init: { body: string }) => {
    const request = JSON.parse(init.body);
    requests.push(request);
    const task = JSON.parse(request.input).task as Task;
    const response = cannedResponse(task);
    if (task.stage === "generate" && task.slots!.length === 15) {
      const content = response.output[0].content[0];
      const data = JSON.parse(content.text);
      data.cards.pop();
      content.text = JSON.stringify(data);
    }
    return new Response(JSON.stringify(response));
  });
  try {
    const caller = await createCaller(out, 1);
    const arm = arms.find((a) => a.id === "SPJ")!;
    const sample = await generateSample(out, arm, blocks[0], caller);
    expect(sample.designs).toHaveLength(15);
    expect(sample.batches[0].attempts.map((a) => a.accepted)).toEqual([14, 1]);
    expect(sample.batches[0].missing).toEqual([]);
    const repair = JSON.parse(requests[3].input).task as Task;
    expect(repair.slots).toHaveLength(1);
    expect(repair.reservedNames).toHaveLength(14);
    expect(repair.slots![0].id).toBe("R012");
    expect(requests[0].instructions).toContain(suffix(arm, blocks[0], "brief"));
    expect(requests[1].instructions).toContain(suffix(arm, blocks[0], "slots"));
    expect(requests[2].instructions).toBe(taskInstructions(JSON.parse(requests[2].input).task));
    expect(requests.slice(0, 4).map(request => request.reasoning.effort)).toEqual(["none", "none", "none", "none"]);
    await reviewSample(sample, caller);
    expect(requests[4].instructions).not.toContain("Creative starting ingredients:");
    expect(requests[4].reasoning.effort).toBe("none");
    const record = JSON.parse(await readFile(join(out, "calls/SPJ-repeat1-brief-try0.json"), "utf8"));
    expect(record.request.instructions).toBe(requests[0].instructions);
    expect(record.request.reasoning).toBe(requests[0].reasoning.effort);
    await generateSample(out, arm, blocks[0], caller);
    await reviewSample(sample, caller);
    expect(requests).toHaveLength(5);
    const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8"));
    expect(ledger).toHaveLength(5);
    expect(ledger.every((r: { state: string }) => r.state === "settled")).toBe(true);
    const task: Task = { stage: "brief", ideas: [], total: 135 };
    await executeTask(task);
    expect(requests[5].instructions).toBe(taskInstructions(task));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
