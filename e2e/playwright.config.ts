import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // One worker on CI: the parallelism is ACROSS jobs instead — run_tests.yml splits the projects
  // into e2e legs (scripts/ci-e2e-leg.sh), each with its own SUT apps, so no two tests ever share a
  // SUT at the same time. (Measured 2026-10-17 with 4 workers on a FRESH SUT: the shared suite
  // passes on mvc/webflux/quarkus/helidon; micronaut-app1 hung — JDK 21 virtual threads pinned on
  // RouteRegistry's load monitor and Micronaut's, waiting on logback's DEBUG lock; fixed since: the
  // registries load under a ReentrantLock and the SUT logs at INFO — and quarkus-app1 logs
  // MountRegistry "zip file closed". Reusing a SUT across runs also fails FullCrud, by design.)
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
        baseURL: process.env.MVC_APP1_URL || 'http://localhost:8080',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      // End-to-end JOURNEYS (design/coverage/coverage-map.md §4): the features a user walks through
      // end to end that the shared suite does not reach — CRUD in a drawer, inline editing, the
      // optimistic-lock dialog, totals and grouping, saved views, the column chooser, drag to a drop
      // zone, role-based access, a proxied secret against a real upstream... Their fixtures live in
      // mvc-app1 only (io.mateu.sample1.app.journeys), so this runs on ONE adapter — the parity of
      // the wire across adapters is the shared suite's job, and this keeps the CI cost to one SUT.
      name: 'journeys',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.MVC_APP1_URL || 'http://localhost:8080',
        // a fake camera, so @PhotoCapture captures a real frame headless
        permissions: ['camera'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
      },
      testMatch: '**/journeys/**/*.spec.ts',
    },
    {
      name: 'webflux-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEBFLUX_APP1_URL || 'http://localhost:8081',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'quarkus-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.QUARKUS_APP1_URL || 'http://localhost:8082',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'micronaut-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.MICRONAUT_APP1_URL || 'http://localhost:8083',
      },
      testMatch: '**/shared/**/*.spec.ts',
    },
    {
      name: 'helidon-app1',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.HELIDON_APP1_URL || 'http://localhost:8086',
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
        baseURL: process.env.MVC_APP1_URL || 'http://localhost:8080',
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
    // The YAML-only federation (e2e/sut/yaml-federation, started by its run.sh): a console served on
    // :18480 whose menu mounts a SERVED YAML domain (:18481) and a STATIC one (:18482). Like the
    // static projects, only listed under CI when the job that starts those servers asks for it.
    ...(process.env.CI && !process.env.YAML_FEDERATION ? [] : [
    {
      name: 'yaml-federation',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:18480',
      },
      testMatch: '**/yaml-federation/**/*.spec.ts',
    },
    ]),
    // The same renderer-agnostic specs against the VB/Redwood renderer: mvc-app1 built a second
    // time with -Dmateu.renderer=mateu-redwood -Dsut.build.dir=target-vb and served on :8090 (CI job
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
      // The YAML actions walkthrough asserts by roles and URLs only, so it is renderer-agnostic:
      // this project runs it too (renderer-vaadin already does, through mvc-app1 on the same
      // :8080). Listed here rather than re-exported from a renderer spec — Playwright refuses a
      // test file that imports another test file of the same run.
      testMatch: ['**/renderer/**/*.spec.ts', '**/shared/yaml-actions.spec.ts'],
    },
    ]),
  ],
});
