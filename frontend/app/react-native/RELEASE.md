# Releasing the Mateu app (TestFlight / Play internal testing)

The installable in this directory is the generic **Mateu** hub app (design: `design/mobile-app-hub.md`):
the user's own list of Mateu UIs, added by QR / typed address / deep link, each rendered natively by the
React Native renderer. Without a registry in `app.json` (`expo.extra.mateuRegistryUrl`) and without
`EXPO_PUBLIC_MATEU_BACKEND_*` env vars, the app boots in hub mode.

## 0. Things only the owner can do (TODO)

| What | Where it goes |
|---|---|
| Apple Developer Program membership (99 $/year), App Store Connect app record for `io.mateu.app` | — |
| Google Play developer account (25 $ once), Play Console app for `io.mateu.app` | — |
| **Apple Team ID** | `well-known/apple-app-site-association` (`TODO_APPLE_TEAM_ID`), served at `https://mateu.io/.well-known/apple-app-site-association` (`Content-Type: application/json`, no redirect) |
| **Android signing SHA-256** (Play App Signing key, plus the EAS upload key for internal APKs) | `well-known/assetlinks.json`, served at `https://mateu.io/.well-known/assetlinks.json` |
| `https://mateu.io/add` landing page (store badges + the QR again, for phones without the app) | mateu.io site |
| App Store id for the "Update the app" button | `src/hub/ui/UiSession.tsx` → `STORE_URL` (`idTODO_APP_STORE_ID`) |
| `https://demo.mateu.io/counter` must be up, public, with no login (it is the preinstalled "Try a demo" entry the reviewer uses) | demo deployment |
| Privacy policy URL (required by both stores even for "no data collected") | store listings |
| Bundle id: `io.mateu.app` on iOS and Android (decided 2026-10-12; it cannot change after the first store release) | `app.json` |
| EAS: `eas login` as `miguelperezcolom` (the `owner` in app.json); project id already set | — |

## 0b. Android APK on GitHub (no EAS, no queue)

Every framework release (`v3.0-beta.N`) also builds an Android APK on a GitHub runner and attaches it
to the release as `mateu-app-<tag>-android.apk` (`.github/workflows/mobile.yml`: `expo prebuild` +
`gradlew assembleRelease`, signed with the `ANDROID_KEYSTORE_*` secrets — without them no APK is
attached, because a debug-signed one could never be updated). Pull requests that touch the app build
it too, as a check (workflow artifact). Put the key's SHA-256 in `well-known/assetlinks.json` so
`https://mateu.io/add` opens the sideloaded app. iOS has no equivalent: an iPhone installs only from
the App Store, TestFlight or an ad-hoc build for registered devices.

## 1. Build

```bash
cd frontend/app/react-native
npm ci
npm test && npm run typecheck
npx eas-cli build --platform ios --profile production      # → .ipa for TestFlight
npx eas-cli build --platform android --profile production  # → .aab for Play
```

- `production` auto-increments the build number (`appVersionSource: remote`).
- The **marketing version** is `expo.version` in `app.json`; it is also what a UI's manifest
  `minAppVersion` is compared against ("Update the app" screen). Bump it for a store release.
- `runtimeVersion.policy = appVersion`: OTA updates (`eas update --channel production`) only reach
  installs with the same `version`.
- First iOS build: let EAS create the distribution certificate and provisioning profile; it also
  enables the **Associated Domains** capability because `ios.associatedDomains` is set.
- `development` profile (`APP_VARIANT=development`) installs side by side (`.dev` ids) and allows
  plain http to a LAN backend.

## 2. Submit to the test tracks

```bash
npx eas-cli submit --platform ios --profile production      # uploads to App Store Connect → TestFlight
npx eas-cli submit --platform android --profile production  # Play "internal" track (eas.json)
```

- iOS: the first submit asks for an App Store Connect API key (or Apple ID + app-specific password).
  Then add internal testers in TestFlight; external testing needs a Beta App Review (use the
  reviewer notes below).
- Android: the very first upload of an app must be done by hand in the Play Console (an API-only
  first upload is rejected); after that `eas submit` works. Needs a Google service-account JSON
  (`eas credentials`).

## 3. Verify deep links on a device

- iOS: `xcrun simctl openurl booted "https://mateu.io/add?u=https%3A%2F%2Fdemo.mateu.io%2Fcounter"`
  (universal links only work once the AASA file is live and the build carries the Team ID); the custom
  scheme works regardless: `xcrun simctl openurl booted "mateu://add?u=demo.mateu.io/counter"`.
- Android: `adb shell am start -a android.intent.action.VIEW -d "https://mateu.io/add?u=..."`;
  `adb shell pm get-app-links io.mateu.app` must show `mateu.io: verified`.
- The OIDC redirect is `mateu://auth` for every UI: each company registers that redirect URI for the
  `clientId` its manifest names.

## 4. Reviewer notes (paste into App Store Connect "Notes" / Play "App access")

> Mateu is a client for business applications built with the open-source Mateu framework
> (https://mateu.io). Organisations publish their apps on their own servers; users add them to this
> app by scanning a QR code or typing the address, the way an authenticator app adds accounts.
>
> **No account is needed to review the app.** On first launch the list contains a preinstalled
> entry, "Try a demo" (https://demo.mateu.io/counter): tap it to open a working demo app. You can
> also tap "Type an address" and enter `demo.mateu.io/counter`.
>
> The app does not download or execute code. Each server sends a declarative description of its
> screens (JSON), which the app renders with its own native components — the same model as other
> enterprise thin clients. Apps that require sign-in use the organisation's own identity provider
> (OpenID Connect in the system browser); the app never sees passwords.
>
> The camera is used only to scan QR codes (and, inside an app, for photo fields the app asks for).

Play "App access": *All functionality is available without special access* (the demo entry).

## 5. Privacy answers

The app itself collects **nothing**: no analytics, no crash reporting SDK, no advertising id, no
tracking, no Mateu account. Everything a user enters goes to the server of the UI they opened —
that organisation is the controller of that data, under its own privacy policy.

**Apple App Privacy ("nutrition label")**: *Data Not Collected*. (Apple defines "collect" as
transmitting off the device in a way the developer or its partners can access; the developer here
operates no server the app reports to.) **Tracking**: No. No `NSUserTrackingUsageDescription`.
`ITSAppUsesNonExemptEncryption = false` (only standard HTTPS/TLS) is set in `app.json`.
Privacy manifest: no required-reason APIs beyond those Expo modules declare themselves.

**Google Play Data safety**: *No data collected*, *No data shared*. Data is encrypted in transit:
Yes (HTTPS; plain http is refused outside development builds). Users can request deletion: removing
a UI from the list (or uninstalling) deletes everything the app stored for it; there is no account to
delete. Permissions: `CAMERA` (QR scanning, photo fields), `INTERNET`. Audio recording is blocked.

What stays on the device: the list of UIs (addresses, names, icons — app storage) and, per UI, its
sign-in tokens and a random session id (Keychain / Android Keystore via expo-secure-store). The
"Export my UIs" QR carries addresses only.

## 6. Store listing basics

- Name: **Mateu**. Subtitle (iOS): "Your business apps, native". Category: Business / Productivity.
- Screenshots: run `e2e/rn-hub-probe.mjs` with `SHOTS=<dir>` for the flows on a phone viewport (web
  rendering — use device screenshots for the actual listing).
- Age rating: 4+ / Everyone (no user-generated content inside the app itself; the content is the
  organisation's).
