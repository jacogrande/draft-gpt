import { afterEach, expect, test, vi } from "vitest";
import { executeTask } from "../convex/draft/set/execute";
import { skeleton } from "../convex/draft/set/slots";
import { cannedBlueprint, cannedResponse } from "./cannedSet";

afterEach(() => vi.unstubAllGlobals());

test("larger evaluation batches expand schema and tokens without changing defaults", async () => {
  const payloads: { max_output_tokens: number; text: { format: { schema: {
    properties: { cards: { maxItems: number } };
  } } } }[] = [];
  vi.stubGlobal("fetch", async (_url: unknown, init: { body: string }) => {
    const request = JSON.parse(init.body);
    payloads.push(request);
    return new Response(JSON.stringify(cannedResponse(JSON.parse(request.input).task)));
  });
  const task = { stage: "generate" as const, total: 135, ideas: [],
    blueprint: cannedBlueprint, slots: skeleton(135).slice(0, 30) };
  const expanded = await executeTask(task, { designBatchLimit: 30, maxOutputTokens: 28000 });
  expect(expanded.error).toBeUndefined();
  expect((expanded.data as { cards: unknown[] }).cards).toHaveLength(30);
  await executeTask({ ...task, slots: task.slots.slice(0, 15) });
  expect(payloads.map((p) => p.text.format.schema.properties.cards.maxItems)).toEqual([30, 15]);
  expect(payloads.map((p) => p.max_output_tokens)).toEqual([28000, 14000]);
});
