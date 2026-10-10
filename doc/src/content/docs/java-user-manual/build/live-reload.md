---
title: Live reload (development mode)
description: Edit a YAML definition or a Java method while the backend runs in debug, and the screen already open in the browser re-renders in place — no restart, no manual refresh, what you typed kept.
---

**Status:** ✅ Java (all five adapters), .NET and Python backends; Vaadin and Redwood/VB renderers;
IntelliJ and VS Code actions. Verified end to end in a browser by `e2e/live-reload-probe.mjs`.

Run the backend in **development mode** and the UI open in your browser follows your edits:

| You change… | What happens | You do |
|---|---|---|
| a definition under `specs/ui/**` (YAML) — by hand or in the visual editor | the open screen is re-requested **in place**: no navigation, no page load, the values typed in the form kept | nothing |
| a route file, a `type: UI` mount or an app shell | the app is remounted on the same URL | nothing |
| a Java method body | IntelliJ/VS Code **HotSwap** it into the running JVM, then the open screen re-renders | build (`Ctrl+F9`) while debugging |
| anything HotSwap cannot reload (new fields, signatures, annotations) | the backend restarts (Spring DevTools, `quarkus:dev`…) and the open browsers re-render when it is back | nothing (or restart) |

A small **"↻ Reloaded"** pill in the bottom-left corner says what triggered each reload.

## Turning it on

Development mode is **off by default**. Turn it on with either

```properties
# application.properties (or -Dmateu.dev=true, or the environment variable MATEU_DEV=true)
mateu.dev=true
# where the specs are edited (default: src/main/resources/specs/ui; comma-separated for several modules)
mateu.dev.specs-dir=ui-module/src/main/resources/specs/ui
```

:::caution[`mvn spring-boot:run -Dmateu.dev=true` does not turn it on]
`spring-boot:run` starts the app in a **separate JVM**, so a `-D` on the Maven command line stays in
Maven's. Pass it to the app instead — any of:

```bash
MATEU_DEV=true mvn spring-boot:run
mvn spring-boot:run -Dspring-boot.run.arguments=--mateu.dev=true
mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dmateu.dev=true
```

The same applies to `mateu.dev.specs-dir`. `java -Dmateu.dev=true -jar target/app.jar` works as
written. If the banner below is not in the log, development mode is off.
:::

The IDE actions below set both for you. At startup the backend logs a loud warning:

```
**************************************************************************
  MATEU DEVELOPMENT MODE IS ON (mateu.dev=true)
  specs are read from [/…/src/main/resources/specs/ui] and watched;
  /mateu/dev/events and /mateu/dev/reload are served.
  NEVER enable this in production.
**************************************************************************
```

:::caution[Never in production]
The dev endpoints let anyone who can reach the server force a re-render on every open browser and see
which spec files changed. They only exist while `mateu.dev` is `true`; nothing in a production profile
sets it. Keep it out of `application-prod.properties`, container images and Helm values — set it on the
run configuration (or `.env`) of your workstation only.
:::

## What development mode does

1. **Specs come from the sources.** `specs/ui/**` is read from the source directory instead of the copy
   the build put on the classpath, so an edit counts without a rebuild — and a file you delete is gone
   (the stale `target/classes` copy is hidden). Specs other jars contribute are still found.
2. **They are watched.** A watcher (the JDK `WatchService` on Linux/Windows, a 300 ms snapshot poll on
   macOS where the JDK's is a 2–10 s poller) reports each burst of edits once.
3. **Every cache of them is dropped**: the route and mount registry, the YAML definitions, partials and
   app shells, the REST source and component catalogues, and the wire-type allow-list.
4. **The browsers are told**, over `GET /mateu/dev/events` (server-sent events):

   | Event | Meaning |
   |---|---|
   | `{"type":"hello","bootId":"…"}` | first event of every connection; a **different boot id** than last time means the server restarted → the client re-renders |
   | `{"type":"specs-changed","files":["specs/ui/orders.yaml"],"scope":"page"}` | re-request the screen on display |
   | `{"type":"specs-changed",…,"scope":"app"}` | a route file, mount or app shell changed (or a file was deleted) → remount the app |
   | `{"type":"reload","scope":"page"}` | someone asked for a re-render (`POST /mateu/dev/reload`) |
   | `{"type":"ping"}` | keep-alive every 15 s |

5. **`POST /mateu/dev/reload[?scope=app]`** (204) re-renders every open screen — what the IDE fires
   after a HotSwap, when the code changed but no spec did:

   ```bash
   curl -X POST http://localhost:8080/mateu/dev/reload
   ```

The index page of a dev-mode backend carries `<meta name="mateu-dev" content="/mateu/dev/events">`;
that is how the renderers know to subscribe (a page from a production backend has no such tag, and the
client opens no connection at all). A host page that boots Mateu itself can point at a backend
explicitly with `window.__MATEU_DEV_EVENTS__ = 'http://localhost:8080/mateu/dev/events'`.

### What is kept on screen

A page-scoped reload sends the screen's **current component state** with the request (so a Java view
model is hydrated from what you typed) and lays it back over the answer (so a definition-only page
keeps it too). The route, the scroll position and the rest of the app shell stay put. An app-scoped
reload remounts the shell on the same URL: the route survives, typed values do not.

## Java code: HotSwap and restarts

