import { chunks } from "../../convex/draft/set/slots";
import { repairCards } from "../../convex/draft/set/repair";
import { inventoryProblems, duplicateIssues } from "../../convex/draft/set/parsing";
import { Design, Task } from "../../convex/draft/set/types";
import { Caller, backoff, pool } from "./calls";

export const generateCandidate = async (id: string, base: Task, size: number, call: Caller) => {
  const start = Date.now();
  const batches = await pool(chunks(base.slots!, size), async (slots, index) => {
    let task: Task = { ...base, stage: "generate", slots };
    const cards: Design[] = [];
    const attempts = [];
    for (let attempt = 0; attempt < 3 && task.slots!.length; attempt++) {
      const record = await call(`${id}-batch${index}-try${attempt}`, task, {
        designBatchLimit: task.slots!.length,
        maxOutputTokens: Math.max(14000, Math.ceil(14000 * task.slots!.length / 15)),
      });
      const response = record.result?.data as { cards: Design[]; errors: string[] } | null;
      attempts.push({ id: record.id, requested: task.slots!.length,
        cacheHit: !!record.cacheHit,
        accepted: response?.cards.length ?? 0, durationMs: record.durationMs,
        usage: record.result?.usage, error: record.transportError ?? record.result?.error,
        errors: response?.errors ?? [] });
      if (response) {
        cards.push(...response.cards);
        task = repairCards(task, response);
      } else if (record.result?.error) task = { ...task, feedback: record.result.error };
      if (attempt < 2) await backoff(record, attempt);
    }
    return { index, requested: slots.length, cards, attempts,
      missing: task.slots!.map((s) => s.id) };
  });
  const designs = batches.flatMap((b) => b.cards)
    .sort((a, b) => base.slots!.findIndex((s) => s.id === a.slotId) - base.slots!.findIndex((s) => s.id === b.slotId));
  return { id, batchSize: size, startedAt: new Date(start).toISOString(),
    finishedAt: new Date().toISOString(), wallMs: Date.now() - start,
    resumed: batches.some((b) => b.attempts.some((a) => a.cacheHit)),
    designs, batches, inventoryProblems: inventoryProblems(base.slots!, designs),
    duplicateIssues: duplicateIssues(designs) };
};
export type Candidate = Awaited<ReturnType<typeof generateCandidate>>;
