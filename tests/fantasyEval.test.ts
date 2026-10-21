import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, expect, test, vi } from "vitest";
import { Task } from "../convex/draft/set/types";
import { taskInstructions } from "../convex/draft/set/prompts";
import { createCaller } from "../scripts/batch-eval/calls";
import { arms, blocks, BASELINE_SLOTS } from "../scripts/fantasy-eval/protocol";
import { generateWorld, reviewWorld } from "../scripts/fantasy-eval/run";
import { cannedResponse } from "./cannedSet";

afterEach(() => vi.unstubAllGlobals());

test("fantasy comparison isolates all three, audits the baseline override and repairs both packs", async () => {
  const out = await mkdtemp(join(tmpdir(), "fantasy-eval-test-"));
  const requests: { instructions: string; input: string; reasoning: { effort: string } }[] = [];
  vi.stubGlobal("fetch", async (_url: unknown, init: { body: string }) => {
    const request = JSON.parse(init.body);
    requests.push(request);
    const task = JSON.parse(request.input).task as Task;
    const response = cannedResponse(task);
    if (task.stage === "generate" && task.slots?.length === 15) {
      const content = response.output[0].content[0];
      const data = JSON.parse(content.text);
      data.cards.pop();
      content.text = JSON.stringify(data);
    }
    return new Response(JSON.stringify(response));
  });
  try {
    const caller = await createCaller(out, 1);
    for (const arm of arms) {
      const start = requests.length;
      const sample = await generateWorld(out, arm, blocks[0], caller);
      expect(sample.designs).toHaveLength(15);
      expect(sample.inventoryProblems).toEqual([]);
      expect(sample.batches[0].attempts.map((a) => a.accepted)).toEqual([14, 1]);
      const taskAt = (index: number) => JSON.parse(requests[start + index].input).task as Task;
      expect(taskAt(0).creativeSeed).toEqual(arm.seed ? blocks[0].creativeSeed : undefined);
      expect(requests[start].instructions).toBe(taskInstructions(taskAt(0)));
      expect(requests[start + 1].instructions).toBe(taskInstructions(taskAt(1), arm.jobs ? undefined : BASELINE_SLOTS));
      expect(requests[start + 2].instructions).toBe(taskInstructions(taskAt(2)));
      expect(taskAt(3).slots?.map((s) => s.id)).toEqual(["R012"]);
      expect(taskAt(3).reservedNames).toHaveLength(14);
      await reviewWorld(sample, caller);
      expect(taskAt(4).creativeSeed).toBeUndefined();
      expect(requests[start + 4].reasoning.effort).toBe("none");
      const record = JSON.parse(await readFile(join(out, `calls/${sample.id}-slots-try0.json`), "utf8"));
      expect(record.request.instructions).toBe(requests[start + 1].instructions);
      expect(record.options.stageInstructionsOverride).toBe(arm.jobs ? undefined : BASELINE_SLOTS);
      await generateWorld(out, arm, blocks[0], caller);
      await reviewWorld(sample, caller);
      expect(requests.length - start).toBe(5);
    }
    const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8"));
    expect(ledger).toHaveLength(10);
    expect(ledger.every((r: { state: string }) => r.state === "settled")).toBe(true);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});
