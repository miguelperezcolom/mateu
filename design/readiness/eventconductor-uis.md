# Using EventConductor's UIs from a Mateu app

Date: 2026-10-12. Branch `feat/consume-external-uis` (from master `833cca02c`).

EventConductor (EC) — the owner's workflow engine — ships its console (definitions, processes with
a live diagram, steps, task contracts, analytics; forms and human tasks in `forms-engine`; rules in
`rule-engine`) **built with Mateu**. A Mateu app must be able to *use* those screens; Mateu does not
build a workflow UI of its own. This note says what works on current Mateu, what Mateu changed to get
there, and what EC has to change on its side. The general, product-neutral guide is
`doc/src/content/docs/java-user-manual/build/using-external-mateu-uis.md`.

Published EC is **2.23.10** (Maven Central), built on Mateu **3.0-alpha.371** under the pre-rename
artifact ids (`mvc-core`, `uidl`, `core`, `vaadin-lit`, `annotation-processor-mvc`).

## Verdict

| Mode | Verdict | Evidence |
|---|---|---|
| **Federated** — EC console as its own service, composed by a Mateu shell (`RemoteMenu` section, Java `@UI` shell and YAML `type: AppShell`; `MicroFrontend` island) | ✅ works, against a console on Mateu master **and** against EC 2.23.10's own console on alpha.371. One gap on the alpha.371 console: the process **diagram** tab stays empty until EC serves its graph module with CORS (EC-side, item 6). | `e2e/external-ui-probe.mjs`, all checks green against `demo/demo-eventconductor`; against the alpha.371 console all green but the diagram check (blocked by CORS, as expected) |
| **In-process** — the EC engine and its console inside the Mateu app | ✅ works for `workflow-engine` (+ its console) after the Mateu change below: EC 2.23.10's alpha.371-compiled classes run on Mateu master. ⚠️ `forms-engine` embedded does not boot without a Spring Cloud Stream `StreamBridge` (Kafka) — EC-side, item 5. | bytecode check (0 missing members); `demo/demo-eventconductor/inprocess` crawled in a browser: lists, process detail with diagram, the "New process" form, both EC dashboards (`/_workflow`, `/_workflow-admin`) |

## What was run

- Backend built into a private repository; `UiModulesIT` (MVC 6 tests, WebFlux 6 tests),
  `YamlShellRemoteDeepLinkSyncTest` (3), `elementRenderer.test.ts` (+3) — all green, and the
  two behaviour tests confirmed failing without their fix.
- **EC console on alpha.371**: EC's `testbench/workflow-embedded` copied to a scratch dir (the EC
  repo was not touched), pointed at the published `workflow-engine` 2.23.10 and Mateu alpha.371, run
  on :8611.
- **`demo/demo-eventconductor`** (new): `inprocess` :8620 (EC 2.23.10 embedded, its console via
  `mateu.ui.modules`, also the "EC service" for the shells), `shell` :8621 (Java), `shell-yaml`
  :8622 (YAML). Playwright probe `e2e/external-ui-probe.mjs`:
  - menu section shows; the remote's menu merges; the screen loads **from the console origin**
    (cross-origin, no CORS error); **every call to the console carries the browser's Bearer
    token**; the URL works as a **deep link** (fresh load); a **record** opens from the list; the
    record's **custom element** (`<eventconductor-workflow-graph>`) is defined; no wire mismatch;
    wire `3.0` on both sides;
  - the `MicroFrontend` island renders the console's process list inside a shell page;
  - in-process: EC's screens in the app's own menu, no error page, EC's own mount answers.
- Same probe with the Java and the YAML shell pointed at the **alpha.371 console**: all green except
  the diagram (CORS, see item 6).
