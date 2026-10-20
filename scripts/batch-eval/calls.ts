import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { executeTask, TaskResult } from "../../convex/draft/set/execute";
import { inspectTask } from "../../convex/draft/set/requestContext";
import { retryAdvice, retryDelay } from "../../convex/draft/retry";
import { Task } from "../../convex/draft/set/types";

type Options = NonNullable<Parameters<typeof executeTask>[1]>;
export type CallRecord = {
  id: string;
  task: Task;
  request: ReturnType<typeof inspectTask>;
  options: Options;
  startedAt: string;
  durationMs: number;
  result: TaskResult | null;
  transportError?: string;
  retryAfterMs?: number;
  cacheHit?: boolean;
};
export type Caller = (id: string, task: Task, options?: Options) => Promise<CallRecord>;
type Charge = { id: string; state: "pending" | "settled"; cost: number };
export const createCaller = async (out: string, budget: number): Promise<Caller> => {
  await mkdir(join(out, "calls"), { recursive: true });
  const ledgerFile = join(out, "ledger.json");
  const ledger: Charge[] = JSON.parse(await readFile(ledgerFile, "utf8").catch(() => "[]"));
  let writes = Promise.resolve();
  const persist = () => {
    const snapshot = JSON.stringify(ledger, null, 2);
    writes = writes.then(() => writeFile(ledgerFile, snapshot));
    return writes;
  };
  return async (id, task, options = {}) => {
    const file = join(out, "calls", `${id}.json`);
    const saved = await readFile(file, "utf8").catch(() => null);
    if (saved) {
      const record = JSON.parse(saved) as CallRecord;
      if (JSON.stringify(record.task) !== JSON.stringify(task) ||
          JSON.stringify(record.options) !== JSON.stringify(options))
        throw new Error(`Checkpoint inputs changed: ${id}`);
      return { ...record, cacheHit: true };
    }
    if (ledger.some((entry) => entry.id === id))
      throw new Error(`Unresolved charged request ${id}; inspect before retrying`);
    const request = inspectTask(task, options.instructionsSuffix, options.stageInstructionsOverride);
    if (options.reasoning) request.reasoning = options.reasoning;
    if (options.maxOutputTokens) {
      request.reservation += Math.max(0, options.maxOutputTokens - (request.outputLimit ?? 0)) * 0.5 / 1e6;
      request.outputLimit = options.maxOutputTokens;
    }
    const spent = ledger.reduce((sum, entry) => sum + entry.cost, 0);
    if (spent + request.reservation > budget) throw new Error("Evaluation budget exhausted");
    const charge: Charge = { id, state: "pending", cost: request.reservation };
    ledger.push(charge);
    await persist();
    const start = Date.now();
    const record: CallRecord = { id, task, request, options,
      startedAt: new Date(start).toISOString(), durationMs: 0, result: null };
    try {
      record.result = await executeTask(task, options);
      charge.cost = record.result.usage.cost;
    } catch (error) {
      record.transportError = String(error);
      record.retryAfterMs = retryAdvice(error);
    }
    record.durationMs = Date.now() - start;
    await writeFile(file, JSON.stringify(record, null, 2));
    charge.state = "settled";
    await persist();
    const data = record.result?.data as { cards?: unknown[] } | null;
    console.log(`${id}: ${(record.durationMs / 1000).toFixed(1)}s; ${record.transportError ?? record.result?.error ?? (data?.cards ? `${data.cards.length}/${task.slots?.length} accepted` : "review accepted")}; $${charge.cost.toFixed(4)}`);
    return record;
  };
};
export const backoff = async (record: CallRecord, attempt: number) => {
  if (record.transportError)
    await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt + 1, record.retryAfterMs) ?? 0));
};
export const pool = async <T, U>(items: T[], fn: (item: T, index: number) => Promise<U>): Promise<U[]> => {
  const results: U[] = new Array(items.length);
  let next = 0;
  let failure: unknown;
  const workers = await Promise.allSettled(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (next < items.length && !failure) {
      const index = next++;
      try { results[index] = await fn(items[index], index); }
      catch (error) { failure = error; throw error; }
    }
  }));
  const rejected = workers.find((r) => r.status === "rejected");
  if (rejected?.status === "rejected") throw rejected.reason;
  return results;
};
