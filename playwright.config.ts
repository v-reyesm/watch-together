import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const HOST = "127.0.0.1";
const baseURL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `corepack pnpm exec next dev --hostname ${HOST} --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8080",
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
    },
  },
});
