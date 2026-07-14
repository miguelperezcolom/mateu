---
title: Audience projection
description: One declared model, projected per audience — staff vs client views of the same screen without duplicating it.
---

**Status:** ✅ Implemented

## Intent

The same screen often serves several personas: the front-desk agent needs the internal notes and the folio balance; the guest doing self check-in should see a welcome message and nothing operational. Duplicating the screen per persona forks the model and the two copies drift. Declare **one model** and mark which elements belong to which **audience**; a header switch projects the model per persona.

## Solution

Two pieces:

1. **The switch** — an [`@AppContext`](./app-context) field named exactly `audience` on the app class. It renders as a selector on the app header and its value travels with every request. An enum gives you the options for free (constants travel as their `name()`):

```java
@UI("")
public class BackofficeApp {

    enum Modo { Staff, Cliente }

    @AppContext(label = "Modo")
    Modo audience;

    // ... @Menu entries ...
}
```

2. **The marks** — `@Audience({"..."})` on any form field, `@Button`/`@Toolbar` action method or `@Menu` entry. The values are matched (case-sensitively) against the current `audience` app-context value:

```java
@UI("/checkin")
public class CheckIn {

    String bookingCode;                 // every audience

    @Audience("Cliente")
    @PlainText @Multiline
    String welcome = "¡Bienvenido!";    // only in the guest projection

    @Audience("Staff")
    @Multiline
    String internalNotes;               // only in the staff projection

    @Audience("Staff")
    @Stereotype(FieldStereotype.money)
    BigDecimal folioBalance;

    @Audience("Staff")
    @Toolbar
    public Message audit() { ... }      // the button disappears for guests
}
```

An element may declare several audiences: `@Audience({"Staff", "Manager"})`.

## The unset → everything rule

When **no audience is selected** (the selector is empty), **everything is visible**: no projection is active, so the developer — or a supervisor — sees the full model. Selecting an audience activates the projection: elements marked for *another* audience disappear; unmarked elements always stay.

| Current audience | Unmarked element | `@Audience("Staff")` element |
|---|---|---|
| *(unset)* | shown | shown |
| `Staff` | shown | shown |
| `Cliente` | shown | **hidden** |

## Not access control

:::caution[This is a UX projection, not security]
`@Audience` decides what is **rendered**, driven by a client-side selector any user can change (or clear — which reveals everything). Sensitive data must be protected with the identity annotations — [`@EyesOnly`](/reference/key-annotations/), `@ReadOnlyUnless`, `@DisabledUnless` — which resolve against the JWT Bearer token. The two compose naturally: `@EyesOnly(roles = "staff") @Audience("Staff")` keeps the element out of the guest *projection* **and** out of reach of non-staff *callers*.
:::

## Where it applies

- **Form fields** (including inline subforms and listing columns that go through the standard field filter).
- **Action methods** — `@Button` and `@Toolbar` buttons are dropped from the page when their audience doesn't match.
- **Menu entries** — `@Menu` fields and methods of the app class.

The annotation is composable (semantic annotations can embed it), and the same behaviour ships in the C# (`[Audience("staff")]`) and Python (`Audience("staff")` marker / `@audience(...)` method decorator) backends.

## When to use it

Use it whenever one screen serves several personas whose *relevance* differs but whose *rights* don't have to (kiosk vs desk mode, agent vs customer view, novice vs expert density). Pair it with [`@AppContext`](./app-context) for the switch and with the security annotations when visibility must actually be enforced. Demo: `/audience-demo` (switch the "Modo" selector between Staff and Cliente).
