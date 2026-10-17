# Wire conformance corpus

The wire is the contract: any server can serve any renderer. Three servers emit it — Java (the
reference), .NET and Python — and until now each proved that with **its own** assertions, written
next to its own code.

That verifies "the port does what the port does", not "the port meets the spec". The practical
difference is who carries the work: with per-port assertions, a new feature has to be walked into
three codebases by whoever knows all three. With a shared corpus, a port can fail **on its own**, in
its own CI, and its owner sees it without anyone else intervening.

This directory is that corpus.

## Shape

```
conformance/
  cases/
    <case>/
      case.md         what the case pins, and why it is worth pinning
      expected.json   the normalised wire the three servers must produce
      request.json    optional: pin a SECOND request instead of the first load
```

A case with a `request.json` (`route`, `consumedRoute`, `actionId`, `componentState`, each
optional) is rendered by sending that request to the case's fixture type — how an interaction step
(the shell's content load, an action) is pinned, not only the first render. The second-request
cases: `app-no-home-content`, `crud-search`, `crud-new`, `crud-edit`, `crud-view`,
`wizard-step-2`, `action-effects` (messages + a command), `drawer` (an overlay), `rejected-save`
(the server-side validation re-check) and `error-boundary` (an unexpected exception).

## The contract

Each case names a **fixture** that every server implements with the same semantics — same route,
same fields, same declarations. Rendering it must produce the same normalised wire.

`expected.json` is generated from the Java reference and then **frozen**: from that point it is the
spec, and a change to it is a change to the contract, reviewed as such. Regenerating it because a
port disagrees is exactly the move this corpus exists to prevent.

## Normalisation

Raw wire carries values that legitimately differ between servers and between runs — generated
component ids, ordering of map-like structures, absent-vs-null. Comparing those would make the
corpus flag noise, and a check that reports noise gets ignored.

So both sides normalise before comparing:

- **drop** generated identifiers (`id` values the server invents) — but NOT an action's `id`
  (inside `actions[]`): that is the name the client sends, so a missing or renamed action is a
  contract break;
- **drop** members at their default — `null`, `[]`, `{}`, `false`, `0`, `""` — because the wire's
  rule is **"absent == default"**: a producer may omit a member at its type's zero value or send it,
  and a reader must treat both alike (Java sends them, the ports mostly omit them);
- **except** the members whose zero is NOT their absent value, which a producer must send
  explicitly and the normaliser therefore KEEPS at `false`/`0`: `duration` (0 = a sticky toast;
  absent = the renderer's default timeout), `visible`, `opened`, `open`, `searchable`, `centered`,
  `asideSticky` (absent = true) and `debounceMillis` (0 = no debounce; absent = 800). The list is
  `MEANINGFUL_ZERO` in the three runners and lives in the wire specification too;
- **mask** the error boundary's per-request reference (`Reference: <ref>`);
- **sort** object keys;
- keep everything that describes *what the screen is*: types, field ids, labels, data types,
  actions, layout structure.

The normaliser is small on purpose and lives with each runner, so a port needs no Java to run the
corpus.

## Running it

| Server | Command |
|---|---|
| Java | `cd backend/shared/core && mvn test -Dtest=WireConformanceTest` |
| Python | `cd backend/python && python -m pytest tests/test_wire_conformance.py` |
| .NET | `cd backend/dotnet && dotnet test --filter WireConformance` |

Regenerating the goldens (Java only, and a reviewed act):

```bash
cd backend/shared/core && mvn test -Dtest=WireConformanceTest -Dconformance.write=true
```

## Known port differences

Some cases cannot be mirrored member for member, and that is information, not an obstacle:

- **.NET has no property-level KPI.** `[Kpi]` is valid on a class or a method; Java's `@KPI` is a
  field marker. The `page-header` fixture therefore omits it on .NET rather than pretending.

- **A CRUD has a mediator in Java and none in the ports.** Java answers the first load of a CRUD
  (an `AutoCrud`, or a listing declaring an interaction capability) with a MEDIATOR app shell and
  the listing on a second, content load; .NET and Python answer the listing directly. The MEDIATED
  cases (`crud`, `crud-grouped`, `listing-navigable`) therefore pin the content load — the Java
  runner issues it — and leave out, in all three runners, the mediator PROTOCOL around it: the
  content component's `actions` (Java lets New/View/Delete bubble to the mediator, the ports answer
  them in place) and its private routing state (`initialData`/`state`). Everything the renderer
  draws is pinned; the action list itself is pinned by the non-mediated listing cases.

- **The CRUD's record forms answer on different routes.** Java's mediator answers `/new`,
  `/{id}/edit` and `/{id}` on the crud's own route (where every later action goes back to); the
  ports answer on the record's route. The `crud-new`/`crud-edit`/`crud-view` cases leave the form
  component's `route` out on every side (`MEDIATED_FORMS`), besides the mediator protocol above.

- **The error boundary lives in the HTTP adapter in the ports.** Java answers an exception inside
  `RunActionUseCase`; .NET (`MateuErrors`) and Python (`mateu_core.errors`) in the adapter. Their
  runners wrap the handler exactly as the adapter does, so `rejected-save` and `error-boundary` pin
  what travels.

- **A wizard is a mediator in Java too.** Java's wizard advertises a `*` catch-all and keeps its
  position in its own state; the ports list `next`/`back`/`skip`/the completion and keep `__step`.
  The `wizard` case therefore leaves out, in all three runners, its `actions` and its
  `initialData`/`state`, like the mediated CRUD cases; everything it draws is pinned. Java names a
  step after its field and the ports number them, so the port fixtures supply the step titles
  through `StepTitle(n)` / `step_title(n)`.

Recording these is the point: a difference nobody wrote down is a difference somebody rediscovers.

## Adding a case

1. Add the fixture to all three servers, with the same semantics.
2. Add `cases/<name>/case.md` saying what it pins.
3. Generate `expected.json` from Java.
4. Run the other two. If they differ, that is the corpus doing its job: either the port has a gap,
   or the case is not expressible there and `case.md` should say so.
