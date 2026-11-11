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

### Under a path prefix: no installable app, and some limits on Redwood and three adapters

A Mateu page follows a servlet context path or a trusted `X-Forwarded-Prefix`: its assets, its API
calls and the address bar all move under the prefix (see
[Deploy to production](/deploy/production-checklist/)). What still does not follow it:

- The **installable app** (PWA). Its manifest and service worker name the mount without the
  prefix, so the browser does not offer to install the app there.
- **Redwood with a mount that is not the root.** A route the server sends with the mount on it (a
  crud's `/products/new`) shows the mount twice in the address bar.
- **Micronaut, Quarkus and Helidon MP read only the proxy's header.** Their own context-path
  settings (`micronaut.server.context-path`, `quarkus.http.root-path`) are not applied to the page.

**Workaround:** for an installable app or a Redwood app, serve the UI at the root of its host or
give the mount the public path you want (`@UI("/admin")`). On Micronaut, Quarkus and Helidon MP,
strip the prefix in the proxy and send `X-Forwarded-Prefix`.

### Micronaut on JDK 21–23: virtual-thread pinning under load

On JDK 21–23 a virtual thread that blocks inside `synchronized` pins its carrier thread. Micronaut
runs Mateu's actions on virtual threads there, so a burst of requests can stall. This is a JVM
limitation. The adapter warns about it once at startup.

**Workaround:** run on JDK 24 or later, or set `micronaut.executors.blocking.virtual=false`. See
[Micronaut](/java-create-your-project/micronaut/).

### Long-running actions and proxy read timeouts

Streamed actions (server-sent events) send `X-Accel-Buffering: no` and
`Cache-Control: no-cache, no-transform`, so nginx's default buffering does not hold them. A proxy's
**read timeout** still applies: a task that sends nothing for longer than that is cut off.

**Workaround:** raise the read timeout for `…/mateu/v3/sse/` above your longest silent stretch. A
proxy that ignores `X-Accel-Buffering` also needs buffering turned off there
(`proxy_buffering off;` in nginx terms).

### Permissions in static bundles and in Play are cosmetic

`access:`, `eyesOnly`, `readOnlyUnless` and `disabledUnless` are enforced by the server on every
request. A static bundle has no server, and the visual editor's Play mode shows the page
unrestricted, so there they decide nothing.

**Workaround:** never rely on a static bundle to hide data: the API behind it must enforce access
itself. See [Permissions in YAML](/define/yaml/permissions/).

## Renderers

### Redwood: light theme only

By design, the Redwood renderer has no dark mode. It ignores `@App(themeToggle = true)`, a stored dark choice
and the operating system's `prefers-color-scheme`.

**Workaround:** use the Vaadin renderer if your users need a dark theme.

### Redwood: an island's `@Toc` index only when it is the page's content

Redwood draws a `@Toc` index for an embedded island's sections when the island **is** the page's
content: the host page has no titled section of its own and embeds that one island. A page that
mixes its own sections with an island's, or embeds two islands, indexes only its own sections.

**Workaround:** give the host page the sections, or open the island's screen on its own route when
it needs its index.

### React Native: no OS notification from a suspended or closed app

With `@App(osNotifications = true)` the phone app posts local notifications only: nothing leaves the
device, and there is no remote push in 3.0, by design. The OS suspends a backgrounded app soon after
it leaves the screen, so a task that ends after that, a live inbox push, or anything sent while the
app is closed produces no OS notification.

**Workaround:** the bell catches up as soon as the app is back in front, so keep what matters in the
inbox (`NotificationsSupplier`, or `InboxStore` for signed-in users). To alert a closed phone, send a
push from your own backend. See
[what reaches the device](/ux-patterns/notification-inbox/#on-a-phone-what-reaches-the-device-while-the-app-is-away).

### Keyboard shortcuts on phones and tablets, and a camera on the desktop

The React Native app answers `@Action(shortcut)`, `@Tab(shortcut)`, `@AppShortcut(key)` and an
`ActionPanel`'s shortcut only in its web build (react-native-web). On iOS and Android, a hardware
keyboard attached to the device does nothing: React Native gives an Expo app no key events (they are
an experimental Android flag, off by default, sent only to the focused view), so there is no key to
match. The access keys mode (`@App(accessKeys)`) is not offered there either.

The IntelliJ plugin takes a `@PhotoCapture` picture from a file, not from a webcam. No
permissively licensed webcam library for Java is pure Java: every one ships native binaries (and the
best known, webcam-capture, is unmaintained and has no Apple silicon build). On macOS a plugin also
cannot declare the camera permission the host app would need.

**Workaround:** on a phone, use the quick-launch codes in the drawer for app shortcuts and the
screen's own buttons and tabs. On the desktop, take the photo with the system camera app and pick
the file.

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
- **The phone and desktop apps do not offer `redirect` sign-in providers** (a login page of the host
  framework: Spring `oauth2Login` for GitHub/Facebook/X/Apple, SAML, form login), even when they list
  `mobile`/`desktop`: that login ends in a session cookie in the system browser, never a token the app
  can send. **Workaround:** declare the provider as `oidc` with a native client of its own (Google,
  Microsoft), or broker it through an OIDC IdP the apps sign in to (Keycloak, Auth0, Okta…) — see
  [Sign-in providers](/deploy/sign-in/).
- **Signing out in the desktop app does not end the provider's browser session**: the refresh token is
  revoked and deleted, but the provider's cookie in your browser stays, so the next sign-in may not
  ask for a password. **Workaround:** sign out at the provider's page too on a shared computer.
- **The Windows desktop installer is not code-signed**, so SmartScreen warns on its first run
  ("Windows protected your PC"). **Workaround:** check the download against the release page, then
  **More info ▸ Run anyway** — see [Installing on Windows](/native/desktop-app/#windows).
