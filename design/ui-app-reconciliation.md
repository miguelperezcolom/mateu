# @UI / @App reconciliation — design + go/no-go

**Status:** design for review — **go/no-go needed before touching the annotation processor.**
Part of Phase 5 (coherence-plan #5). The last vocabulary rename after `modelView`→`viewModel`
(#534), `definition`→`layout` (#535) and R2 App≠Home (#542/#543).

## The problem (idea #5)

The "app" concept is fragmented across two annotations with different jobs:

- **`@UI("/path")`** — the ONE routing annotation (since `@Route`/`@Routes`/`@HomeRoute` were
  deleted). It marks ANY routed view — a page, a CRUD, OR an app — and carries the path. Resolved by
  the **annotation processor at compile time** (it generates a framework controller per `@UI` class).
- **`@App(...)`** — a chrome MODIFIER: variant, layout, themeToggle, commandCenter, chromeless,
  requires. **No route.** A class becomes an app by being `@UI("/shop")` **and** `@App(...)` **and**
  having `@Menu` fields.

So a newcomer who reaches for `@App` to "declare an app" is wrong: `@App` decorates, `@UI` routes.
`@UI` is also overloaded — its name says "a UI", but it means "a routed view", app or not.

## Accepted target (idea #5)

> An **App** is a UI served at a base path: it has a base path, chrome (menu/variant) and a set of
> routes. `@App` should be the single thing you reach for to declare one.

## Proposed change (additive, aliased)

**Give `@App` an optional route: `@App("/shop")` ≡ `@UI("/shop") @App`.**

- `@App("/shop")` on a class declares BOTH that it is an app AND its base path — one annotation.
- `@UI("/path")` stays exactly as-is for **non-app** routed views (a page, a CRUD, a definition-bound
  screen). Nothing that works today breaks.
- A class may still write `@UI("/shop") @App(...)` — the old spelling keeps working; if both carry a
  path, `@App`'s wins (or they must agree — TBD, see open questions).

This makes `@App` the "declare an app" annotation the mental model expects, while keeping `@UI` as the
generic router. It is the smallest change that satisfies #5 without a mass rename of every `@UI` page.

## Blast radius

The heavy part is that **`@UI` is compile-time**: the AP generates a controller per routed class in
EACH framework adapter. Making `@App("/route")` route means the AP must treat `@App`-with-a-route as a
routing annotation too.

| Layer | Site | Change |
|---|---|---|
| Annotation (uidl) | `App.java` | add `String value() default ""` (the route); keep chrome attrs |
| AP indexer | `MateuUIIndexerProcessor` | index `@App`-with-route classes into `META-INF/mateu/ui-registrations`, same as `@UI` |
| AP core | `MateuUIAnnotationProcessor`, `MateuIndexedUIProcessor`, `UISourceFileGenerator` | recognise `@App("/route")` as a routed class; generate its controller with the route |
| Adapters (×5) | mvc / webflux / micronaut / quarkus / helidon controller templates (`index.ftl` etc.) | no change if the generator feeds them a route the same way — VERIFY each |
| Core runtime | `ViewTypeClassifier.isApp`, `AppMetadataExtractor`, `AppMapper` | already key off `@App`; a route on it changes nothing they read (they read chrome, not the route) |
| Route registry | resolution | a class routed via `@App("/x")` must resolve exactly like `@UI("/x")` |

## Risks / open questions

1. **Two paths.** If a class has both `@UI("/a") @App("/b")`, which wins? Proposal: `@App` wins; but
   simplest safe rule may be "they must match, else a compile error" — decide before implementing.
2. **`@App` with no value** (`@App` bare, the common case today) must keep meaning "chrome for the
   `@UI` route on the same class" — the AP must NOT treat a value-less `@App` as a route.
3. **Per-adapter parity.** Five controller generators. Each must emit the `@App("/route")` controller
   identically to `@UI`. This is where the regression risk concentrates — a golden/e2e per adapter.
4. **Ports.** `.NET [App]`/`[UI]` and Python `@app`/`@ui` mirror the same split. Parity means the same
   `[App("/route")]` / `@app("/route")` alias there — reflective, not AP, so lower risk but still work.
5. **Docs churn.** Every "declare an app with `@UI` + `@App`" example becomes `@App("/route")`.

## Recommendation

**Do it as its own focused effort, design-approved first** — like R2. It is additive (both spellings
work) so back-compat is safe, but it rewires compile-time routing across five adapters, so it needs:
its own PR, an AP unit test that `@App("/route")` indexes + generates a controller, a per-adapter
smoke (or at least the mvc e2e proving an `@App("/route")` app boots), and port parity. **Hold for
go/no-go** on: (a) whether to do it now vs. after Phase 6, and (b) the two-paths rule (open question 1).

**Alternative if the AP change is judged too risky for now:** ship only the *conceptual + docs* half —
state that "an App = `@UI` route + `@App` chrome + menu", make the docs lead with `@App`, and defer the
`@App("/route")` single-annotation sugar. That satisfies the mental-model goal cheaply, leaving the AP
untouched.
