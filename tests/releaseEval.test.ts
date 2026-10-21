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

test("release evaluation preserves partial repairs and failed final gates when resumed", async () => {
  const out = await mkdtemp(join(tmpdir(), "release-eval-"));
  const tasks: Task[] = [];
  vi.stubGlobal("fetch", async (_url: unknown, init: { body: string }) => {
    const task = JSON.parse(JSON.parse(init.body).input).task as Task;
    tasks.push(task);
    const response = cannedResponse(task), content = response.output[0].content[0];
    const data = JSON.parse(content.text);
    if (task.stage === "generate" && task.slots?.length === 15) data.cards.pop();
    if (task.stage === "final") data.issues = [{ id: "unfixed", slots: ["C001"], severity: "major",
      evidence: "Unresolved fixture defect", correction: "Repair before publication" }];
    content.text = JSON.stringify(data);
    return new Response(JSON.stringify(response));
  });
  try {
    const trial = { id: "busted-135", total: 135, powerLevel: "busted" as const, seed: 731 };
    const result = await runTrial(out, trial);
    expect(result.designs).toHaveLength(135);
    expect(result.structurallyComplete).toBe(true);
    expect(result.ready).toBe(false);
    expect(result.finalReview.issues[0].id).toBe("unfixed");
    const repairs = tasks.filter(t => t.stage === "generate" && t.slots?.length === 1);
    expect(repairs).toHaveLength(9);
    expect(repairs.every(t => t.reservedNames?.length === 14)).toBe(true);
    expect(tasks.every(t => t.powerLevel === "busted" && t.referenceSeed === 731)).toBe(true);
    const count = tasks.length;
    expect((await runTrial(out, trial)).ready).toBe(false);
    expect(tasks).toHaveLength(count);
    const ledger = JSON.parse(await readFile(join(out, trial.id, "ledger.json"), "utf8"));
    expect(ledger).toHaveLength(count);
    expect(ledger.every((r: { state: string }) => r.state === "settled")).toBe(true);
  } finally { await rm(out, { recursive: true, force: true }); }
}, 20000);
