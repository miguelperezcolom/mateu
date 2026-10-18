---
name: mateu-yaml
description: Author Mateu UIs as DATA — YAML files under specs/ui (a `type: UI` mount, routes.yaml, page/layout definitions, sources.yaml REST sources, `type: AppShell` menu, actions/types/translations/environments/project files, partials) served by a backend (Spring Boot, .NET, Python) or shipped as a static bundle to a CDN with mateu-bundle-maven-plugin. Use for no-code/low-code Mateu work, the yaml / static starters, files the visual editor writes, or binding a YAML layout to a view model. Triggers on specs/ui, type: UI, routes.yaml, sources.yaml, AppShell, layout:, rowsSource, restAction, sample:, mateu-bundle, specsOnly, staticOnly.
---

# Authoring Mateu UIs as data (YAML)

The same model a Java `@UI` class declares can be written as YAML under `specs/ui/`
(`src/main/resources/specs/ui/` in a Maven project; `specs/ui/` under the working directory for
the .NET/Python servers, or `MATEU_SPECS_DIR`). No UI code, no frontend code: a generic renderer
paints what the files declare. The IDE visual editor (IntelliJ / VS Code) reads and writes these
same files.

## The mental model

```
type: UI  (mount at a base path, home:, lists route files)
  └─ routes.yaml  (type: Routes — each route → a layout file and/or a viewModel, params, data:)
       ├─ ""      → app.yaml        (type: AppShell — title + menu around every screen)
       ├─ orders  → orders.yaml     (a page: type: Listing, rowsSource: {ref: orders})
       └─ orders/:id → order.yaml   (a page: type: Form, data: order fetches the record)
sources.yaml  (every REST endpoint named once; pages reference it by name; sample: data)
```

- Routes are **relative to the mount**. `""` is the mount root (usually the app shell).
- Every table has two producers: annotations/code (derived) and YAML (authored). **Authored wins**,
  replacing the entry outright.
- A page with no `viewModel:` is complete: reads come from `sources.yaml`, writes from
  `actions:` with a `restAction` (run by the browser — no server round trip), navigation from a
  `RouteLink`. That is what makes a static bundle possible.

## File kinds (`type:` discriminates; the file name does not matter except where noted)

| File (conventional name) | `type:` | What it is | Reference |
|---|---|---|---|
| `app.ui.yaml` | `UI` | the mount: `basePath`, `home`, `routes: [routes.yaml]` | [mounts-and-routes.md](reference/mounts-and-routes.md) |
| `routes.yaml` | `Routes` | route table: `route`, `layout`, `viewModel`, `fixedParams`, `defaultParams`, `children`, `state`, `appState`, `data`, `appData`, `access` | [mounts-and-routes.md](reference/mounts-and-routes.md) |
| `app.yaml` | `AppShell` | title, variant, menu, header extras, shell flows (Java server and static bundle only) | [app-shell.md](reference/app-shell.md) |
| any page file | a component (`Listing`, `Form`, `VerticalLayout`…) or an envelope with `layout:` / `layoutDelta:` | one screen | [pages-and-components.md](reference/pages-and-components.md) |
| `sources.yaml` | `Sources` (optional) | REST source catalogue + `sample:` data | [sources.md](reference/sources.md) |
| `partials/<name>.yaml` | none (`content:` list) or one component | reusable piece, spliced where `type: Partial` names it | [partials.md](reference/partials.md) |
| `actions.yaml` | `Actions` | named client-runnable flows / REST calls | [other-kinds.md](reference/other-kinds.md) |
| `types.yaml` | `Types` | field-type vocabulary (`fieldType: OrderStatus`) | [other-kinds.md](reference/other-kinds.md) |
| `translations/<locale>.yaml` | `Translations` | `${i18n.key}` catalogue | [other-kinds.md](reference/other-kinds.md) |
| `environments/<name>.yaml` | `Environment` | per-environment source overrides | [other-kinds.md](reference/other-kinds.md) |
| `components.yaml` | none (`components:`) | business components, used by `type: ComponentRef` | [other-kinds.md](reference/other-kinds.md) |
| `project.yaml` | `Project` | `renderer: vaadin \| redwood` | [other-kinds.md](reference/other-kinds.md) |

Static bundles: [static-bundle.md](reference/static-bundle.md) · YAML + Java/C#/Python view
models: [mixing-with-code.md](reference/mixing-with-code.md) · A complete validated mount to copy
from: [examples/specs/ui/](examples/specs/ui/).