**HotSwap (method bodies).** Start the app in **debug** (the IDE action does) and, after editing a
method, build (`Build › Build Project`, `Ctrl+F9`/`⌘F9`); IntelliJ offers — or, with *Settings › Build ›
Debugger › HotSwap › Reload classes after compilation: Always*, performs — the HotSwap. The next action
you run already executes the new code; the IDE plugin then fires `POST /mateu/dev/reload` so the screen
on display re-renders with it too. Without the plugin, run *Reload Mateu Screen* or the `curl` above.

**Restarts.** For changes the JVM cannot hot-swap (new fields, new classes, changed annotations):

| Adapter | How | What the browser does |
|---|---|---|
| **Spring MVC / WebFlux** | add `spring-boot-devtools` (`<scope>runtime</scope>`, `<optional>true</optional>`): it restarts the app context when the classpath changes | the event stream drops, reconnects to the restarted app, sees a new boot id and re-renders |
| **Quarkus** | `mvn quarkus:dev -Dmateu.dev=true` — Quarkus recompiles and restarts on the next request; it also opens a debugger port (5005) | same |
| **Micronaut** | `mvn mn:run -Dmn.watch=true` (or `./gradlew run --continuous`) with `MATEU_DEV=true` | same |
| **Helidon MP** | no built-in restart: run it from the IDE in debug (HotSwap) and restart the run configuration for structural changes; with `mateu.dev=true` in `microprofile-config.properties` or `MATEU_DEV=true` | same |

## From the IDE

### IntelliJ — *Run › Run Mateu App (Live)*

The Mateu plugin's action finds the module that declares a runnable app (Spring Boot, Quarkus,
Micronaut or Helidon; Maven or Gradle) and

1. starts it in development mode with the debug agent listening on 5005
   (`mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=… -Dmateu.dev=true
   -Dmateu.dev.specs-dir=…"`, `mvn quarkus:dev -Dmateu.dev=true`, `mvn mn:run -Dmn.debug=true …`,
   `./gradlew bootRun --debug-jvm`), with `MATEU_DEV`/`MATEU_DEV_SPECS_DIR` in its environment and every
   `src/main/resources/specs/ui` of the project as specs directories;
2. once it answers, attaches a *Remote JVM Debug* session (*Mateu (live) debugger*) so HotSwap works;
3. points *Settings › Tools › Mateu* at it when the project has no backend configured yet — the Mateu
   tool window and the **visual editor's Play** then use the running app — and opens it in the browser;
4. after every HotSwap, fires `POST /mateu/dev/reload`.

*Run › Reload Mateu Screen* fires the reload by hand. An edit made in the **visual editor's canvas** is
written to the YAML file, so it reaches the running app (and its open browsers) like any other edit.

### VS Code — *Mateu: Run App (Live)*

The command runs the same launch as a shell task (*Mateu (live)* terminal) and opens the app once it
answers. Attach a *Java: Attach* debug configuration on port 5005 for hot code replace: when the Java
debugger reports a hot code replace, the extension fires the reload. *Mateu: Reload Screen* does it by
hand.

## .NET and Python backends

The same endpoints and events, so the same renderers follow them:

- **.NET** — `MATEU_DEV=true` (or `AddMateu(o => o.Dev = true)`): a `FileSystemWatcher` over the specs
  directory (`MATEU_DEV_SPECS_DIR`, else `MATEU_SPECS_DIR`, else `specs/ui`) drops the registries and
  `MapMateu` serves `/mateu/dev/events` and `/mateu/dev/reload`. Run with `dotnet watch` for C# changes:
  the restarted app's new boot id re-renders the open browsers.
- **Python** — `MATEU_DEV=true` (or `add_mateu(app, …, live_reload=True)`): a polling watcher, the
  same endpoints. Run with `uvicorn app:app --reload` for Python changes.

## Adding a catalogue of your own

Anything that reads `specs/ui/**` once and keeps it joins the invalidation with one line — implement
`io.mateu.core.infra.dev.SpecsCache` and register it:

```java
public class TranslationsCatalogue implements SpecsCache {
  private volatile Map<String, String> loaded;

  public TranslationsCatalogue() {
    DevSpecs.register(this); // the one line
  }

  @Override
  public void invalidateSpecs() {
    loaded = null; // read again on next use
  }

  private Map<String, String> load(ClassLoader cl) {
    // read through DevSpecs.classLoader(cl): in dev mode specs/ui/** comes from the sources
    try (var in = DevSpecs.classLoader(cl).getResourceAsStream("specs/ui/translations.yaml")) { … }
  }
}
```

Registration is weak and costs nothing outside development mode. The ports have the same hook:
`ISpecsCache` + `DevSpecs.Register(this)` (.NET), `invalidate_specs()` + `dev_specs.register(self)`
(Python).

## Limitations

- The **YAML mounts** of a class-less deployment are routed at startup: a *new* `type: UI` file (a new
  base path) needs a restart; editing an existing one does not.
- A HotSwap only replaces method bodies (standard JVM); use DevTools/`quarkus:dev` or a restart for the
  rest. The reload after a HotSwap is fired as the swap starts, with a short delay — on a very slow swap,
  press *Reload Mateu Screen*.
- An **app-scoped** reload (routes, mounts, shell) remounts the shell, so typed values are not kept.
- The React Native and IntelliJ native renderers do not subscribe yet: reopen the screen.
