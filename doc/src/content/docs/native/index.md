---
title: "Native Renderers"
description: "Run your Mateu application as a native desktop or mobile app, without a browser."
---

Mateu's API is not limited to web browsers. Because the renderer is decoupled from the backend, any client that speaks HTTP and understands the Mateu component tree can render a Mateu application natively.

Native renderers trade the browser's zero-install convenience for **better performance** and an OS-native feel — and, on the desktop, for a **docking/tabbed productivity workspace** the browser can't offer. (For when to prefer web vs. native, see [Web or native?](/design-systems/#web-or-native).)

Three native renderers are available out of the box:

- **[JavaFX](#desktop--javafx)** — a desktop power-user workspace (tabs + docking).
- **[React Native](#mobile--react-native)** — iOS & Android, built with Expo/TypeScript.
- **[Compose Multiplatform](#desktop--mobile--compose-multiplatform)** — **one Kotlin codebase that runs on desktop, iOS and Android** (and, soon, web).

## Desktop — JavaFX

The JavaFX renderer runs your Mateu backend as a **native desktop application** on Windows, macOS, and Linux. No browser is required. The UI is rendered using JavaFX controls and layouts, giving you a native look and feel on each operating system.

### Why a native desktop app: productivity

The desktop renderer exists for one reason: **power-user productivity**. Browser tabs are isolated and heavyweight; a native desktop shell can give operational users — the people who live in the app all day (check-in desks, back-office, control rooms) — a workspace tuned for speed:

- **Tabs** — every menu entry opens in its own tab, each with its **own independent navigation state** (route, form data, CRUD page/filters). Users keep several screens open at once and switch instantly, instead of losing context on every navigation.
- **Docking** — tabs can be **detached into floating windows** and **docked side by side** (drag a tab to an edge to split the area). A user can put a reservations list next to the detail they're editing, or spread work across multiple monitors — a layout a single browser tab can't offer.
- **Collapsible menu + hamburger** — the left menu starts with submenus collapsed and can be hidden entirely, maximizing screen space for the actual work.

All of this is **free for the application developer**: you write the same `@UI` classes, and the desktop shell adds the windowing productivity layer on top of the exact same backend.

### The docking workspace

The desktop renderer turns the content area into a dockable, multi-document workspace built on a `DetachableTabPane` (TiwulFX-Dock). Everything below works out of the box — there is nothing to configure in your `@UI` classes.

![The JavaFX desktop renderer showing two docked panes side by side: a Reservation detail (with its own "Reservations / Wizard 1" tabs) on the left and a Products CRUD listing on the right, plus the collapsible left menu.](/images/docs/native/desktop-docking.png)

**Tabs**

- Clicking a menu item **opens a new tab**, or re-activates it if that screen is already open.
- Each tab carries its **own navigation state** — navigating inside one tab (opening a CRUD detail, paging a list, editing a form) changes only that tab; the others are untouched.
- Tab titles **track the current view** (its page title, truncated), with the full title shown on hover.
- **Ctrl/Cmd + W** closes the active tab. When no tab is open, the area shows a hint to pick a screen from the menu.

**Docking (drag & drop)**

- **Reorder** — drag a tab within its tab strip.
- **Split / dock** — drag a tab onto an edge of a pane to split the area and place the two views **side by side** (e.g. a list next to the detail you're editing).
- **Detach** — drop a tab outside the window to pop it into a **floating window**, which inherits the app stylesheet and can be moved to another monitor.
- **Dock back** — drag a floating tab back onto any pane to re-dock it. Floating windows **close automatically** once their last tab is removed. All panes share a single dock scope, so any tab can dock into any pane.

**Persistence**

- The set of open tabs (and which one is selected) is **saved on change and restored on the next launch**, keyed by backend URL — reopening the app brings back the same workspace. (Split/floating arrangements are not restored; tabs reopen in the main pane.)

**Navigation chrome**

- Submenu groups in the left menu are **collapsed by default** and expand on click.
- A **hamburger** button shows/hides the whole sidebar to maximize working space.

**How it works:**

1. The app starts, makes an initial HTTP call to `POST /mateu/v3/sync/_no_route`, and receives the application metadata (title, menu, home route, variant).
2. Based on the `variant` field (`NAVIGATION_LAYOUT`, `MENU_ON_LEFT`, `TABS`, `MEDIATOR`), it builds a JavaFX window: a shared shell (header + collapsible menu) around a central dockable tab area.
3. Each menu entry opens a tab backed by its own navigation context. Subsequent calls within that tab fetch pages, forms, and CRUD listings, rendered as native JavaFX controls (`TextField`, `ComboBox`, `TableView`, `DatePicker`, etc.).

**Architecture — shared shell vs. per-tab state:**

State is split so that tabs are truly independent:

- **`AppShell`** (one per app) holds the shared services and the dockable tab container: the HTTP client, the global `appState`, the JavaFX stage, and the `DetachableTabPane`.
- **`AppContext`** (one per tab) holds that view's navigation state: current route, `serverSideType`, component state, the component/action registry, CRUD orchestrator context, and inline validation.

**Key classes:**

| Class | Role |
|---|---|
| `MateuApp` | Entry point — launches the JavaFX stage |
| `MateuApiClient` | HTTP client — calls `POST /mateu/v3/sync/{route}` |
| `AppShell` | App-wide shared state + the dockable `DetachableTabPane`; opens/activates tabs and saves/restores the open-tabs workspace |
| `AppContext` | Per-tab navigation state, action dispatch/bubbling, and client-side validation |
| `AppRenderer` | Builds the window: header, collapsible menu, and the dockable tab area |
| `PageRenderer` | Renders pages with header, toolbar, children, and bottom buttons |
| `FormRenderer` | Renders forms with a grid of fields |
| `FormFieldRenderer` | Renders individual fields (`text`, `boolean`, `date`, `options`, etc.) and inline validation errors |
| `CrudRenderer` | Renders tables with search, pagination, status badges, link columns, and row actions |
| `ContainerRenderer` | Renders sections, cards, tabs, accordion, split layout, badges, dialogs |
| `DashboardRenderer` | Renders `MetricCard` KPI tiles, the `Scoreboard` band, `DashboardPanel` tiles and the `DashboardLayout` grid |
| `FoldoutRenderer` | Renders `FoldoutLayout` — overview panel + lateral fold-out panels (click a strip to unfold; local UI state) |
| `DisplayRenderer` | Renders `HeroSection` headers, `EmptyState` placeholders, `Skeleton` loading blocks and the `Gantt` timeline |
| `ComponentRenderer` | Dispatcher — routes each component node to the right renderer |

The desktop renderer also covers the UX-pattern components (`MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout`, `FoldoutLayout`, `HeroSection`, `EmptyState`, `Skeleton`, `Gantt`), so dashboards, foldout record pages, hero/welcome pages and Gantt timelines defined with the archetypes render natively on the desktop too. `MetricCard` and `EmptyState` actions dispatch through the same mechanism as buttons.

**Dependencies:** JavaFX 21 + [TiwulFX-Dock](https://github.com/panemu/tiwulfx-dock) (`com.panemu:tiwulfx-dock`) for the detachable/dockable tabs.

**Source:** `frontend/app/javafx/`

## Mobile — React Native

The React Native renderer runs your Mateu backend as a **native mobile application** on iOS and Android. It is built with [Expo](https://expo.dev) and TypeScript, and uses React Navigation for screen and drawer management.

**How it works:**

1. On startup, `App.tsx` calls `initialLoad('')` and receives the root component tree.
2. If the root component is of type `App`, `AppRenderer` builds the navigation structure — a Drawer for `NAVIGATION_LAYOUT`/`MENU_ON_LEFT` variants, a Bottom Tab navigator for `TABS`, or a simple Stack for `MEDIATOR`.
3. Each menu entry maps to a content screen that fetches its data on demand.
4. Pages, forms, CRUD tables, and individual fields are rendered as native React Native components (`TextInput`, `Switch`, `FlatList`, `TouchableOpacity`, etc.).
5. The dashboard/display components are supported too: `MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout` (rendered mobile-first as a single-column stack with the KPI band on top), `FoldoutLayout` (overview card + accordion of panels), `HeroSection`, `EmptyState`, `Skeleton`, and `Gantt` (horizontal-scrollable timeline with proportional bars, progress fill, and today marker).

**Key files:**

| File | Role |
|---|---|
| `App.tsx` | Entry point — initial load and root component dispatch |
| `src/api/MateuApiClient.ts` | HTTP client — calls `POST /mateu/v3/sync/{route}` |
| `src/context/AppContext.tsx` | React context — holds `navigate()`, `runAction()`, and app state |
| `src/renderer/AppRenderer.tsx` | Builds navigation structure from app metadata |
| `src/renderer/PageRenderer.tsx` | Renders pages with header, toolbar, children, and buttons |
| `src/renderer/FormRenderer.tsx` | Renders forms with scrollable field list |
| `src/renderer/FormFieldRenderer.tsx` | Renders individual fields (text, boolean, options, password, numbers) |
| `src/renderer/CrudRenderer.tsx` | Renders tables with search, pagination, and row navigation |
| `src/renderer/ComponentRenderer.tsx` | Dispatcher — routes each component node to the right renderer |
| `src/renderer/LayoutRenderer.tsx` | Renders horizontal and vertical layouts |
| `src/renderer/DashboardRenderer.tsx` | Renders `MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout` |
| `src/renderer/DisplayRenderer.tsx` | Renders `FoldoutLayout`, `HeroSection`, `EmptyState`, `Skeleton`, `Gantt` |
| `src/api/metadata.ts` | TypeScript wire types for the dashboard/display component metadata |

**Source:** `frontend/app/react-native/`

**To run:**

```bash
cd frontend/app/react-native
# edit MATEU_CONFIG in App.tsx to point to your backend
npx expo start --port 8084
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Desktop & mobile — Compose Multiplatform

The Compose renderer is a single **[Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)** (Kotlin) codebase that runs as a **native desktop app** (Windows/macOS/Linux, JVM) **and** as a **native mobile app** on **iOS and Android** — the same UI, compiled to each platform. Where the JavaFX + React Native pair is two separate codebases (one per form factor), this is one.

**How it works:** like every Mateu renderer it calls `POST /mateu/v3/sync/{route}`, receives the component tree, and renders it — here with native **Compose** widgets. All rendering logic lives in `commonMain` and is shared verbatim across targets; each platform only provides a tiny entry point and an HTTP engine.

The Compose renderer also covers the UX-pattern components (`MetricCard`, `Scoreboard`, `DashboardPanel`, `DashboardLayout`, `FoldoutLayout`, `HeroSection`, `EmptyState`, `Skeleton`, `Gantt`), so dashboards, foldout record pages, hero/welcome pages and Gantt timelines defined with the archetypes render natively on desktop and mobile too (shared `ui/UxRenderers.kt`, used by both the Material 3 and the desktop Jewel dispatchers). `MetricCard` and `EmptyState` actions dispatch through the same mechanism as buttons; the foldout's open/closed state is local UI state, exactly like the web's `mateu-foldout`.

**Responsive UI** — the same screens adapt to the form factor:

- On wide (desktop) viewports the left menu is an inline sidebar and CRUD listings render as a **table**.
- On narrow (phone) viewports the menu becomes an **overlay drawer** (hamburger toggle) and CRUD listings render as **cards** (one per row). Forms drop to a single column. The breakpoint is 600 dp.

**Key files** (under `frontend/app/compose/src/`):

| File | Role |
|---|---|
| `commonMain/.../api/MateuApiClient.kt` | HTTP client — Ktor + kotlinx.serialization; `expect fun createHttpClient()` |
| `commonMain/.../state/AppState.kt` | Session state holder — observable content slots, navigation, action dispatch, validation |
| `commonMain/.../ui/MateuApp.kt` | Platform-agnostic root composable each entry point hosts |
| `commonMain/.../ui/*` | The `@Composable` renderers (App shell, Page, Form, FormField, Crud, layouts…) + `Json.kt` |
| `desktopMain/.../Main.kt` | Desktop entry (`Window`/`application`); CIO engine |
| `iosMain/.../MainViewController.kt` | iOS entry (`ComposeUIViewController`); Darwin engine |
| `androidMain/.../MainActivity.kt` | Android entry (`setContent`); OkHttp engine |

**Run:**

```bash
cd frontend/app/compose
./gradlew run                 # desktop  (mateu.windowMode=mobile previews the phone UI)
# iOS:     see iosApp/README.md  (xcodegen + an iOS Simulator)
# Android: ./gradlew assembleDebug && adb install … (needs the Android SDK)
```

Targets desktop / iOS / Android are wired and run today; **web** (`wasmJs`) reuses the same `commonMain` and is the natural next target. **Source:** `frontend/app/compose/` (see its `README.md` for per-platform run details).

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
