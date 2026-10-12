# Universal link / App Link templates (NOT published)

These two files make `https://mateu.io/add?...` open the Mateu mobile app when it is installed
(iOS universal links, Android App Links). They are **templates**: they cannot be filled without the
owner's store accounts, so they live here, outside `public/`, and are not deployed. A half-filled
association file would be worse than none — the OS caches it.

| File | Fill in | Where it comes from |
|---|---|---|
| `apple-app-site-association` | `TODO_TEAM_ID` (and the bundle id, if `io.mateu.native` changes) | Apple Developer account → Membership → Team ID |
| `assetlinks.json` | `TODO_SHA256` (and the package, if `io.mateu.mobile` changes) | Play Console → App integrity → App signing key certificate (SHA-256); add the upload key too for internal builds |

Once filled, the owner moves them to `doc/public/.well-known/` so they are served at:

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