## Schema line — put it at the top of every file

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
```

`specs-schema.json` is the unified schema (a `oneOf` of every file kind above), so this one line
fits every file. It is the convention of the starters and demos (which often name the kind-specific
schema instead — keep whichever a file already has); the loaders ignore the key. `master` is the
latest API: when the project pins a release, validate against that tag instead
(`…/mateu/v3.0-beta.3/backend/shared/uidl/specs-schema.json`, via `MATEU_SPECS_SCHEMA` for the
validator script).
Kind-specific schemas exist beside it (`mount-schema.json`, `routes-schema.json`,
`sources-schema.json`, `uidl-schema.json` for a bare component page, `actions-schema.json`,
`types-schema.json`). Editors that only honour the comment form (VS Code's YAML extension without
the Mateu extension) take
`# yaml-language-server: $schema=<same url>` instead. The Mateu IntelliJ / VS Code extensions map
`specs/ui/**` to the schema automatically.

## Gotchas (each one has cost a real debugging session)

- **Unknown keys are silently ignored** — by the loader *and* by the schema (no
  `additionalProperties: false`). `titel: Orders` gives a page with no title and no error. Copy key
  names from the schema / these references, never guess.
- **An unreadable definition answers "Page not found."** (bad enum value, unknown `type:`, wrong
  shape). The server logs a `WARN … Could not read the definition specs/ui/x.yaml, line N (path):
  …`; run with `-Dmateu.dev=true` (or `MATEU_DEV=true`) and the page itself shows that reason, plus
  specs are re-read from `src/main/resources/specs/ui` on every change (live reload; development only — never in production).
- **`dataType` values**: `integer string number date time dateTime bool array file status money
  component menu range action actionGroup dateRange`. There is **no `decimal`, `boolean`,
  `double`, `text`**. Field look is `stereotype:` (`textarea`, `select`, `email`, `money`,
  `multiSelect`, `numberRange`, `richText`, …).
- **Order matters in routes.yaml**: put `orders/new` *before* `orders/:id`, or `new` is read as an
  id.
- **A layout shared by several routes must not declare `viewModel:`** (or the deprecated
  `modelView:`) — naming one means it can only ever serve that class; bind on the route entry.
- **`actions:` belongs to the page definition, beside the component (or beside `layout:`)**, never on
  the route. A `Button`'s `actionId` must name an action the page declares, an `actions.yaml`
  entry, or a method of the bound view model — otherwise nothing happens (and a static bundle with
  `staticOnly` refuses to build).
- **Navigation is a `RouteLink`, not an action**: `actionable: {type: RouteLink, route: orders/new}`.
- **`${...}` expressions** see only `state`, `data`, `appState`, `appData`, `component` (and `row`
  in `rowRoute`, `i18n` in texts, `secret` only on the server-side proxy). `${state.x ?? ''}`,
  `?.` and `encodeURIComponent(...)` work.
- **Secrets never go in the browser**: `${secret.KEY}` resolves only when the source has
  `proxy: true` (server-side; value from a `SecretsProvider` bean or env `MATEU_SECRET_KEY`).
  Proxying needs a server, so it is not available in a static bundle.
- **`sample:` is used only in sample mode** (visual editor; `-Dmateu.sources.mock=true` /
  `MATEU_SOURCES_MOCK=true` on a served app; `-Dmateu.bundle.mock=true` for a bundle). In sample
  mode writes "succeed" without persisting. Outside it the real endpoint is called.
- **App shell (`type: AppShell`) is Java-server and static-bundle only.** The .NET and Python
  servers serve YAML pages, routes, mounts, sources, actions, types, translations, partials and
  `layoutDelta:`, but the shell/menu must come from their app class (`[App]` / `@app`).
- **A home**: give the `type: UI` mount `home: <route>` (or the shell `homeRoute:`); otherwise the
  first navigable menu item is home.

## Workflow

1. Start from a generated project (`yaml` flavour = Spring Boot serving YAML; `static` = no
   backend) or copy [examples/specs/ui/](examples/specs/ui/). New page = new file + a
   `routes.yaml` entry + (usually) a menu entry in `app.yaml`.
2. **Validate against the schema** before running: copy
   [scripts/validate-specs.mjs](scripts/validate-specs.mjs) to a scratch dir, `npm i ajv@8 yaml`
   there, `node validate-specs.mjs <project>/src/main/resources/specs/ui`. It catches wrong enum
   values, wrong shapes and unknown component `type:`s — not misspelled keys.
3. **Run and probe each route** (served flavour): `mvn spring-boot:run`, then
   ```bash
   curl -s -X POST localhost:8080/mateu/v3/sync/orders -H 'Content-Type: application/json' \
     -d '{"route":"/orders","consumedRoute":"","actionId":"","componentState":{}}'
   ```
   `"type":"NotFound"` in the answer = the route or its definition did not resolve (read the
   message / WARN). Then open the page in a browser to see it render (the `mateu-run` skill
   screenshots it).
4. **Static flavour**: `mvn package` → `target/mateu-bundle/`; `staticOnly` fails the build naming
   any screen that still needs a server. Preview with `npx serve -s target/mateu-bundle`.

Docs: https://mateu.io/define/yaml/quickstart/ · https://mateu.io/concepts/routes-and-mounts/ ·
https://mateu.io/concepts/data-sources/ · https://mateu.io/deploy/static-ui/
