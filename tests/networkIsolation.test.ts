import { expect, test, vi } from "vitest";

test("restoring a fetch mock cannot expose live provider calls", async () => {
  vi.stubGlobal("fetch", async () => new Response("fixture"));
  expect(await (await fetch("http://127.0.0.1:1")).text()).toBe("fixture");
  vi.unstubAllGlobals();
  await expect(fetch("http://127.0.0.1:1")).rejects.toThrow("live network requests are disabled");
});