- **Bytecode compatibility** (scratch `BinCompat.java`, Spring's repackaged ASM): every reference the
  four EC 2.23.10 jars (`workflow-engine`, `forms-engine`, `rule-engine`, `shared`) make into
  `io.mateu.*` (EC's own `io.mateu.workflow`/`io.mateu.testworker` excluded) checked against the
  Mateu master classpath — **151 classes, 770 method/constructor references (incl. lambdas and method
  references), 57 field references, 438 annotation uses (elements and enum constants), plus every
  abstract Mateu method an EC class must implement: 0 missing.** The checker was validated by
  removing `mateu-core` from the classpath (135 problems reported).
- `dependency:tree` of the in-process app: one Mateu (the BOM relocates the old ids).

## What Mateu changed (this branch)

| Change | Why | Tests |
|---|---|---|
| **`mateu.ui.modules` / `@EnableMateuUiModules`** (Spring MVC + WebFlux): name a third-party UI module's package and its beans (generated controllers, route resolvers, the screens' services) are registered, exactly like a `@ComponentScan`; a named package with no beans logs a WARN. `MateuUiModulesRegistrar` is an `ImportBeanDefinitionRegistrar` (imported by `MateuAutoConfiguration` for the property, by the annotation for code), so a module's own `@Configuration` classes are processed too. | Since `3f37ee451` Mateu registers only its own beans. EC's console used to be swept in by Mateu's `io.mateu` scan; now it is not, and EC's `@WorkflowEmbeddedApplication` deliberately excludes its UI layer — so an embedding app got **"Page not found"** for every EC screen and a 404 on `/_workflow`, with nothing logged. | `UiModulesIT` (MVC, WebFlux): not named → not served; named by property (two packages) → served + other beans registered + the app's own UI still answers; named by `basePackageClasses` → served, only that package scanned. Contract methods in `AdapterParityITFoundation`. |
| **Deep links into a remote under a YAML shell.** `AppMenuResolver.resolveRemoteDeepLink`, called from `ActionInstanceCreator`'s data-authored-shell paths (fresh load, and the content load after local pages). | Under a `type: AppShell` with a `RemoteMenu`, clicking a remote screen worked but reloading/bookmarking it answered "Page not found": only the `@UI` class path offered unclaimed routes to the remotes. | `YamlShellRemoteDeepLinkSyncTest`: deep link mounts the remote, the caller's token reaches it, a local route is never offered to it. |
| **Custom-element modules of remote screens** (`libs/mateu` `elementRenderer.remoteOriginOf` / `moduleUrlFor`): an `Element` `import` that is root-relative is loaded from the origin of the remote app that sent the screen (found by walking up to the nearest `mateu-ux`'s base url) instead of the shell's. | EC's diagram (`/eventconductor/workflow-graph.js`) 404'd on the shell; the diagram tab of every federated process stayed empty. | `elementRenderer.test.ts` (+3); probe check "the record's `<eventconductor-workflow-graph>` is defined". Vaadin bundle regenerated. |
| Docs: guide *Using external Mateu UIs*; links from Spring MVC setup, shell & remote menus, migrating-from-alpha (scan row); stability page lists the adapter properties + `@EnableMateuUiModules` as public. Demo `demo/demo-eventconductor` (in `demo/pom.xml`, so CI compiles it). Probe `e2e/external-ui-probe.mjs`. | | |

**Wire version policy — no change needed.** EC alpha.371 already answers `wireVersion: "3.0"`; the
renderers' check is "same major interoperates, a different major is reported once and still
rendered, an absent version is accepted silently". Nothing refuses an older remote. Documented in the
guide (*Wire versions*).

**Deprecated bridges — none needed.** The bytecode check found no API EC uses that current Mateu
removed or changed, so nothing was restored. (Mateu is alpha: other agents are renaming listing /
`MetricCard` APIs right now — re-run the check before each EC upgrade; see *Re-checking* below.)

## EventConductor-side checklist

In priority order. None blocks *using* 2.23.10 as it is (federated, or in-process with
`mateu.ui.modules`); they remove traps and the remaining gaps.

1. **Move to the `mateu-*` artifact ids and import the BOM.** Replace `io.mateu:mvc-core`,
   `vaadin-lit`, `annotation-processor-mvc` (all at `${mateu.version}` = 3.0-alpha.371) with
   `mateu-mvc` / `mateu-vaadin` / `mateu-annotation-processor-mvc`, import `io.mateu:mateu-bom`, and
   bump to the first Mateu release that contains this branch (expected **3.0-alpha.411** or later).
   Rebuild — the generated controllers in the EC jars are then the current template (IndexPage,
   no `@CrossOrigin`).
2. **Stop leaking the annotation processor and the renderer.** `workflow-engine` and `forms-engine`
   declare `annotation-processor-mvc` **at compile scope** (it drags freemarker + guava into every
   embedder's runtime) and `vaadin-lit` (forces a renderer on the embedder, who may use Redwood).
   Move the processor to `<annotationProcessorPaths>` only; make the renderer `optional` (or
   `provided`) in the library modules and keep it in the standalone apps.
3. **Document the UI module for embedders.** With Mateu master an embedding app must name EC's UI
   package: `mateu.ui.modules=io.mateu.workflow.infra.in.ui` (or `@EnableMateuUiModules`). EC's
   `@WorkflowEmbeddedApplication` excludes that package on purpose, and its README/testbenches relied
   on Mateu's old `io.mateu` scan to bring it back — under current Mateu the testbenches
   (`testbench/workflow-embedded`, `forms-embedded`, `rules-embedded-mvc`) lose their console. Add the
   property to them and to EC's embedding docs. (Optionally: an EC property, e.g.
   `workflow.ui.enabled`, that contributes `mateu.ui.modules` from an `EnvironmentPostProcessor`.)
4. **CORS after the upgrade.** EC's generated controllers on alpha.371 answer any origin
   (`@CrossOrigin`). On current Mateu CORS is off unless `mateu.cors.allowed-origins` lists the
   shells' origins — the standalone console apps (`orchestrator-standalone-app`, the demo services)
   must set it, or every federated shell breaks after the upgrade.
5. **`forms-engine` embedded needs Kafka.** `io.mateu.workflow.application.services.HumanTaskEvents`
   requires a `StreamBridge`; with `forms-engine` on the classpath of an embedded (no Kafka) app the
   context fails: *"Parameter 0 of constructor in …HumanTaskEvents required a bean of type
   'org.springframework.cloud.stream.function.StreamBridge'"*. Make the event publishing a port with
   an in-memory/no-op adapter in embedded mode, or document the
   requirement. Until then the human-task screens (`/forms/task/:_taskId`, the tasks widget) can only
   be used **federated** from a forms service that has Kafka.
6. **Serve the diagram module with CORS.** The process / definition diagram is a custom element
   loaded from `/eventconductor/workflow-graph.js` (`SimpleProcessViewModel`,
   `WorkflowDefinitionDetailView`). Mateu now loads it from the console's origin when the screen is
   federated, but a module script is always fetched in CORS mode and Mateu's CORS covers only
   `/mateu/**`. Add a `CorsRegistry` mapping for `/eventconductor/**` with the same allowed origins
   (`demo/demo-eventconductor/inprocess/.../ConsoleAssetsCors.java` is the 15-line version). Same for
   any other asset a screen loads from EC's server.
7. **Publish an embedding contract for islands.** A `MicroFrontend` island of an EC screen must name
   EC's app class (`serverSideType = io.mateu.workflow.infra.in.ui.WorkflowHome`, or `FormsHome`,
   `RulesHome`), because EC's screens are routes of those apps. List the stable routes and app classes
   (as `WorkflowMenu`'s Javadoc already does for the in-process menu) so embedders do not depend on
   internals.
8. **Prefer the framework-agnostic module form** (optional, for non-Spring-MVC embedders). Today the
   EC jars carry **pre-generated Spring MVC controllers** and view models such as `SimpleProcessViewModel` are
   `@ConditionalOnWebApplication(SERVLET)` Spring beans, so the console can be embedded in-process
   only in a Spring MVC app (federation works with any shell). Shipping the UI classes indexed by
   `mateu-annotation-processor-indexer` (`META-INF/mateu/ui-registrations`) instead would let the
   embedder's own processor generate the controllers for its adapter (WebFlux, Quarkus…). This is a
   larger change (the view models are Spring `@Service @Scope("prototype")` beans with constructor
   injection); not required for Spring MVC.
9. **Identity.** On current Mateu, `@EyesOnly` & co. read roles only from the framework's
   authenticated principal (or a `PrincipalResolver`), never from an unverified token. A federated EC
   console must run a resource server (or a `PrincipalResolver` behind a gateway) for role-gated EC
   screens to show for anyone; the shell forwards the user's `Authorization` header server to server,
   and the browser sends the same token to EC directly.
10. Cosmetic, both versions: `Invalid scale configuration for scale: z` in the browser console on
    EC's analytics/dashboard charts (seen on alpha.371 and on master alike, so not a regression).
    EC's console also hardcodes the `/images/riu.svg` logo, which an embedding app will serve as-is.

## Re-checking binary compatibility before an upgrade

The scratch tool used here is not committed (it lived in the session scratchpad). To redo it: build a
classpath of the target Mateu (`mvn dependency:build-classpath` on `mateu-mvc`), then walk the EC jars
with ASM collecting every `io.mateu.*` (non-EC) class, method/field reference, invokedynamic handle,
annotation element/enum constant and inherited abstract method, and resolve each against that
classpath reflectively. Running the in-process demo and the probe is the behavioural complement.

## Not verified

- **Human tasks / forms** in either mode end to end: `forms-engine` needs Kafka (item 5); no Kafka
  was run. Its classes passed the bytecode check.
- **`rule-engine` console** in a browser (bytecode check only).
- **A real identity provider**: token *propagation* was verified (browser → console, shell → console
  server to server), not a Spring Security resource server validating it on the EC side.
- **Redwood as the shell's renderer** for federated EC screens: Redwood resolves an `Element`'s
  `import` itself (`apps/redwood/poc/core/content.mjs`) and was not changed — the diagram of a
  federated screen will 404 there the same way until it gets the same rule.
- **WebFlux / Quarkus / Micronaut / Helidon** consuming EC in-process: not possible with EC's
  MVC-compiled jars (item 8); the inclusion mechanism itself is tested on WebFlux.
- A shell and a console on **different major** wires (none exists yet).
