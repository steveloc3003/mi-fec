import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Keep E2E tests isolated from unit/integration tests.
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  // Avoid race conditions with shared db.json mutation by running flows in sequence.
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Allows relative navigation like page.goto('/videos').
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    // Start the app (and json-server through yarn start) before E2E tests run.
    command: 'yarn start',
    url: 'http://localhost:3000',
    // Reuse an existing dev server for UI mode convenience.
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
