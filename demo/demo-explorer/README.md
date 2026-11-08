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
   every Java example is a class under `io.mateu.explorer.examples`, no route is used twice.
3. Checklist ids no entry covers yet are **pending**: printed on every run; a failure only with
   `-Dexplorer.coverage.strict=true` (make it the default once the Explorer is complete).

Ids are `component:<Type>`, `template:<FormTemplate>`, `archetype:<Name>`, `behaviour:<id>`,
`distributed:<id>`. To add a checklist id (not an entry), edit `checklist.yaml` — keep it rare.

## Pending after PR #1080

The progress/notifications patterns are being rebuilt in PR #1080. Entries for
`behaviour:notifications-inbox` and `behaviour:task-center` show the CURRENT API; refresh them once
#1080 merges (their checklist items carry a `note:` saying so).
