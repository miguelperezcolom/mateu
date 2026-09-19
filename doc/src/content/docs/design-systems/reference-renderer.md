---
title: "The reference renderer (write your own in a day)"
description: "A minimal, dependency-free renderer for the Mateu wire — the concrete proof that a Mateu UI is portable, and the starting skeleton for your own renderer or design system."
---

Writing a renderer has looked like an open-ended commitment. It is not: the wire is bounded, the
[Core level](/design-systems/renderer-contract/) is small, and there is now a **minimal, dependency-free
reference renderer** you can read in one sitting and start from.

It lives at `frontend/reference-renderer/` — one HTML file and one JS module, **no framework and no
build step**. It renders a Mateu UI using nothing but the wire itself, which is exactly why it is the
concrete proof of [portability](/mateu-about/portability-and-exit/): if a ~250-line file with no
dependencies can render the definition, the definition is genuinely portable.

## Run it

```bash
cd frontend/reference-renderer
python3 -m http.server 8090
# open http://localhost:8090, set Backend to a running Mateu app (any Java/.NET/Python server), pick a route
```

## The whole protocol, in four steps

A renderer is a function from `UIIncrementDto` to painted UI plus a way to post actions back. That is
all:

1. **One call.** `POST {backend}/mateu/v3/sync/{route}` (route in the path, `_no_route` when empty) with
   a body of `{ route, actionId, componentState, appState, parameters, … }`. The route load is
   `actionId: ""`. The response is a `UIIncrementDto`
   (see the [wire specification](/reference/wire-specification/)).
2. **Apply the envelope.** Run `commands` (`SetWindowTitle`, `navigateTo`, …), show `messages`, then
   apply the `Replace` `fragments`.
3. **Walk the tree.** Each node's real type is `metadata.type`; a `Card`'s content is in
   `metadata.content`; a `FormField` carries `fieldId` / `label` / `dataType` / `stereotype` /
   `options`; values come from the fragment `state` / `initialData`.
4. **Post actions back.** A button posts its `actionId` with the current `componentState`; the response
   is another increment, applied the same way.

## Reaching Core, then stopping (or not)

Core is a **usable renderer**: forms, field types, validation, actions, CRUD listings, text. When every
Core fixture renders with no `<mateu-unsupported>` placeholder, you are Core-conformant — a legitimate,
complete answer. Standard (sections, tabs, zones, wizards, filtering, master-detail) and Full (charts,
uploads, islands, adapters) are where you keep going if you want to.

Declare what you support (`SUPPORTED_TYPES` in the module) so the report can tell *"this type is not
supported"* apart from *"this type broke"* — only the second is a bug.

## Scope & honesty

This is a **teaching / proof artifact**, not a first-party product renderer. It implements Core; it
does not do overlays (`Add` fragments), the full command set, the client fetch plan for external REST
sources, or the rich catalogue. The first-party [conformance harness](/design-systems/renderer-contract/)
drives renderers built on the shared `libs/mateu` plumbing; this standalone renderer shows the wire→DOM
mapping directly, and wiring it into that harness is a follow-up. See `frontend/reference-renderer/README.md`.
