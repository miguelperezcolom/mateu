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

### Accessibility gaps against WCAG 2.2 AA

The Redwood renderer still has no keyboard or single-pointer alternative for the planning board and
drop zones and does not keep the focused control clear of pinned regions; on the web, dropping rows
on a drop zone without dragging needs row selection on the listing; and the 2026-11 fixes are
verified by component tests, not with assistive technology. The full list, per renderer, is in the [accessibility conformance report](/quality/accessibility-conformance/#known-gaps-in-one-list).

**Workaround:** most have an author-side mitigation listed there (an action beside a drag-only
board, no auto-dismissing banners for content users must read).

### Right-to-left languages are not supported

No renderer mirrors its layout for Arabic, Hebrew, Persian or Urdu: nothing sets `dir="rtl"`, and an
RTL language gets Mateu's own words in English. The chrome speaks English, Spanish, French, German,
Portuguese and Italian. What it would take is described in
[Right-to-left languages](/java-user-manual/advanced/i18n/#right-to-left-languages).

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

### React Native: push to a closed phone needs your FCM and APNs credentials

A suspended or closed Mateu app is reached by a remote push
([Push notifications to phones](/deploy/push-notifications/)). The phone gets its push token
through Google's FCM and Apple's APNs, and those credentials belong to the owner of the store
accounts: a Firebase `google-services.json` with its FCM V1 key, and an APNs key. A build without
them works, but gets no token, so it shows only the notifications the app posts itself while it is
still running. The same applies to the published Mateu app until a store build that carries the
credentials is released: an over-the-air update cannot add them.

A push only goes out for an `inbox` message to a signed-in user, or for `PushNotifications.send`. A
task that ends, or a `LiveNotifications` change, while the app is away produces no push of its own.

**Workaround:** add the credentials as described in
[Publishing › Push notifications](/deploy/mobile-app-stores/#push-notifications-fcm-and-apns-credentials).
Until then the bell catches up as soon as the app is back in front, so keep what matters in the
inbox.

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

- **Spring Boot 3 is not supported, by decision**: the 3.x line has had no open-source support
  since 30 June 2026 (Spring recommends 4.0.x or 4.1.x), so the Spring adapters are built and tested
  against Spring Boot 4 only. Upgrade to Boot 4 (why, and how: [Prerequisites](/java-create-your-project/prerequisites/)).
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
