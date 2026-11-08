---
title: "Import from Figma"
description: "One step from a Figma file designed with the Mateu library to specs/ui YAML pages and their routes — from Maven, IntelliJ or VS Code."
---

A Figma file composed with the Mateu component library (see [Figma design-to-code](/design-systems/figma/))
becomes YAML pages under your mount's `specs/ui` in **one step**: Mateu fetches the file through the
Figma REST API, converts every screen frame, writes the pages and registers each new one in
`routes.yaml`. There are three front doors and they behave the same way:

| Where | How |
|---|---|
| Maven | `mvn io.mateu:mateu-bundle-maven-plugin:figma -Dfigma.file=<url>` |
| IntelliJ | **Tools › Import from Figma…**, or **New › Mateu › Import from Figma…** on a folder |
| VS Code | **Mateu: Import from Figma…** (Command Palette, or right-click a folder) |

## Before you start

- **Node.js 20 or newer.** The conversion is the same converter the repository tests
  (`design/figma/to-yaml`), shipped inside the plugin and run with your `node` — Maven and the IDEs
  never re-implement it. Node is looked for on the `PATH` and in the usual install folders; point at
  another one with `-Dfigma.node=…` (Maven) or the `mateu.nodePath` setting (VS Code).
- **A Figma personal access token.** In Figma: *Settings › Security › Personal access tokens*,
  scope **File content: Read only** — that is all the import needs.

## Where the token comes from

The token is never written to your project, never logged and never passed on a command line (the
converter receives it in its environment).

| Front door | Looked for in |
|---|---|
| Maven | `FIGMA_TOKEN`, else `~/.mateu-secrets/figma-token`, else `~/.config/mateu/figma-token` |
| IntelliJ | the IDE's password store, else the same three; when none has one, it asks and offers to remember it in the password store (*Tools › Forget the Figma Token* removes it) |
| VS Code | VS Code's secret storage (the OS keychain), else the same three; when none has one, it asks and offers to save it (*Mateu: Forget the Figma Token* removes it) |

## Maven

```bash
mvn io.mateu:mateu-bundle-maven-plugin:figma \
    -Dfigma.file=https://www.figma.com/design/AbCdEf123456/My-App \
    -Dfigma.frames=orders,order-detail
```

It runs with or without a `pom.xml` in the current folder.

| Property | Default | What it does |
|---|---|---|
| `figma.file` | — | The file's URL (as copied from the browser, branch URLs included) or its key |
| `figma.json` | — | A payload already downloaded (`GET /v1/files/:key`) instead — no token, no network |
| `figma.frames` | every screen frame | Comma-separated frame names or slugs |
| `figma.out` | `src/main/resources/specs/ui` | The mount's `specs/ui` (or a folder under it) |
| `figma.dryRun` | `false` | Report what would be written and registered, write nothing |
| `figma.force` | `false` | Also overwrite pages that were not generated from Figma |
| `figma.routes` | `true` | Register the new pages in `routes.yaml` |
| `figma.node` | `node` on the `PATH` | The Node.js executable |

The log lists every file (`created`, `updated`, `unchanged` or `skipped`), the converter's warnings
as it wrote them, and a summary line.

## What it writes

- **One page per screen frame**, named after the frame (`Order detail` → `order-detail.yaml`), plus
  `partials/<ref>.yaml` for every `partial:<ref>` frame the selected screens use. Each file starts
  with a *Generated from the Figma frame…* header.
- **A re-import updates those files in place** and leaves the unchanged ones alone. A file at the
  same path that does **not** carry the header — one you wrote by hand — is skipped with a warning
  (`figma.force` / the dialog's *Overwrite* option overwrites it).
- **The converter's warnings** (an instance that is not a Mateu component, a `#config` key the
  component does not have…) are shown as they come: they name the frame and node to fix in Figma.

## How the routes are registered

Each new page gets an entry in the mount's routes file — `routes.yaml` when there is one, else the
only (or first) `type: Routes` file under `specs/ui`; when there is none, `routes.yaml` is created:

```yaml
  - route: order-detail
    layout: order-detail.yaml
```

The route is the page's path without `.yaml` (a page written to `specs/ui/sales/` answers
`sales/order-detail`). It is a **minimal text append** — your comments and formatting are never
rewritten — at the end of the `routes:` list, or right **before a marker line** when the file has one:

```yaml
type: Routes
routes:
  - route: ""
    layout: app.yaml
  # __ROUTES__        ← imported pages are added above this line
  - route: orders/:id
    layout: order.yaml
```

A route that is already declared is left alone, so importing again never duplicates one. Partials
and an app shell frame get no route. Parameterised routes (`orders/:id`), view models and
`data:` sources are yours to add afterwards (*Add Route…* or by hand).

## Next steps

- Open the pages in the [visual editor](/define/yaml/visual-editor/) and run the app — see the
  [YAML quickstart](/define/yaml/quickstart/).
- [Figma design-to-code](/design-systems/figma/) explains the library, the slot and `#config`
  conventions the converter reads.
