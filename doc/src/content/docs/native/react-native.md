---
title: "React Native renderer (iOS & Android)"
description: "Run any Mateu backend as a native mobile app: pointing it at a backend, the app registry, sign-in against a secured backend, and store builds."
---

The React Native renderer (`frontend/app/react-native`, Expo SDK 57 / React Native 0.86, TypeScript)
turns any Mateu backend into a **native iOS and Android app**. It speaks the same
`POST /mateu/v3/sync/{route}` wire as the web renderers, so the backend needs no changes — one
server serves web, desktop and mobile at once. It is a **fully supported** renderer: every
component type of the wire has a native rendering (see the
[coverage table](/reference/parity/#react-native-component-coverage)), and CI fails the build if a
new wire type arrives without one.

For the architecture and the other native renderer see [Desktop & Mobile](/native/).

## 1. Point it at a backend

Three ways, from quickest to production:

| Situation | How the app finds its backend |
|---|---|
| Local development (`npm run web`, Expo Go, emulator) | `http://<dev host>:8594` — the host is the Expo dev server's (`hostUri`, so a phone on your Wi-Fi reaches your laptop), the port is `EXPO_PUBLIC_MATEU_BACKEND_PORT` (default **8594**, `demo/demo-front-office`) |
| Any build pointing at a fixed backend | `EXPO_PUBLIC_MATEU_REGISTRY_URL` + `EXPO_PUBLIC_MATEU_APP_ID` → the [app registry](#2-the-app-registry) |
| Store installables | the same two values, set in the EAS environment of the build profile (see [store builds](#4-store-builds)) |

```bash
cd frontend/app/react-native
npm ci
EXPO_PUBLIC_MATEU_BACKEND_PORT=8595 npm run web     # demo-admin-panel on :8595, in a browser
npm start                                           # QR code for Expo Go on a real phone
```

`EXPO_PUBLIC_MATEU_ROUTE=/some/route` boots straight into a route instead of the home screen.

## 2. The app registry

An installable carries only a **registry URL** and an **app id**. At boot it fetches
`{registryUrl}/{appId}.json` (or the URL with `{appId}` substituted) and gets everything else, so
retargeting a backend, changing launch parameters, forcing an upgrade or switching the identity
provider is a registry edit — not a store release:

```json
{
  "appId": "front-office",
  "baseUrl": "https://apps.example.com/front-office",
  "parameters": { "tenantId": "1111" },
  "requiredRendererVersion": "1.0.0",
  "storeUrl": { "android": "https://play.google.com/…", "ios": "https://apps.apple.com/…" },
  "auth": {
    "type": "oidc",
    "issuer": "https://login.example.com/realms/acme",
    "clientId": "mateu-mobile",
    "scopes": ["openid", "profile", "email", "offline_access"]
  }
}
```

- `parameters` are seeded into the `appState` of every request.
- `requiredRendererVersion` gates the boot: an older installable shows **Update required**, tries
  an over-the-air update (EAS Update) and falls back to `storeUrl`.
- `auth` turns sign-in on — next section.

## 3. Signing in to a secured backend

A secured Mateu backend resolves identity (`@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless`,
`HttpRequest` roles) from a JWT sent as `Authorization: Bearer <token>`. The native renderer sends
it on **every** Mateu request (and on the AI chat), from a pluggable **token provider**:

- **Built-in OIDC** — declare `auth` in the registry entry (or, in dev,
  `EXPO_PUBLIC_MATEU_OIDC_ISSUER` / `_CLIENT_ID` / `_SCOPES` / `_AUDIENCE`). The app runs the
  Authorization Code flow with **PKCE** in the system browser (`expo-auth-session`), keeps the
  tokens in the **keychain / keystore** (`expo-secure-store`; `localStorage` on web), refreshes the
  access token before it expires, and shows a **Sign in** screen before the first screen
  (`"loginOnStart": false` signs in only when a request comes back 401). A **Sign out** entry
  appears at the bottom of the drawer. Works with any standards-compliant provider (Keycloak,
  Entra ID, Auth0 — add `"audience"` —, Okta, Cognito…): it only needs the issuer's discovery
  document.
- **Your own login** — register any provider: `setTokenProvider({ getToken, refresh, login, logout })`
  from `src/core/auth.ts`.

Register these redirect URIs as allowed for the client at the identity provider:
`mateu://auth` (iOS/Android — the app's scheme is `mateu`) and `<web origin>/auth` (expo web).

**Session expiry** follows the web renderers' contract: a **401** gives the app one chance to
re-authenticate — an explicit `onSessionExpired(handler)` (`src/core/sessionGuard.ts`) wins;
otherwise the provider refreshes silently, then prompts — and the original request is retried
**once**, so a half-filled form survives. Concurrent 401s share a single re-authentication.

Every installation also sends its own `X-Session-Id` (a random UUID created on first launch and
kept in secure storage), so two devices never share a server-side session.

## 4. Store builds

Builds go through [EAS](https://docs.expo.dev/build/introduction/) (`npx eas-cli login` once).
`eas.json` has three profiles; each maps to an **EAS environment** and an **EAS Update channel**
of the same name:

| Profile | Use | Network | App id |
|---|---|---|---|
| `development` | internal APK against a LAN backend | cleartext `http` allowed (Android `usesCleartextTraffic`, iOS local networking) | `io.mateu.mobile.dev` / `io.mateu.native.dev` |
| `preview` | internal APK / ad-hoc for QA | **https only** | `io.mateu.mobile` / `io.mateu.native` |
| `production` | Play Store `.aab` / App Store `.ipa` | **https only** | `io.mateu.mobile` (Android) / `io.mateu.native` (iOS) |

```bash
# registry coordinates per environment — nothing environment-specific is committed
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_MATEU_REGISTRY_URL --value https://registry.example.com
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_MATEU_APP_ID --value front-office

npm run build:apk          # preview APK
npm run build:android      # production .aab
npm run build:ios          # production .ipa
npm run submit:android     # Play Store, internal track
npm run submit:ios         # App Store Connect
```

**Store credentials are never in the repository.** Upload them once to EAS
(`npx eas-cli credentials`: the Play service-account JSON and the App Store Connect API key), or
provide them on the submitting machine (`EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`,
`EXPO_ASC_ISSUER_ID`). **Over-the-air updates**: `npx eas-cli update --channel production`
publishes a new JS bundle to production installables; `runtimeVersion` follows the app version,
so an update only reaches binaries it is compatible with. The camera permission is the only
runtime permission requested (for `@PhotoCapture`); the microphone is explicitly not.

## 5. Compatibility

The app declares the oldest wire it supports (`MIN_WIRE_VERSION = "3.0"`,
`src/core/wireVersion.ts`). Every response carries `wireVersion`: a server speaking another major
version (or an older minor) gets a one-time **Version mismatch** warning instead of screens that
silently render wrong; a newer minor is fine (the wire is additive within a major).

## 6. Checks

```bash
npm test             # unit tests (node --test)
npm run typecheck    # tsc --noEmit
npm run parity       # every wire component type has a native renderer; parity.md in sync
node scripts/wire-fixture-server.mjs 18600   # a page of rarely-used component types, for eyeballing
```

Request and response bodies are logged to the console **only in development builds** (`__DEV__`).
