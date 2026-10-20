import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { executeTask } from "../convex/draft/set/execute";
import {
  inspectTask,
  taskReservation,
} from "../convex/draft/set/requestContext";
import {
  Blueprint,
  Design,
  Review,
  Slot,
  Screening,
  Task,
  VERSIONS,
} from "../convex/draft/set/types";

const source = resolve(
  process.argv[2] ?? ".artifacts/pack-preview-v2/set.json"
);
const out = resolve(process.argv[3] ?? ".artifacts/prompt-pilot-v7");
const withScreening = process.argv.includes("--with-screening");
const previous = JSON.parse(await readFile(source, "utf8")) as {
  blueprint: Blueprint;
  designs: Design[];
  slots: Slot[];
  ideas: string[];
};
const weak = [
  "C016",
  "C019",
  "C020",
  "C031",
  "C039",
  "C056",
  "C060",
  "C062",
  "C067",
  "U040",
  "R001",
];
const controls = ["C014", "C002", "C021", "C065"];
const selected = [...weak, ...controls];
const before = previous.designs.filter((d) => selected.includes(d.slotId));
const slots = previous.slots.filter((s) => selected.includes(s.id));
if (before.length !== 15 || slots.length !== 15)
  throw new Error("The pilot needs all fifteen source designs and slots.");
await mkdir(out, { recursive: true });
let spent = 0,
  reserved = 0,
  sequence = 0;
const usage: unknown[] = [];
const call = async (task: Task): Promise<unknown> => {
  let current = task;
  for (let attempt = 0; attempt < 3; attempt++) {
    const reservation = taskReservation(current);
    if (spent + reserved + reservation > 0.5)
      throw new Error("Pilot budget reached.");
    reserved += reservation;
    let result;
    try {
      result = await executeTask(current);
    } catch (error) {
      reserved -= reservation;
      spent += reservation;
      throw error;
    }
    reserved -= reservation;
    spent += result.usage.cost;
    usage.push({ stage: task.stage, ...result.usage });
    await writeFile(
      join(out, `${++sequence}-${task.stage}.json`),
      JSON.stringify(
        {
          task: current,
          versions: VERSIONS,
          request: inspectTask(current),
          ...result,
        },
        null,
        2
      )
    );
    console.log(`${task.stage}: $${spent.toFixed(4)} reported text cost`);
    if (!result.error) return result.data;
    current = { ...task, feedback: result.error };
  }
  throw new Error(`Could not validate ${task.stage}`);
};
const scope =
  "Focused sample only, not a complete set. Judge the supplied cards individually. Do not infer missing support or absent answers from cards omitted from this sample. Never declare full-set readiness from this focused sample.";
const results = await Promise.allSettled([
  call({ stage: "brief", total: 135, ideas: previous.ideas }),
  call({
    stage: "review",
    total: 135,
    ideas: previous.ideas,
    blueprint: previous.blueprint,
    slots,
    designs: before,
    scope,
  }),
]);
const failed = results.find((r) => r.status === "rejected");
if (failed?.status === "rejected") throw failed.reason;
const blueprint = (results[0] as PromiseFulfilledResult<unknown>)
  .value as Blueprint;
const beforeReview = (results[1] as PromiseFulfilledResult<unknown>)
  .value as Review;
const base = { total: 135, ideas: previous.ideas, blueprint };
const planned = (await call({
  ...base,
  stage: "slots",
  slots: slots.map((slot) => ({ ...slot, mechanics: [] })),
})) as Slot[];
const after: Design[] = [];
let remaining = planned;
let feedback: string | undefined;
for (let attempt = 0; attempt < 3 && remaining.length; attempt++) {
  const result = (await call({
    ...base,
    stage: "generate",
    slots: remaining,
    reservedNames: after.map((c) => c.face.name),
    ...(feedback ? { feedback } : {}),
  })) as { cards: Design[]; errors: string[] };
  after.push(...result.cards);
  remaining = remaining.filter(
    (s) => !result.cards.some((c) => c.slotId === s.id)
  );
  feedback = result.errors.join("; ");
}
if (remaining.length)
  throw new Error(`Unrepaired pilot slots: ${remaining.map((s) => s.id)}`);
const screens = withScreening
  ? ((await call({
      ...base,
      stage: "screen",
      slots: planned,
      designs: after,
    })) as Screening[])
  : [];
const afterReview = (await call({
  ...base,
  stage: "review",
  slots: planned,
  designs: after,
  ...(withScreening ? { screens } : {}),
  scope,
})) as Review;
const editPlan = (await call({
  ...base,
  stage: "editPlan",
  slots: planned,
  designs: after,
  issues: afterReview.issues,
  ...(withScreening ? { screens } : {}),
  scope,
})) as Review;
const revised: Design[] = [];
let editSlots = planned.filter((s) =>
  editPlan.issues.some((i) => i.slots.includes(s.id))
);
feedback = undefined;
for (let attempt = 0; attempt < 3 && editSlots.length; attempt++) {
  const result = (await call({
    ...base,
    stage: "revise",
    slots: editSlots,
    designs: after.filter((c) => editSlots.some((s) => s.id === c.slotId)),
    reservedNames: after
      .filter((c) => !editSlots.some((s) => s.id === c.slotId))
      .map((c) => c.face.name),
    issues: editPlan.issues,
    ...(feedback ? { feedback } : {}),
  })) as { cards: Design[]; errors: string[] };
  revised.push(...result.cards);
  editSlots = editSlots.filter(
    (s) => !result.cards.some((c) => c.slotId === s.id)
  );
  feedback = result.errors.join("; ");
}
if (editSlots.length) throw new Error("Pilot revisions did not validate");
const finalCards = after.map(
  (c) => revised.find((r) => r.slotId === c.slotId) ?? c
);
const rescreens =
  withScreening && revised.length
    ? await call({
        ...base,
        stage: "rescreen",
        slots: planned.filter((s) => revised.some((c) => c.slotId === s.id)),
        designs: revised,
      })
    : [];
const finalReview = (await call({
  ...base,
  stage: "final",
  slots: planned,
  designs: finalCards,
  issues: editPlan.issues,
  ...(withScreening
    ? { screens: [...screens, ...(rescreens as Screening[])] }
    : {}),
  scope,
})) as Review;
await writeFile(
  join(out, "comparison.json"),
  JSON.stringify(
    {
      versions: VERSIONS,
      withScreening,
      source,
      ideas: previous.ideas,
      blueprint,
      slots: planned,
      before,
      after,
      beforeReview,
      afterReview,
      editPlan,
      finalCards,
      rescreens,
      finalReview,
      screens,
      usage,
      reportedTextCost: spent,
      weakCasesFlagged: weak.filter((id) =>
        beforeReview.issues.some((i) => i.slots.includes(id))
      ),
      controlIssues: beforeReview.issues.filter((i) =>
        i.slots.some((id) => controls.includes(id))
      ),
      limitations:
        "A development prompt probe using known failure cases, not a held-out evaluation, collated pack or draft-ready set. Original slot types and mana bands are intentionally held fixed; the new curve profile is tested separately.",
    },
    null,
    2
  )
);
console.log(`Saved ${join(out, "comparison.json")}`);
