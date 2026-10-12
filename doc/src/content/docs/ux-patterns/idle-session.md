---
title: Idle-session warning
description: After a period without activity in any tab, a modal counts down before signing out; "Stay signed in" keeps the session, "Sign out" goes to the app's logout.
---

**Status:** ✅ Implemented · `@Experimental`

![The idle warning counting down, focus on "Stay signed in"](/images/docs/idle-session/warning.png)

## Intent

Shared terminals — a front desk, a counter, a ward — must not stay signed in for whoever walks up next. Security policies ask for a sign-out after a period of inactivity, and users ask not to lose their work to it without warning.

## Solution

```java
@App(idleTimeoutMinutes = 15, idleWarningSeconds = 60, idleSignOutUrl = "/logout")
public class Shell implements KeepAliveHandler {

    @Override
    public void keepAlive(HttpRequest httpRequest) {
        // optional: refresh whatever "signed in" means for this app (a token, a session)
    }
}
```

After `idleTimeoutMinutes` minus `idleWarningSeconds` without activity, a modal says **"Are you still there?"** and counts down:

- **Stay signed in** (also **Esc**, and the button that has the focus) runs the app-level `_keep-alive` action — reaching the server is what renews an ordinary server session; a `KeepAliveHandler` on the app class is called too.
- **Sign out**, or the countdown reaching zero, goes to `idleSignOutUrl` with a full page load — typically the app's logout endpoint. Blank: the app's own route.

Mateu does no authentication: what "signed in" and "sign out" mean is the app's. Before navigating, a cancelable `mateu-idle-sign-out` event is dispatched on `document` (detail `{ url }`) — an app with its own sign-out (an OIDC library, say) calls `preventDefault()` and does it itself.

### Every tab counts

Activity is **shared by the tabs** of the app: each tab records its last key press, click, wheel or touch (not scroll: a shell scrolls by itself) in `localStorage` (at most every 5 s), and each tab measures idleness from the latest activity of **any** tab. Working in one tab keeps the others from warning; **Stay signed in** in one tab dismisses the warning in all; **Sign out** in one signs out the others. While the warning is up only *Stay signed in* keeps the session — a stray mouse move must not cancel a warning nobody saw.

### In YAML

```yaml
type: AppShell
idleTimeoutMinutes: 15
idleWarningSeconds: 60
idleSignOutUrl: /logout
```

## How it relates to session expiry

The two cover different ends:

| | Idle warning | [Session expiry](/ux-patterns/session-expiry/) |
|---|---|---|
| Who decides | the **client**, from the user's inactivity | the **server**, which answers 401 |
| When | before anything expires | after the token or session expired |
| What happens | a countdown; stay or sign out | the request is held; the app re-authenticates and it is retried |

They compose: if the server session has already expired when the user presses *Stay signed in*, the keep-alive request gets a 401 and goes through the session-expiry handling like any other request. Set the idle timeout **shorter** than the server's session so the warning comes first.

## Accessibility

The warning is a modal `alertdialog`, labelled and described; the focus moves to **Stay signed in** (so Enter never signs out) and is trapped; Esc stays. The remaining time is announced again at 10 seconds.

## Where it works

- **Vaadin** — the shared `mateu-idle-warning` element.
- **Redwood (Oracle VB)** — an `oj-dialog` with the same cross-tab rules.
- **React Native** — every touch counts; time in the background counts as idle; a modal with the countdown.
- **IntelliJ plugin** — IDE activity counts; a modal countdown dialog.
- Also from the C# (`[App(IdleTimeoutMinutes = 15)]`, `IKeepAliveHandler`) and Python (`@app(idle_timeout_minutes=15)`, `KeepAliveHandler`) backends.

Demo: `demo-admin-panel` → `/e2-demo` (one minute, a 30-second countdown).

## Related

- [Session expiry](/ux-patterns/session-expiry/)
- [Autosave](/ux-patterns/autosave/) — shrink the work an expiry can cost
