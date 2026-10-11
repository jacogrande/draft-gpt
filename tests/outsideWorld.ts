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
    artIsDown: false,
    rateLimitNextSeconds: null as number | null,
    packSize: 12,
    settingPrompts: [] as string[],
    packRequests: 0,
    artPrompts: [] as string[],
  };

  const rateLimited = () => {
    const seconds = world.rateLimitNextSeconds;
    if (seconds === null) return null;
    world.rateLimitNextSeconds = null;
    return new Response("slow down", {
      status: 429,
      headers: { "retry-after": String(seconds) },
    });
  };

  const openai = (request: { tools?: unknown; messages: { content: string }[] }) => {
    if (world.openaiIsDown) return new Response("unavailable", { status: 500 });
    if (!request.tools) world.settingPrompts.push(request.messages[1].content);
    else world.packRequests++;
    const limited = rateLimited();
    if (limited) return limited;
    if (!request.tools) {
      return completion({ content: JSON.stringify(cannedSetting) });
    }
    const pack = { cards: cannedPack().cards.slice(0, world.packSize) };
    return completion({
      tool_calls: [{ function: { arguments: JSON.stringify(pack) } }],
    });
  };

  vi.stubGlobal("fetch", async (url: unknown, init?: { body?: string }) => {
    const target = String(url);
    const request = JSON.parse(init?.body ?? "{}");
    if (target.endsWith("/v1/images/generations")) {
      if (world.openaiIsDown)
        return new Response("unavailable", { status: 500 });
      if (world.artIsDown) return new Response("refused", { status: 400 });
      world.artPrompts.push(request.prompt);
      return json({ data: [{ b64_json: CANNED_IMAGE }] });
    }
    if (target.includes("api.openai.com")) return openai(request);
    throw new Error(`Unexpected request to ${target}`);
  });

  return world;
};
