---
title: "Native Renderers"
description: "Run your Mateu application as a native desktop or mobile app, without a browser."
---

Mateu's API is not limited to web browsers. Because the renderer is decoupled from the backend, any client that speaks HTTP and understands the Mateu component tree can render a Mateu application natively.

Native renderers trade the browser's zero-install convenience for **better performance** and an OS-native feel — and, on the desktop, for a **docking/tabbed productivity workspace** the browser can't offer. (For when to prefer web vs. native, see [Web or native?](/design-systems/#web-or-native).)

Two native renderers are available out of the box:

- **[IntelliJ plugin](#desktop--intellij-plugin)** — desktop, rendered **inside IntelliJ IDEA** with the full IDE platform: tool windows, editor tabs, docking, Search Everywhere.
- **[React Native](#mobile--react-native)** — iOS & Android, built with Expo/TypeScript.

## Desktop — IntelliJ plugin

The IntelliJ plugin renders your Mateu backend **inside the IDE**, using the IntelliJ platform as the desktop shell. It targets power users who live in the IDE — internal tools, back-office operations, admin panels — and inherits, for free, the most battle-tested desktop workspace there is: dockable tool windows, split/floating editor tabs, keyboard-first navigation.

**IDE-native UX** — the plugin does not imitate a web page; each Mateu concept maps to the IDE's own idiom:

- The **app menu** appears as a widget on the IDE's **main toolbar** (like the Version Control widget) and as a navigator **tool window**; menu entries are also registered as IDE actions, so they show up in **Search Everywhere** (double Shift).
- **CRUD listings** open in the **bottom tool window** (like Find/Search results) with a native search field (history included), column speed search, and **row context menus**; row actions and inline editing follow the listing's wire flags (row-form dialogs with ◀▶ prev/next navigation when inline editing is off).
- **Details, forms and wizards** open as **editor tabs** — split them side by side, drag them out into floating windows, close them with the usual shortcuts. Tab titles track the view title; unsaved changes show the editor's **modified dot** and closing the tab asks before discarding (the standard `@ConfirmOnNavigationIfDirty` dirty guard, IDE-style).
- **Toolbars** render on the editor header and the tool-window title bar; Mateu keyboard shortcuts (`@Action(shortcut=…)`) are registered as **IDE shortcuts**; backend messages use IntelliJ's **native notifications**.
- A **focused mode** hides the IDE chrome that isn't yours (foreign tool windows, VCS/run widgets), leaving a clean business-app frame.

**Run it:**

```bash
cd frontend/app/intellij-plugin
./gradlew runIde        # launches an IDE with the plugin installed
```

Then open a project and reveal the **Mateu** tool window. See `frontend/app/intellij-plugin/README.md` for platform overrides and the `renderProbe` verification harness (render the captured wire JSON to a Swing tree + PNG without booting the IDE).

**Ship it as an installer** — one Gradle task bundles the plugin *with* the IDE:

```bash
./gradlew buildInstaller \
  -Pmateu.registryUrl=https://registry.example.com -Pmateu.appId=demo-admin-panel
```

This produces a portable `mateu-desktop-<version>-linux.tar.gz` (or `-Pinstaller.platform=windows`
for a `.zip`): IntelliJ IDEA Community with the Mateu plugin preinstalled, isolated `data/`
config (it never interferes with an IDE the user already has), first-boot prompts pre-answered,
and a `mateu.sh`/`mateu.bat` launcher that opens the bundled workspace directly — unpack and
double-click. The optional registry properties bake the [app registry](#app-registry-pointing-installables-at-their-backend)
coordinates into the launcher, which is how a production desktop installable gets its backend.

**Source:** `frontend/app/intellij-plugin/`

## Mobile — React Native

The React Native renderer runs your Mateu backend as a **native mobile application** on iOS and Android. It is built with [Expo](https://expo.dev) and TypeScript, and uses React Navigation for screen and drawer management.

**How it works:**

1. On startup, `App.tsx` resolves the backend (see the [app registry](#app-registry-pointing-installables-at-their-backend) below), calls `initialLoad('')` and receives the root component tree.
2. If the root component is of type `App`, `AppRenderer` builds the navigation structure — a Drawer for `NAVIGATION_LAYOUT`/`MENU_ON_LEFT` variants, a Bottom Tab navigator for `TABS`, or a simple Stack for `MEDIATOR`.
3. Each menu entry maps to a content screen that fetches its data on demand; detail navigations push screens onto a per-screen view stack with a back bar.
4. Pages, forms, CRUD tables, and individual fields are rendered as native React Native components (`TextInput`, `Switch`, `FlatList`, `TouchableOpacity`, etc.).
5. The dashboard/display components are supported too: `MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout` (rendered mobile-first as a single-column stack with the KPI band on top), `FoldoutLayout` (overview card + accordion of panels), `HeroSection`, `EmptyState`, `Skeleton`, and `Gantt` (horizontal-scrollable timeline with proportional bars, progress fill, and today marker).

**Key files:**

| File | Role |
|---|---|
| `App.tsx` | Entry point — registry boot gate, root load, toast/overlay/dirty-guard hosts |
| `src/api/MateuApiClient.ts` | HTTP client — calls `POST /mateu/v3/sync/{route}` |
| `src/core/AppRegistry.ts` | App registry client — installable → registry entry → backend config + version gate |
| `src/core/MateuViewController.ts` | Pure-TS increment pipeline for ONE view — fragments, commands, action bubbling, client-side validation, dirty tracking |
| `src/core/MateuSession.ts` | App-wide services — HTTP client, `appState`, event bus (`@SubscribeTo`), host hooks (toasts, overlays, confirm) |
| `src/renderer/MateuViewHost.tsx` | Hosts one view controller and re-renders on every increment |
| `src/renderer/AppRenderer.tsx` | Builds navigation structure from app metadata + the per-screen view stack |
| `src/renderer/PageRenderer.tsx` | Renders pages with header, toolbar, children, and buttons |
| `src/renderer/FormRenderer.tsx` | Renders forms with scrollable field list |
| `src/renderer/FormFieldRenderer.tsx` | Renders individual fields (text, boolean, date, options, grids, capture fields…) |
| `src/renderer/DateField.tsx` | Dependency-free calendar picker for `date`/`datetime` fields and date filters |
| `src/renderer/CrudRenderer.tsx` | Renders tables with search, filters panel, pagination, and row navigation |
| `src/renderer/ComponentRenderer.tsx` | Dispatcher — routes each component node to the right renderer |
| `src/renderer/LayoutRenderer.tsx` | Renders horizontal and vertical layouts |
| `src/renderer/DashboardRenderer.tsx` | Renders `MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout` |
| `src/renderer/DisplayRenderer.tsx` | Renders `FoldoutLayout`, `HeroSection`, `EmptyState`, `Skeleton`, `Gantt` |
| `src/api/metadata.ts` | TypeScript wire types for the dashboard/display component metadata |

**Source:** `frontend/app/react-native/`

### App registry: pointing installables at their backend

A native installable should not hardcode its backend URL — app-store releases are slow, and the
same renderer binary often serves several environments. Instead, the installable carries only
**two values**: a **registry URL** and an **app id**. A public registry maps the app id to
everything else, so retargeting a backend, changing launch parameters, or forcing an upgrade is
a registry edit — no republishing:

```json
// GET {registryUrl}/{appId}.json   (any static hosting works: S3, GitHub Pages, nginx…)
// or   {registryUrl} with an {appId} placeholder, for dynamic registries
{
  "appId": "demo-admin-panel",
  "baseUrl": "https://apps.example.com/admin",
  "parameters": { "tenantId": "1111" },
  "requiredRendererVersion": "1.2.0",
  "storeUrl": {
    "android": "https://play.google.com/store/apps/details?id=…",
    "ios": "https://apps.apple.com/app/id…"
  },
  "intellij": {
    "requiredPluginVersion": "0.2.0",
    "requiredIdeBuild": "243.0",
    "downloadUrl": "https://plugins.example.com/mateu-latest.zip"
  }
}
```

- **`baseUrl`** — the Mateu backend the renderer talks to from then on.
- **`parameters`** — seeded into the `appState` sent with every request (the server reads them
  via `HttpRequest`, like `@AppContext` values).
- **`requiredRendererVersion`** — minimum installable version able to run this app. When the
  installed renderer is older, the app shows a blocking **Update required** screen *before*
  touching the backend: it first tries an **over-the-air update** (real for EAS-built Expo
  installables via `expo-updates`; the app relaunches on the new bundle), and falls back to the
  platform **store link** (`storeUrl`) when no OTA update is available. A **Check again** button
  re-reads the registry, so lowering the requirement unblocks users without reinstalling.
- **`intellij`** — desktop requirements: `requiredPluginVersion` (minimum Mateu plugin version)
  and `requiredIdeBuild` (minimum IntelliJ build number, e.g. `243.0` = 2024.3). Each renderer
  reads its own block and ignores the others'.
- From there on, everything works as usual — the registry is only consulted at boot.

**React Native wiring** (`src/core/AppRegistry.ts` + the boot gate in `App.tsx`): the registry
coordinates live in the installable's `app.json` under `expo.extra` —

```json
"extra": { "mateuRegistryUrl": "https://registry.example.com", "mateuAppId": "demo-admin-panel" }
```

— or, during development, in the `EXPO_PUBLIC_MATEU_REGISTRY_URL` / `EXPO_PUBLIC_MATEU_APP_ID`
environment variables. With neither set, the renderer boots against its dev config (localhost /
the Expo dev-server host). A ready-to-copy entry lives in `registry-example/demo-admin-panel.json`;
to try the whole flow locally, serve that folder over HTTP (with CORS for web) and run:

```bash
EXPO_PUBLIC_MATEU_REGISTRY_URL=http://localhost:8765 \
EXPO_PUBLIC_MATEU_APP_ID=demo-admin-panel \
npx expo start --web
```

**IntelliJ plugin wiring** (`plugin/AppRegistry.kt` + the boot gate in `MateuProjectService`):
the coordinates live in the plugin's bundled `application.properties` (`mateu.registryUrl` +
`mateu.appId`; system properties override them, e.g. `./gradlew runIde -Dmateu.registryUrl=…`).
The gate resolves the entry off the EDT before the app boots; an unmet `intellij` requirement
replaces the navigator with an **Update required** panel whose *Update now* button runs the IDE's
own **Check for Updates** flow — the same one behind *Help ▸ Check for Updates*, which installs
both plugin and platform updates — and opens the entry's `downloadUrl` when one is provided;
*Check again* re-reads the registry. Registry errors show a Retry panel + an IDE notification.
Headless verification: `./gradlew -q registryProbe` (entry URL resolution, fetch/parse against a
throwaway local registry, version comparator, gate decisions).

### Building installables — APK, Play Store, App Store

Packaging and store submission go through **EAS**, preconfigured in the module (`eas.json` +
npm scripts; sign in once with `npx eas-cli login`):

```bash
cd frontend/app/react-native
npm run build:apk           # .apk for sideloading / QA (or build:apk:local with an Android SDK)
npm run build:android       # .aab for the Play Store
npm run build:ios           # .ipa for the App Store
npm run submit:android      # upload to the Play Store (service-account JSON, internal track)
npm run submit:ios          # upload to App Store Connect (API key)
```

Set the installable's [app-registry](#app-registry-pointing-installables-at-their-backend)
coordinates in the build profile's `env` block in `eas.json` — that is how a store build knows its
registry. EAS also hosts the **over-the-air updates** the registry's version gate triggers
(`expo-updates`; `runtimeVersion` is pinned to the app version so updates only reach compatible
installables).

### Running and testing the mobile renderer

All options assume a Mateu backend running locally (e.g. the demo at `http://localhost:8592` — the port is configured in `App.tsx`, `MATEU_BACKEND_PORT`). From your IDE (IntelliJ included) the commands below run fine from the integrated terminal, or as an **npm Run Configuration** (Run → Edit Configurations → `+` → npm → pick the module's `package.json` and the `web`/`start` script) so launching the renderer is one click.

**1. Browser with a phone viewport — fastest, zero install**

```bash
cd frontend/app/react-native
npm run web            # expo start --web
```

Open the printed URL in Chrome and turn on device mode (`F12` → phone icon, or `Ctrl+Shift+M`), then pick a device preset ("iPhone 14", "Pixel 7"…). You get the mobile viewport, touch events, and hot reload as you edit the renderer code. It is not a real phone (no native camera, system gestures, etc.), but for iterating on UI it is very faithful.

**2. Your real phone with Expo Go — the genuine experience, ~2 minutes**

Install the free **Expo Go** app (App Store / Play Store), put the phone on the same Wi-Fi as your machine, and:

```bash
cd frontend/app/react-native
npm start              # expo start — prints a QR code
```

Scan the QR with the camera (iOS) or from Expo Go (Android). The app opens on the phone with hot reload. The backend host is **derived automatically** from the Expo dev server the bundle was loaded from (`hostUri`), so as long as the backend runs on the same machine as `expo start`, no configuration is needed — just make sure your firewall allows ports **8081** (Metro) and your backend port (e.g. **8592**). If your network isolates Wi-Fi clients, `npx expo start --tunnel` routes around it (over the internet, slower).

**3. Android emulator / iOS simulator**

With Android Studio installed and an AVD created (Device Manager → any Pixel image), `npm run android` starts Expo and launches the app in the emulator. On macOS, `npm run ios` does the same with the iOS Simulator (requires Xcode). This is the heaviest option to set up, but gives you a full mobile OS in a window — useful for testing the real camera flow (Android emulator) or platform-specific behaviors.

## How the renderers relate to the Mateu API

All native renderers implement the same protocol as the web renderers:

```
POST /mateu/v3/sync/{route}
Body: { route, consumedRoute, actionId, serverSideType,
        initiatorComponentId, componentState, appState, parameters }
```

This means **the same Mateu backend serves web, desktop, and mobile clients simultaneously** with no code changes. You choose which renderer (or which combination) fits your deployment.

## Related

- [Design systems](/design-systems/) — web renderers based on different component libraries
- [Architecture](/mateu-about/architecture/) — how renderers connect to the Mateu API
- [Bring your own design system](/design-systems/bring-your-own-design-system/) — build a custom renderer
