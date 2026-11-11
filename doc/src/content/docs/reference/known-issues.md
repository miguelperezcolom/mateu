---
title: "Known issues"
description: "Current limitations of Mateu 3.0 that an application can run into, each with its workaround."
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

### Helidon MP: an app that authenticates only in JAX-RS

On Helidon MP, Mateu's streamed actions (`LongTask`), the MCP endpoint, YAML mounts and the client
log run on Helidon's own routing, ahead of Jersey. With **helidon-security** they see its principal,
roles and scope grants included, and an app that requires a login
(`mateu.helidon.authentication-required`) answers an anonymous caller 401 on the MCP endpoint and
the YAML mounts. Two cases are still limited:

- An app that authenticates only in JAX-RS — MicroProfile JWT, or a JAX-RS `ContainerRequestFilter`,
  without helidon-security — is not seen on the MCP endpoint and the YAML mounts: they get an
  anonymous caller, so `@EyesOnly` and YAML `access:` refuse it.
- A streamed action whose request carries credentials that only JAX-RS reads is handed to Jersey,
  which authenticates it but buffers the stream: the progress arrives at the end, all at once.

**Workaround:** use helidon-security for authentication, or register a `PrincipalResolver` bean that
builds the caller from the request. See [Security](/java-user-manual/advanced/security/).

### Micronaut and Quarkus are stricter than the JSON-body rule

Mateu's endpoints accept a body declared `application/json` or any `application/*+json`
(everything else answers 415). Two frameworks narrow that further before Mateu sees the request:
Micronaut's sync, SSE and YAML-mount endpoints accept only `application/json` (a
`application/vnd.x+json` body answers 415 there, while `/mateu/mcp` and every other adapter take
it), and Quarkus REST refuses `application/json ;charset=UTF-8` with a space before the `;`.

**Workaround:** send exactly `Content-Type: application/json` (with or without `; charset=…`) — what
every Mateu renderer, native app and the sidecar send.

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

### Redwood: a static remote that ships raw definitions is not loaded

On Redwood, a federated menu (`RemoteMenu`) works against a remote that is a running Mateu backend,
deep links and reloads of its screens included. A remote that is a **`specsOnly` static bundle**
(raw YAML definitions, expanded in the browser) is shown disabled: Redwood has no client-side
expander.

**Workaround:** serve the remote from a backend, or use the Vaadin renderer for that shell. See
[Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/).

### Redwood: inside an embedded island, no `@Toc` index and no app state sent back

An island (an embedded view or a `MicroFrontend` drawn inside a page) is laid out by Redwood as part
of its host, and two things of a standalone page do not carry over:

- a `@Toc` on the island's view draws no index (the island's sections are not page sections);
- `appState` an island's answer carries is shown (`${appState.x}`), but it is not sent back with
  later requests.

**Workaround:** open the screen on its own route when it needs its index, and keep cross-request
state in the component state instead of `appState`.

### A remote screen's own scripts need CORS from the remote

When a shell embeds a screen from another Mateu backend, Mateu's CORS settings
(`mateu.cors.allowed-origins`) cover only its own endpoints (`…/mateu/**`). A script an `Element`
of the remote screen imports (`import: /x.js`) is a plain static file of the remote.

**Workaround:** open that path to the shell's origin on the remote (on Spring, a `CorsRegistry`
mapping). See [Using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/).

### React Native: no OS notification from a suspended or closed app

With `@App(osNotifications = true)` the phone app posts local notifications only: nothing leaves the
device, and there is no remote push in 3.0, by design. The OS suspends a backgrounded app soon after
it leaves the screen, so a task that ends after that, a live inbox push, or anything sent while the
app is closed produces no OS notification.

