---
title: "Native Renderers"
description: "Run your Mateu application as a native desktop or mobile app, without a browser."
---

Mateu's API is not limited to web browsers. Because the renderer is decoupled from the backend, any client that speaks HTTP and understands the Mateu component tree can render a Mateu application natively.

Native renderers trade the browser's zero-install convenience for **better performance** and an OS-native feel — and, on the desktop, for a **docking/tabbed productivity workspace** the browser can't offer. (For when to prefer web vs. native, see [Web or native?](/design-systems/#web-or-native).)

Two native renderers are available out of the box:

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
| `ComponentRenderer` | Dispatcher — routes each component node to the right renderer |

**Dependencies:** JavaFX 21 + [TiwulFX-Dock](https://github.com/panemu/tiwulfx-dock) (`com.panemu:tiwulfx-dock`) for the detachable/dockable tabs.

**Source:** `frontend/app/javafx/`

## Mobile — React Native

The React Native renderer runs your Mateu backend as a **native mobile application** on iOS and Android. It is built with [Expo](https://expo.dev) and TypeScript, and uses React Navigation for screen and drawer management.

**How it works:**

1. On startup, `App.tsx` calls `initialLoad('')` and receives the root component tree.
2. If the root component is of type `App`, `AppRenderer` builds the navigation structure — a Drawer for `NAVIGATION_LAYOUT`/`MENU_ON_LEFT` variants, a Bottom Tab navigator for `TABS`, or a simple Stack for `MEDIATOR`.
3. Each menu entry maps to a content screen that fetches its data on demand.
4. Pages, forms, CRUD tables, and individual fields are rendered as native React Native components (`TextInput`, `Switch`, `FlatList`, `TouchableOpacity`, etc.).

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

**Source:** `frontend/app/react-native/`

**To run:**

```bash
cd frontend/app/react-native
# edit MATEU_CONFIG in App.tsx to point to your backend
npx expo start --port 8084
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## How both renderers relate to the Mateu API

Both renderers implement the same protocol as the web renderers:

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
