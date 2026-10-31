# Universal link / App Link templates

These two files make `https://mateu.io/add?...` open the Mateu mobile app when it is installed
(iOS universal links, Android App Links). The PUBLISHED copies are `doc/public/.well-known/` (served
with `Content-Type: application/json` by the rules in `doc/public/_headers`); these templates keep the
placeholders still to fill. The published files carry only real values — a half-filled association
file is worse than none, the OS caches it.

Status (2026-10-31): the AASA file carries the Team ID `2V77LVXCM8`; `assetlinks.json` carries the
key the GitHub-released APK is signed with. Still to add once the Play app exists: the **Play App
Signing** key (Play Console → App integrity), to BOTH copies of `assetlinks.json`.

| File | Fill in | Where it comes from |
|---|---|---|
| `apple-app-site-association` | `TODO_TEAM_ID` (and the bundle id, if `io.mateu.app` changes) | Apple Developer account → Membership → Team ID |
| `assetlinks.json` | `TODO_SHA256` (and the package, if `io.mateu.app` changes) | Play Console → App integrity → App signing key certificate (SHA-256); add the upload key too for internal builds |

They are served at:

- `https://mateu.io/.well-known/apple-app-site-association` — **no file extension**, served with
  `Content-Type: application/json`;
- `https://mateu.io/.well-known/assetlinks.json` — `application/json`.

Both must be served over **HTTPS**, with a 200 and **no redirects** (Apple and Google refuse a
redirected association file). Check the static host serves the extensionless AASA file as JSON
(most need an explicit header rule), then verify with Apple's AASA validator / `swcutil` and with
Google's Digital Asset Links API
(`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://mateu.io&relation=delegate_permission/common.handle_all_urls`).

The app side declares the same domain: `applinks:mateu.io` in the iOS Associated Domains
entitlement and an `autoVerify` intent filter for `https://mateu.io/add` on Android (the React
Native app's `app.json`). Design: `design/mobile-app-hub.md`.
