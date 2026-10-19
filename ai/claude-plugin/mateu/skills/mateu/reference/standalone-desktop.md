# Deployment topologies (incl. standalone desktop)

The renderer is **static** and backend-agnostic; the API always speaks `/mateu/v3/sync`.
Three ways to ship it:

## 1. All-in-one (renderer served by the Java service)

Add one renderer dependency; Spring Boot serves it from the classpath — no config. The
frontend calls back to the same origin (`baseUrl=""`), zero CORS. One deployment.

```xml
<dependency><groupId>io.mateu</groupId><artifactId>mateu-vaadin</artifactId><version>${mateu.version}</version></dependency>
```

## 2. Split — CDN + API

Publish the static renderer assets on a CDN and point the root web component at a separate
API origin:

```html
<mateu-ui baseUrl="https://api.yourapp.com"></mateu-ui>   <!-- the API must allow the origin: mateu.cors.allowed-origins -->
```

Scale the static frontend and the Java backend independently. Switching topologies is
changing `baseUrl` — no screen-code changes.

## 3. Standalone desktop tool

Package the app so a user just launches it — with or without a browser.

- **Native desktop renderer (no browser):** the IntelliJ plugin renderer renders the same wire
  model inside the IDE (https://mateu.io/native/). The JavaFX / Compose renderers were removed.
- **Web shell:** run the normal web service on `localhost` and open the default browser at it
  (`Desktop.getDesktop().browse(...)` on `ApplicationReadyEvent`). Here it is a *local*
  server, not "no server" — the browser is the UI shell over loopback HTTP.

Either way, "quit" is just a Mateu action (a `@Fab`/`@Button` that calls `System.exit(0)` or
`SpringApplication.exit(ctx, () -> 0)`).

Full write-up with code: https://mateu.io/mateu-about/standalone-desktop/. A UI with **no backend
at all** (YAML bundled into static files for a CDN) is the static bundle — see the **mateu-yaml**
skill and https://mateu.io/deploy/static-bundle/. For build wiring see **mateu-scaffold**.
