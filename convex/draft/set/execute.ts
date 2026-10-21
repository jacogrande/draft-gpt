import { intentSchema } from "./intent";
import { requestDecisions, requestLuna } from "../openai";
import {
  parseIntent,
  parseBlueprint,
  parseDesigns,
  parseReview,
  parseScreens,
  parseSlots,
} from "../parsing";
import {
  worldSchema,
  planningSchema,
  designsSchema,
  designBatchSchema,
  reviewSchema,
} from "./contracts";
import { taskInstructions, taskPrompt } from "./prompts";
import { reasoningEffort, ReasoningEffort } from "./modelSettings";
import { questionsFor } from "./screening";
import { outputLimit } from "./usage";
import { Task, Usage } from "./types";

export type TaskResult = { data: unknown; usage: Usage; error?: string };
export const executeTask = async (
  task: Task,
  options: {
    reasoning?: ReasoningEffort;
    designBatchLimit?: number;
    maxOutputTokens?: number;
    instructionsSuffix?: string;
    stageInstructionsOverride?: string;
  } = {}
): Promise<TaskResult> => {
  const screen = task.stage === "screen" || task.stage === "rescreen";
  const writing = task.stage === "generate" || task.stage === "revise";
  const schema =
    task.stage === "interpret"
      ? intentSchema
      : task.stage === "brief"
      ? worldSchema(!!task.intent)
      : task.stage === "slots"
      ? planningSchema(!!task.blueprint?.preferencePlan)
      : writing
      ? options.designBatchLimit
        ? designBatchSchema(options.designBatchLimit)
        : designsSchema
      : reviewSchema;
  const reply = screen
    ? await requestDecisions(taskPrompt(task), questionsFor(task.designs ?? []))
    : await requestLuna(
        [taskInstructions(task, options.stageInstructionsOverride), options.instructionsSuffix].filter(Boolean).join("\n\n"),
        taskPrompt(task),
        schema,
        options.maxOutputTokens ?? outputLimit(task.stage),
        options.reasoning ?? reasoningEffort(task.stage)
      );
  try {
    if ("error" in reply && typeof reply.error === "string")
      throw new Error(reply.error);
    const data =
      task.stage === "interpret"
        ? parseIntent(reply.raw, task.conversation ?? [])
        : task.stage === "brief"
        ? parseBlueprint(reply.raw, task.ideas.length, task.intent)
        : task.stage === "slots"
        ? parseSlots(reply.raw, task.slots!, task.blueprint!)
        : writing
        ? parseDesigns(
            reply.raw,
            task.slots!,
            task.blueprint!,
            task.reservedNames
          )
        : screen
        ? parseScreens(
            reply.raw,
            questionsFor(task.designs ?? []).map((q) => q.name)
          )
        : parseReview(reply.raw, task.designs ?? []);
    return { data, usage: reply.usage };
  } catch (error) {
    return {
      data: null,
      usage: reply.usage,
      error: error instanceof Error ? error.message : "Invalid response",
    };
  }
};
