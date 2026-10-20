import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { executeTask } from "../convex/draft/set/execute";
import { inspectTask } from "../convex/draft/set/requestContext";
import { ReasoningEffort } from "../convex/draft/set/modelSettings";
import { Review, Screening, Task } from "../convex/draft/set/types";
import { powerCases, powerTask } from "../tests/powerCases";

const out = resolve(process.argv[2] ?? `.artifacts/power-eval-${Date.now()}`);
const repeats = Number(process.argv[3] ?? 2);
if (!Number.isInteger(repeats) || repeats < 1 || repeats > 5)
  throw new Error("Use one to five repetitions");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
await mkdir(out, { recursive: true });
let spent = 0;
const results: unknown[] = [];
for (const effort of ["low", "medium"] as ReasoningEffort[]) {
  for (let repeat = 1; repeat <= repeats; repeat++) {
    const task: Task = powerTask("review");
    const request = { ...inspectTask(task), reasoning: effort };
    if (spent + request.reservation > 0.25)
      throw new Error("Evaluation budget reached");
    const start = Date.now();
    const result = await executeTask(task, { reasoning: effort });
    spent += result.usage.cost;
    const review = result.data as Review | null;
    const expected = powerCases
      .filter((c) => Object.values(c.expect).some(Boolean))
      .map((c) => c.slot.id);
    const flagged = [
      ...new Set(
        review?.issues
          .filter((i) => i.severity !== "minor")
          .flatMap((i) => i.slots) ?? []
      ),
    ];
    const entry = {
      effort,
      repeat,
      durationMs: Date.now() - start,
      request,
      ...result,
      expected,
      flagged,
      missed: expected.filter((id) => !flagged.includes(id)),
      falsePositives: flagged.filter((id) => !expected.includes(id)),
    };
    results.push(entry);
    await writeFile(
      join(out, `${effort}-${repeat}.json`),
      JSON.stringify(entry, null, 2)
    );
    console.log(
      `${effort} ${repeat}: missed ${
        entry.missed.join(",") || "none"
      }; false positives ${entry.falsePositives.join(",") || "none"}; ${
        result.error ?? "valid"
      }`
    );
    if (result.error) throw new Error(result.error);
  }
}
const task = powerTask("screen");
const request = inspectTask(task);
if (spent + request.reservation > 0.25)
  throw new Error("Evaluation budget reached");
const result = await executeTask(task);
spent += result.usage.cost;
const screens = result.data as Screening[] | null;
const mismatches = powerCases.flatMap((c) =>
  Object.entries(c.expect).flatMap(([key, expected]) => {
    const criterion = key === "slot" ? key : `power_${key}`;
    const actual = screens?.find(
      (s) => s.name === `${c.slot.id}:${criterion}`
    )?.choice;
    return actual === (expected ? "review" : "pass")
      ? []
      : [
          {
            id: c.slot.id,
            criterion,
            expected: expected ? "review" : "pass",
            actual,
          },
        ];
  })
);
await writeFile(
  join(out, "screen.json"),
  JSON.stringify({ request, ...result, mismatches }, null, 2)
);
await writeFile(
  join(out, "summary.json"),
  JSON.stringify(
    {
      reportedTextCost: spent,
      results,
      screening: { ...result, mismatches },
      limitation:
        "Small development regression suite, not a held-out benchmark or human playtest. Expected labels are editorial and never sent to the model. Review metrics count material issues by card, so inspect evidence to check the reason. Reported usage excludes uncertain failed requests and is not an invoice.",
    },
    null,
    2
  )
);
console.log(
  `Saved ${out}; Decisions mismatches ${
    mismatches.length
  }; reported cost $${spent.toFixed(4)}`
);
if (result.error) throw new Error(result.error);
