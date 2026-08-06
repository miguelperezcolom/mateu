---
title: Client-side caching
description: How Mateu makes return visits feel instant — it caches what a screen looks like (and, for screens you mark static, its data too) so navigation doesn't wait on the backend, without ever losing the server-driven UI.
---

**Status:** ✅ Implemented

## Intent

Make returning to a screen feel instant. Mateu caches what a screen *looks like* in the browser and reuses it on the next visit, so navigation no longer waits on a backend round-trip — while the server stays the source of truth for the UI. It is built into the framework: you get most of it on every renderer with no code, and you can opt a screen into the strongest form with a single annotation.

## Problem

Every Mateu screen normally asks the server what to render. That is what lets the server infer and drive the UI — but for a *declared* screen (a class and its annotations) the structure barely changes between requests, so re-fetching all of it on every visit is a round-trip you can usually avoid. On a slow connection that round-trip is exactly what makes a back-and-forth navigation feel sluggish.

## How it works

Three layers, from fully automatic to opt-in. They compose: the first paints the layout instantly, the second shrinks the follow-up, and the third removes it.

### 1. Instant structure (automatic)

The first time you open a screen, Mateu remembers its **structure** (the layout: sections, fields, tabs, columns — never the data) in the browser. On a return visit it paints that real structure immediately instead of a blank page or a generic loading skeleton, *and* still sends the normal request in the background. When the server responds, its answer replaces the prediction.

This is **stale-while-revalidate**: the cache is a prediction, the server is the authority. Because only the structure is cached — never the data — you never see stale business data, and a structure that has drifted (a new deployment, a screen that looks different for a different user) corrects itself within that one navigation.

### 2. Smaller responses (automatic)

On that background request the client tells the server which structure it already holds (an ETag). If nothing changed, the server replies with **only the data** and omits the layout — a much smaller response. So a return visit paints instantly *and* revalidates cheaply. Entirely transparent; there is nothing to configure.

### 3. Skip the round-trip — `@StaticView` (opt-in)

Some screens never change at all: a help or "about" page, a fixed reference screen, a dashboard of constants. Mark the view `@StaticView` and Mateu caches its **whole response** (structure *and* data) for the session. On a return visit within that session it renders from the cache and makes **no server call** at all.

```java
@Route("/about")
@Title("About")
@StaticView
@PlainText
public class About {
    String product = "Mateu";
    String tagline = "Model-driven UI for Java.";
    String version = "3.0";
}
```

`@StaticView` is a promise you make, much like `@Action(idempotent = true)`: you are telling Mateu the screen's content does not vary. Use it only when that is genuinely true.

**Do not** use it on a screen whose content depends on:

- data (anything loaded from a store),
- the logged-in user or their permissions,
- the current time,
- `${…}` interpolation of live state.

If you mark such a screen static, the client will keep showing the first rendering for the rest of the session. When in doubt, leave it off — layers 1 and 2 already make the return visit cheap.

The skip is **scoped to the browser session** on purpose: a full page reload always reloads the screen, so a new deployment is picked up automatically the next time the tab is refreshed — no cache-busting to manage.

## What you get for free

Layers 1 and 2 need **no code and no annotation**. Every declared screen already:

- paints its real structure instantly on a return visit, and
- revalidates with a small, data-only response when its structure hasn't changed.

It all lives in the shared frontend, so it applies identically on every renderer (Vaadin, the Redwood/Visual Builder line, and the other shells).

## Other languages

`@StaticView` has the same effect in the C# and Python backends:

```csharp
[Route("/about")]
[Title("About")]
[StaticView]
public class About
{
    public string Product { get; set; } = "Mateu";
}
```

```python
@ui("/about")
@title("About")
@static_view
class About:
    product: str = "Mateu"
```

## Turning it off / measuring

The caching is safe to leave on, but if you want to compare with and without it (for example, to measure the difference on a slow link), you can disable each layer from the browser console:

- Structure cache (layers 1–2): `localStorage['mateu-route-structure-cache-off'] = '1'`, then reload.
- Static-view skip (layer 3): it is in-memory and session-scoped, so a plain reload already re-fetches; there is nothing persistent to clear.

## Related

- [Slow connections](/ux-patterns/slow-connections/) — the transport's busy feedback, retries and offline handling that this builds on.
- [`@StaticView` in Key annotations](/reference/key-annotations/#staticview).
