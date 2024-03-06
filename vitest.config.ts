import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    clearMocks: true,
    setupFiles: "./vitestSetup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
      exclude: [
        ...(configDefaults.coverage.exclude
          ? configDefaults.coverage.exclude
          : []),
        "typedoc.cjs",
        "src/types-internal.ts",
        "src/types.ts",
        "src/index.ts",
      ],
    },
  },
})
