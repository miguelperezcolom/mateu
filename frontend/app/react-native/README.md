# Mateu React Native renderer

Runs any Mateu backend as a **native mobile app** (iOS & Android), built with [Expo](https://expo.dev)
and TypeScript. Like every Mateu renderer it speaks `POST /mateu/v3/sync/{route}` — the same backend
serves web, desktop, and mobile clients simultaneously.

Full documentation: [Native Renderers](../../../doc/src/content/docs/native/index.md) (§ Mobile — React Native).

## Quick start

Start a Mateu backend first (e.g. the demo admin panel at `http://localhost:8592`; the port is set in
`App.tsx`, `MATEU_BACKEND_PORT`). Then pick how you want to run the renderer:

### 1. Browser with a phone viewport (fastest)

```bash
npm run web
```

Open the URL in Chrome, enable device mode (`F12` → phone icon / `Ctrl+Shift+M`) and pick a device
preset. Hot reload included.

### 2. Real phone with Expo Go

Install **Expo Go** (App Store / Play Store), phone on the same Wi-Fi as your machine, then:

```bash
npm start        # prints a QR — scan it with the camera (iOS) or Expo Go (Android)
```

The backend host is derived automatically from the Expo dev server (`hostUri`), so no configuration
is needed when the backend runs on the same machine. Firewall must allow ports 8081 (Metro) and the
backend port. On networks that isolate Wi-Fi clients, use `npx expo start --tunnel`.

### 3. Android emulator / iOS simulator

```bash
npm run android    # needs Android Studio + an AVD
npm run ios        # macOS + Xcode only
```

> From IntelliJ: use the integrated terminal, or create an **npm Run Configuration**
> (Run → Edit Configurations → `+` → npm → this module's `package.json`, script `web` or `start`).

## Building installables (APK / App Store / Play Store)

Builds go through [EAS](https://docs.expo.dev/build/introduction/) (Expo's build service — sign in
once with a free Expo account: `npx eas-cli login`). Profiles live in `eas.json`; application ids
(`io.mateu.native`) in `app.json`. Set the app-registry coordinates for the installable in the
profile's `env` block (`EXPO_PUBLIC_MATEU_REGISTRY_URL` / `EXPO_PUBLIC_MATEU_APP_ID`).

```bash
npm run build:apk           # installable .apk (internal distribution / sideload / QA)
npm run build:apk:local     # same, built on THIS machine (needs Android SDK; no cloud)
npm run build:android       # .aab for the Play Store (auto-incremented version code)
npm run build:ios           # .ipa for the App Store (EAS manages certificates/profiles)

npm run submit:android      # upload the last build to the Play Store (internal track)
npm run submit:ios          # upload the last build to App Store Connect
```

Submissions need store credentials once: a Play Console **service-account JSON**
(`play-service-account.json`, see `eas.json`) and an App Store Connect **API key**
(`asc-api-key.p8` + key/issuer ids). Both file names are gitignored. `runtimeVersion` follows the
app version, so EAS OTA updates (the registry's update path) only reach compatible installables.

## App registry (production installables)

A production installable carries only a **registry URL + app id** (`app.json` → `expo.extra.mateuRegistryUrl`
/ `mateuAppId`, or the `EXPO_PUBLIC_MATEU_REGISTRY_URL` / `EXPO_PUBLIC_MATEU_APP_ID` env vars in dev).
At boot the app fetches `{registryUrl}/{appId}.json`, which maps the app id to the Mateu `baseUrl`,
the launch `parameters` (seeded into `appState`) and the `requiredRendererVersion` — if the installed
renderer is older, a blocking screen tries an OTA update (`expo-updates`, real on EAS builds) and
falls back to the store link. No registry configured → dev config (localhost / Expo host).
See `src/core/AppRegistry.ts` and `registry-example/demo-admin-panel.json`.

## Architecture (short version)

- `src/core/MateuViewController.ts` — pure-TS UIIncrement pipeline for one view: fragments,
  commands, action bubbling to the orchestrator, client-side validation, dirty tracking.
- `src/core/MateuSession.ts` — app-wide services: HTTP client, `appState`, `@SubscribeTo` event bus,
  host hooks (toasts, overlays, dirty-guard confirm).
- `src/renderer/MateuViewHost.tsx` — hosts one controller; `useViewController()` gives every
  renderer in the subtree the live state/action pipeline.
- `src/renderer/*` — one renderer per component family (page, form, fields, crud, layouts,
  dashboard/display, date picker, capture fields).

## Dev verification

- `npx tsx scripts/controller-probe.ts` — drives the real controller (no React) against a live
  backend at `:8592` and asserts the full pipeline (listing + search data, row → detail, edit
  bubbling, validation, state merge).
- `node ../../../e2e/rn-shot.mjs http://localhost:8081 out.png menu` — Playwright screenshot of the
  web build (run from `e2e/`, actions: `menu`, `checkin`, `open:<label>`, `row`, `edit`, `gridrow`,
  `filters`).
