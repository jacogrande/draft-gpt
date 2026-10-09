import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts", "tests/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
