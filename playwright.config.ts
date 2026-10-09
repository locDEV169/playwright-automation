import { defineConfig, devices } from "@playwright/test";
import * as fs from "fs";
import { defineBddConfig } from "playwright-bdd";
import { AUTH_FILE, requireEnv } from "./shared/env";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: ["shared/fixtures.ts", "shared/steps/*.ts", "features/**/fixtures.ts", "features/**/steps.ts"],
});

export default defineConfig({
  testDir,
  reporter: [["list"], ["html", { open: "never" }]],
  // Scenarios of one feature run in order; separate features still run in parallel.
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 180_000,
  use: {
    baseURL: requireEnv("BASE_URL"),
    // Missing file is reported by the "the user is signed in" step with a fix hint.
    storageState: fs.existsSync(AUTH_FILE) ? AUTH_FILE : undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: !!process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
