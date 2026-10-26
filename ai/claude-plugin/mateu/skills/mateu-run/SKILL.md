---
name: mateu-run
description: Build, run and screenshot a Mateu app to see a screen actually render — Java (Spring Boot, Quarkus, Micronaut, Helidon), YAML-only, static bundle, .NET or Python. Use when asked to run a Mateu app, verify a screen renders in the real UI (not just tests), call the wire API, or capture a PNG of a route. Handles the UI-module → app build order and ships a Playwright screenshot script. Triggers on run the app, start the server, screenshot the screen, verify it renders, spring-boot:run, mateu/v3/sync.
---

# Running & screenshotting a Mateu screen

A screen is not done until it has rendered. This skill knows the build order, how to start each
kind of Mateu project, how to poke the wire API, and has a one-shot screenshot script.

## 1. Build in the right order

If the `@UI` classes live in a **separate module**, build and install it **first** (its jar
carries the `META-INF/mateu/ui-registrations` index the app's annotation processor reads), then
the app:

```bash
(cd my-ui-module && mvn clean install)
(cd my-app && mvn clean package -DskipTests)
```

A single-module app (screens in the app itself) just builds the app.

## 2. Start it (keep it running in the background)

| Project | Start | Default URL |
|---|---|---|
| Spring Boot (MVC/WebFlux), `yaml` flavour | `mvn spring-boot:run` (other port: `-Dspring-boot.run.arguments=--server.port=8081`) | http://localhost:8080 |
| Quarkus | `mvn quarkus:dev` | http://localhost:8080 |
| Micronaut | `mvn mn:run` | http://localhost:8080 |
| Helidon MP | `mvn package && java -jar target/<artifactId>.jar` (no version in the jar name) | http://localhost:8080 |
| static bundle | `mvn mateu-bundle:dev` (rebuilds + reloads on every save; read the `mateu-dev: serving …` line for the port; the next lines give the iOS simulator / Android emulator URLs for the RN app, and with `-Dmateu.dev.host=0.0.0.0` a LAN URL + QR for a phone) — or the finished bundle: `mvn package && npx serve -s target/mateu-bundle` | http://localhost:3000 |
| .NET | `MATEU_UI=<mateu-vaadin jar or its static/> dotnet run` | http://localhost:8080 |
| Python | `MATEU_UI=<mateu-vaadin jar or its static/> uvicorn main:app --port 8080` | http://localhost:8080 |

.NET/Python answer only the wire API unless `MATEU_UI` points at the web renderer
(`curl -LO https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/<version>/mateu-vaadin-<version>.jar`).
Wait until the port answers before probing; kill the process when done.

## 3. Quick check without a browser — the wire API

Every Mateu server answers the same endpoint. It needs a JSON body (an empty POST is a 400):

```bash
# load a route (actionId "" = load)
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"route":"/products","consumedRoute":"","actionId":"","componentState":{}}' \
  http://localhost:8080/mateu/v3/sync/products

# run an action on a view: serverSideType = the view's class, componentState = its field values
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"route":"/greeting","consumedRoute":"","actionId":"greet","serverSideType":"com.example.app.Greeting","componentState":{"name":"Ada"}}' \
  http://localhost:8080/mateu/v3/sync/greeting
```

Look for your fields/columns in `fragments`; `"Not found."` = no screen at that route; HTTP
403 on an action = the method isn't marked as an action (strict mode) — see the server log.

A **CRUD / listing** answers in steps, like the browser: the first load returns a thin `App` with
`"variant":"MEDIATOR"` (the CRUD's own router, no columns yet); load again with
`"consumedRoute":"/suppliers"` and `"serverSideType":"<its class>"` to get the `Crud` with its
`GridColumn`s and filter `FormField`s; the ROWS come from the `search` action
(`"actionId":"search"`, same body) at `fragments[0].data.crud.page.content`. A shell route
(`""`) answers the `App` with its menu.

## 4. Screenshot a route

[`scripts/screenshot.mjs`](scripts/screenshot.mjs) (next to this file) opens the route in
headless Chromium, waits for `mateu-component`, lets web components settle, and captures. A
blank or missing image means the screen didn't render.

```bash
# once, in any scratch folder
npm i -D playwright && npx playwright install chromium
cp <this skill dir>/scripts/screenshot.mjs .

node screenshot.mjs --url http://localhost:8080/<route> --output /tmp/<name>.png
node screenshot.mjs --url http://localhost:8080/<route> --output /tmp/<name>.png --element vaadin-form-layout
```

| Flag | Default | Meaning |
|---|---|---|
| `--url` | — (required) | route to capture |
| `--output` | — (required) | destination PNG path |
| `--wait-for` | `mateu-component` | CSS selector to wait for (pierces shadow DOM); `mateu-page` for form pages |
| `--element` | — | capture only this element instead of the full page |
| `--width` / `--height` | `1280` / `800` | viewport size |
| `--full-page` | `false` | capture the whole scrollable page |
| `--settle` | `1500` | extra ms after `--wait-for` appears |
| `--timeout` | `20000` | max ms to wait for `--wait-for` |

Then look at the PNG (read the image) and check the screen shows what you declared.

Inside the Mateu repo the same script is `e2e/screenshot.mjs`; doc images go to
`doc/public/images/docs/<topic>/<name>.png`. Follow the repository's screenshot conventions
when working inside that repository; other projects can choose their own output directory.

## Related

- Wiring the build so it generates anything at all → **mateu-scaffold** (+ its `verify.md`).
- Writing the screen → **mateu** (Java), **mateu-yaml**, **mateu-dotnet**, **mateu-python**.
