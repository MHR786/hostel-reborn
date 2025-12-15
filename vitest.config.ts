import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // 1. Tell Vitest to ignore the 'client' root and look in 'server'
    include: ["server/**/*.test.ts"],
    // 2. Set environment to Node.js (since we are testing the backend)
    environment: "node",
  },
  resolve: {
    alias: {
      // 3. Ensure the @shared alias works in tests
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
