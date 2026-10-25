import { defineConfig, devices } from "@playwright/test";

// Porta própria dos E2E, para não reaproveitar outro app (ou o npm run dev) aberto na 3000.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  // Uma trilha inteira leva ~10 s numa máquina folgada; em máquina carregada passa de 30 s.
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: String(port),
      AUTH_SECRET:
        process.env.AUTH_SECRET ?? "dev-only-shieldpath-secret-for-local-e2e-tests",
    },
  },
});
