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
      // The same federation drawn as HAMBURGER_SECTIONS (fed-sections-app :8087, P9 delivery 2):
      // the hamburger holds the sections, the band under the header the entries of the one on screen.
      name: 'fed-sections-app',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8087',
      },
      testMatch: '**/federation-sections/**/*.spec.ts',
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
    // P5 · S0 — the «static VCN slice» (design/maui-parity-plan.md): the same spec against two
    // static sites with NO Mateu backend, served as plain files by demo/demo-static-vcn/run-static.sh
    // (the external API on :8790). Not part of the default run's SUTs: start that script first.
    // CI's plain `npx playwright test` runs every listed project and never starts those servers, so
    // under CI the two projects are only listed when STATIC_VCN is set.
    ...(process.env.CI && !process.env.STATIC_VCN ? [] : [
    {
      name: 'static-vcn-java',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8791',
      },
      testMatch: '**/static/**/*.spec.ts',
    },
    {
      name: 'static-vcn-yaml',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8792',
      },
      testMatch: '**/static/**/*.spec.ts',
      // Both static sites call the SAME external API (:8790), which each test resets
      // (`/__reset`) and mutates (delete): run in parallel, one project wiped or deleted the
      // other's data mid-test. Running after the Java one keeps them from overlapping.
      dependencies: ['static-vcn-java'],
    },
    ]),
    // The same renderer-agnostic specs against the VB/Redwood renderer: mvc-app1 built a second
    // time with -Dmateu.renderer=redwood -Dsut.build.dir=target-vb and served on :8090 (CI job
    // `renderer-vb` in run_tests.yml; RENDERER_VB_URL overrides the URL locally). It paints
    // headless: the 2026-09 "0 rendered nodes" finding was the unsecured index never promoting the
    // VB boot scripts (fixed in index.ftl), not headless Chromium. Like the static projects, only
    // listed under CI when that job asks for it (RENDERER_VB), so the plain e2e run never waits on it.
    ...(process.env.CI && !process.env.RENDERER_VB ? [] : [
    {
      name: 'renderer-vb',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.RENDERER_VB_URL || 'http://localhost:8090',
      },
      testMatch: '**/renderer/**/*.spec.ts',
    },
    ]),
  ],
});
