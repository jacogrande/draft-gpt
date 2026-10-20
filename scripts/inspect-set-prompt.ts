import { readFile, writeFile } from "node:fs/promises";
import { inspectTask } from "../convex/draft/set/requestContext";
import { Task } from "../convex/draft/set/types";
import { powerTask } from "../tests/powerCases";

const source = process.argv[2];
const raw = source
  ? JSON.parse(await readFile(source, "utf8"))
  : powerTask("review");
const task: Task = raw.task ?? raw;
const inspection = inspectTask(task);
const json = JSON.stringify(inspection, null, 2);
if (process.argv[3]) await writeFile(process.argv[3], json);
else console.log(json);
