---
title: "Project settings (project.yaml)"
description: "Choose the renderer once for the whole project — the visual editor, Play, the static bundle and the IDEs follow it."
---

A project picks its renderer **once**, in a small descriptor next to its other `specs/ui` files:

```yaml
# src/main/resources/specs/ui/project.yaml
type: Project
renderer: redwood   # vaadin | redwood
```

| Key | Values | Default |
|---|---|---|
| `type` | `Project` (required — it is how the file is recognised) | — |
| `renderer` | `vaadin` (served by `io.mateu:vaadin-lit`) or `redwood` (served by `io.mateu:redwood`) | `vaadin` |

There is one per project. It conventionally lives at `specs/ui/project.yaml`, and any file under
`specs/ui/` with `type: Project` is found too. A project without one uses the defaults, so it
renders with Vaadin. The file is covered by the generated authoring schema (`specs-schema.json`,
the `type: Project` branch), so editors complete and validate it.

## Who reads it

Before this file existed, three unrelated places each decided the renderer. A served app's Maven
dependency decided it on the server. The visual editor had a switch for each session, and Play and
the static bundle always used Vaadin. They now read the project's choice:

| Where | What it does with `renderer` |
|---|---|
| **Visual editor** | The canvas opens in the project's renderer. The toolbar switch still lets you *peek* at another renderer for the session. The peek is labelled **preview — project: …** and never changes the file. Opening `project.yaml` itself shows a small settings form. See [the visual editor](/java-ui-definition/visual-editor#the-projects-renderer). |
| **Play** | Plays the mount in the project's renderer. With Redwood, the whole mount runs in the real Redwood app, including the menu, routes and Play's back/forward. |
| **Static bundle** | `mateu-bundle:bundle` ships the project's renderer, and the editor's **Export** writes a manifest that renderer can read. See [static UI](/java-user-manual/build/static-ui#choosing-the-renderer). |
| **IDEs** | IntelliJ (**Settings → Tools → Mateu**) and VS Code (the `mateu.renderer` setting, or **Mateu: Project Settings…**) have a project-level renderer selector. The selector reads and writes this file, and the file is the source of truth. See [IDE tooling](/native/ide-tooling#the-projects-renderer-projectyaml). |

## A served app: the dependency decides, the server warns

The renderer a **served** app shows is still decided by the renderer jar on its classpath. With
`io.mateu:vaadin-lit` it serves Vaadin, and with `io.mateu:redwood` it serves Redwood. `project.yaml`
does not switch it. If the two disagree, the app your users get is not the one you designed in the
editor. The server therefore logs one warning at startup:

```text
WARN  ProjectRendererCheck -- The project descriptor (specs/ui/project.yaml) says renderer: redwood,
but this server serves vaadin (io.mateu:vaadin-lit is on the classpath). … Depend on
io.mateu:redwood instead of io.mateu:vaadin-lit, or set renderer: vaadin in the descriptor.
```

The warning is never a failure. A team may serve Vaadin while it tries Redwood out in the editor.
Nothing is logged when there is no descriptor, or when the server is headless (no renderer jar on
the classpath, for an API behind a separately deployed frontend). The C# and Python servers do not
serve a renderer bundle, so the check does not apply to them.

To switch a served app, change the dependency **and** the descriptor together:

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>redwood</artifactId>   <!-- was: vaadin-lit -->
  <version>${mateu.version}</version>
</dependency>
```

## See also

- [Route registry](/java-ui-definition/route-registry) and [REST source catalogue](/java-ui-definition/rest-source-catalogue), the other `specs/ui` kinds.
- [Authoring with the visual editor](/java-ui-definition/visual-editor).
- [Static UI](/java-user-manual/build/static-ui).
