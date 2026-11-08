# Mateu Explorer

Everything Mateu can do — every component, page template, archetype, behaviour and distributed-UI
pattern — **running live**, next to the very source that renders it. It is itself a Mateu app
(Spring Boot MVC, Java shell + YAML/Java examples). Target: `explorer.mateu.io` (prepared in
`deploy/demos/demo-explorer.Dockerfile` + `deploy/demos/k8s/70-demo-explorer.yaml`, not deployed).

```bash
cd demo/demo-explorer
mvn spring-boot:run                                   # → http://localhost:8640 (Vaadin)
mvn clean spring-boot:run -Dmateu.renderer=mateu-redwood   # Redwood (clean: a stale target keeps the other renderer)
mvn test                                              # the coverage guard (see below)
```

Uses the released `mateu.version` (3.0-beta.51) from Maven Central.

## How it works

| Piece | File | What it does |
|---|---|---|
| Checklist | `src/main/resources/explorer/checklist.yaml` | The menu's **areas and groups** (in order) and **every id the Explorer must cover**. |
| Entries | `src/main/resources/explorer/entries/<area>/<id>.yaml` | **One file per entry**, discovered by convention. |
| Shell | `ExplorerShell` | `@UI("")` app; its menu (`MenuSupplier`) and ⌘K search (`GlobalSearchSupplier`) are derived from the entries. |
| Routes | `ExplorerRoutes` | A `RouteEntrySupplier`: `/<area>/overview`, `/<area>/<group>/<id>` (the entry page) and every entry's own `pages:`. |
| Entry page | `EntryPage` | Description → doc links → each example **running** → **Code** tabs. Generic; nothing entry-specific. |
| Sources in the jar | `pom.xml` (`explorer-sources`) | The build copies `src/main/java/io/mateu/explorer/examples/**`, `src/main/resources/specs/ui/**`, `src/main/resources/application.properties` and `src/main/ports/**` VERBATIM into the jar under `explorer-src/<same path>`. The Code tabs read them from there. |
| Guard | `src/test/.../ExplorerCoverageTest` | See "Coverage guard". |

**Single source of truth:** the Code tabs show the files the examples are run FROM, read back from
the jar. Never paste a snippet into an entry — point at the file.

## Adding an entry (conflict-free)

Adding an entry touches **no shared file**: no menu, no routes.yaml, no index. Create:

1. **The entry file** — `src/main/resources/explorer/entries/<area>/<id>.yaml`:

   ```yaml
   id: button                       # unique across the Explorer; page = /<area>/<group>/<id>
   area: components                 # an area id of checklist.yaml
   group: actions-and-navigation    # a group id of that area
   title: Button & ButtonGroup      # the menu label
   covers: [component:Button, component:ButtonGroup]   # checklist ids this entry demonstrates
   description: |                   # optional markdown; default = the catalogue description of each
     …                              #   component:X it covers (uidl-catalog.json), or the checklist title
   doc: https://mateu.io/…          # optional; the checklist item's doc is always linked too
   examples:                        # what runs, in order — each names EXACTLY ONE of:
     - title: In YAML
       yaml: specs/ui/explorer/<area>/<id>/<name>.yaml     # a YAML partial (`content:` list), drawn in place
     - title: In Java
       description: optional markdown above it
       java: io.mateu.explorer.examples.<area>.<id>.MyView # embedded as an INDEPENDENT island (EmbeddedView):
                                                           #   its own @Action methods / handlers run
       # embed: inline                                     # (optional) draw a Component/ComponentTreeSupplier in place instead
     - title: A whole page
       route: x/<area>/<id>/<name>                         # a page registered below, embedded as a MicroFrontend + "open on its own" link
   pages:                           # extra routes this entry registers (absolute, mount-relative)
     - {route: x/<area>/<id>/<name>, layout: explorer/<area>/<id>/<page>.yaml}   # layout is relative to specs/ui/
     - {route: x/<area>/<id>/other, viewModel: io.mateu.explorer.examples.<area>.<id>.MyPage}
   code:                            # EXTRA files for the Code tabs (paths relative to the module)
     - {label: "C#", path: src/main/ports/<area>/<id>/MyView.cs}
     - {label: Python, path: src/main/ports/<area>/<id>/my_view.py}
     - {label: application.properties, path: src/main/resources/application.properties}
   # notDemonstrable: "why"         # instead of examples, for an id that cannot run live
   ```

   The Code tabs list, automatically, every `yaml:` file, the source of every `java:` class, every
   page `layout:`/`viewModel:` — then the `code:` extras.

