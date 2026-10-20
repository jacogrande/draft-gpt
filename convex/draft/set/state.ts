import { Stage } from "./types";

export const NEXT: Partial<Record<Stage, Stage>> = {
  brief: "slots",
  slots: "generate",
  generate: "review",
  screen: "review",
  review: "editPlan",
  editPlan: "revise",
  revise: "final",
  rescreen: "final",
  final: "art",
};
export const stageLabel = (phase: string) =>
  ({
    brief: "Creating the world",
    slots: "Planning the set",
    generate: "Designing cards",
    screen: "Screening cards",
    review: "Reviewing the set",
    editPlan: "Planning improvements",
    revise: "Refining cards",
    rescreen: "Checking improvements",
    final: "Reviewing the final set",
    art: "Preparing packs",
    ready: "Ready to draft",
  }[phase] ?? "Preparing the set");
export const canAccept = (
  run: { key: string; revision: number },
  job: { runKey: string; revision: number; key: string; status: string },
  key: string,
  live: boolean
) =>
  live &&
  run.key === job.runKey &&
  run.revision === job.revision &&
  job.key === key &&
  job.status === "running";
export const reserveAllowed = (
  spent: number,
  reserved: number,
  amount: number,
  budget: number
) => spent + reserved + amount <= budget;
