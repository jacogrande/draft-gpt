import { taskInstructions, taskPrompt } from "./prompts";
import { reasoningEffort } from "./modelSettings";
import { questionsFor } from "./screening";
import { estimateReservation, outputLimit } from "./usage";
import { MODELS, Task, VERSIONS } from "./types";

export const inspectTask = (task: Task, instructionsSuffix?: string, stageInstructionsOverride?: string) => {
  const decisions = task.stage === "screen" || task.stage === "rescreen";
  const input = taskPrompt(task);
  const instructions = decisions
    ? ""
    : [taskInstructions(task, stageInstructionsOverride), instructionsSuffix].filter(Boolean).join("\n\n");
  const questions = decisions ? questionsFor(task.designs ?? []) : [];
  return {
    versions: VERSIONS,
    model: MODELS.luna,
    endpoint: decisions ? "decisions" : "responses",
    instructions,
    input,
    questions,
    reasoning: decisions ? null : reasoningEffort(task.stage),
    outputLimit: decisions ? null : outputLimit(task.stage),
    reservation: estimateReservation(
      task.stage,
      instructions + input + JSON.stringify(questions)
    ),
  };
};

export const taskReservation = (task: Task) =>
  task.stage === "art" ? 0.04 : inspectTask(task).reservation;
