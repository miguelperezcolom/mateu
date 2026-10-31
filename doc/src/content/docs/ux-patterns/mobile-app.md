---
title: Mobile App (Open on Mobile)
description: One generic Mateu app for iOS and Android that renders any Mateu UI natively — UIs are added by scanning a QR code, like accounts in an authenticator app. The server side (the UI manifest and the "Open on mobile" button) ships today.
---

**Status:** 🧪 Experimental (`@Experimental`, mobile app 3.0 beta) — phase 1 (server + web) is
shipped; the app itself is on its way (see [Status](#status)).

## Intent

A Mateu UI already renders natively: the React Native renderer speaks the same `/mateu/v3/*` wire
as the web renderers. What is missing is a way to *get* a UI onto a phone without building and
publishing an app per UI. The answer is **one** generic app, "Mateu", in the App Store and Google
Play, to which users **add UIs by scanning a QR code** — exactly the way Google Authenticator adds
accounts.

| Google Authenticator | Mateu app |
|---|---|
| QR `otpauth://totp/Issuer:user?secret=…&issuer=…` | QR `https://mateu.io/add?u=<baseUrl>` (universal link) or `mateu://add?u=<baseUrl>` |
| an "account" = issuer + user + icon | a "UI" = name + base URL + icon (from the server's manifest) |
| local list, no Google account | local list, no "Mateu" account |
| add by QR or by typing the key | add by QR or by typing the URL |
| remove, reorder, search | the same — a row's **⋮** button or a **long press** opens its actions (move up/down, remove), and the pencil in the top bar shows them on every row — plus selecting which UI is open |
| "Transfer accounts" (export QR) | "Export my UIs" QR: the list of URLs only, never sessions or tokens |

Inside an open UI there is **one top bar**: the UI's own (its menu, its title) with the hub's
**⇄ switch UI** on the right; opening a record turns its menu button into a **back arrow**. A UI
without a menu (tabs, a single screen) shows the hub's bar instead. *My UIs* is at the top of the
UI's menu.

**The key difference:** an authenticator QR carries a *secret*; ours carries **none** — only the
URL. Credentials are entered at login (OIDC). A photographed or forwarded QR grants nothing: at
worst it adds an entry to someone's list.

:::tip[No app at all]
Every Mateu UI is also an installable **Progressive Web App**: a phone adds it to the home screen
from the browser, and desktop Chrome and Edge install it in its own window. Its web app manifest is
derived from the same members as the UI manifest below (the same settings and `@MobileApp`). See
[Install as a desktop or phone app](/deploy/install-as-app/).
:::

## The UI manifest

Every UI answers a small, public, cacheable description of itself:

```
GET <baseUrl>/mateu/v3/manifest
```

(`/mateu/v3/manifest` for a UI mounted at the root.) It is served by the five Java adapters (Spring
MVC, WebFlux, Micronaut, Quarkus, Helidon MP — for `@UI` classes and YAML mounts alike), by
ASP.NET Core and by FastAPI, with `Content-Type: application/json`,
`Cache-Control: public, max-age=300` and `X-Content-Type-Options: nosniff`.

```json
{
  "name": "Acme CRM",
  "shortName": "CRM",
  "icon": "/images/acme.svg",
  "themeColor": "#1f6feb",
  "wireVersion": "3.0",
  "minAppVersion": "1.0.0",
  "auth": {
    "type": "oidc",
    "issuer": "https://auth.acme.com/realms/acme",
    "clientId": "mateu-mobile",
    "scopes": ["openid", "profile"]
  }
}
```

A member with no value is **omitted**, never `null`. Name, icon and colour come from the app
itself, so a rename or a new icon reaches every phone without anybody re-scanning. An `icon` may be
relative: the app resolves it against the manifest's URL.

### Where each member comes from

Highest precedence first. A **setting** is, in Java, a JVM system property (`mateu.mobile.…`), a
key in the framework's configuration (`application.properties`, MicroProfile Config…) or the
matching environment variable (`MATEU_MOBILE_…`); in .NET and Python, the environment variable.
Settings win because the identity provider usually changes per environment while the code does not.

| Member | Setting (env var) | `@MobileApp` / `[MobileApp]` / `@mobile_app` | Fallback |
|---|---|---|---|
| `name` | `MATEU_MOBILE_NAME` (`mateu.mobile.name`) | `name` | the app's title (`@Title`; `[App("…")]`; `@app("…")`), else the humanized class name |
| `shortName` | `MATEU_MOBILE_SHORT_NAME` | `shortName` / `ShortName` / `short_name` | = `name` |
| `icon` | `MATEU_MOBILE_ICON` | `icon` | Java: the app's `@Logo`, else its `@FavIcon`; else omitted |
| `themeColor` | `MATEU_MOBILE_THEME_COLOR` | `themeColor` / `ThemeColor` / `theme_color` | Java: `@App(accentColor)`; else omitted |
| `wireVersion` | — | — | the server's wire version, the same value every response carries (`"3.0"`; servers before 3.0-alpha.426 sent `"3"` — the app compares the major only, so both are the same wire) |
| `minAppVersion` | `MATEU_MOBILE_MIN_APP_VERSION` | `minAppVersion` / `MinAppVersion` / `min_app_version` | `"1.0.0"` |
| `auth.issuer` | `MATEU_MOBILE_OIDC_ISSUER` | `oidcIssuer` / `OidcIssuer` / `oidc_issuer` | — |
| `auth.clientId` | `MATEU_MOBILE_OIDC_CLIENT_ID` | `oidcClientId` / `OidcClientId` / `oidc_client_id` | — |
| `auth.scopes` | `MATEU_MOBILE_OIDC_SCOPES` (comma and/or space separated) | `scopes` / `Scopes` / `scopes` | `["openid", "profile"]` |

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

`auth` is emitted only when **both** the issuer and the client id resolve; blank values count as
unset. The .NET and Python ports have no app logo, favicon or accent colour, so there `icon` and
`themeColor` come only from `MobileApp` or the environment.

```java
@UI("/crm")
@Title("Acme CRM")
@Logo("/images/acme.svg")
@App(mobileQr = true)
@MobileApp(shortName = "CRM", themeColor = "#1f6feb",
           oidcIssuer = "https://auth.acme.com/realms/acme", oidcClientId = "mateu-mobile")
public class AcmeCrm { }
```

```csharp
[App("Acme CRM", MobileQr = true)]
[MobileApp(ShortName = "CRM", Icon = "/images/acme.svg", ThemeColor = "#1f6feb",
           OidcIssuer = "https://auth.acme.com/realms/acme", OidcClientId = "mateu-mobile")]
public class AcmeCrm { }
```

```python
@app("Acme CRM", mobile_qr=True)
@mobile_app(short_name="CRM", icon="/images/acme.svg", theme_color="#1f6feb",
            oidc_issuer="https://auth.acme.com/realms/acme", oidc_client_id="mateu-mobile")
class AcmeCrm: ...
```

A YAML-only deployment (a `type: UI` mount) gets its name, icon and colour from its app shell and
the rest from the settings.

:::note[Settings are JVM properties or environment variables]
In Java the settings are read the way Mateu's other switches are (`MateuSettings`): a JVM system
property (`-Dmateu.mobile.oidc.issuer=…`) or the environment variable (`MATEU_MOBILE_OIDC_ISSUER`).
A key in Spring's `application.properties` or Quarkus' `application.properties` is **not** read —
set the environment variable in each environment's deployment instead.
:::

:::caution[Secured apps: let the manifest through]
The phone fetches the manifest **before** anyone has signed in. If your application protects every
path (Spring Security, Quarkus OIDC, an API gateway…), permit anonymous `GET` on
`<baseUrl>/mateu/v3/manifest` of each UI, e.g. `.requestMatchers(HttpMethod.GET, "/crm/mateu/v3/manifest").permitAll()`.
:::

## Open on mobile

`@App(mobileQr = true)` adds an **"Open on mobile"** button to the app header. The same switch is
`mobileQr: true` on a YAML [`type: AppShell`](/define/yaml/app-shell/),
`[App(MobileQr = true)]` in .NET and `@app(mobile_qr=True)` in Python; it travels as
`AppDto.mobileQr`. It is opt-in: without it nothing changes.

On a desktop the button opens a dialog with the **QR code** of the link to this app — at the screen
being shown — the link as copyable text and a short hint. On a phone (a narrow or touch-only
screen) there is nothing to scan, so it shows an **"Open in the Mateu app"** link instead.

The link is:

```
https://mateu.io/add?u=<url-encoded absolute base URL>[&r=<url-encoded route>]
```

- `u` is the page's origin plus the mount's base URL (`https://crm.acme.com/crm`).
- `r` is the current route relative to the mount (`/orders/42?tab=lines`), omitted on the home
  screen.
- The app also accepts the same query on `mateu://add?…`.

It is a universal link (iOS) / App Link (Android): the phone's camera opens the Mateu app when it
is installed, and otherwise lands on [mateu.io/add](/add/), which shows the target domain, the
store links and the QR again.

The QR is drawn in the browser by a small dependency-free encoder that ships with Mateu (no
third-party code, no network call): the Vaadin and Redwood renderers both have it, loaded only when
the dialog opens.

### Without "Open on mobile": the browser's own QR, or a page address

The app also adds a UI from the plain address of **any of its pages**: the QR a browser makes with
*Create QR code for this page* (Chrome, Edge), a link scanned with the app's own scanner, or an
address pasted in *Type an address*. Such an address does not say where the UI is mounted, so the
app asks for the manifest from the full path upwards (`/crm/orders/7`, `/crm/orders`, `/crm`, `/`) and
the first that answers a Mateu manifest, or a static bundle, is the UI. The rest of the path is the
screen it opens on. The confirmation shows the domain it found, as for any other add. No server
change is needed. In the app's **web build** the manifest (`/mateu/v3/manifest`, and a static
site's `manifest.json`) must allow cross-origin reads; the native app needs no CORS.

## Opening fast

A UI the app has opened before opens at once, even on a slow network. The fresh content follows
moments later:

- **Manifest.** The app opens the UI with the copy it kept and refreshes it in the background. The
  next open sees the new name, icon and version gate. Only a UI never opened before waits for its
  manifest.
- **Static bundle.** A static UI's `manifest.json`, often around 1 MB, is kept on the device with its
  `ETag`. It answers at once and is revalidated in the background with `If-None-Match`: a `304`
  costs a few bytes, and a new build replaces the copy for the next open. Serve that file
  **compressed**; with gzip, 1 MB of JSON is about 140 KB.
- **Last screens.** The app keeps the last 20 screens of each UI, 256 KB at most each, and shows
  one immediately when you open it again. The server's answer then replaces it. Only what is drawn
  is kept, never commands or messages, so nothing runs or pops up twice; a listing's search runs
  once, with the fresh answer. **A UI that signs in keeps no screens**: what a signed-in screen
  shows is not left on the device. Removing a UI from the list deletes all of this.
- **Icons** are kept on disk (`expo-image`).

Each step logs its duration as `[Mateu timing] <step>: <n> ms (cache | snapshot | network)`. They are
also kept in `globalThis.__mateuTimings`, to measure on a real phone.

## The desktop app

The desktop Mateu app (IntelliJ IDEA Community with the Mateu plugin, built by `buildInstaller` —
see [IDE tooling](/native/ide-tooling/)) has the same hub in its `hub` build: **My UIs**, with
search, open, reorder, remove, **Share…** (the QR code of one UI, to open it on a phone) and
**Export…** (one QR with the whole list). A `fixed` build is bound to one UI and has none of it,
like the phone's.

A UI is added by its address, by a Mateu link, or by its **QR code**. On a desktop the code is
usually on the screen rather than in front of a camera, so *Add a UI* reads it:

- **From the screen**: every monitor is captured and searched. On macOS this needs the *Screen
  Recording* permission for Mateu; without it the capture is only the wallpaper and the dialog says so.
- **From the clipboard**: an image copied with the system's screenshot shortcut, or a copied link.
- **From an image file**.

When several codes are found, the Mateu one wins. A page address (what a browser's own *QR code for
this page* holds) is looked up like on the phone: the manifest is asked from the full path upwards.

`mateu://` links open the desktop app too: the installer registers the scheme with the operating
system for the hub build (macOS, the Windows registry, a Linux `.desktop` file), and the link goes
through the same confirmation as a scanned code.

The rules are the phone's — the same link grammar, refusals and sentences, checked by both against
`conformance/client/hub-links.json` — with two differences: the desktop app opens only UIs served by
a Mateu backend (a static bundle is refused, with a sentence saying so), and it does not read
`minAppVersion`, which speaks of the phone app's versions. A different wire major is refused, as on
the phone. Each UI keeps its own sign-in (OIDC device flow against the issuer its manifest names;
tokens in the OS credential store, per base URL), and switching UI never carries one UI's token to
another.

## Security

- **No secrets in a QR**, nor in the "export my UIs" QR: only URLs. Tokens never leave the phone's
  secure store.
- **HTTPS only.** The app refuses plain-HTTP UIs (a development build can allow `localhost`).
- **Adding requires confirmation**, showing the **domain** prominently next to the manifest's name
  and icon. A QR can come from anyone; this is the phishing protection.
- **Mateu never validates tokens.** The app signs in with OIDC (Authorization Code + PKCE, in the
  system browser) against the issuer the manifest names, keeps one session per UI and sends
  `Authorization: Bearer` on every call. The *host application's* framework (Spring Security,
  Quarkus OIDC, ASP.NET authentication…) validates the token, exactly as for the web renderers; the
  manifest only tells the client which identity provider the host trusts.
- The manifest is public by design: it says what the UI is called and where to log in, nothing
  more. Keep anything sensitive out of `name` and `icon`.
- The wire and app versions are checked: a UI that needs a newer app shows "Update the app".

## Status

The plan has four phases (see `design/mobile-app-hub.md` in the repository):

1. **Server** — the manifest on every backend and "Open on mobile" on the Vaadin and Redwood
   renderers. **Shipped (experimental).**
2. **App MVP** — the list of UIs (add by URL or QR, remove, reorder), opening a UI, per-UI OIDC,
   universal links, the export QR. **Built (experimental)**, in internal builds until the store
   release.
3. **Store release** — listings, a reviewer demo, privacy labels.
4. **Enterprise** — managed configuration (MDM) with a pushed or locked list of UIs, signed QR codes,
   a domain allow-list; then push notifications through the
   [notification inbox](/ux-patterns/notification-inbox/).

Until the app is in the stores, the QR leads to the landing page, which says so.
