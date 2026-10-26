---
title: "Publishing to the App Store and Google Play"
description: "Make your Mateu UI available in the generic Mateu app, or ship your own branded iOS and Android app built on the React Native renderer."
---

A Mateu UI reaches a phone in one of two ways:

- **In the generic Mateu app.** You publish nothing to a store. Your users install the Mateu app
  once and add your UI to it by scanning a QR code, the way an authenticator app adds accounts.
  This is the right choice for most internal and B2B apps.
- **In your own branded app.** You build the React Native renderer under your own name, bundle id
  and icon, and publish it yourself. Choose this when the store listing has to carry your brand, or
  when you need a store presence of your own.

Both use the same renderer and talk to your backend over the same `/mateu/v3/*` API. Nothing about
your UI changes between them.

## A. Make your UI available in the Mateu app

### How the hub works

The Mateu app (`io.mateu.app` on iOS and Android) keeps a **local list of UIs** on the device. Each
entry is a name, an icon and a base URL. There is no Mateu account: the list lives on the phone.
Opening an entry renders that UI natively, and each UI keeps its own session, navigation and app
context. The app does not download or run code. It renders the declarative JSON your server sends
with its own native components.

### 1. The UI manifest

When a UI is added, the app first reads a small public document from your backend:

```
GET <baseUrl>/mateu/v3/manifest
```

```json
{
  "name": "Acme CRM",
  "shortName": "CRM",
  "icon": "https://crm.acme.com/icon.png",
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

- **You don't write it by hand.** Every Mateu backend (the five Java adapters, .NET and Python)
  serves it, built from your app shell ([how each member is derived](/ux-patterns/mobile-app/#the-ui-manifest),
  including `@MobileApp` for the members the shell doesn't say). The name, icon and colours come from your `@App` class or
  your YAML `type: AppShell`, so a rename or a new icon reaches every phone without anyone scanning
  again.
- The app validates every field. Names are plain text with a length cap. Icons must be https URLs
  or raster `data:image/…` URIs (SVG is refused). Colours must be hex literals. Anything else is
  dropped.
- `auth` is optional. A UI without it is open. Mateu doesn't authenticate anyone: the manifest only
  tells the app which identity provider your backend trusts.
- A server that publishes no manifest (an older Mateu) still works. The entry is named after its
  domain.

A UI with **no backend** — a static bundle — publishes the same manifest as a file: `mateu-bundle`
writes `mateu/v3/manifest` into the bundle (from the app shell; `mateu.mobile.*` settings apply at
build time) with one more member, `"bundle": "manifest.json"`, and the app runs from that bundle.
See [Same project on web and phone](/deploy/static-ui/#same-project-on-web-and-phone).

### 2. The QR code and the deep link

The QR code is a link:

```
https://mateu.io/add?u=<urlencoded baseUrl>[&r=<route>]
```

- `u` is your UI's base URL. `r` is optional and opens a specific route ("open this screen on my
  phone").
- On a phone with the app installed, the system camera opens the app directly (universal link on
  iOS, App Link on Android). Without the app, `mateu.io/add` shows the store badges.
- The custom scheme `mateu://add?u=…` is accepted too, and so is typing the address in the app.

The QR code carries **no secret**, only the URL. A photographed or forwarded code grants nothing: at
worst it adds an entry to someone's list, and they still have to sign in.

### 3. The "Open on mobile" header action

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Turn it on and your web app gets a header action that shows the QR code for the current app,
optionally pointing at the current route. On a phone the same action shows an **Open in the Mateu
app** button instead.

```java
@UI("")
@App(mobileQr = true)
public class Home { /* … */ }
```

```yaml
# specs/ui/app.yaml
type: AppShell
title: Acme CRM
mobileQr: true
```

