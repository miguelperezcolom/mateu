---
title: Using external Mateu UIs
description: Put screens someone else built with Mateu — a workflow engine's console, a vendor's admin module — into your own Mateu app, either running as their own service (federated) or inside your app (in-process). EventConductor is the worked example.
---

**Status:** ✅ Spring MVC and WebFlux (in-process and federated), any backend as a federated
remote. Verified end to end in a browser by `e2e/external-ui-probe.mjs` against
[`demo/demo-eventconductor`](https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-eventconductor).

Some products ship their own UI **built with Mateu**: a workflow engine with its process monitor
and task inbox, a rules engine with its editor, a vendor's admin module. Your app does not rebuild
those screens. It **uses** them, in one of two ways:

| | Federated | In-process |
|---|---|---|
| Where the screens run | the product's own service | your app's JVM |
| How you add them | a `RemoteMenu` in your shell (or a `MicroFrontend` island in a page) | a Maven dependency + name its package (`mateu.ui.modules`) |
| Mateu version of the product | **any** 3.x — independent of yours | must run on yours (binary compatible) |
| Deploys | independently | together |
| Cross-origin setup | CORS on the product's service | none |
| Pick it when | the product runs as a service anyway, or upgrades on its own schedule | you embed the product's engine in your app and want one deployable |

Both modes render the screens with **your** app's renderer and shell: the product's screens
appear in your menu, under your header, with your theme.

## Federated: compose a running service

The product runs as its own service and serves its UI at a mount (EventConductor's console:
`/_workflow`). Your shell adds a section for it.

### From a Java shell

```java
@UI("")
@Title("Acme operations")
public class Shell {

  @Menu Overview overview;

  @Menu
  RemoteMenu workflow =
      new RemoteMenu("https://workflow.acme.com/_workflow")
          .withLabel("Workflow")
          .withPath("/_workflow");
}
```

### From a YAML shell

```yaml
# specs/ui/app.yaml — bound to the mount root in routes.yaml
type: AppShell
title: Acme operations
menu:
  - type: RouteLink
    label: Overview
    route: overview
  - type: RemoteMenu
    label: Workflow
    baseUrl: https://workflow.acme.com/_workflow
    path: /_workflow
```

### What happens

1. Your shell asks the product for its menu **server to server** (the descriptor, cached for 30 s
   — see [Shell and remote menus](/mateu-about/shell-and-remote-menus/)). Only `http`/`https` hosts
   you allow with `mateu.remote.allowed-hosts` (when set) are asked.
2. The user opens the section: the **browser** loads each screen from the product's service
   directly, with your renderer. The URL stays on your shell (`/workflow/processes`), so reloads,
   bookmarks and shared links work — under a Java shell and under a YAML shell alike.
3. Actions on those screens go to the product's service too.

### What the product's service must allow

- **CORS for your shell's origin.** The browser calls the product cross-origin:

  ```properties
  # on the product's service
  mateu.cors.allowed-origins=https://ops.acme.com
  ```

  Mateu's CORS covers its own endpoints (`…/mateu/**`). Anything else a screen loads from its
  own server — the module of a custom element (`Element` with an `import` attribute), an image —
  is the product's to open to your origin (on Spring, a `CorsRegistry` mapping for that path).
  The renderer loads a remote screen's root-relative module url (`/eventconductor/graph.js`) from
  the product's origin, not from your shell's (the web renderers built on `libs/mateu`; the
  Redwood renderer does not do this yet).

  A product built on Mateu before 3.0 beta answers every origin (its generated controllers
  carried `@CrossOrigin`); after it upgrades, it must list your origin.

### Who the user is

There is one token, and every party checks it on its own:

- the **browser** sends the Bearer token it holds (`__mateu_auth_token`, or the provider you
  configured with `configureAuthToken`) on every call — to your shell **and** to the product;
- your **shell** forwards the caller's `Authorization` header when it asks a product for its menu;
- the **product** decides who the caller is with its own framework's authenticated principal
  (Spring Security resource server, Quarkus OIDC…) or its own `PrincipalResolver`. Mateu never
  trusts a token it has not seen verified — see [Security](/java-user-manual/advanced/security/).

So both services must accept the same issuer (one identity provider, the same audience or one
the product accepts). A product that reads its roles from a gateway's headers needs your shell's
traffic to reach it through that gateway.

### Wire versions

Every response carries `wireVersion`. A shell and a product of the same wire **major** (`3.x`)
interoperate in both directions: the wire is additive within a major, so an older product's
screens render on a newer renderer, and a newer product's new fields are ignored by an older one.
The renderer reports a different major once, in plain words, and still renders. A response with
no `wireVersion` (a product older than the field) is accepted silently. Nothing is refused.

### An island inside one of your pages

To show one of the product's screens inside a page of yours rather than as a menu section, embed
it with `MicroFrontend`. Name the product's app (its `@UI` class), because the screens of an app
are routes **of that app**:

```java
MicroFrontend.builder()
    .baseUrl("https://workflow.acme.com/_workflow")
    .route("/workflow/processes")
    .consumedRoute("")
    .serverSideType("io.mateu.workflow.infra.in.ui.WorkflowHome")
    .build()
```

Without `serverSideType`, the product answers "Page not found" for an in-app route.

## In-process: mount a UI module in your app

The product ships its screens in a jar (EventConductor: `io.mateu.workflow:workflow-engine`,
package `io.mateu.workflow.infra.in.ui`). Your app depends on it and **names that package**:

```properties
mateu.ui.modules=io.mateu.workflow.infra.in.ui
```

