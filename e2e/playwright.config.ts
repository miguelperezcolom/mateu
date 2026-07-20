import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'mvc-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8080',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'webflux-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8081',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'quarkus-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8082',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'micronaut-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8083',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      // Federated shell (fed-shell-app :8084) aggregating fed-remote-app :8085 over RemoteMenu.
      // Runs only the federation specs (not the shared ones).
      name: 'fed-shell-app',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8084',
      },
      testMatch: '**/federation/**/*.spec.ts',
    },
  ],
});