The .NET and Python servers have the same switch: `[App(MobileQr = true)]` and
`@app(mobile_qr=True)`. See [Mobile app (Open on mobile)](/ux-patterns/mobile-app/#open-on-mobile)
for what the dialog shows and how it behaves on a phone.

### 4. Sign-in: register `mateu://auth` with your identity provider

If the manifest names an `auth` block, the app signs the user in with **OpenID Connect,
Authorization Code + PKCE, in the system browser**. The app never sees the password.

On your identity provider (Keycloak, Entra ID, Okta, Auth0…):

1. Create a **public** client (no client secret, since a mobile app can't keep one) with the
   `clientId` your manifest names.
2. Allow PKCE (S256).
3. Register the redirect URI **`mateu://auth`**. It is the same for every UI in the hub.
4. Allow the scopes the manifest lists.

The tokens are kept in the Keychain or the Android Keystore, separately for each UI, and refreshed
as needed. Requests carry `Authorization: Bearer`: your backend's framework validates the token as
it would for any other client, and Mateu reads the resulting principal. Signing out of one UI clears
only that UI's tokens.

For a backend that is already secured, see also
[Signing in to a secured backend](/native/react-native/#3-signing-in-to-a-secured-backend).

### 5. Requirements and safety

- **HTTPS only.** The app refuses plain http, except in development builds. Your identity
  provider's issuer must be https too.
- **Adding asks for confirmation.** The confirmation screen shows the domain prominently, next to
  the manifest's name and icon, so a QR code from an untrusted source can't pass itself off as
  another UI.
- **"Update the app".** If your UI needs a newer app, set `minAppVersion`. Users on an older app
  then see an "Update the app" screen instead of a screen that half works. A wire version the app
  doesn't understand gets the same treatment.

## B. Your own branded app on the React Native renderer

This is the same React Native project (`frontend/app/react-native`), built under your own name and
pointed at your backend or your app registry. How to point it is covered in
[React Native renderer](/native/react-native/). This section covers getting it into the stores.

### Accounts and identifiers

| What | Cost | Notes |
|---|---|---|
| Apple Developer Program | 99 $/year | Create the app record in App Store Connect. |
| Google Play developer account | 25 $ once | Create the app in the Play Console. Read the testing rule below before you pick the account type. |
| Expo account (EAS) | free tier available | `eas login`. The `owner` in `app.json` must match. |
| A privacy policy URL | — | Both stores require one, even if you collect nothing. |

Pick your **bundle id** (iOS `bundleIdentifier`, Android `package`) before the first upload, for
example `com.acme.crm`. It **can't change** after the first store release. Use the same id on both
platforms unless you have a reason not to.

### `app.json`: what to change

```json
{
  "expo": {
    "name": "Acme CRM",
    "scheme": "acmecrm",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.acme.crm",
      "associatedDomains": ["applinks:crm.acme.com"],
      "infoPlist": {
        "NSCameraUsageDescription": "Acme CRM uses the camera for photo fields and to scan QR codes.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.acme.crm",
      "permissions": ["android.permission.CAMERA"],
      "blockedPermissions": ["android.permission.RECORD_AUDIO"],
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{ "scheme": "https", "host": "crm.acme.com", "pathPrefix": "/open" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "plugins": [
      ["expo-build-properties", { "android": { "usesCleartextTraffic": false } }]
    ]
  }
}
```

- `name`, the icons and `scheme` are your brand. If you register your own OIDC redirect, it uses
  your scheme (`acmecrm://auth`), not `mateu://auth`.
- `associatedDomains` (iOS) and `intentFilters` with `autoVerify` (Android) are only needed if you
  want https links to open the app.
- The camera permission text has to say what the camera is for. Reviewers read it.
- `ITSAppUsesNonExemptEncryption: false` is correct when the app only uses standard HTTPS/TLS. It
  saves you the export-compliance question on every upload.
- `usesCleartextTraffic: false` keeps release builds on https.

### Build profiles (`eas.json`)

The project ships three profiles:

| Profile | What it is for |
|---|---|
| `development` | Installs side by side (`.dev` ids), allows plain http to a LAN backend. |
| `preview` | Internal distribution (an APK on Android) for testers outside the stores. |
| `production` | Store builds. `autoIncrement` bumps the build number on every build. |

- With `"appVersionSource": "remote"`, EAS keeps the build number. You only bump the **marketing
  version** (`expo.version` in `app.json`) for a store release.
- With `runtimeVersion.policy = appVersion`, over-the-air updates
  (`eas update --channel production`) only reach installs with the same `version`. A change to
  native code needs a new store build. A JavaScript-only fix can go out as an update.

### Build and submit

```bash
cd frontend/app/react-native
npm ci
npm test && npm run typecheck

npx eas-cli build --platform ios --profile production       # .ipa
npx eas-cli build --platform android --profile production   # .aab

npx eas-cli submit --platform ios --profile production       # → App Store Connect / TestFlight
npx eas-cli submit --platform android --profile production   # → Play "internal" track
```

**iOS**

- On the first build, let EAS create the distribution certificate and the provisioning profile. It
  also enables the Associated Domains capability when `associatedDomains` is set.
- On the first submit, EAS asks for an **App Store Connect API key** (or an Apple ID with an
  app-specific password).
- In TestFlight, internal testers (your team) can install right away. External testers need a
  **Beta App Review** first, so use the reviewer notes below.

**Android**

- The **very first upload must be done by hand** in the Play Console. An API-only first upload is
  rejected. Download the `.aab` from EAS and upload it to a testing track.
- After that, `eas submit` works. It needs a **Google service account JSON** with access to your
  app (`eas credentials`).

### Universal links and App Links

To make https links open the app, your domain has to vouch for it. Serve two files from the domain
named in `associatedDomains` and `intentFilters`:

`https://<your-domain>/.well-known/apple-app-site-association`, served as `application/json` with
no redirect:

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["<APPLE_TEAM_ID>.com.acme.crm"],
        "components": [{ "/": "/open" }, { "/": "/open/*" }]
      }
    ]
  }
}
```

`https://<your-domain>/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.acme.crm",
      "sha256_cert_fingerprints": [
        "<PLAY_APP_SIGNING_KEY_SHA256>",
        "<EAS_UPLOAD_KEY_SHA256>"
      ]
    }
  }
]
```

- The Team ID is in your Apple Developer account (Membership details).
- The Play App Signing fingerprint is in the Play Console under **Setup › App integrity › App
  signing key**. The upload key's fingerprint (`eas credentials -p android`) is only needed for
  internal APKs installed outside Play.

Check them on a device or emulator:

```bash
# iOS simulator: universal link (needs the AASA file live), then the custom scheme
xcrun simctl openurl booted "https://crm.acme.com/open"
xcrun simctl openurl booted "acmecrm://open"

