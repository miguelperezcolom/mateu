---
title: Slow connections
description: How Mateu behaves when the backend is slow or the network is unreliable — busy feedback, per-action timeouts, retries, offline banner and loading skeletons.
---

**Status:** ✅ Implemented

## Intent

Keep an app usable when the backend is slow or the connection is poor, without every screen having to handle it. All of this is built into the framework's transport and shell: you get it on every renderer with no code, and you can tune it per action when the defaults do not fit.

## Problem

On a fast backend nobody notices the network. On a slow one, the same UI produces a predictable sequence of bad outcomes:

- The user presses **Save**, nothing changes for a moment, and they press it again — now there are two rows.
- A page shows nothing at all for several seconds and reads as broken rather than loading.
- A failure surfaces as `Network Error` or `timeout of 60000ms exceeded`, which tells the user nothing about what happened or what to do.
- The connection drops, and the app explains it once per click, five seconds at a time.

## What you get for free

### Busy feedback on the control you pressed

The pressed control is marked busy — dimmed and pulsing, `pointer-events: none`, `aria-busy="true"` — for as long as the action runs. This is deliberately *local*: the global loading veil answers "is the app busy?", but the question a user on a slow link is actually asking is "did my click register?".

The marker is the `data-mateu-pending` attribute, so a renderer or an app stylesheet can restyle it:

```css
[data-mateu-pending] { outline: 2px solid var(--brand-accent); }
```

> The busy state animates the control's own opacity rather than drawing a `::after` spinner. A pseudo-element on a shadow host is not painted, and `vaadin-button`, `ui5-button` and `oj-c-button` are all shadow hosts — a pseudo-element spinner would show on a plain `<button>` and silently vanish everywhere else.

### No double submission

While a given action of a given component is in flight, the same action of the same component is refused before any request is built. This covers the paths the loading veil never could: `background` actions, and keyboard shortcuts, where there is no pointer to block.

**Reads are exempt from the block.** The guard exists because a second `POST` of a write means a second row; a second read just means fresher data. Blocking reads would break type-ahead — the search for `mad` would be dropped while the search for `ma` was still in flight, leaving the user looking at stale results.

### Loading skeletons on navigation

A route with nothing on screen yet renders a skeleton — a title bar and a few field pairs — after 400 ms. Below that threshold the request usually wins and the user sees nothing at all, which is the right outcome for a wait too short to explain.

Once a page HAS content, a re-load keeps the old content under the veil instead: stale content beats a skeleton that throws away context.

### Failures in plain language

Transport failures are classified and translated before they reach the user. `Network Error` becomes *"No connection. Your changes have not been sent — check your network and try again."*; a timeout becomes *"The server is taking too long to answer. Your changes may not have been saved."* An aborted request (a navigation, the loop breaker) says nothing at all, because it is not news.

When the framework declined to retry on the user's behalf, the toast carries a **Retry** control that re-runs the whole action — request and response handling — so the result lands on the page as if it had worked the first time.

### Offline banner

Losing the connection is a *state*, not an event, so it gets a standing strip at the top of the page rather than a toast, and the page is pushed down instead of covered. Recovery is announced briefly before the strip retires.

Reachability is not taken from `navigator.onLine` alone — that flag reports the link, not the path, and says "online" on a captive portal or a dead uplink. It is used as a hard negative; the positive comes from our own traffic actually coming back.

### Automatic retries, for reads only

A read that hits a timeout or a 5xx is re-sent automatically, up to twice, with an exponential backoff and ±25 % jitter. The route load, listing searches, lookup searches and global search are all recognised as reads.

**Writes are never retried automatically.** When a request times out the client does not know whether the server processed it, so repeating a `create` risks a silent duplicate. Writes fail once and offer the user an explicit Retry, where the decision is theirs and informed.

## Tuning it per action

One global 60-second ceiling cannot serve both a type-ahead lookup, which should give up in seconds so the user can retype, and a report export, which may legitimately run for minutes.

```java
// Give up quickly: the user is waiting on this one.
@Action(timeoutMillis = 5000)
public void quickLookup() { … }

// Batch work: a long ceiling, and safe to re-send after a network blip.
@Action(timeoutMillis = 120000, idempotent = true)
public Message recalculateTotals() { … }
```

`idempotent = true` declares that re-running the action cannot apply the same change twice, so the client may retry it by itself. Use it only for genuine reads or naturally idempotent writes — reads are detected automatically, so this flag is for the cases the framework cannot infer.

Both attributes default to "safe": no declaration means the client's own timeout applies and nothing is ever re-sent without the user asking.

### C\#

```csharp
[Button, ActionOptions(TimeoutMillis = 5000)]
public Message QuickLookup() => …;

[Button, ActionOptions(TimeoutMillis = 120000, Idempotent = true)]
public Message RecalculateTotals() => …;
```

### Python

```python
@button()
@action_options(timeout_millis=5000)
def quick_lookup(self): ...

@button()
@action_options(timeout_millis=120000, idempotent=True)
def recalculate_totals(self): ...
```

## Verifying it

`e2e/slow-network-probe.mjs` drives a running app under a throttled, failing and offline network and asserts what the user sees — skeleton, busy control, no double submit, banner, plain-language error, working Retry, read-recovers/write-does-not. Run it against any SUT app:

```bash
cd e2e && node slow-network-probe.mjs
BASE=http://localhost:8081 node slow-network-probe.mjs
```

It exits non-zero on the first failed check, so it can gate a change to the transport layer.

## Related

- [Empty states and skeletons](/ux-patterns/empty-states-and-skeletons/) — the developer-declared `Skeleton` component
- [Autosave](/ux-patterns/autosave/) — `background` actions, which are exempt from all of the above by design
