---
title: "Native Renderers"
description: "Run your Mateu application as a native desktop or mobile app, without a browser."
---

Mateu's API is not limited to web browsers. Because the renderer is decoupled from the backend, any client that speaks HTTP and understands the Mateu component tree can render a Mateu application natively.

Two native renderers are available out of the box:

## Desktop — JavaFX

The JavaFX renderer runs your Mateu backend as a **native desktop application** on Windows, macOS, and Linux. No browser is required. The UI is rendered using JavaFX controls and layouts, giving you a native look and feel on each operating system.

**How it works:**

1. The app starts, makes an initial HTTP call to `POST /mateu/v3/sync/_no_route`, and receives the application metadata (title, menu, home route, variant).
2. Based on the `variant` field (`NAVIGATION_LAYOUT`, `MENU_ON_LEFT`, `TABS`, `MEDIATOR`), it builds a JavaFX window with the appropriate navigation structure.
3. As the user navigates, subsequent calls fetch pages, forms, and CRUD listings, which are rendered as native JavaFX controls (`TextField`, `ComboBox`, `TableView`, `DatePicker`, etc.).

**Key classes:**

| Class | Role |
|---|---|
| `MateuApp` | Entry point — launches the JavaFX stage |
| `MateuApiClient` | HTTP client — calls `POST /mateu/v3/sync/{route}` |
| `AppContext` | Shared state — holds navigation helpers and component state |
| `AppRenderer` | Builds the top-level window layout from app metadata |
| `PageRenderer` | Renders pages with header, toolbar, children, and bottom buttons |
| `FormRenderer` | Renders forms with a grid of fields |
| `FormFieldRenderer` | Renders individual fields (`text`, `boolean`, `date`, `options`, etc.) |
| `CrudRenderer` | Renders tables with search, pagination, and row actions |
| `ComponentRenderer` | Dispatcher — routes each component node to the right renderer |

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
