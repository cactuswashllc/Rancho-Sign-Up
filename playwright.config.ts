import { defineConfig, devices } from "@playwright/test";

const E2E_DB = process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/signups_e2e";
const PORT = 3100;

// Sandboxes with a preinstalled Chromium can point at it instead of downloading.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "e2e",
  // Specs share one database; keep them serial and predictable.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } } },
  ],
  webServer: {
    // Always a production build: dev-mode compilation makes e2e flaky.
    // Reset + seed the e2e database, then serve the prebuilt app.
    command: `pnpm exec tsx e2e/prepare-db.ts && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}/signup/cancelled`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: E2E_DB,
      APP_URL: `http://localhost:${PORT}`,
      ADMIN_EMAILS: "admin@example.com",
      RATE_LIMIT_SALT: "e2e",
    },
  },
});
