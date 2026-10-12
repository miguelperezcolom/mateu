---
title: Live header values
description: Values on the app header — a business date, a shift — that the server changes while the app is open, in every tab and, opt-in, in every open session.
---

**Status:** ✅ Implemented · `@Experimental`

![The business date and the shift on the app header](/images/docs/live-header-values/header.png)

## Intent

Operational apps show a few facts on the header that everybody works against: the hotel's **business date**, the current **shift**, a cut-off. They change rarely but for everyone at once — the night audit moves the business date, and a front desk still showing yesterday's date is a real error. A header widget built when the shell loads goes stale until the next reload.

## Solution

The app class supplies the values; each has an `id` the server addresses it by:

```java
@App(liveUpdates = true)
public class Shell implements HeaderValuesSupplier {

    @Override
    public List<HeaderValue> headerValues(HttpRequest httpRequest) {
        return List.of(
                new HeaderValue("businessDate", "Business date", hotel.businessDate()),
                new HeaderValue("shift", "Shift", shifts.current()));
    }
}
```

Then change one in either of two ways:

| From | How | Who sees it |
|---|---|---|
| an action's answer | `return UICommand.updateHeaderValue("shift", "Night");` | this tab and the other tabs of the same browser |
| anywhere on the server | `LiveHeaderValues.publish("businessDate", "13 Oct 2026");` | every open session of the app — with `@App(liveUpdates = true)` |

```java
@Toolbar
public Object closeTheDay() {
    var next = hotel.closeDay();
    LiveHeaderValues.publish("businessDate", next);   // every session, including this one
    return new Message("Day closed");
}
```

A change is announced to screen readers ("Business date changed to 13 Oct 2026") and flashes briefly on the header (not with reduced motion).

### How it travels — and why it is cheap

- **Tabs of one browser** share changes through `localStorage` (the `storage` event): a tab that learns a new value tells the others. No request.
- **Other sessions**: with `liveUpdates`, each **browser** keeps **one** event stream open — not one per tab. The tabs elect a leader through `localStorage` (a heartbeat every 5 s; a silent leader is replaced after 15 s), only the leader holds the stream, and it hands each change to the other tabs. That matters: browsers allow about six connections per host over HTTP/1.1, and a stream per tab would starve the app's own requests.
- The stream is the **existing** SSE endpoint every adapter already has (`/mateu/v3/sse/…`) running the app-level `_live-updates` action — no new endpoint, no polling. It sends the last value published for each id first (a reconnecting browser catches up), then every publish, and an empty heartbeat every 20 s for proxies. The server ends it every 5 minutes on purpose and the browser reconnects at once; that bounds the life of a stream whose browser went away without the adapter noticing.
- A shell built after a publish starts from the published value.

`LiveHeaderValues` is **in-process**: a publish reaches the sessions connected to that server. In a cluster, publish on every node (e.g. from the message listener that learns about the change).

It is all opt-in: without `HeaderValuesSupplier` there is nothing on the header, and without `liveUpdates` no stream is opened.

### In YAML

```yaml
type: AppShell
liveUpdates: true
headerValues:
  - id: businessDate
    label: Business date
    value: 12 Oct 2026
```

A static bundle carries the values but never a stream (there is no server to stream from).

## Where it works

- **Vaadin** — on the header next to the app-context pickers (`mateu-header-values`).
- **Redwood (Oracle VB)** — in the shell header, with the same tab sharing and one-stream-per-browser rule.
- **React Native** — at the top of the drawer; the stream while the app is in the foreground.
- **IntelliJ plugin** — at the top of the navigator; one background stream per session.
- Also from the C# (`IHeaderValuesSupplier`, `LiveHeaderValues.Publish`) and Python (`HeaderValuesSupplier`, `LiveHeaderValues.publish`) backends — both serve the same `/mateu/v3/sse/…` stream.

Demo: `demo-admin-panel` → **End of day** (`/e2-business-day`, F8): *Close the day* publishes, *Change shift* answers a command. Open `/` in another tab and `/e2-demo` in another browser to watch both.

## Related

- [App context](/ux-patterns/app-context/) — a value the USER picks for every screen
- [Long-running jobs](/ux-patterns/long-running-jobs/) — the same SSE endpoint