or, in code:

```java
@SpringBootApplication
@EnableMateuUiModules("io.mateu.workflow.infra.in.ui")
public class PmsApplication { … }
```

Then its screens are yours to place, e.g. in your shell's menu:

```java
@UI("")
public class PmsHome {

  @Menu FrontDesk frontDesk;

  @Menu
  @Label("Workflow")
  WorkflowMenu workflow;   // the product's own menu class
}
```

### Why you name the package

Mateu registers **only its own beans** (`io.mateu.MateuAutoConfiguration`, an auto-configuration of
`mateu-mvc` / `mateu-webflux`). A UI module's controllers and route resolvers — which the annotation
processor generates **next to each `@UI` class** — and the beans its screens use live in the
module's own package, so they are registered only when your app asks for that package. Mateu used
to scan all of `io.mateu`, which swept in any library living under it whether you wanted its UI or
not.

`mateu.ui.modules` (comma-separated, or a YAML list; env `MATEU_UI_MODULES`) and
`@EnableMateuUiModules(value / basePackages / basePackageClasses)` scan exactly like a
`@ComponentScan` of those packages: `@Component`s, `@Named` beans and `@Configuration` classes. At
startup Mateu logs how many beans each module registered, and **warns** when a named package
registered none (a typo, or the jar is missing). A plain `scanBasePackages` entry works too; the
property just says what it is for and keeps working when your main class moves.

Symptoms when the module is not named: the product's own mount (`/_workflow`) answers 404, and its
screens reached from your menu say **"Page not found"**.

### Two ways a module can ship

| The module jar contains… | How you consume it |
|---|---|
| **generated controllers** (it was compiled with `mateu-annotation-processor-mvc`) | depend on it + name its package. It only works on the adapter it was compiled for — Spring MVC for EventConductor 2.x. |
| a **`META-INF/mateu/ui-registrations`** index (compiled with `mateu-annotation-processor-indexer`, framework-agnostic) | depend on it, put it on your annotation processor path **as well**, so your framework's processor generates its controllers in your build — see [two-step annotation processing](/java-create-your-project/springboot-mvc/) — and name its package. Works on every adapter. |

A product that wants to be consumable from any adapter should ship the second form.

### Other adapters

`mateu.ui.modules` / `@EnableMateuUiModules` are Spring (MVC and WebFlux). On the other adapters
the container already discovers beans per jar:

- **Quarkus**: a dependency's beans are discovered when the jar has a Jandex index or
  `META-INF/beans.xml`; otherwise `quarkus.index-dependency.<name>.group-id/artifact-id`.
- **Micronaut**: beans are compiled ahead of time; a jar compiled with Micronaut's processors
  brings its bean definitions with it.
- **Helidon MP**: the jar must be a bean archive (`META-INF/beans.xml`).

In all three the module must be indexed (`ui-registrations`) so that **your** build generates the
controllers for your adapter.

### The product must run on your Mateu

In-process, the product's classes were compiled against **its** Mateu version and run against
**yours**. Two things make that work:

- **One Mateu on the classpath.** Import `io.mateu:mateu-bom`: it also manages the pre-rename
  artifact ids (`mvc-core`, `uidl`, `core`, `vaadin-lit`…) a product built on an older alpha still
  declares, which resolve to relocation poms — so Maven does not load two copies of `io.mateu.*`.
- **Binary compatibility.** Mateu is still in alpha; a release may rename or remove API. Check the
  product's jars against yours before upgrading either (the EventConductor check below is a
  template).

## Worked example: EventConductor

[EventConductor](https://github.com/miguelperezcolom/eventconductor) is a workflow engine whose
console (definitions, processes with a live diagram, steps, task contracts, analytics; forms and
human tasks in `forms-engine`) is built with Mateu. Version **2.23.10** was built on Mateu
**3.0-alpha.371**.

The runnable example is [`demo/demo-eventconductor`](https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-eventconductor):

| Module | Port | What it shows |
|---|---|---|
| `inprocess` | 8620 | the engine embedded (H2), its console mounted with `mateu.ui.modules`, next to the app's own screens. Also serves the console at `/_workflow` for the shells below. |
| `shell` | 8621 | a Java `@UI` shell: the console as a `RemoteMenu` section, and as a `MicroFrontend` island in a page |
| `shell-yaml` | 8622 | the same shell as YAML (`type: AppShell`) |

```bash
cd backend && mvn install -DskipTests          # the demo tracks master
cd ../demo/demo-eventconductor && mvn package -DskipTests
java -jar inprocess/target/*.jar &             # :8620
java -jar shell/target/*.jar &                 # :8621
java -jar shell-yaml/target/*.jar &            # :8622
cd ../../e2e && node external-ui-probe.mjs     # checks all of it in a browser
```

What was verified (Mateu master, October 2026):

- **Federated**, against a console on Mateu master **and** against EventConductor 2.23.10's own
  console on 3.0-alpha.371: the menu merges, screens load cross-origin with the token, deep links
  and record links work under the Java and the YAML shell, both speak wire 3.0. The alpha.371
  console's process diagram does not load in a shell until it serves its graph module with CORS.
- **In-process**: EventConductor 2.23.10's compiled classes run on Mateu master — a bytecode check
  of every Mateu class, method, field, annotation element and enum constant they reference (151
  classes, 770 method references, 438 annotation uses) found none missing, and the console's
  screens (lists, process detail with its diagram, forms, dashboards) render and act.

The changes EventConductor needs on its side are tracked in the project's readiness notes
(`design/readiness/eventconductor-uis.md`).
