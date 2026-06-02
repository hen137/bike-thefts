import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      // Instrument the whole source tree, not just files touched by a test,
      // so untested modules show up as 0% instead of being invisible.
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "contexts/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "workers/**/*.{ts,tsx}"
      ],
      exclude: [
        "node_modules/",
        ".next/",
        "tests/",
        "**/*.d.ts",
        "**/index.ts", // barrel re-exports only
        "types/**"
      ]
    }
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  }
});
