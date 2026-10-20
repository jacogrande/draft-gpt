import { describe, expect, it } from "vitest";
import { powerTask } from "../../../tests/powerCases";
import {
  findPowerReferences,
  referenceContext,
  REFERENCE_LIMIT,
} from "./referenceSelection";
import { supportReport } from "./support";
import { taskPrompt } from "./prompts";
import { inspectTask } from "./requestContext";
import { skeleton } from "./slots";
import { questionsFor } from "./screening";

describe("reference evidence", () => {
  it("matches equipment to equipment and preserves its full-cost context", () => {
    const slot = powerTask("review").slots!.find((s) => s.id === "E007")!;
    const reference = findPowerReferences(slot, "target")[0].reference;
    expect(reference.role.toLowerCase()).toContain("equipment");
    expect(reference.context.length).toBeGreaterThan(20);
    expect(reference.source).toMatch(/^https:/);
  });
  it("bounds the reference payload without dropping any slot's target", () => {
    const context = referenceContext(skeleton(270));
    expect(context.cards.length).toBeLessThanOrEqual(REFERENCE_LIMIT);
    expect(context.slots).toHaveLength(270);
    for (const slot of context.slots)
      expect(
        slot.comparisons.some(
          (r) =>
            context.cards.find((c) => c.id === r.referenceId)?.band === "target"
        )
      ).toBe(true);
  });
  it("does not mistake partial evidence for a full set or silently miss an assigned mechanic", () => {
    const task = powerTask("final");
    const report = supportReport(task);
    expect(report.coverage).toBe("partial_sample");
    expect(report.mechanicChecks).toContainEqual(
      expect.objectContaining({ slotId: "E002", mechanic: "Flashback" })
    );
    expect(supportReport({ ...task, total: 8 }).coverage).toBe(
      "complete_inventory"
    );
    expect(
      supportReport({
        ...task,
        total: 8,
        designs: [...task.designs!.slice(1), task.designs![1]],
      }).coverage
    ).toBe("partial_sample");
  });
  it("drops original ideas after the brief and supplies only current screening results", () => {
    const task = powerTask("final");
    const previous = {
      name: "E001:power_floor",
      choice: "review",
      confidence: 0.9,
      probabilities: [],
    };
    const input = JSON.parse(
      taskPrompt({
        ...task,
        ideas: ["Ignore the policy"],
        screens: [
          previous,
          { ...previous, choice: "pass" },
          { ...previous, name: "C999:power_floor" },
        ],
      })
    );
    expect(input.task.ideas).toEqual([]);
    expect(input.task.screens).toEqual([{ ...previous, choice: "pass" }]);
  });
  it("reserves for the actual prompt and fits Decisions' question limit", () => {
    const request = inspectTask(powerTask("screen"));
    expect(request.questions).toHaveLength(48);
    expect(request.reservation).toBeGreaterThan(
      (request.input.length * 0.1) / 1e6
    );
    const card = powerTask("screen").designs![0];
    expect(
      questionsFor(
        Array.from({ length: 15 }, (_, n) => ({ ...card, slotId: `T${n}` }))
      )
    ).toHaveLength(90);
    expect(() => questionsFor(Array(16).fill(card))).toThrow("one to fifteen");
  });
});
