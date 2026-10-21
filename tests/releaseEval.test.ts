import { cannedReview } from "./cannedReview";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, expect, test, vi } from "vitest";
import { Task } from "../convex/draft/set/types";
import { runTrial } from "../scripts/release-eval/run";
import { cannedResponse } from "./cannedSet";
import { fixtureTask, fixtures } from "../scripts/release-eval/fixtures";
import { parseDesigns } from "../convex/draft/set/parsing";

afterEach(() => vi.unstubAllGlobals());

test("review calibration fixtures have valid slots including zero-mana artifacts", () => {
  for (const mode of ["default", "busted"] as const) {
    const task = fixtureTask(mode);
    const parsed = parseDesigns({ cards: task.designs!.map(card => ({ ...card, face: Object.fromEntries(Object.entries(card.face).filter(([key]) => key !== "image_url")) })) }, task.slots!, task.blueprint!);
    expect(parsed.errors).toEqual([]);
    expect(parsed.cards).toHaveLength(fixtures.length);
    expect(task.slots!.filter(s => ["H07", "H09", "H11"].includes(s.id)).map(s => s.minMana)).toEqual([0, 0, 0]);
    expect(JSON.stringify(task)).not.toContain('"expected"');
    expect(JSON.stringify(task)).not.toContain('"reason"');
  }
});

test.each([undefined, "none"] as const)("release evaluation preserves repairs, gates and reasoning override %s when resumed", async (reasoning) => {
  const out = await mkdtemp(join(tmpdir(), "release-eval-"));
  const tasks: Task[] = [];
  const efforts: string[] = [];
  vi.stubGlobal("fetch", async (_url: unknown, init: { body: string }) => {
    const request = JSON.parse(init.body);
    const task = JSON.parse(request.input).task as Task;
    tasks.push(task);
    efforts.push(request.reasoning.effort);
    const response = cannedResponse(task), content = response.output[0].content[0];
    const data = JSON.parse(content.text);
    if (task.stage === "generate" && task.slots?.length === 15) data.cards.pop();
    if (task.stage === "review" && task.scope === "global") {
      data.issues = [{ id: "edit", slots: ["C001"], severity: "major",
        evidence: "Fixture needs a stronger effect", correction: "Improve inside the fixed slot" }];
      data.audit = cannedReview(task, data.issues).audit;
    }
    if (task.stage === "final") data.issues = [{ id: "unfixed", slots: ["C001"], severity: "major",
      evidence: "Unresolved fixture defect", correction: "Repair before publication" }];
    if (task.stage === "final") data.audit = cannedReview(task, data.issues).audit;
    content.text = JSON.stringify(data);
    return new Response(JSON.stringify(response));
  });
  try {
    const trial = { id: "busted-135", total: 135, powerLevel: "busted" as const, seed: 731, reasoning };
    const result = await runTrial(out, trial);
    expect(result.designs).toHaveLength(135);
    expect(result.structurallyComplete).toBe(true);
    expect(result.ready).toBe(false);
    expect(result.finalReview.issues[0].id).toBe("unfixed");
    const repairs = tasks.filter(t => t.stage === "generate" && t.slots?.length === 1);
    expect(repairs).toHaveLength(9);
    expect(repairs.every(t => t.reservedNames?.length === 14)).toBe(true);
    expect(tasks.every(t => t.powerLevel === "busted" && t.referenceSeed === 731)).toBe(true);
    expect(tasks.some(t => t.stage === "revise")).toBe(true);
    tasks.forEach((task, index) => expect(efforts[index]).toBe(reasoning ?? (["revise", "final"].includes(task.stage) ? "medium" : "none")));
    const finalCall = JSON.parse(await readFile(join(out, trial.id, "calls/final-try0.json"), "utf8"));
    expect(finalCall.request.reasoning).toBe(reasoning ?? "medium");
    const count = tasks.length;
    expect((await runTrial(out, trial)).ready).toBe(false);
    expect(tasks).toHaveLength(count);
    await expect(runTrial(out, { ...trial, reasoning: reasoning === "none" ? undefined : "none" })).rejects.toThrow("reasoning");
    const ledger = JSON.parse(await readFile(join(out, trial.id, "ledger.json"), "utf8"));
    expect(ledger).toHaveLength(count);
    expect(ledger.every((r: { state: string }) => r.state === "settled")).toBe(true);
  } finally { await rm(out, { recursive: true, force: true }); }
}, 20000);
