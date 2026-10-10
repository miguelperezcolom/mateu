# Mateu React Native renderer

Runs any Mateu backend as a **native mobile app** (iOS & Android), built with [Expo](https://expo.dev)
and TypeScript. Like every Mateu renderer it speaks `POST /mateu/v3/sync/{route}` — the same backend
serves web, desktop, and mobile clients simultaneously.

Full documentation: [React Native renderer](../../../doc/src/content/docs/native/react-native.md)
(backend, registry, sign-in, store builds) and [Native Renderers](../../../doc/src/content/docs/native/index.md).

Expo SDK 57 · React Native 0.86 · every wire component type rendered natively (`npm run parity`).

## Quick start

Start a Mateu backend first — by default the app looks for `demo/demo-front-office` on
`http://localhost:8594`; point it elsewhere with `EXPO_PUBLIC_MATEU_BACKEND_PORT` (e.g. `8595` for
`demo-admin-panel`). Then `npm ci` and pick how you want to run the renderer:

### 1. Browser with a phone viewport (fastest)

```bash
npm run web
```

Open the URL in Chrome, enable device mode (`F12` → phone icon / `Ctrl+Shift+M`) and pick a device
preset. Hot reload included.

In the browser the app is a page on ANOTHER origin than the backend (Expo serves it on `:8081` or
the port you pass), and Mateu answers no cross-origin request unless told to (CORS is off by
default). Start the backend with the Expo origin allowed, or the app stops at *"Can't reach the
server"* and the browser console shows a CORS error:

```bash
java -jar target/my-app.jar --mateu.cors.allowed-origins=http://localhost:8081
```

(The native builds — Expo Go, simulators, installables — are not browsers and need no CORS.)
Append `?route=/some-route` to the page URL to open a given screen directly.

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
once with a free Expo account: `npx eas-cli login`). Profiles live in `eas.json` (`development`,
`preview`, `production` — each with its own EAS environment and EAS Update channel); application
ids in `app.json`: **`io.mateu.mobile` on Android, `io.mateu.native` on iOS** (the `development`
profile adds `.dev`, via `app.config.ts`). Set the app-registry coordinates as variables of the
profile's EAS environment:

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_MATEU_REGISTRY_URL --value https://registry.example.com
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_MATEU_APP_ID --value front-office
```

Only the `development` profile allows cleartext `http` (a LAN backend); `preview` and
`production` are https-only.

```bash
npm run build:apk           # installable .apk (internal distribution / sideload / QA)
npm run build:apk:local     # same, built on THIS machine (needs Android SDK; no cloud)
npm run build:android       # .aab for the Play Store (auto-incremented version code)
npm run build:ios           # .ipa for the App Store (EAS manages certificates/profiles)

npm run submit:android      # upload the last build to the Play Store (internal track)
npm run submit:ios          # upload the last build to App Store Connect
```

Submissions need store credentials once — **kept in EAS, never in the repo**: upload the Play
Console service-account JSON and the App Store Connect API key with `npx eas-cli credentials` (or
export `EXPO_ASC_API_KEY_PATH` / `EXPO_ASC_KEY_ID` / `EXPO_ASC_ISSUER_ID` on the submitting
machine). OTA updates: `npx eas-cli update --channel production`; `runtimeVersion` follows the app
version, so an update only reaches compatible installables.

## App registry (production installables)

A production installable carries only a **registry URL + app id** (`app.json` → `expo.extra.mateuRegistryUrl`
/ `mateuAppId`, or the `EXPO_PUBLIC_MATEU_REGISTRY_URL` / `EXPO_PUBLIC_MATEU_APP_ID` env vars in dev).
At boot the app fetches `{registryUrl}/{appId}.json`, which maps the app id to the Mateu `baseUrl`,
the launch `parameters` (seeded into `appState`) and the `requiredRendererVersion` — if the installed
renderer is older, a blocking screen tries an OTA update (`expo-updates`, real on EAS builds) and
falls back to the store link. No registry configured → dev config (localhost / Expo host).
See `src/core/AppRegistry.ts` and `registry-example/demo-admin-panel.json`.

## Signing in (secured backends)

Every request carries a per-install `X-Session-Id` and, when a token provider is registered,
`Authorization: Bearer <token>`. Built-in OIDC (Authorization Code + PKCE, `expo-auth-session`,
tokens in the keychain/keystore) is configured by an `auth` block in the registry entry —
`{ "type": "oidc", "issuer": "…", "clientId": "…", "scopes": [...] }` — or, in dev, by
`EXPO_PUBLIC_MATEU_OIDC_ISSUER` / `EXPO_PUBLIC_MATEU_OIDC_CLIENT_ID`. A 401 refreshes or re-prompts
and retries once. Redirect URIs to allow at the IdP: `mateu://auth` and `<web origin>/auth`. Your
own login: `setTokenProvider(...)` in `src/core/auth.ts`.

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

- `npm test`, `npm run typecheck`, `npm run parity` — unit tests, `tsc --noEmit`, and the wire
  coverage check (every wire component type has a native case; parity.md in sync). All run in CI.
- `node scripts/wire-fixture-server.mjs 18600` + `EXPO_PUBLIC_MATEU_BACKEND_PORT=18600 npm run web`
  — a fixture backend with a page of the rarely-used component types, for eyeballing renderers.
- `npx tsx scripts/controller-probe.ts` — drives the real controller (no React) against a live
  backend at `:8592` and asserts the full pipeline (listing + search data, row → detail, edit
  bubbling, validation, state merge).
- `node ../../../e2e/rn-shot.mjs http://localhost:8081 out.png menu` — Playwright screenshot of the
  web build (run from `e2e/`, actions: `menu`, `checkin`, `open:<label>`, `row`, `edit`, `gridrow`,
  `filters`).
