import { vi } from "vitest";
import { cannedPack, cannedSetting, CANNED_IMAGE } from "./cannedGeneration";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });

const completion = (message: unknown) => json({ choices: [{ message }] });

export const fakeOutsideWorld = () => {
  const world = {
    openaiIsDown: false,
    settingPrompts: [] as string[],
    packRequests: 0,
    imageRequests: 0,
  };

  const openai = (request: { tools?: unknown; messages: { content: string }[] }) => {
    if (world.openaiIsDown) return new Response("unavailable", { status: 500 });
    if (!request.tools) {
      world.settingPrompts.push(request.messages[1].content);
      return completion({ content: JSON.stringify(cannedSetting) });
    }
    world.packRequests++;
    return completion({
      tool_calls: [{ function: { arguments: JSON.stringify(cannedPack()) } }],
    });
  };

  vi.stubGlobal("fetch", async (url: unknown, init?: { body?: string }) => {
    const target = String(url);
    if (target.includes("api.openai.com"))
      return openai(JSON.parse(init?.body ?? "{}"));
    if (target.includes("api.getimg.ai")) {
      world.imageRequests++;
      return json({ image: CANNED_IMAGE });
    }
    throw new Error(`Unexpected request to ${target}`);
  });

  return world;
};
