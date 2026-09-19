# Mateu reference renderer (Core, zero-dependency)

A **minimal, dependency-free** renderer for the Mateu wire — one HTML file and one JS module, no
framework, no build step. It renders a Mateu UI with **nothing but the wire itself**.

## Why this exists

It is the concrete proof of the portability claim (see
[Portability & exit strategy](../../doc/src/content/docs/mateu-about/portability-and-exit.md)): a
Mateu UI definition is a portable asset that another engine can render. It is also the **starting
skeleton** for anyone writing their own renderer / design system — the "1-day Core renderer".

It targets the **Core** conformance level (forms, field types, validation, actions, CRUD listings,
text). Anything beyond that renders as an explicit `<mateu-unsupported>` placeholder — the same
contract the first-party renderers honour, and what conformance measures.

## Run it

No install, no build:

```bash
# serve this folder statically (any static server works)
cd frontend/reference-renderer
python3 -m http.server 8090
# open http://localhost:8090 — set the Backend URL to a running Mateu app (e.g. http://localhost:8080)
```

Point it at any Mateu backend (any of the Java/​.NET/​Python servers, since they all emit the same
wire) and enter a route.

## How it works (the whole protocol)

1. **One call:** `POST {backend}/mateu/v3/sync/{route}` (route in the path, `_no_route` when empty) with
   a body of `{ route, actionId, componentState, appState, parameters, … }`. The route load uses
   `actionId: ""`.
2. **Apply the envelope** (`UIIncrementDto`): run `commands` (`SetWindowTitle`, `navigateTo`), then
   paint the `Replace` `fragments`.
3. **Walk the component tree:** each node's real type is `metadata.type`; `Card` content lives in
   `metadata.content`; fields carry `fieldId`/`label`/`dataType`/`stereotype`/`options`; values come
   from the fragment `state` / `initialData`.
4. **Post actions back:** a button posts its `actionId` with the current `componentState`; the
   response is another increment, applied the same way.

See `renderer.mjs` — it is deliberately small and commented. The normative contract it implements is
in `doc/src/content/docs/reference/wire-specification.md` and
`doc/src/content/docs/design-systems/renderer-contract.md`.

## Scope & honesty

- **This is a teaching / proof artifact**, not a first-party product renderer. It covers Core; it does
  not implement overlays (`Add` fragments), the full command set, the fetch plan for external sources,
  or the rich catalogue — those are Standard/Full and are where a real renderer keeps going.
- The first-party conformance harness (`e2e/conformance.sh`) drives renderers built on the shared
  `libs/mateu` plumbing; this standalone renderer demonstrates the wire→DOM mapping directly. Wiring
  it into that harness is a follow-up.
