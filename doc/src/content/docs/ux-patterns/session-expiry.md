---
title: Session expiry without losing work
description: A 401 mid-action hands control to your re-auth flow and retries the same request — the form state survives.
---

**Status:** ✅ Implemented

## Intent

The user spends twenty minutes on a form; the token expires; Save returns 401. The naive handling
— redirect to login — destroys the work. The right contract: **pause the action, re-authenticate,
retry it**; the page never navigates, the state never unloads.

## Solution

When any Mateu request returns **401**, the api client does not fail the action. It hands control
to the app's re-auth flow and retries the same request once afterwards — the original action then
completes as if nothing happened.

Plug your re-auth flow (programmatically, from your app's bootstrap script):

```ts
import { onSessionExpired, setAuthToken } from 'mateu';

onSessionExpired(async ({ retry, giveUp }) => {
    const ok = await openLoginPopup();          // your flow: popup, refresh token, SSO iframe…
    if (ok) {
        setAuthToken(ok.token);                 // Mateu's token store (a cookie by default)
        retry();                                // re-runs the failed request, action completes
    } else {
        giveUp();                               // fail normally (user declined)
    }
});
```

Or listen to the DOM event (same contract, no imports):

```ts
document.addEventListener('mateu-session-expired', e => {
    e.preventDefault();                         // claim it
    const { retry, giveUp } = e.detail;
    // …re-authenticate, then retry() or giveUp()
});
```

- The retry happens **once** per request (no loops when the new token is also rejected).
- Both web renderers raise it: the Vaadin one from its axios client, the Redwood one from its
  bridge's single request path.
- In the Redwood renderer, 401s that arrive **together** share one event: a tab back from the
  background whose periodic calls (inbox badge, banner sync) and the user's action all bounce at
  once triggers a single refresh, and all of them are retried with its token. A request whose
  token was already replaced while it was in flight (the `visibilitychange` refresh landed first)
  is simply resent, without raising the event.
- A **403 is not a session problem** and never raises the event: the server knows who you are and
  refuses this (an undeclared action, a missing role). Redwood shows "No tienes permiso para hacer
  esto." instead of the session message.
- With **no handler registered**, behavior is exactly as before: the request fails — the guard is
  fully opt-in. The exception is a UI that declares [sign-in providers](/deploy/sign-in/): then the
  built-in sign-in answers (next section).
- Because the page never navigates, everything holds: form values, wizard position, scroll,
  selection. Combine with the [dirty guard](/ux-patterns/partial-forms/) and
  [autosave](/ux-patterns/autosave/) for defense in depth.

## Sign-in providers: the built-in answer

When the UI declares [sign-in providers](/deploy/sign-in/) (`mateu.auth.providers=…`), the served
page carries them in `<meta name="mateu-auth">` and both web renderers (Vaadin and Redwood) sign the
user in themselves — no bootstrap script to write:

- **At boot**, with `loginOnStart` (the default) and no session, one provider is followed straight
  away and several are offered in a chooser ("Continue with Google", "Continue with Acme SSO"…).
  Nothing loads behind it. `loginOnStart: false` loads the app and waits for the first 401.
- **An OIDC provider** runs Authorization Code + PKCE (S256) with `state` and `nonce`: the browser
  goes to the IdP's authorize endpoint and comes back to the mount's root (register
  `<origin><mount>/` as the redirect URI); the code is redeemed, the URL is cleaned and put back on
  the route the user was on. The access token goes where [the Bearer token is
  kept](/java-user-manual/advanced/security/#where-the-browser-keeps-the-bearer-token) — a
  `SameSite=Strict` cookie by default, its refresh token in `sessionStorage`, never in the cookie —
  and is refreshed a minute before it expires.
- **A redirect provider** (the framework owns the login: Spring's `oauth2Login`, SAML, form login…)
  sends the browser to its `url` with `continue=<the current URL>`.
- **A 401** that no `onSessionExpired` handler and no `mateu-session-expired` listener claimed is
  answered by the refresh token and the request is retried, as above. Without one (or when the
  refresh is refused), the user signs in again — straight to the only provider, coming back to this
  URL, or through the chooser, which they may decline (the request then fails as it would have).
- **Sign out** appears in the app header while the built-in sign-in holds a session (`signOut()`
  from `mateu` does the same): the tokens go, then the IdP ends its session (`end_session_endpoint`
  with `id_token_hint`, back to the mount) or the browser goes to `logoutUrl`.
- A failed attempt (the IdP answered an error, the code could not be redeemed) always shows the
  chooser with a message, even for a single provider — a broken IdP is never a redirect loop.

**Your own handler still wins**: an `onSessionExpired` handler, a claimed `mateu-session-expired`
event, or `configureAuthToken({ provider })` (the app keeps the token itself, so it also owns
sign-in) take precedence over the built-in.

## Container-managed login (basic auth / form login): the invisible 302

Behind container-managed auth there is no 401: when the server session dies (e.g. the server
restarted), API calls answer a **302 to the login page** — and the browser follows it
*transparently*, so the client sees a 200 whose body is the login page's HTML instead of JSON. The
user would just see the action silently do nothing.

Mateu detects this shape on every response — the request was redirected (the final URL differs
from the requested one) **and** the payload is not JSON — and sends the **browser** to that final
URL so the user can log in again. A redirect that still answers JSON (e.g. a trailing-slash
rewrite) is left alone. This is built into the shared api client; nothing to configure.

One limit: if the login page lives on **another origin** without CORS, the browser hides the final
URL from the client — that case surfaces as a plain network error instead.

## Related

- [Idle-session warning](/ux-patterns/idle-session/) — the client-side counterpart: warn before anything expires
- [Autosave](/ux-patterns/autosave/) — shrink the window of unsaved work
- [Undo](/ux-patterns/undo/) — recover from the opposite problem

**See it live in the Explorer:** [Session expiry (401 → retry)](https://explorer.mateu.io/behaviour/app/session-expiry)
