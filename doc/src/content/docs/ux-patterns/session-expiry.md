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
import { onSessionExpired } from 'mateu';

onSessionExpired(async ({ retry, giveUp }) => {
    const ok = await openLoginPopup();          // your flow: popup, refresh token, SSO iframe…
    if (ok) {
        localStorage.setItem('__mateu_auth_token', ok.token);  // where Mateu reads the Bearer
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
- With **no handler registered**, behavior is exactly as before: the request fails — the guard is
  fully opt-in.
- Because the page never navigates, everything holds: form values, wizard position, scroll,
  selection. Combine with the [dirty guard](/ux-patterns/partial-forms/) and
  [autosave](/ux-patterns/autosave/) for defense in depth.

## Related

- [Autosave](/ux-patterns/autosave/) — shrink the window of unsaved work
- [Undo](/ux-patterns/undo/) — recover from the opposite problem