# Android
adb shell am start -a android.intent.action.VIEW -d "https://crm.acme.com/open"
adb shell pm get-app-links com.acme.crm     # must show: crm.acme.com: verified
```

### Store review

Reviewers have to be able to use the app without being one of your customers. Apple guideline 4.2
(minimum functionality) is the usual reason an app like this is rejected. Give them a way in:

- a demo backend that opens with no login, preconfigured in the build, or
- a demo account, in App Store Connect's **Sign-in information** and in Play's **App access**.

They also want to know the app is not downloading code (Apple 2.5.2 and 4.7). A note along these
lines works:

> This app is the mobile client of Acme CRM. It connects to Acme's servers, which send a declarative
> description of each screen (JSON); the app renders it with its own native components. It does not
> download or execute code.
>
> To review it: [open the preinstalled demo / sign in with demo@acme.com, password in the
> sign-in fields]. Sign-in uses Acme's identity provider in the system browser.
>
> The camera is used for photo fields and to scan QR codes.

### Privacy answers

Answer for **your** app. The renderer itself collects nothing: no analytics, no crash-reporting
SDK, no advertising id, no tracking. So the answer depends on what your backend and any SDKs you add
receive.

- **Apple App Privacy** and **Google Play Data safety**: if the app sends user data to your
  servers, declare those data types and their purpose. "Data Not Collected" is only correct when
  the developer, which here is you, can't access what the user enters.
- **Tracking**: no, unless you add it. Don't add `NSUserTrackingUsageDescription` if you don't
  track.
- **Encryption in transit**: yes (HTTPS; release builds refuse plain http).
- **Deletion**: say how a user deletes their account and data on your backend.
- **On the device**: per-backend sign-in tokens live in the Keychain or Keystore
  (`expo-secure-store`).

### Google Play: the testing requirement for new personal accounts

Under Google's current policy, a **personal** developer account created recently can't publish to
production straight away. It first has to run a **closed test with at least 12 testers who have
opted in, for at least 14 days in a row**, and then apply for production access from the Play
Console. **Organisation** accounts are not subject to this requirement.

Plan for it:

- If the app belongs to a company, register the Play account as an **organisation** (it needs a
  D-U-N-S number). That is usually faster than the 14-day test.
- If you must use a personal account, start the closed test as soon as the first build is in. The
  14 days only count while at least 12 testers are opted in.

Google changes these rules from time to time. Check the Play Console help for the current wording
before you plan a launch date.

### Listing basics

- **Age rating**: complete the questionnaires in both consoles. A business app with no
  user-generated content inside the app itself usually gets 4+ / Everyone.
- **Screenshots**: take them on real devices or simulators at the sizes each store asks for. Web
  renderings of the React Native app are fine for checking flows, but not for the listing.
- **Category**: usually Business or Productivity.

## Related

- [React Native renderer](/native/react-native/): pointing the app at a backend, the app registry,
  signing in, compatibility.
- [Desktop & mobile](/native/): how the native renderers relate to the Mateu API.
- [Mobile app (Open on mobile)](/ux-patterns/mobile-app/): the manifest every backend serves,
  `@MobileApp`, and the "Open on mobile" header action.
