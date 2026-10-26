---
title: "Install as a desktop or phone app"
description: "Every Mateu UI is an installable Progressive Web App: Chrome and Edge offer \"Install app\" on the desktop, phones add it to the home screen, and the shell opens offline. On by default, for served apps and static bundles alike."
---

Every Mateu UI is an installable **Progressive Web App** (PWA). There is nothing to write:

- On the **desktop**, Chrome and Edge show an **Install app** button in the address bar (and in the
  browser menu). The installed UI opens in **its own window**, with its own icon in the dock, the
  taskbar or the Start menu, and without the browser's tabs and toolbars.
- On a **phone**, Android browsers offer **Install app** / **Add to home screen**, and Safari on iOS
  has **Share → Add to Home Screen**. The UI then opens full screen from its icon.
- The installed app **opens offline**: the shell starts from a cache, so the user sees your app
  (and its "No connection" notice) instead of the browser's offline page.

It is the same project and the same deployment as the web UI, with the same URL: the user installs
it from the page. It works for every way a Mateu UI is served: the Java adapters (Spring MVC,
WebFlux, Quarkus, Micronaut, Helidon MP), .NET, Python, YAML mounts and
[static bundles](/deploy/static-ui/).

:::note[Which "app" do you need?]
A PWA is the zero-effort way to put a Mateu UI on a desktop or a phone. For a **native** phone UI
(native components, OpenID Connect sign-in in the system browser, one app for many UIs) use the
[Mateu mobile app](/ux-patterns/mobile-app/) or [your own branded app](/deploy/mobile-app-stores/).
For a tool shipped as a jar that the user double-clicks, see
[Standalone desktop app](/mateu-about/standalone-desktop/).
:::

## What Mateu adds

Every page Mateu serves carries, in its `<head>`:

```html
<link rel="manifest" href="/crm/mateu/v3/pwa/manifest.webmanifest" crossorigin="use-credentials">
<meta name="theme-color" content="#1f6feb">
<link rel="apple-touch-icon" href="/crm/mateu/v3/pwa/icon-192.png">
<script src="/crm/mateu/v3/pwa/register.js" data-sw="/crm/mateu/v3/pwa/sw.js?v=…" data-scope="/crm" defer></script>
```

and serves, under each UI's base URL:

