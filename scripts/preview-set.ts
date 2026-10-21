import { conversationSnapshot } from "../convex/lobby/worldbuilding";
import { CreativeIntent } from "../convex/draft/set/intent";
import { preferenceCoverageProblems } from "../convex/draft/set/guidance";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { executeTask, TaskResult } from "../convex/draft/set/execute";
import { chunks, skeleton } from "../convex/draft/set/slots";
import { repairCards } from "../convex/draft/set/repair";
import {
  inventoryProblems,
  duplicateIssues,
  parseBlueprint,
  parseReview,
} from "../convex/draft/set/parsing";
import { collate, seededRandom } from "../convex/draft/set/collation";
import {
  Blueprint,
  Design,
  Issue,
  PAIRS,
  Review,
  Slot,
  Task,
  VERSIONS,
  MODELS,
} from "../convex/draft/set/types";
import {
  inspectTask,
  taskReservation,
} from "../convex/draft/set/requestContext";
import { paintCard } from "../convex/draft/images";
import { artPrompt } from "../convex/draft/artPrompt";
import { pickSchool } from "../convex/draft/artSchools";
import { settingFromBlueprint } from "../convex/draft/set/setting";
import { worldDirection, WorldDirection } from "../convex/draft/set/worldDirection";
import { renderPreview } from "./render-set-preview";
import { PowerLevel, powerLevelOf } from "../convex/powerLevel";

const selectedPower = process.argv.find((arg) => arg.startsWith("--power-level="))?.split("=")[1] ?? "default";
if (selectedPower !== "default" && selectedPower !== "busted")
  throw new Error("--power-level must be default or busted");
const powerLevel: PowerLevel = selectedPower;
const out = resolve(process.argv.slice(2).find((arg) => !arg.startsWith("--"))
  ?? `.artifacts/pack-preview-v10-${powerLevel}`);
const total = 135;
const ideas: string[] = [];
const ledgerPath = join(out, "ledger.json");
await mkdir(out, { recursive: true });
const configPath = join(out, "preview-config.json");
const config = JSON.stringify({ powerLevel, total, versions: VERSIONS });
const previousConfig = await readFile(configPath, "utf8").catch(() => null);
if (previousConfig && previousConfig !== config)
  throw new Error("Preview configuration differs; use a fresh output directory.");
if (!previousConfig) await writeFile(configPath, config, { flag: "wx" });
const seedPath = join(out, "world-direction.json");
const savedSeed = await readFile(seedPath, "utf8").catch(() => null);
const direction: WorldDirection = savedSeed
  ? JSON.parse(savedSeed)
  : worldDirection(Math.floor(Math.random() * 2 ** 32));
if (!savedSeed)
  await writeFile(seedPath, JSON.stringify(direction, null, 2), { flag: "wx" });
let spent = 0,
  reserved = 0;
