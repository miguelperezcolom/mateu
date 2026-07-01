# Deployment topologies (incl. standalone desktop)

The renderer is **static** and backend-agnostic; the API always speaks `/mateu/v3/sync`.
Three ways to ship it:

## 1. All-in-one (renderer served by the Java service)

Add one renderer dependency; Spring Boot serves it from the classpath — no config. The
frontend calls back to the same origin (`baseUrl=""`), zero CORS. One deployment.

```xml
<dependency><groupId>io.mateu</groupId><artifactId>vaadin-lit</artifactId><version>${mateu.version}</version></dependency>
```

## 2. Split — CDN + API

Publish the static renderer assets on a CDN and point the root web component at a separate
API origin:

```html
<mateu-ui baseUrl="https://api.yourapp.com" pathPrefix=""></mateu-ui>
```

Scale the static frontend and the Java backend independently. Switching topologies is
changing `baseUrl` — no screen-code changes.

## 3. Standalone desktop tool

Package the app so a user just launches it — with or without a browser.

- **Native desktop renderer (no browser):** the JavaFX / Compose Multiplatform renderers
  (see `doc/.../native/`) render a real native window; the backend runs embedded in the same
  process. A genuine desktop app.
- **Web shell:** run the normal web service on `localhost` and open the default browser at it
  (`Desktop.getDesktop().browse(...)` on `ApplicationReadyEvent`). Here it is a *local*
  server, not "no server" — the browser is the UI shell over loopback HTTP.

Either way, "quit" is just a Mateu action (a `@Fab`/`@Button` that calls `System.exit(0)` or
`SpringApplication.exit(ctx, () -> 0)`).

Full write-up with code: `doc/src/content/docs/mateu-about/standalone-desktop.md`. For build
wiring see the **mateu-scaffold** skill.
