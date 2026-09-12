# Example 5 — build-time federation

**Example 5** of the progressive Star Wars suite. Example 4 was one application; this one is one
application composed from **several independently-authored modules** — the build-time federation
mode: one deployment, many modules, each owning its own domain and CRUD.

## The shape

```
demo-starwars-5-federation/         (reactor)
  characters-ui/    ← an independent @UI module (Characters CRUD)   — indexer AP
  planets-ui/       ← an independent @UI module (Planets CRUD)      — indexer AP
  shell-app/        ← the shell: depends on both, menus them        — framework AP
```

Each `*-ui` module is **framework-agnostic** (no Spring): it declares `@UI` classes and is compiled
with the **indexer** annotation processor, which writes `META-INF/mateu/ui-registrations` into its
jar — a manifest of its `@UI` classes.

The `shell-app` depends on both modules and is compiled with the **framework** annotation processor,
with each UI module on the processor path. That processor reads the modules' indexes and generates
their controllers **without their sources** — the shell only names them:

```java
@UI("") @Title("Star Wars — federated shell") @App
public class Shell implements HomeRouteSupplier {
  @Menu Characters characters;   // from characters-ui
  @Menu Planets planets;         // from planets-ui
  @Override public String homeRoute() { return "characters"; }
}
```

## The two-step annotation processing

That is the mechanism the whole example turns on (`e2e/README.md` is the canonical reference):

1. **Index** — each UI module lists `annotation-processor-indexer` in `annotationProcessorPaths`; it
   writes the `ui-registrations` index into the jar.
2. **Generate** — the app lists `annotation-processor-mvc` **and each UI module** in
   `annotationProcessorPaths`; it reads the indexes and generates the controllers.

Both the module and the AP must appear on the processor path — see `shell-app/pom.xml`.

## The step from Example 4

Example 4 declared everything in one module. Example 5 splits the domains into modules that a
different team could own and build on their own, and composes them at build time into a single
deployment — no runtime coupling, no shared source. (The other federation mode — independent
services stitched at runtime over HTTP with `RemoteMenu` — is the microservices variant; this one is
the single-deployment variant.) Next: a static bundle with no backend at all.

## Run it

```bash
# build the reactor once (installs the UI modules, then the shell)
cd demo/demo-starwars-5-federation
mvn -s ../../settings.xml clean install -DskipTests

# run the shell
cd shell-app
mvn -s ../../../settings.xml spring-boot:run     # → http://localhost:8604
```

Open <http://localhost:8604> — the menu has **Characters** and **Planets**, each a full CRUD served
from its own module.
