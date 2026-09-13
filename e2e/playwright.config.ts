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
      name: 'helidon-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8086',
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
    {
      // Renderer-agnostic smoke suite (Phase 0). Runs against the VAADIN renderer served by
      // mvc-app1 (:8080). The same specs are meant to be pointed at other renderers by adding a
      // project with a different baseURL — see design/renderer-e2e-strategy.md.
      name: 'renderer-vaadin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8080',
      },
      testMatch: '**/renderer/**/*.spec.ts',
    },
    // A `renderer-vb` project (baseURL :8090, an mvc-app-vb SUT with the io.mateu:redwood frontend)
    // is NOT wired here yet: the VB shell serves and reaches Oracle's JET CDN, but its visual-runtime
    // does not paint the screen headless (0 rendered nodes after 6s). See
    // design/renderer-e2e-strategy.md (Phase 1) for the recipe + finding.
  ],
});
