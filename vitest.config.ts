import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "app/generated"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["node_modules", ".next", "app/generated", "tests"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
