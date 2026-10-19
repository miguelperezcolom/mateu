---
title: "Known issues"
description: "Current limitations of the 3.0 beta that an application can run into, each with its workaround."
---

This page lists the limitations of the current release that you can hit when building or running an
app, and what to do about each one. It covers behaviour, not missing features: the full list of
what each server and renderer supports is the [feature parity matrix](/reference/parity/).

An item leaves this page in the release that fixes it, and the [CHANGELOG](https://github.com/miguelperezcolom/mateu/blob/master/CHANGELOG.md)
says so. If you hit something that is not listed here, report it on
[GitHub issues](https://github.com/miguelperezcolom/mateu/issues). Security problems go through the
private channel in [SECURITY.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY.md),
never a public issue.

## Deployment

### A servlet context path or a prefix-stripping proxy is not supported

The generated index page loads the renderer's assets from `/assets/…` at the **root of the host**.
Behind `server.servlet.context-path` or a reverse proxy that strips a path prefix, the page loads
but the assets 404, so you get a blank screen.

**Workaround:** serve the app at the root of its host, or give the mount the public path you want
(`@UI("/admin")`) and route both `/admin/**` and `/assets/**` to the backend. Several Mateu apps
behind one host share `/assets/**`, so they must run the same Mateu release. See
[Deploy to production](/deploy/production-checklist/).

### Micronaut on JDK 21–23: virtual-thread pinning under load

On Java 21+ Micronaut runs the blocking executor that serves Mateu's action endpoints on virtual
threads. On JDK 21–23 a virtual thread that blocks inside `synchronized` (verbose logging and some
libraries do) pins its carrier thread, and a burst of requests can stall.

**Workaround:** run on JDK 24 or later, or set `micronaut.executors.blocking.virtual=false`. See
[Micronaut](/java-create-your-project/micronaut/).

### Helidon MP: streamed actions, MCP and YAML mounts see no principal

On Helidon MP, Mateu's streamed actions (`LongTask`), the MCP endpoint and YAML mounts run on
Helidon's own routing, which does not carry the JAX-RS `SecurityContext`. Without extra wiring they
see an anonymous caller, so `@EyesOnly` and YAML `access:` refuse them.

**Workaround:** register a `PrincipalResolver` bean that builds the caller from the request. See
[Security](/java-user-manual/advanced/security/).

### Proxies must not buffer server-sent events

Long-running actions stream their progress over server-sent events. A proxy that buffers the
response (nginx does by default) delivers it all at the end, or times out.

**Workaround:** disable buffering for the action endpoint (`proxy_buffering off;` in nginx) and raise
its read timeout above your longest task.

### Permissions in static bundles and in Play are cosmetic

`access:`, `eyesOnly`, `readOnlyUnless` and `disabledUnless` are enforced by the server on every
request. A static bundle has no server, and the visual editor's Play mode shows the page
unrestricted, so there they decide nothing.

**Workaround:** never rely on a static bundle to hide data: the API behind it must enforce access
itself. See [Permissions in YAML](/define/yaml/permissions/).

## Renderers

### Redwood: light theme only

The Redwood renderer has no dark mode. It ignores `@App(themeToggle = true)`, a stored dark choice
and the operating system's `prefers-color-scheme`.

**Workaround:** use the Vaadin renderer if your users need a dark theme.

### Redwood: federation does not know static remotes or remote custom elements

On Redwood, a federated menu (`RemoteMenu`) works against a remote that is a running Mateu backend.
A remote that is a **static bundle**, and a remote screen that uses its own **custom web
components**, are not loaded.

**Workaround:** serve the remote from a backend, or use the Vaadin renderer for that shell. See
[Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/).

### A remote screen's own scripts need CORS from the remote

When a shell embeds a screen from another Mateu backend, Mateu's CORS settings
(`mateu.cors.allowed-origins`) cover only its own endpoints (`…/mateu/**`). A script an `Element`
of the remote screen imports (`import: /x.js`) is a plain static file of the remote.

**Workaround:** open that path to the shell's origin on the remote (on Spring, a `CorsRegistry`
mapping). See [Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/).

### Multi-value fields do not read `optionsSource`

A single-select field takes its options from a REST source (`@RestOptions`, `optionsSource`). A
multi-value field (`multiSelect`, `listBox`, multi-select `combobox`) does not: it reads static
options or a remote `search-<field>` action.

**Workaround:** give the field an options supplier or a `@Lookup` search on your server, which can
call the external endpoint itself.

### React Native: saved views and column choices last one session

On React Native, saved listing views and the column chooser's show/hide choices are kept in memory
and reset when the app restarts; columns cannot be reordered there. The web renderers and IntelliJ
persist them.

**Workaround:** none yet. Server-side defaults (the listing's declared columns and filters) are what
a user sees after a restart.

### Touch and desktop adaptations

Some interactions have no direct equivalent on a device and are adapted rather than reproduced:
React Native has no hover (popovers and tooltips open on press / long-press), no row dragging (a
"Move to…" picker), no hardware keyboard shortcuts (app quick-launch codes only), and shows
`Workflow`, `FormEditor` and `Bpmn` read only. IntelliJ shows `Workflow` and `FormEditor` read only,
uses a file picker for photo capture and searches only the loaded options of a searchable picker.

**Workaround:** edit workflows and forms on the web. The full list is in the
[renderer coverage tables](/reference/parity/#renderers).

## .NET and Python servers

The .NET and Python servers emit the same wire as Java for the features they support. These Java
features are **not ported yet**; an app that needs them must be written in Java for now:

- the editable-view orchestrators — `EditableView`, `AutoEditableView`, `MasterDetailView` (a read
  view with an Edit button that flips to an editor and back). **Workaround:** a CRUD with
  `editInDrawer`, or a view whose action returns the editor;
- class-level `@AutoSave` (the archetypes that auto-save, such as `CollectionDetail`, do work);
- `@ViewToolbarButton` — a CRUD record's view page has the fixed Back / Add another / Edit toolbar;
- `type: AppShell` YAML definitions — author the shell in code (`AppShell` + `AppSupplier`);
- the static-bundle exporter (`mateu-bundle:bundle` is a Java build plugin);
- `Dialog` placement and `draggable`/`resizable`;
- `@MainFilter`, `@HiddenIn*` and `@Section(sticky, columns, style)`;
- Python only: a class-level `read_only_unless` — put it on each field.

Listing filters (ranges, multi-select) are applied in memory in both ports; override `find` to push
them to your database. The complete list is [What is still Java-only](/reference/parity/#what-is-still-java-only).

### .NET 8 leaves Microsoft support on 2026-11-10

The .NET packages target `net8.0` and `net10.0`. Microsoft ends support for .NET 8 on
10 November 2026; Mateu keeps the `net8.0` target for the 3.0 line, but security updates of the
runtime itself stop then.

**Workaround:** move the app to .NET 10 (LTS).

## Tooling

- **Spring Boot 3 is not supported.** The Spring adapters are built and tested against Spring
  Boot 4 only. Upgrade to Boot 4 (see [Prerequisites](/java-create-your-project/prerequisites/)).
- **The IntelliJ plugin supports IDE builds 2025.2 and 2025.3** (`252`–`253.*`). Newer IDE lines are
  enabled once the plugin verifier passes on them.
- **The Figma pipeline and the visual editor are previews**: they are not covered by the stability
  promise (see [Stability & versioning](/reference/stability-and-versioning/)).
