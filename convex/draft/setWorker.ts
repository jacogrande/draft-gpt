import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { artPrompt } from "./artPrompt";
import { pickSchool } from "./artSchools";
import { paintCard } from "./images";
import { failureMessage, retryAdvice } from "./retry";
import { executeTask } from "./set/execute";
import { Task } from "./set/types";
import { settingFromBlueprint } from "./set/setting";
import { seededRandom } from "./set/collation";

export const execute = internalAction({
  args: { jobId: v.id("setJobs"), key: v.string() },
  handler: async (ctx, { jobId, key }): Promise<void> => {
    const input: { task: string; artDeadline?: number } | null =
      await ctx.runQuery(internal.draft.setJobs.input, { jobId, key });
    if (!input) return;
    const task = JSON.parse(input.task) as Task;
    try {
      if (task.stage === "art") {
        const card = task.designs![0];
        const random = seededRandom(
          [...card.slotId].reduce((n, c) => n * 31 + c.charCodeAt(0), 0)
        );
        const prompt = artPrompt(
          `${card.face.art_direction}\nWorld motifs: ${
            task.blueprint!.creative.motifs
          }`,
          settingFromBlueprint(task.blueprint!),
          pickSchool(random())
        );
        const image = await paintCard(
          prompt,
          input.artDeadline ?? Date.now() + 90000
        );
        if (image) {
          const imageId = await ctx.storage.store(image);
          await ctx.runMutation(internal.draft.setArt.save, {
            jobId,
            key,
            imageId,
            prompt,
            slotId: card.slotId,
          });
        }
        await ctx.runMutation(internal.draft.setJobs.finish, {
          jobId,
          key,
          result: "null",
          usage: JSON.stringify({
            input: 0,
            output: 0,
            reasoning: 0,
            cost: 0.04,
            requestId: "art-budget-reservation",
          }),
        });
        return;
      }
      const result = await executeTask(task);
      await ctx.runMutation(internal.draft.setJobs.finish, {
        jobId,
        key,
        result: JSON.stringify(result.data),
        usage: JSON.stringify(result.usage),
        ...(result.error ? { error: result.error } : {}),
      });
    } catch (error) {
      await ctx.runMutation(internal.draft.setJobs.failed, {
        jobId,
        key,
        message: failureMessage(error),
        retryAfterMs: retryAdvice(error),
      });
    }
  },
});
