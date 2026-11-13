# Releasing the Mateu app (TestFlight / Play internal testing)

The installable in this directory is the generic **Mateu** hub app (design: `design/mobile-app-hub.md`):
the user's own list of Mateu UIs, added by QR / typed address / deep link, each rendered natively by the
React Native renderer. Without a registry in `app.json` (`expo.extra.mateuRegistryUrl`) and without
`EXPO_PUBLIC_MATEU_BACKEND_*` env vars, the app boots in hub mode.

## 0. Things only the owner can do (TODO)

| What | Where it goes |
|---|---|
| ✅ Apple Developer Program membership (team `2V77LVXCM8`), App ID `io.mateu.app` (Associated Domains), App Store Connect app record | — |
| ✅ Google Play developer account (personal: production needs a closed test with ≥12 testers for 14 days), Play Console app for `io.mateu.app` | — |
| ✅ **Apple Team ID** `2V77LVXCM8` | `well-known/apple-app-site-association`, published from `doc/public/.well-known/` at `https://mateu.io/.well-known/apple-app-site-association` (`Content-Type: application/json` via `doc/public/_headers`, no redirect) |
| ✅ **Play App Signing key** (decided 2026-11-05 at the first upload): Google generated it, `B3:1F:FC:…:D1:0D`. Play-installed apps carry it; the GitHub APKs keep `61:A6:…:07:02`, so a sideloaded install must be uninstalled before installing from Play (different signatures). The local `.aab` is signed with the GitHub key, which Play takes as the upload key | Play Console › Setup › App integrity |
| ✅ **Android signing SHA-256**: both are in: Play App Signing `B3:1F:…:D1:0D` and the GitHub APK key `61:A6:…:07:02` (keystore in the owner's `~/.mateu-secrets/android`) | `well-known/assetlinks.json` AND `doc/public/.well-known/assetlinks.json` (the published one: real fingerprints only, never a TODO) |
| `https://mateu.io/add` landing page: it exists, but its store buttons are `href="#"` and it says the app is not in the stores yet — set them the day the app is live | `doc/src/pages/add.astro` |
| ✅ App Store id `6829227403` (App Store Connect app record created, SKU `mateu-app`) | `src/hub/ui/UiSession.tsx` → `STORE_URL` |
| ✅ `https://demo.mateu.io/counter` is up, public, with no login (checked 2026-10-31; it is the preinstalled "Try a demo" entry the reviewer uses) | demo deployment |
| ✅ Privacy policy: **https://mateu.io/privacy/** (use the trailing slash in the consoles: without it, a redirect) (`doc/src/pages/privacy.astro` — keep it in step with §5) | store listings |
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

## 0c. Over-the-air updates on every release (EXPO_TOKEN)

Every framework release also publishes the app's JavaScript over the air (`ota` job in
`.github/workflows/mobile.yml`: `eas update --channel production`), so an installed app gets the
renderer of that release without a store review, and its hub's compatibility check
(`src/hub/compat.ts`) then knows it renders UIs on that release (`MATEU_VERSION` is stamped into the
update's app config). It runs only when the repository has the **`EXPO_TOKEN`** secret; without it
the job says so and skips.

1. expo.dev → avatar → **Account settings → Access tokens → Create token** (a robot user's token is
   better if the account has one; scope: the `mateu` project).
2. `gh secret set EXPO_TOKEN` and paste it (stdin, so it never lands in the shell history).

An over-the-air update only reaches installs of the **same app version** (`runtimeVersion.policy =
appVersion`). A **native** change — a new native module, a permission, an Expo SDK upgrade, anything
under `ios/`/`android/` or in `app.json` plugins — needs a store build (§1) with a bumped
`expo.version`; publishing it over the air would crash the old binaries, so do not.

A build made OUTSIDE EAS gets its channel from `app.config.ts` (`updates.requestHeaders`): the local
Play bundle `production`, the GitHub APK (`MATEU_DISTRIBUTION=github`) its own channel **`github`**.
EAS builds take their profile's channel from `eas.json`. Without a channel an install never receives
an update. The `ota` job publishes every release's update to both channels — the `github` one with
`MATEU_DISTRIBUTION=github` — because an update carries its own app config: published once for both,
it made the APK forget it updates from the GitHub releases, and "Update Mateu" sent it to Google Play.
The app reads the distribution from the binary's channel (`Updates.channel`), which no update changes
(`src/hub/updateTargets.ts`). An APK installed before this (asking for `production`) learns it with
its next APK update.

When a build is made by hand (`eas build`), pass `MATEU_VERSION=<release>` (e.g. `3.0-beta.33`) in
its environment so the hub knows which release the binary carries; without it the app compares only
wire versions.

## 0d. Pending store build: 1.0.1 (200003) — `expo-notifications`

The OS-level notifications of an app that declares `@App(osNotifications = true)`
(design/progress-and-notifications.md, "OS-level notifications") added a NATIVE module,
`expo-notifications` — LOCAL notifications only: no push service, no push token, nothing new leaves
the device. So this release needs a **new store build** (§1, §2 — the owner builds and submits):

- `expo.version` **1.0.1** (a new runtime: the OTA job must not send this JavaScript to 1.0.0
  binaries; the code also tolerates a missing module and simply posts nothing there).
- `android.versionCode` **200003** / `ios.buildNumber` **"200003"** in `app.json` (local and GitHub
  builds); EAS keeps its own remote counter (`appVersionSource: remote`) — if it is behind, set it
  with `npx eas-cli build:version:set` before building.
- New permission: Android 13+ **`POST_NOTIFICATIONS`** (asked at runtime, only when the user taps
  "Notify me on this device" in the inbox or the task sheet). iOS asks for alert permission the
  same way; no Info.plist usage string is needed for local notifications. Plugin `expo-notifications`
  in `app.json` (monochrome icon, default channel `mateu`); `plugins/with-local-notifications-only`
  drops the iOS push entitlement (`aps-environment`) that plugin adds — no Push capability needed.
  Checked with `npx expo prebuild --no-install`: the manifest carries POST_NOTIFICATIONS,
  versionCode 200003 / 1.0.1, Info.plist CFBundleVersion 200003.
- Store answers: Play Data safety and Apple privacy are unchanged (nothing is collected); in Play's
  permissions declaration, `POST_NOTIFICATIONS` = notifications the user turned on for the apps they
  opened.

## 1. Build

```bash
cd frontend/app/react-native
npm ci
npm test && npm run typecheck
npx eas-cli build --platform ios --profile production      # → .ipa for TestFlight
npx eas-cli build --platform android --profile production  # → .aab for Play
```

- `production` auto-increments the build number (`appVersionSource: remote`).
- Android release builds run R8 (`expo-build-properties` › `enableMinifyInReleaseBuilds`): upload the
  build's `android/app/build/outputs/mapping/release/mapping.txt` with the bundle (Play Console › the
  version in the App bundle explorer › Downloads › ReTrace mapping file), or Play's crash reports
  show obfuscated stacks.
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
  `clientId` its manifest names, as a valid redirect AND as a post-logout redirect (sign-out also ends the
  provider's session, in the browser, when it offers an `end_session_endpoint`).

## 4. Reviewer notes (paste into App Store Connect "Notes" / Play "App access")

> Mateu is a client for business applications built with the open-source Mateu framework
> (https://mateu.io). Organisations publish their apps on their own servers; users add them to this
> app by scanning a QR code or typing the address, the way an authenticator app adds accounts.
>
> **No account is needed to review the app.** On first launch the list contains a preinstalled
> entry, "Try a demo" (https://demo.mateu.io/counter): tap it to open a working demo app. You can
> also tap "Type an address" and enter `demo.mateu.io/counter`.
>
> The app does not execute code sent by those servers. Each server sends a declarative description
> of its screens (JSON), which the app renders with its own native components — the same model as
> other enterprise thin clients. The app's own JavaScript is updated through Expo EAS Update. Apps that require sign-in use the organisation's own identity provider
> (OpenID Connect in the system browser); the app never sees passwords.
>
> The camera is used only to scan QR codes (and, inside an app, for photo fields the app asks for).

Play "App access": *All functionality is available without special access* (the demo entry).

## 5. Privacy answers

The app has no analytics, no crash reporting SDK, no advertising id, no tracking and no Mateu account.
Everything a user enters goes to the server of the UI they opened — that organisation is the controller
of that data, under its own privacy policy. The ONE thing that leaves for a service we chose:
**expo-updates asks Expo's servers (`u.expo.dev`) for a new version on every launch**, sending a random
per-install id (EAS Client ID, kept in the app's storage), the platform and runtime version, and, as with
any request, the IP address. Each UI's server also receives a random per-UI session id (`X-Session-Id`).

**Apple App Privacy ("nutrition label")**: same fact, same answer: *Device ID, App Functionality, not
linked to the user*, for the update check. **Tracking**: No. No `NSUserTrackingUsageDescription`.
`ITSAppUsesNonExemptEncryption = false` (only standard HTTPS/TLS) is set in `app.json`.
Privacy manifest: no required-reason APIs beyond those Expo modules declare themselves.

**Google Play Data safety**: declare *Device or other IDs → collected, required, purpose App functionality*
(the update check above), processed by a service provider, so not "shared" in Play's sense; check Expo's
own store-privacy guidance when filling it in. Nothing else. Data is encrypted in transit:
Yes (HTTPS; plain http is refused outside development builds). Users can request deletion: removing
a UI from the list (or uninstalling) deletes everything the app stored for it; there is no account to
delete. Permissions: `CAMERA` (QR scanning, photo fields), `INTERNET`. Audio recording is blocked.

What stays on the device: the list of UIs (addresses, names, icons — app storage) and, per UI, its
sign-in tokens and a random session id (Keychain / Android Keystore via expo-secure-store). The
"Export my UIs" QR carries addresses only.

## 6. Store listing basics

Ready-to-paste texts (name, subtitle, promotional text, keywords, short + full description, what's new;
English and Spanish, within each store's limits): `store/listing.md`.


- Name: **Mateu**. Subtitle (iOS): "Your business apps, native". Category: Business / Productivity.
- Screenshots: `store/android/` has the phone screenshots, the 512 px icon and the feature graphic Google
  Play asks for, captured from a release build on an emulator. `e2e/rn-hub-probe.mjs` with `SHOTS=<dir>`
  covers the flows on a phone viewport for checks (web rendering, not for the listing).
- Age rating: 4+ / Everyone (no user-generated content inside the app itself; the content is the
  organisation's).
