import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/e2e/**"],
    environment: "node",
    env: {
      DATABASE_URL: "postgres://shieldpath:shieldpath@localhost:5432/shieldpath",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