| File | What it is |
| --- | --- |
| `<baseUrl>/mateu/v3/pwa/manifest.webmanifest` | The [web app manifest](https://developer.mozilla.org/docs/Web/Manifest): name, icons, colours, `display: standalone`, start URL and scope. |
| `<baseUrl>/mateu/v3/pwa/sw.js` | The service worker. Served with `Service-Worker-Allowed`, so it controls the whole UI. |
| `<baseUrl>/mateu/v3/pwa/register.js` | The script that registers it: an external file, so a `script-src 'self'` policy needs no hash. |
| `<baseUrl>/mateu/v3/pwa/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Mateu's default icons. |

Each UI is its own app: a UI at `/crm` and another at `/admin` install separately, each with its
own scope, cache and icon.

A static bundle carries the same files: `pwa/manifest.webmanifest`, `pwa/register.js` and the
icons, and the worker at the bundle's root, `mateu-sw.js`. A static host cannot send the header that
widens a worker's scope, so the worker sits at the root.

## Name, colour and icon

The manifest is derived from your app exactly like the
[mobile app's manifest](/ux-patterns/mobile-app/#the-ui-manifest). It is the same derivation, so a
rename reaches the installed app, the mobile app and the browser tab alike:

| Member | From (highest precedence first) |
| --- | --- |
| `name` | `mateu.mobile.name` › `@MobileApp(name)` › `@Title` / the app shell's `title` |
| `short_name` | `mateu.mobile.short-name` › `@MobileApp(shortName)` › the name |
| `theme_color` | `mateu.mobile.theme-color` › `@MobileApp(themeColor)` › `@App(accentColor)` / the shell's `accentColor`. Only a hex colour is kept. |
| icon | `mateu.mobile.icon` › `@MobileApp(icon)` › `@Logo` / the shell's `logo`, followed by Mateu's default icons |

```java
@UI("/crm")
@Title("Acme CRM")
@App(accentColor = "#1f6feb")
@MobileApp(shortName = "CRM", icon = "/images/acme-512.png")
public class Crm { /* … */ }
```

```yaml
# specs/ui/app.yaml
type: AppShell
title: Acme CRM
accentColor: "#1f6feb"
logo: /images/acme.svg
```

In .NET and Python, `[MobileApp(...)]` / `@mobile_app(...)` and the `MATEU_MOBILE_*` environment
variables set the same members (those ports have no logo or accent colour of their own).

**Icons.** Your icon comes first, declared with `sizes: any`; Mateu's own icons (192 and 512 px,
and a maskable one) always follow, so the app is installable even when you declare none, and the
browser falls back to them if it cannot use yours. For a crisp installed icon, declare a **square
PNG of at least 512 px, or an SVG**. The rules:

- accepted: an `https://` URL, a path on the UI's own origin (a relative one is taken from the
  origin's root), a `data:image/png|jpeg|webp|gif|svg+xml` URI;
- refused (the default icons are used): plain `http://`, other schemes, `.ico` files;
- the **favicon is never the app icon**: a 16–32 px image makes a blurred app icon. Declare the
  icon with `@MobileApp(icon)` (or `mateu.mobile.icon`) if your logo is not suitable.

iOS ignores the manifest's icons and SVGs: its home-screen icon is your PNG icon when you declare
one, else Mateu's.

## Offline and caching

The service worker is deliberately minimal, and **network first, always**:

- **Online, nothing changes.** Every request it handles goes to the network first, exactly as
  without it; the cache only answers when the network fails. A new deploy is never hidden behind a
  cached copy.
- **One cache per build.** The worker's URL carries a version (a hash of the page and the build), so
  the next deploy installs a new worker, which takes over at once and deletes the previous cache.
  There is no "close every tab to update" trap.
- **What it caches:** the shell page (served for every page of the UI when offline), the folders
  the page loads its own scripts and stylesheets from (the renderer's `/assets/`, Redwood's
  `/_redwood/`, Oracle's CDN), scripts, stylesheets and fonts, same-origin image files, and a static
  bundle's `manifest.json`.
- **What it never touches:** anything but `GET`; the Mateu API (`/mateu/…`), so no screen data is
  ever stored; and every other `fetch`/XHR, so the data of your [named REST
  sources](/concepts/data-sources/) — which may be personal or need a token — is never cached; a
  response marked `Cache-Control: no-store` is never stored either.

What the user sees offline depends on where the screens come from:

- A **static bundle** opens fully offline, screens included: the definitions travel in
  `manifest.json`. Data from REST sources still needs the network (the screen says so).
- A **served app** opens its shell offline and shows its "No connection" notice: its screens come
  from the server, which is not reachable.

:::caution[Spring Security and `no-store`]
Spring Security sends `Cache-Control: no-store` on every response by default, the renderer's files
included. The worker honours it, so such an app is still installable but does not open offline.
Let the static files be cached (for example `web.ignoring()` for `/assets/**`, or a
`headers().cacheControl()` rule that leaves them out) if you want the offline shell.
:::

## Turning it off

It is **on by default**. To turn it off:

| Where | How |
| --- | --- |
| Java (any adapter) | `mateu.pwa.enabled=false` — a JVM system property, `application.properties` / MicroProfile Config, or `MATEU_PWA_ENABLED=false` |
| .NET | `MateuOptions.Pwa = false`, or `MATEU_PWA_ENABLED=false` |
| Python | `MATEU_PWA_ENABLED=false` |
| Static bundle | `-Dmateu.bundle.pwa=false`, or `<pwa>false</pwa>` in the plugin's configuration |

Off, the page carries none of the above, and the worker's URL answers a worker that **unregisters
itself** and deletes its cache, so the browsers that installed it before let it go on their next
visit. It is also off in **development mode** (`mateu.dev=true`, and the bundle plugin's
[`mateu-bundle:dev`](/deploy/static-ui/#develop-with-live-reload) goal), where a cached shell would
only get in the way of live reload.

The worker is not registered inside a frame (the IDE editors' previews, a page that embeds a Mateu
UI) nor on an insecure origin (browsers only allow service workers on `https://` and `localhost`).

## Content Security Policy

Under a strict policy, also allow `manifest-src 'self'` and `worker-src 'self'`. The registration
script is a file on your own origin, so `script-src 'self'` covers it. See the
[production checklist](/deploy/production-checklist/#6-content-security-policy).

## Check it

In Chrome or Edge: DevTools → **Application** → **Manifest** (the installability section should
list no errors) and **Service workers** (the worker active and controlling the page). Then use
**Install app** in the address bar, and tick **Offline** in DevTools → Network and reload.
