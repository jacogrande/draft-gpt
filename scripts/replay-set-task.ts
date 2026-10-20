import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { executeTask } from "../convex/draft/set/execute";
import { inspectTask } from "../convex/draft/set/requestContext";
import { Task } from "../convex/draft/set/types";

const [source, target, effort] = process.argv.slice(2);
if (!source || !target || (effort && effort !== "low" && effort !== "medium"))
  throw new Error(
    "Usage: bun scripts/replay-set-task.ts saved-task.json result.json [low|medium]"
  );
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
const saved = JSON.parse(await readFile(source, "utf8"));
const task: Task = saved.task ?? saved;
if (
  ![
    "brief",
    "slots",
    "generate",
    "review",
    "editPlan",
    "revise",
    "final",
    "screen",
    "rescreen",
  ].includes(task.stage)
)
  throw new Error("Expected a saved text-generation task");
const request = inspectTask(task);
if (effort && request.endpoint === "decisions")
  throw new Error("Decisions does not accept reasoning effort");
if (request.reservation > 0.1)
  throw new Error("Replay exceeds the $0.10 reservation cap");
const reasoning = effort === "low" || effort === "medium" ? effort : undefined;
if (reasoning) request.reasoning = reasoning;
const start = Date.now();
const result = await executeTask(task, reasoning ? { reasoning } : {});
const batch = result.data as { cards?: unknown[]; errors?: string[] } | null;
const incomplete =
  ["generate", "revise"].includes(task.stage) &&
  batch?.cards?.length !== task.slots?.length;
await mkdir(dirname(resolve(target)), { recursive: true });
await writeFile(
  target,
  JSON.stringify(
    { task, request, durationMs: Date.now() - start, ...result },
    null,
    2
  )
);
console.log(
  `${task.stage}: ${
    result.error ??
    (incomplete
      ? `partial batch: ${batch?.cards?.length ?? 0}/${task.slots?.length}`
      : "parsed")
  }; reported cost $${result.usage.cost.toFixed(4)}; saved ${target}`
);
if (result.error || incomplete) process.exitCode = 1;
