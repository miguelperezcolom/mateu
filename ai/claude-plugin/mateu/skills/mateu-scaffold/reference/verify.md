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

The framework AP writes generated sources under `target/generated-sources/annotations/`, four
per `@UI` class (local or read from a consumed module's index — every framework AP does both):

```bash
find target/generated-sources -name '*MateuController.java' -o -name '*UIRouteResolver.java'
```
Expect `<Screen>Controller`, `<Screen>MateuController`, `<Screen>Config` and
`<Screen>UIRouteResolver` per screen. None → the framework AP (or, for a consumed module, the
module itself) isn't on the app's `annotationProcessorPaths`.

## 3. The route actually responds at runtime

Start the app, then:

```bash
# HTML page for the route
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/your-route

# the wire endpoint the renderer calls — it needs a JSON body (an empty POST is a 400)
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"route":"/your-route","consumedRoute":"","actionId":"","componentState":{}}' \
  http://localhost:8080/mateu/v3/sync/your-route
```

A `200` on the HTML and a JSON `UIIncrementDto` (`"fragments":[…]` with your fields/columns)
from the POST means the wiring is correct. `"Not found."` in the response = no screen at that
route. To *see* it render, use the **mateu-run** skill (screenshot via Playwright).

## Common failures → cause

| Symptom | Cause |
|---|---|
| Compiles, but route 404s / blank page | framework AP or the UI module not on the app's `annotationProcessorPaths` |
| `ui-registrations` missing from jar | indexer AP not on the UI module's `annotationProcessorPaths` |
| Generated controllers not found at runtime | the `@UI` classes live outside the package `@SpringBootApplication` scans |
| UI loads but no styles / 404 on assets | renderer jar (`mateu-vaadin`) not a dependency of the app |
| Lombok getters missing / Lombok stops working | lombok missing from `annotationProcessorPaths` (once the list is set, only what it names runs) |
| An action does nothing / answers 403 | the handler method isn't marked (`@Action`/`@Button`/`@Toolbar`…) — strict action mode |
| Helidon: every route 404s | no `src/main/resources/META-INF/beans.xml` |
| Quarkus/Helidon: components render empty | JSON-B instead of Jackson (`quarkus-rest-jackson` / `jersey-media-json-jackson` missing) |
