# Verify the scaffold actually generated a UI

A green `mvn compile` does **not** mean Mateu produced anything — a mis-wired AP path just
generates nothing, silently. Check these after building.

## 1. UI module wrote its index

```bash
unzip -p target/myapp-ui-*.jar META-INF/mateu/ui-registrations
```
Expect one `class=…` block per `@UI` class. Missing → indexer not on the module's
`annotationProcessorPaths` (see ui-module-pom.md).

## 2. App generated controllers

The framework AP writes generated sources under `target/generated-sources/annotations/`:

```bash
find target/generated-sources -name '*MateuController.java' -o -name '*RouteResolver.java'
```
Expect a `<Screen>MateuController`, `<Screen>Controller`, `<Screen>Config` and a route
resolver per screen. None → the UI module isn't on the app's `annotationProcessorPaths`,
**or** the app has no local `@UI` and is missing the indexed-UI fallback (all mvc/quarkus/
micronaut APs include it; helidon/webflux do not).

## 3. The route actually responds at runtime

Start the app, then:

```bash
# HTML shell for the route
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/your-route

# the action endpoint that returns the UIDL
curl -s -X POST http://localhost:8080/mateu/v3/sync/your-route
```

A `200` on the HTML and a JSON `UIIncrementDto` from the POST means the wiring is correct.
To *see* it render, use the **mateu-run** skill (screenshot via Playwright).

## Common failures → cause

| Symptom | Cause |
|---|---|
| Compiles, but route 404s / blank page | UI module not on app `annotationProcessorPaths` |
| `ui-registrations` missing from jar | indexer AP not on UI module `annotationProcessorPaths` |
| Beans/controllers not found at runtime | `scanBasePackages` on `@SpringBootApplication` omits `io.mateu` |
| UI loads but no styles / 404 on assets | renderer jar (`vaadin-lit`) not a dependency of the app |
| Lombok getters missing in generated code | lombok not before the Mateu AP on the path |