const ledger: { stage: string; cost: number; requestId: string }[] = JSON.parse(
  await readFile(ledgerPath, "utf8").catch(() => "[]")
);
spent = ledger.reduce((n, entry) => n + entry.cost, 0);
let ledgerWrite = Promise.resolve();
const persistLedger = () => {
  ledgerWrite = ledgerWrite.then(() =>
    writeFile(ledgerPath, JSON.stringify(ledger, null, 2))
  );
  return ledgerWrite;
};
const call = async (task: Task): Promise<unknown> => {
  const hash = createHash("sha256")
    .update(JSON.stringify({ versions: VERSIONS, task }))
    .digest("hex")
    .slice(0, 20);
  const file = join(out, `${task.stage}-${hash}.json`);
  const saved = await readFile(file, "utf8").catch(() => null);
  if (saved) {
    const result = JSON.parse(saved) as TaskResult;
    if (result.error) throw new Error(result.error);
    if (!result.error) {
      if (["review", "editPlan", "final"].includes(task.stage))
        parseReview(result.data, task.designs ?? []);
      return result.data;
    }
  }
  const reservation = taskReservation(task);
  if (spent + reserved + reservation > 5)
    throw new Error("Preview budget reached; checkpoints saved.");
  reserved += reservation;
  let result: TaskResult;
  try {
    result = await executeTask(task);
  } catch (error) {
    reserved -= reservation;
    spent += reservation;
    ledger.push({
      stage: task.stage,
      cost: reservation,
      requestId: "uncertain-failed-request",
    });
    await persistLedger();
    throw error;
  }
  reserved -= reservation;
  spent += result.usage.cost;
  ledger.push({
    stage: task.stage,
    cost: result.usage.cost,
    requestId: result.usage.requestId,
  });
  await persistLedger();
  await writeFile(
    file,
    JSON.stringify(
      { ...result, versions: VERSIONS, task, request: inspectTask(task) },
      null,
      2
    )
  );
  console.log(
    `${task.stage}: ${
      task.scope ?? task.slots?.length ?? "complete"
    }; cumulative text estimate $${spent.toFixed(4)}`
  );
  if (result.error) throw new Error(result.error);
  return result.data;
};
const repairedCall = async (task: Task): Promise<unknown> => {
  let current = task;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await call(current);
    } catch (error) {
      if (
        attempt === 2 ||
        /budget|responded|fetch|timeout/i.test(String(error))
      )
        throw error;
      current = { ...task, feedback: String(error) };
    }
  }
  throw new Error("Repair exhausted");
};
const parallel = async <T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> => {
  const results: U[] = [];
  for (const group of chunks(items, 4)) {
    const settled = await Promise.allSettled(group.map(fn));
    const failed = settled.find((r) => r.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
    results.push(...settled.map((r) => (r as PromiseFulfilledResult<U>).value));
  }
  return results;
};
const generatePreview = async () => {
  const resumeBrief = process.argv.find((arg) => arg.startsWith("--resume-brief="));
  const savedBrief = resumeBrief
    ? JSON.parse(await readFile(resolve(resumeBrief.slice(15)), "utf8"))
    : null;
  if (savedBrief && powerLevelOf(savedBrief.task?.powerLevel) !== powerLevel)
    throw new Error("The resumed brief uses a different power level.");
  const intent: CreativeIntent | undefined = savedBrief ? savedBrief.task?.intent
    : ideas.length ? await repairedCall({ stage: "interpret", total, powerLevel, ideas: [],
      conversation: conversationSnapshot(ideas.map(text => ({ userId: "preview-player", text }))),
    }) as CreativeIntent : undefined;
  const promptIdeas = intent ? [] : ideas;
  const blueprint = savedBrief
    ? parseBlueprint(savedBrief.data, promptIdeas.length, intent)
    : ((await repairedCall({
        stage: "brief",
        total,
        powerLevel,
        referenceSeed: direction.seed,
        ideas: promptIdeas,
        intent,
        worldDirection: direction,
      })) as Blueprint);
  const base = { total, ideas: promptIdeas, intent, blueprint, powerLevel, referenceSeed: direction.seed };
  const slots = (
    await parallel(chunks(skeleton(total, powerLevel)), (group) =>
      repairedCall({ ...base, stage: "slots", slots: group })
    )
  ).flat() as Slot[];
  const missingPreferences = preferenceCoverageProblems(slots, blueprint, intent);
  if (missingPreferences.length) throw new Error(missingPreferences.join("; "));
  const writeCards = async (task: Task) => {
    const cards: Design[] = [];
    let current = task;
    for (let attempt = 0; attempt < 3 && current.slots!.length; attempt++) {
      const result = (await call(current)) as { cards: Design[]; errors: string[] };
      cards.push(...result.cards);
      current = repairCards(current, result);
    }
    if (current.slots!.length)
      throw new Error(
        `Invalid designs remain: ${current.slots!
          .map((s) => s.id)
          .join(", ")}. ${current.feedback}`
      );
    return cards;
  };
  let designs = (
    await parallel(chunks(slots), (group) =>
      writeCards({ ...base, stage: "generate", slots: group })
    )
  ).flat();
  const reviews = (await parallel([...PAIRS, "global"], (scope) =>
    repairedCall({
      ...base,
      stage: "review",
      scope,
      designs:
        scope === "global"
          ? designs
          : designs.filter((d) =>
              slots
                .find((s) => s.id === d.slotId)
                ?.archetypes.includes(scope as (typeof PAIRS)[number])
            ),
      slots,
      feedback: inventoryProblems(slots, designs).join("; "),
    })
  )) as Review[];
  const plan = (await repairedCall({
    ...base,
    stage: "editPlan",
    designs,
    slots,
    issues: [...reviews.flatMap((r) => r.issues), ...duplicateIssues(designs)],
  })) as Review;
  if (plan.blueprintBroken)
    throw new Error(
      "Review requires a new blueprint; candidate saved for inspection."
    );
  const issues: Issue[] = plan.issues;
  const edits = slots.filter((s) => issues.some((i) => i.slots.includes(s.id)));
  const revised = (
    await parallel(chunks(edits), (group) =>
      writeCards({
        ...base,
        stage: "revise",
        slots: group,
        designs: designs.filter((c) => group.some((s) => s.id === c.slotId)),
        reservedNames: designs
          .filter((d) => !group.some((s) => s.id === d.slotId))
          .map((d) => d.face.name),
        issues: issues.filter((i) =>
          i.slots.some((id) => group.some((s) => s.id === id))
        ),
      })
    )
  ).flat();
  designs = designs.map(
    (card) => revised.find((r) => r.slotId === card.slotId) ?? card
  );
  const finalReview = (await repairedCall({
    ...base,
    stage: "final",
    designs,
    slots,
    issues,
  })) as Review;
  const problems = inventoryProblems(slots, designs);
  const ready =
    !problems.length &&
    !finalReview.blueprintBroken &&
    !finalReview.issues.some((i) => i.severity !== "minor");
  const ids = collate(designs, 1, 20261015)[0];
  const pack = ids.map((id) => designs.find((d) => d.slotId === id)!);
  const artifact = {
    generatedAt: new Date().toISOString(),
    powerLevel,
    ready,
    mode: "Luna generation and contextual review; no Decisions screening",
    versions: VERSIONS,
    models: MODELS,
    ideas,
    worldDirection: resumeBrief ? undefined : direction,
    blueprint,
    slots,
    designs,
    reviews,
    issues,
    revised: revised.map((c) => c.slotId),
    finalReview,
    problems,
    pack,
    ledger,
  };
  await writeFile(join(out, "set.json"), JSON.stringify(artifact, null, 2));
  return artifact;
};
const artifact = process.argv.includes("--finish")
  ? (JSON.parse(await readFile(join(out, "set.json"), "utf8")) as Awaited<
      ReturnType<typeof generatePreview>
    >)
  : await generatePreview();
const { blueprint, pack, ready } = artifact;
if (powerLevelOf(artifact.powerLevel) !== powerLevel)
  throw new Error("The saved set uses a different power level.");
await writeFile(join(out, "index.html"), renderPreview({ ...artifact, pack }));
await parallel([...pack.entries()], async ([index, card]) => {
  const path = join(out, `${card.slotId}.jpg`);
  const existing = await readFile(path).catch(() => null);
  if (!existing && spent + reserved + 0.04 <= 5) {
    reserved += 0.04;
    const prompt = artPrompt(
      `${card.face.art_direction}\nWorld motifs: ${blueprint.creative.motifs}`,
      settingFromBlueprint(blueprint),
      pickSchool(seededRandom(index + 123)())
    );
    const image = await paintCard(prompt, Date.now() + 90000);
    reserved -= 0.04;
    spent += 0.04;
    ledger.push({
      stage: "art",
      cost: 0.04,
      requestId: "conservative-art-reservation",
    });
    await persistLedger();
    if (image) await writeFile(path, new Uint8Array(await image.arrayBuffer()));
  }
  if (await readFile(path).catch(() => null))
    card.face.image_url = `${card.slotId}.jpg`;
  console.log(`Preview art ${index + 1}/15`);
});
await writeFile(
  join(out, "pack.json"),
  JSON.stringify(
    { ...artifact, designs: undefined, slots: undefined, ledger, pack },
    null,
    2
  )
);
await writeFile(join(out, "index.html"), renderPreview({ ...artifact, pack }));
console.log(
  `Preview saved: ${join(out, "index.html")} (${
    ready ? "passed automated review" : "needs validation; NOT draft-ready"
  })`
);
