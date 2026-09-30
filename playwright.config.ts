import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Local runs start the production build; set BASE_URL to test a deployment instead.
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npx next start -p 3100", url: baseURL, reuseExistingServer: true, timeout: 120_000 },
});
