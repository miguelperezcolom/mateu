# Mateu mobile: one generic app, many UIs (the "Authenticator" model)

Status: **proposed** (Miguel, 2026-10-12). Timing: decide before/after beta.

## Idea

Publish ONE generic app ("Mateu") in the App Store and Google Play. It renders any Mateu UI natively
(the React Native renderer already speaks `/mateu/v3/*` to any backend). Users add UIs by scanning a
QR code, exactly like Google Authenticator adds accounts:

| Google Authenticator | Mateu app |
|---|---|
| QR `otpauth://totp/Issuer:user?secret=…&issuer=…` | QR `https://mateu.io/add?u=<baseUrl>` (universal link) or `mateu://add?u=<baseUrl>` |
| an "account" = issuer + user + icon | a "UI" = name + base URL + icon (from the server's manifest) |
| local list, no Google account | local list, no "Mateu" account |
| add by QR or by typing the key | add by QR or by typing the URL |
| remove, reorder, search | the same, plus selecting which UI is open |
| "Transfer accounts" (export QR) | "Export my UIs" QR: the list of URLs only, never sessions or tokens |

**Key difference:** an Authenticator QR carries a SECRET; ours carries NO secret, only the URL.
Credentials are entered at login (OIDC). A photographed or forwarded QR grants nothing: at worst it
adds an entry to the list.

## Pieces

### 1. The QR and the deep link
- Payload: `https://mateu.io/add?u=<urlencoded baseUrl>[&r=<route>]`. It is a universal link (iOS
  Associated Domains) and an App Link (Android): the system camera opens the app if it's installed,
  else `mateu.io/add` shows the store badges and the QR again. In-app scanning parses the same format.
  `mateu://add?...` is accepted too.
- Optional `r` = route to open (the "Open on mobile" of a specific screen).
- Optional, enterprise: `s=<signature>` over `u` with a key the company configures (see Security).

### 2. The UI manifest (server side, small)
`GET <baseUrl>/mateu/v3/manifest` (JSON, public, cacheable):
```json
{ "name": "Acme CRM", "shortName": "CRM", "icon": "<url or data uri>", "themeColor": "#1f6feb",
  "wireVersion": "3", "minAppVersion": "1.0.0",
  "auth": { "type": "oidc", "issuer": "https://auth.acme.com/realms/acme", "clientId": "mateu-mobile",
            "scopes": ["openid","profile"] } }
```
- Name, icon and colours come from the app (`@App` / YAML app shell), so a rename or new icon reaches every
  phone without re-scanning.
- Served by all five Java adapters, .NET and Python (shared builder in core, like `IndexPage`).
- `auth` is optional: an app with no auth is "open". Mateu doesn't authenticate; the manifest only tells the
  client which identity provider the host app trusts (consistent with the `PrincipalResolver` model).

### 3. Authentication per UI
- OIDC Authorization Code + PKCE via the system browser (`expo-auth-session` / AppAuth), with a per-UI
  redirect.
- Tokens are kept in the Keychain/Keystore (`expo-secure-store`), separately for each UI, with refresh.
- Requests carry `Authorization: Bearer`. The backend's framework validates the token and Mateu reads the
  resulting principal.
- Logout clears that UI's tokens only.

### 4. The app (React Native)
- **Home:** the list of UIs (icon, name, domain) with add (QR / URL), remove, reorder, search and
  "export my UIs" (QR).
- **Open a UI:** the existing React Native renderer against its base URL. Each UI keeps its own session and
  state (navigation stack, app context).
- **Switch between UIs:** a switcher, such as a long-press on the header or the drawer's top.
- **Offline:** the list and the icons are cached; opening a UI needs the network (the existing
  slow-network banner covers degradation).
- **Push notifications:** later, wired to the existing notification inbox (`NotificationsSupplier`).

### 5. Web: "Open on mobile"
- An opt-in app header action, `@App(mobileQr = true)` (plus `mobileQr: true` in a YAML `type: AppShell`,
  and the same in the .NET/Python ports).
- On desktop it shows a dialog with the QR for the current app, optionally with the current route.
- On a phone it shows an "Open in the Mateu app" button instead (the universal link).
- Rendered by the shared web lib (Vaadin) and Redwood. The QR is generated client-side by a small
  dependency-free encoder, or a permissively licensed one; it must pass the licence check.

### 6. Enterprise
- **MDM managed configuration** (AppConfig on iOS, managed configurations on Android): the company pushes a
  list of UIs, optionally locked so users can't remove them, and/or an allow-list of domains.
- **Signed QR codes:** when a company configures a public key via MDM, the app only accepts QR codes whose
  `s` verifies.

## Security
- HTTPS only; plain HTTP is refused, with a flag for local development builds.
- **Adding requires confirmation** and shows the domain prominently, plus the manifest's name and icon.
  This is phishing protection: a QR can come from anyone.
- No secrets in QR codes, nor in the export QR. Tokens never leave the secure store.
- Manifest and wire version are checked. A UI that needs a newer app shows "Update the app".
- An optional domain allow-list (via MDM) for enterprise devices.

## Store review strategy
- **Apple 4.7 / 2.5.2:** the app doesn't download or execute code; it renders a declarative JSON model with
  native components. Precedent: thin clients such as SAP Fiori Client, Power Apps and Salesforce.
- **Apple 4.2 (minimum functionality):** the app must be useful without the reviewer's own account. Ship it
  with a "Try a demo" entry (`demo.mateu.io`) preloaded, and give the reviewer notes and a demo login if a
  demo needs one.
- **Google Play:** same approach; declare the deep-link domain (Digital Asset Links).
- Accounts: Apple Developer Program (99 $/year) and Google Play (25 $ once) — the owner's.
- Bundle ids: `io.mateu.app` (Android) / `io.mateu.app` (iOS): align them, or keep both as they are.

## Phases
1. **Server:** the manifest endpoint (Java 5 adapters + .NET + Python) and `@App(mobileQr)` + YAML key + the
   web QR dialog (Vaadin + Redwood). Small.
2. **App MVP:** UI list (add by URL/QR, remove, reorder), open a UI, per-UI OIDC, universal links, export QR.
   Internal builds via EAS (TestFlight / internal testing).
3. **Store release:** listings, the reviewer demo, privacy labels (no tracking; only what each UI's own
   backend handles).
4. **Enterprise:** MDM config, signed QR codes, domain allow-list. Then push notifications.

## Open questions
- Before or after the beta? (Recommendation: phase 1 can ship in the beta; phases 2–4 right after.)
- Should the app's own brand be "Mateu", or white-labelable per company (a later, separate build)?
- iOS/Android bundle ids: unify them?