**Workaround:** the bell catches up as soon as the app is back in front, so keep what matters in the
inbox (`NotificationsSupplier`, or `InboxStore` for signed-in users). To alert a closed phone, send a
push from your own backend. See
[what reaches the device](/ux-patterns/notification-inbox/#on-a-phone-what-reaches-the-device-while-the-app-is-away).

### Touch and desktop adaptations

Some interactions have no direct equivalent on a device and are adapted rather than reproduced:
React Native has no hover (popovers and tooltips open on press / long-press), no row dragging (a
"Move to…" picker), no hardware keyboard shortcuts (app quick-launch codes only), and shows
`Workflow`, `FormEditor` and `Bpmn` read only. IntelliJ shows `Workflow` and `FormEditor` read only,
uses a file picker for photo capture and searches only the loaded options of a searchable picker.

On a phone the React Native app also lays a few things out for the screen size:

- a `Drawer` is a bottom sheet whatever its position (`size` sets its starting height,
  `maximizable` takes it to full height, `modeless` keeps the screen behind usable);
- a horizontal `SplitLayout` stacks its panes, with no drag handle;
- the `@Toc` index is a row of section chips above the page, which stays on screen, instead of a
  sticky side index, and `@Section(sticky = true)` cards are not pinned (a pinned card would cover
  most of the screen; the index lists them first);
- labels stay above the fields (`labelsAside` is not applied: an outlined field carries its label
  in its outline);
- a `masterDetail` listing shows the pressed row's detail under it;
- a row (`HorizontalLayout`) wraps rather than running off the screen;
- `@FileUpload` offers the photo library on a device (any file in the web build); an `accept`
  list with no image or video type says so instead of offering a picker.

**Workaround:** edit workflows and forms on the web. The full list is in the
[renderer coverage tables](/reference/parity/#renderers).

## .NET and Python servers

In 3.0 the .NET and Python servers are **supported with documented gaps**
([what that means](/reference/support-policy/#how-mature-each-part-is-in-30)). They emit the same
wire as Java for the features they support, held to the conformance corpus with empty
allow-lists. The gaps documented before 3.0 GA — the static-bundle exporter, `@App(backLink)`, a
YAML definition's `actions:`, `HeroSearch` with a separate filters type, `@Inline` nested forms, .NET
length/pattern validation, the fluent listing's grid options, page breadcrumbs and the rest — are
closed ([what the ports closed](/reference/parity/#what-the-ports-closed-for-30-ga)). What a port
still cannot declare is listed in [What is still Java-only](/reference/parity/#what-is-still-java-only);
the port idioms (the same screen reached another way) are in
[Port idioms](/reference/parity/#port-idioms-same-wire-different-declaration).

Listing filters (ranges, multi-select) are applied in memory in both ports by default; override
`find` (it receives the typed criteria) to push them to your database.

## Tooling

- **Spring Boot 3 is not supported.** The Spring adapters are built and tested against Spring
  Boot 4 only. Upgrade to Boot 4 (see [Prerequisites](/java-create-your-project/prerequisites/)).
- **The IntelliJ plugin supports IntelliJ IDEA 2025.2 and later** (build `252` on, no upper bound).
  Each build is checked by the JetBrains plugin verifier against 2025.2, 2025.3, 2026.1, 2026.2 and
  2026.3; a later line installs, and joins that list once it ships.
- **The desktop app is built on IntelliJ IDEA Open Source 2026.3.** Apps installed from 3.0-beta.53
  or earlier (on IntelliJ IDEA Community 2025.2) ask to be reinstalled once, and cannot update in
  place. Settings and the list of UIs are kept. See [Updates](/native/desktop-app/#updates).
- **On Linux and Windows the IDE launcher files inside the desktop app's folder keep IntelliJ's
  names** (`bin/idea.sh`, `bin/idea64.exe`): the launchers you open (`mateu.sh` / `mateu.bat`, the
  shortcuts, the `.desktop` entry) carry Mateu's name, start without IntelliJ's splash screen, and
  Help ▸ About names the app. Opening a `mateu://` link on Windows while the app is closed still
  shows IntelliJ's splash.
- **The Figma pipeline, the visual editor and the VS Code extension are previews**: they are not
  covered by the stability promise (see
  [How mature each part is](/reference/support-policy/#how-mature-each-part-is-in-30)).
- **The Windows desktop installer is not code-signed**, so SmartScreen warns on its first run
  ("Windows protected your PC"). **Workaround:** check the download against the release page, then
  **More info ▸ Run anyway** — see [Installing on Windows](/native/desktop-app/#windows).
