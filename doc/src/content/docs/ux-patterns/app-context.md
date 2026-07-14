---
title: Application context selector
description: Fix a value (the active hotel, the company, the fiscal year…) for every screen of the app.
---

**Status:** ✅ Implemented

## Intent

Fix a value at APPLICATION level — the active hotel in a PMS, the company in a multi-tenant ERP,
the business unit, the fiscal year — so every screen of the app works against it without asking
again.

## Problem

Without an app-level context, every listing and form needs its own "which hotel?" filter, users
re-select it on every screen, and nothing guarantees two screens agree on the value.

## Solution

Annotate a field of the `@UI` app class with `@AppContext`. It renders as a compact selector on
the **app header** (next to the theme toggle), visible on every screen:

```java
@UI("")
@Title("My first Mateu app")
public class BackofficeApp {

    @AppContext(label = "Hotel")
    HotelSelector hotel;      // options from a LookupOptionsSupplier

    @AppContext
    Environment environment;  // or simply an enum: its constants are the options
}
```

The field's type provides the choices:

- **An enum** — its constants become the options.
- **Any class implementing `LookupOptionsSupplier`** — searched once with an empty text (first
  page) when the app shell is built:

```java
public class HotelSelector implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(String fieldName, String searchText,
                                      Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(hotels.stream()
                .map(h -> new Option(h.id(), h.name()))
                .toArray(Option[]::new));
    }
}
```

![The Hotel context selector on the app header](/images/docs/ux-patterns/app-context.png)

## Reading the context

The selected option's value lives in the **app state** under the field's name and travels with
EVERY request, so any screen or action reads it from the `HttpRequest`:

```java
@Button
public Message greet(HttpRequest httpRequest) {
    var hotel = httpRequest.appContext("hotel");   // "2", or null when nothing is selected
    ...
}
```

An `AutoCrud` typically uses it inside `repository()`/`search(...)` to scope the data — the widget
stays fully decoupled from the screens.

## Behaviour

- **Compact select or searchable picker** — up to 7 options render as a plain select; more options
  render as a button opening a **searchable panel**: typing filters the loaded options and asks
  the server for matches beyond the first page (the `_appcontext-search-<field>` action, answered
  by the field's `LookupOptionsSupplier` or the enum constants).
- **Persistent** — the selection (and its label) is stored client-side (one entry per origin) and
  survives reloads, navigation and new tabs.
- **Uniform reactivity** — picking a different value reloads the current route, so whatever screen
  the user is on rebuilds against the new context. No per-screen wiring.
- **Cross-tab sync** — when another tab of the same origin changes the context, every open tab
  reloads and rebuilds against the new value.
- **Explicit app state wins** — the persisted context is merged under any appState entries the
  components set programmatically.
- Several `@AppContext` fields render several selectors (e.g. hotel + fiscal year).

## Other servers

The pattern is wire-level, so the .NET and Python backends emit the same selectors:

```csharp
[App("Backoffice")]
public class BackofficeApp
{
    [AppContext("Hotel")]
    public IReadOnlyList<OptionDto> Hotel() => hotels.Select(h => new OptionDto(h.Id, h.Name)).ToList();

    [AppContext] public Environment Environment { get; set; }   // enum property
}
```

```python
@app("Backoffice")
class BackofficeApp:
    @app_context("Hotel")
    def hotel(self):
        return [(h.id, h.name) for h in hotels]   # or Option(...) objects, or an Enum return type
```

## Native renderers

The native shells render the same wire field:

- **React Native** — selectors at the top of the drawer; session-scoped, picking a value remounts
  the current screen.

Like the web picker, a selector with more than 7 options gains a **search box**: typing filters
the loaded options and (debounced) asks the server for matches beyond the loaded page via the same
`_appcontext-search-<field>` action — React Native shows it under the drawer selector.

## Principles served

- **Workflow over screens** — set once, applies everywhere
- **Recoverability** — the context survives reloads; no re-selection tax
- **Single source of truth** — screens can't disagree on the active context

## See also

- [Audience projection](./audience-projection) — an `@AppContext` field named `audience` becomes a
  persona switch: `@Audience`-marked fields, buttons and menu entries filter to the selected
  audience (unset → everything visible).
