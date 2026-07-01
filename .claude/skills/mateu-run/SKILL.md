---
name: mateu-run
description: Build, run, and screenshot a Mateu screen to see it actually render. Use when asked to run a Mateu app, verify a screen renders in the real UI (not just tests), or capture a PNG of a route (e.g. for docs). Handles the UI-module → app build order and the Playwright screenshot.mjs flow. Triggers on run the app, start the demo, screenshot the screen, verify it renders, spring-boot:run.
---

# Running & screenshotting a Mateu screen

Use this to see a screen render for real, or to capture doc images. This is the
Mateu-specific version of the generic `run`/`verify` skills — it knows the build order and
the screenshot script.

## 1. Build in the right order

If the `@UI` classes live in a **separate module**, build it **first** (its jar carries the
`META-INF/mateu/ui-registrations` index the app's annotation processor reads), then the app:

```bash
# 1) UI module (only if you have one)
cd e2e/sut/modules/sample1 && mvn clean install
# 2) the app
cd e2e/sut/apps/mvc-app1 && mvn clean install -DskipTests
```

For a single-module app (screens in the app itself), just build the app.

## 2. Run the app (keep it running)

```bash
cd e2e/sut/apps/mvc-app1 && mvn spring-boot:run
```

Default port `8080` → open `http://localhost:8080/<route>`. Run it in the background so you
can screenshot while it serves. Demo apps live under `demo/` (e.g.
`demo/demo-admin-panel`, `demo/demo-vaadin-mvc`) and start the same way.

## 3. Screenshot a route

From `e2e/`, the one-shot Playwright script waits for `mateu-page`, adds a settle delay, then
captures. It also **validates** the screen — a blank/missing image means the class didn't
compile or didn't render.

```bash
cd e2e
# full route
node screenshot.mjs --url http://localhost:8080/<route> --output /tmp/<name>.png
# just one element
node screenshot.mjs --url http://localhost:8080/<route> --output /tmp/<name>.png --element vaadin-form-layout
```

### Options

| Flag | Default | Meaning |
|---|---|---|
| `--url` | — (required) | route to capture |
| `--output` | — (required) | destination PNG path |
| `--wait-for` | `mateu-page` | CSS selector to wait for before capturing |
| `--element` | — | capture only this element instead of the full page |
| `--width` / `--height` | `1280` / `800` | viewport size |
| `--full-page` | `false` | capture the whole scrollable page |
| `--settle` | `1500` | extra ms after `--wait-for` appears (let web components finish) |
| `--timeout` | `20000` | max ms to wait for `--wait-for` |

For docs, write into `doc/public/images/docs/<topic>/<name>.png` and reference it as
`/images/docs/<topic>/<name>.png` (see the workflow in `CLAUDE.md`).

## Quick sanity without a browser

```bash
curl -s -X POST http://localhost:8080/mateu/v3/sync/<route>   # returns the UIDL JSON
```

## Related

- Wiring the build so it generates anything at all → **mateu-scaffold** (+ its `verify.md`).
- Writing the screen → **mateu**.
