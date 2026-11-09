// Run by bin/run.mjs, which starts the app and passes BASE_URL (one run per fixture).
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8080',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
})