2. **The example files**, at these conventional places (one folder per entry, so nobody collides):
   - YAML: `src/main/resources/specs/ui/explorer/<area>/<id>/…yaml` — a partial is `content: [...]`;
     a page is `type: Form` (page templates: `template:`).
   - Java: `src/main/java/io/mateu/explorer/examples/<area>/<id>/…java` — package
     `io.mateu.explorer.examples.<area>.<id>` (dashes → nothing or `_`). Only classes under
     `io.mateu.explorer.examples` may be examples (their source is what is shown).
   - C# / Python twins: `src/main/ports/<area>/<id>/…` — only where the port supports the feature
     (check `doc/src/content/docs/reference/parity.md`). They are shown, not executed here; keep them
     faithful to the port's API (mirror `backend/dotnet/samples`, `backend/python/samples`).

3. Run `mvn test` — the guard checks the entry and reports what is still pending.

The three template entries: `entries/components/button.yaml` (YAML partial + Java fluent island + a
whole YAML page), `entries/behaviour/validation.yaml` (a Java view island + C#/Python tabs),
`entries/archetypes/dashboard.yaml` (an archetype island + its own route + C#/Python tabs).

### Gotchas found building the templates

- **A YAML partial's actions bubble to the entry page**, which handles none: in a partial use buttons
  with an `actionable` (RouteLink), a `restAction`, or client rules — for server actions use a `java:`
  island.
- **A fluent handler button needs an explicit `actionId`** (beta.51): without one it is not advertised
  and its click never reaches the server.
- **`ButtonGroup` renders only in a toolbar**, not in a content tree (dropped silently) — show it on a
  page.
- An embedded archetype's composed heading shows the app title, not the view's `@Title`.
- The menu nests paths: a leaf's route must start with its group's path (hence `/<area>/<group>/<id>`).
- **A `pages:` route with only a `layout:` renders embedded but not on its own** (beta.51): the
  "Open this page on its own ↗" link lands on "Page not found". The route is registered and works.
  But under the class shell, the content load names `ExplorerShell` as its type, and Mateu resolves
  that through the shell's menu and the routed classes only. It never reaches the definition. This
  is a framework bug, and it is being fixed in `fix/explorer-findings-2`.

> **These workarounds are temporary.** The notes on handler buttons needing an explicit `actionId`,
> on `ButtonGroup` rendering only in a toolbar, on the embedded heading and the Redwood section below
> describe beta.51 bugs. Framework PR #1092 (branch `fix/explorer-findings`) and its follow-up
> `fix/explorer-findings-2` fix them. Once both are merged and `mateu.version` moves to the release
> that contains them, drop these notes. Also drop the workarounds in the examples, such as the
> explicit `actionId`s and showing `ButtonGroup` only on a page.

## Run the distributed examples

The *Distributed UIs* area needs other apps to federate, embed and call. They live in
`remotes/` (their own Maven reactor, `remotes/pom.xml`), and their sources are copied into the
Explorer's jar like the examples, so the Code tabs show them too.

| Port (env) | What | Module |
|---|---|---|
| 8640 (`EXPLORER_PORT`) | the Explorer — also serves the mounts `/fed` (the federated console, Java) and `/yaml-mount` (YAML) | `.` |
| 8641 (`JAVA_REMOTE_PORT`) | **Java remote**: the Inventory app shell (`/inventory`), the micro frontends (`/mf-*`), the content service (`/content-hub`), the identity echoes (`/id-*`), and the helpdesk UI module (`/helpdesk`) it mounts in-process | `remotes/java-remote` + `remotes/helpdesk-ui` |
| 8642 (`YAML_REMOTE_PORT`) | **YAML-only remote**: the Orders domain (`/orders`), no UI code | `remotes/yaml-remote` |
| 8643 (`STATIC_REMOTE_PORT`) | **static bundle**: the Help Center, plain files behind `remotes/serve-static.mjs` | `remotes/static-remote` |
| 8644 (`PYTHON_REMOTE_PORT`) | **Python remote** (optional): Reports, FastAPI + `mateu-ui` | `remotes/python-remote` |

```bash
cd demo/demo-explorer/remotes
./run.sh                 # builds the remotes and the Explorer, starts everything (Python only if its .venv exists)
./run.sh stop
# optional, once: the Python remote
(cd python-remote && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt)
```

Start order does not matter (a remote that is not up yet shows "… is not available right now. It
will be retried."). `./run.sh --remotes-only` leaves the Explorer to you (`mvn spring-boot:run`).
Other ports: set the env vars above — `run.sh` derives the urls the Explorer calls
(`EXPLORER_JAVA_REMOTE_URL`, `EXPLORER_YAML_REMOTE_URL`, `EXPLORER_STATIC_REMOTE_URL`,
`EXPLORER_PYTHON_REMOTE_URL`, read by `examples/distributed/Remotes.java`) and the origin the remotes
allow (`EXPLORER_ORIGIN`, their `mateu.cors.allowed-origins`).

**Verify:** `node remotes/probe.mjs` (same env vars; Playwright from the repo's `e2e/`, or
`PLAYWRIGHT_FROM=<dir>`) drives every "Try it" of the area in a browser — 23 checks, incl. a restart of
the Java remote with another `MATEU_BUILD_ID` (version skew) during which the content slots must
paint their fallbacks. Checks marked *known Mateu bug* are reported but tolerated
(`KNOWN_BUGS=strict` fails on them):

- a fresh deep link / reload of a remote screen (`/fed/stock`) is loaded from the SHELL with the
  remote app's `serverSideType` → 403 (clicking the menu works);
- a leaf of a YAML-only remote (no `serverSideType`) is sent to the remote with the SHELL's
  `serverSideType` (`appRenderer.chooseAppServerSideType`) → the remote answers 403;
- a `RouteLink` on the non-root YAML mount pushes `/yaml-mountsecond` (no slash).

Gotchas found building the area:

- Adding a `type: UI` mount turns OFF the conventional root `specs/ui/routes.yaml` (RouteRegistry
  loads it only when no mount is declared). The Explorer authors its routes in code, so nothing is
  lost — but do not add a root `routes.yaml` expecting it to load.
- `@Label` on a `MicroFrontend` FIELD is not drawn: compose captions yourself (`Links.caption`).
- A screen embedded from an origin the app does not name is drawn through the untrusted strip: an
  `Element`'s `import` is dropped (see the *Remote Element imports* entry).
- A down remote's failed call raises the PAGE-level "No connection" toast / "Connection restored"
  banner, not only an error inside its island; and an embedded page with the default chrome shows the
  HOST's breadcrumb trail inside the island.
- Browsers refuse some ports outright (`ERR_UNSAFE_PORT`, e.g. 9): the "down" remote is 127.0.0.1:59999.
- Python: `add_mateu(app, *sources)` takes modules or classes; a LIST (`add_mateu(app, [A, B])`) is
  silently ignored — every route then answers "Route not found". Pass `A, B` or the module.

k8s: `deploy/demos/k8s/70-demo-explorer.yaml` carries a Deployment/Service/Ingress per remote
(images from `deploy/demos/demo-explorer-remotes.Dockerfile`, one `--target` each). Prepared, not applied.

## Redwood

`-Dmateu.renderer=mateu-redwood` serves the same app on the Redwood (VB) renderer (no console errors
on the template entries), but Redwood RESHAPES the entry page with its own page projection: the
header and description are not drawn and only the first example card shows, beside the Code tabs.
Fix that (in the Redwood projection, or by giving the entry page a shape Redwood keeps) before
advertising the Redwood twin.

## Coverage guard

`ExplorerCoverageTest`:

1. `checklist.yaml` lists every component of `uidl-catalog.json` (read from the mateu-uidl jar) and
   every `FormTemplate` — a new Mateu component without a checklist id fails the build.
2. Every entry is well-formed: known area/group, every `covers:` id is a checklist id, something runs
   (or `notDemonstrable:` says why), every file it runs or shows exists and was copied into the jar,
   every Java example is a class under `io.mateu.explorer.examples`, no route is used twice, and a
   description that talks about a known issue / gap carries a `knownIssue:` line.
3. **Strict by default**: a checklist id no entry covers (by an example or a `notDemonstrable:`
   reason) fails the build. `-Dexplorer.coverage.strict=false` only reports them, for work in progress.
4. Every run prints the totals and the `knownIssue:` list. A **known issue** is a Mateu bug an entry
   runs into: the description says it to the reader, `knownIssue:` (one line) lets the guard and the
   probe report it — never a failure. Drop both once the fix ships in `mateu.version`.

Ids are `component:<Type>`, `template:<FormTemplate>`, `archetype:<Name>`, `behaviour:<id>`,
`distributed:<id>`. To add a checklist id (not an entry), edit `checklist.yaml` — keep it rare.

## Pending after PR #1080

The progress/notifications patterns are being rebuilt in PR #1080. Entries for
`behaviour:notifications-inbox` and `behaviour:task-center` show the CURRENT API; refresh them once
#1080 merges (their checklist items carry a `note:` saying so).
