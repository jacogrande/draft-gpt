import { createServer } from "node:http";
import {
  CANNED_IMAGE,
  cannedPack,
  cannedSetting,
} from "../tests/cannedGeneration";

const PORT = Number(process.env.FAKE_SERVICES_PORT ?? 4010);

const completion = (message: unknown) => ({ choices: [{ message }] });

const reply = (path: string, body: { tools?: unknown }) => {
  if (path.includes("/images/generations"))
    return { data: [{ b64_json: CANNED_IMAGE }] };
  if (body.tools)
    return completion({
      tool_calls: [{ function: { arguments: JSON.stringify(cannedPack()) } }],
    });
  return completion({ content: JSON.stringify(cannedSetting) });
};

let failing = false;

createServer((request, response) => {
  let raw = "";
  request.on("data", (chunk) => (raw += chunk));
  request.on("end", () => {
    if (request.url === "/__fail/on") failing = true;
    if (request.url === "/__fail/off") failing = false;
    response.writeHead(failing ? 500 : 200, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify(reply(request.url ?? "", JSON.parse(raw || "{}"))));
  });
}).listen(PORT, () => console.log(`Fake OpenAI on :${PORT}`));
