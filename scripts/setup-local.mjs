import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const FAKE_SERVICES = "http://127.0.0.1:4010";
const ENV_FILE = ".env.local";

const setEnv = (name, value) =>
  execFileSync("./node_modules/.bin/convex", ["env", "set", name, "--", value], {
    stdio: "ignore",
    env: { ...process.env, CONVEX_AGENT_MODE: "anonymous" },
  });

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);

setEnv("JWT_PRIVATE_KEY", privateKey.trimEnd().replace(/\n/g, " "));
setEnv("JWKS", JSON.stringify({ keys: [{ use: "sig", ...publicKey }] }));
setEnv("SITE_URL", "http://localhost:5173");
setEnv("AUTH_TEST_LOGIN", "true");
setEnv("OPENAI_BASE_URL", FAKE_SERVICES);

if (!readFileSync(ENV_FILE, "utf8").includes("VITE_TEST_LOGIN")) {
  appendFileSync(ENV_FILE, "\nVITE_TEST_LOGIN=true\n");
}
