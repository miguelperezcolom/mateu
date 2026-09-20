---
title: "Wire specification & derivation semantics"
description: "The versioned contract every Mateu backend emits and every renderer consumes — the envelope, the component model, and the derivation rules that turn a declared model into wire. The single place a re-implementer needs."
---

This is the **authoritative index** for the Mateu wire: the JSON contract a backend produces and a
renderer consumes, plus the **derivation semantics** — the rules that turn a declared model into that
wire. It exists so a re-implementer (a new renderer, or an alternate producer) can reproduce **the
behaviour, not just the shape**. It gathers and points at the normative sources rather than restating
them, so there is one contract, not several drifting copies.

See also: [Renderer contract](/design-systems/renderer-contract/) (what a renderer must do),
[Bring your own design system](/design-systems/bring-your-own-design-system/), and
[Portability & exit strategy](/mateu-about/portability-and-exit/).

## Status and versioning

- **Current wire version: `3.0`.** Every response envelope carries it as `wireVersion` (see below), so
  a consumer can guard against a mismatched producer.
- **Compatibility policy:** **additive within a major**. New optional fields and new component types
  may be added without bumping the major; a consumer must **ignore unknown fields and unknown
  component types** gracefully (render a placeholder, keep going). The major version bumps only on a
  breaking change to existing wire shape or semantics.
- **Freeze-and-pin is the supported migration stance:** if you build against the wire (an alternate
  renderer, or an extraction), pin the `wireVersion` you targeted; that snapshot is a stable contract.
- The published JSON Schemas (below) are the machine-readable half; this page is the normative prose
  for the parts a schema cannot express (behaviour).

## The exchange

One endpoint, same shape on every framework and language:

```
POST /{baseUrl}/mateu/v3/sync/{route}        // route in the PATH; "_no_route" when empty
Body: {
  "route": "/...",           // "" for the root
  "actionId": "" | "<methodName>",   // "" = the route load
  "componentState": { ... },
  "appState": { ... }, "parameters": { ... }, "consumedRoute": "...",
  "serverSideType": null, "initiatorComponentId": null
}
```

- The response is a **`UIIncrementDto`** (the envelope). The `v3` in `/mateu/v3/sync/…` is a **route
  path segment**, not the schema version — the schema version is `wireVersion` in the payload.
- The **route load** is dispatched as `actionId: ""` (empty), not `"__load__"` — both are treated as
  idempotent reads. See the transport notes in [Slow connections](/ux-patterns/slow-connections/).
- SSE variants stream partial increments for long tasks; each streamed frame is a `UIIncrementDto`.

## The envelope — `UIIncrementDto`

| Field | Meaning |
|---|---|
| `wireVersion` | Wire protocol version this payload conforms to (e.g. `"3.0"`). Always present. |
| `commands` | Client commands to run (`SetWindowTitle`, `navigateTo`, `PushStateToHistory`, `CloseModal`, `DispatchEvent`, `MarkAsClean`/`MarkAsDirty`, …). |
| `messages` | Toasts / alerts (may be `undoable`). |
| `fragments` | Partial UI updates (`UIFragmentDto`: `targetComponentId`, `action` = `Replace`/`Add`, `component`, `state`, `data`). Overlays (dialog/drawer) arrive as `Add`. |
| `banners` + `appendBanners` | Page banners; append vs replace. |
| `appData` / `appState` | App-level data / merged app state. |

The three "effects" a producer can return from an action reduce to this envelope: **route** change
(a command), **ui-delta** (fragments), **data** (fragment `data`/`appData`), and **commands**. A
returned `Step`/`List<Step>` (the flow language) lowers 1:1 to `commands` — it is behaviour, not a view.

## The component model (authoring surface)

Components are a polymorphic family discriminated on `type`. The **normative, machine-readable**
description is the generated JSON Schema, published at:

- `https://mateu.io/uidl/uidl-schema.json` — the component catalog.
- `https://mateu.io/uidl/routes-schema.json` — the route registry (`routes.yaml`).
- `https://mateu.io/uidl/sources-schema.json` — the REST source catalogue (`sources.yaml`).
- `https://mateu.io/uidl/specs-schema.json` — the unified `specs/ui/**` schema (a `oneOf` of every kind).

These are **generated from the records and pinned by a test**, so the authored YAML keys *are* the
record components (no sugar the schema does not describe). Wire-plumbing types
(`ServerSideComponent`, `ModelViewComponent`, `PageView`) are intentionally excluded from the authoring
surface.

## Normalisation (what is normative vs. noise)

The wire carries values that legitimately differ between servers and runs. The
[conformance corpus](/design-systems/renderer-contract/) defines the canonical normalisation both
producers and the reference apply before comparing:

- **Drop** server-invented `id`s and empty/null members.
- **Sort** object keys.
- **Keep** everything that says *what the screen is*: types, field ids, labels, data types, actions,
  layout structure — and scalar envelope fields such as `wireVersion`.

If two producers normalise to the same tree for the same fixture, they are wire-equivalent. This corpus
(`conformance/cases/*`) is the **executable half** of this spec.

## Derivation semantics (behaviour a schema cannot express)

These are the rules that turn a *declared model* into the wire. They are normative: a producer that
wants to be wire-equivalent must reproduce them. The authoritative write-ups are linked; the key
thresholds are inlined so a re-implementer does not have to reverse-engineer them.

### Layout inference — [layout-inference](/ux-patterns/layout-inference/)
`@AutoLayout` infers structure from the amount/shape of declared data; explicit annotations always win.
- **Field weight units:** textarea/richText/html/markdown/image/uploadableImage = 4; grid = 6;
  radio/checkbox = 2; array/component = 6; else 1.
- **Fold-optionals:** editable form, single unnamed section, no tab/inline/composition/component
  fields, weight > 16, ≥1 required and ≥4 optional → optionals collapse into a one-panel accordion
  ("More options").
- **Sections → tabs:** read-only view, ≥5 sections, total weight ≥ 30, no sticky section and no explicit
  `@Toc` → one tab per section.
- **Small enum → radio:** an enum with ≤4 constants renders as radio buttons (`@UseRadioButtons` forces
  it at any size).
- `TabLayout` carries `groupRelationship` (`alternative`/`sequential`/`simultaneous`) and `adaptable`
  (renderers may degrade tabs to an accordion on narrow viewports without losing disclosure semantics).

### Sizing — hug / fixed / fill
A component declares a portable sizing intent (`hug` / `fill` / `fixed:<len>`); a listing infers `fill`.
In the responsive grid a track's size **is** the sizing intent: `hug` = `auto`, `fixed` = px,
`fill` = `fr`. The renderer applies it to the component's host (a `fill` child takes remaining height
and scrolls internally).

### Page type & width — [page-templates](/ux-patterns/page-templates/)
- **`pageType`** (`landing`/`collection`/`detail`/`form`/`process`/`dashboard`) is on every page:
  `@PageTemplate` wins > archetype family > `MetricCard` field → dashboard > default `form`.
- **`pageWidth`** (`fixed`/`fullWidth`/`edgeToEdge`): `@PageWidth` on the view wins > `PageWidthSupplier`
  > null (renderer infers from type/content).
- **`labelsAside`** is inferred per form: aside only when single-column AND ≥6 fields AND all labels
  ≤20 chars AND all single-line widgets; `@FormLayout(labelsAside=…)` overrides.

### Listings, filters & criteria — [filters-and-listing](/ux-patterns/filters-and-listing/)
- **Capability model:** a listing declares inputs (`Searchable`, `Filterable<F>`) and implements
  interactions (`Navigable`, `Editable`, `Creatable`, `Deletable`); gates `canView/canEdit/canCreate/
  canDelete` decide which routes/buttons exist. `gridLayout()` = `auto`(→table)/`table`/`list`/`cards`/
  `masterDetail`/`tree`.
- **A filter field counts as SET only when its value differs from a freshly-constructed instance** of
  the filters class (untouched fields keep initializers/defaults). Strings match by case-insensitive
  containment; other basics by equality; free-text search is **word-based** (every whitespace-separated
  word must be contained, case-insensitive, any order).
- **Range/multi-select conditions** travel as `FilterCriterion(field, operator, values)` (`between`/
  `gte`/`lte`/`in`), built from `<field>_from`/`<field>_to` keys and value lists; temporal → `dateRange`,
  `@RangeFilter` numerics → `numberRange`, enums → `multiSelect` (under AutoCrud's crud-filter semantics).
- **Totals & grouping:** `@Aggregate`/`@GroupBy` → `ListingData.aggregates/groups` + `CrudlDto.groupBy`;
  the group column becomes the implicit primary sort; marker rows are excluded from selection/click/edit.

### State coercion (round-trip) — the JS client integerises whole doubles
- **Numeric widening:** any `Number` widens into the target numeric field type on both read and write
  (a `Double` field's `343.0` arriving as `343` must not reset the field).
- **Holder fields are excluded from state:** fields typed `Callable`/`Supplier`/`Runnable`/`Component`
  are dropped on write and skipped on read (initializers survive) — no `@JsonIgnore` needed.

### Route resolution & parameter precedence — [route-registry](/java-ui-definition/route-registry/)
- Routes are **relative to the mount**. Resolution merges authored (`routes.yaml` / code suppliers) over
  derived (annotations); authored wins and short-circuits.
- **Parameter precedence (identical on server and in the browser):**
  `fixed > client state > path > query > defaults`. Fixed params are **re-applied server-side**, never
  trusted from the client.

### REST sources — [rest-source-catalogue](/java-ui-definition/rest-source-catalogue/)
A surface references a named endpoint by `ref`; the catalogue travels separately (`AppDto.restSources`
live, or once in `manifest.json` for a bundle). A source gives **selection, not transformation**
(`itemsPath`, `totalPath`, `fields` name→path, `valuePath`/`labelPath`, `resultPath`). `proxy` is read
off the **resolved** source, server-side, and is the only channel that injects `${secret.KEY}`.

### Behaviour bus — triggers → actions, events
Triggers reference an action by id; an action carries confirm + effects. Components communicate over an
abstract pub/sub bus: `UICommand.dispatchEvent` emits, `@SubscribeTo`/`@Emits` subscribe (scopes
`DOCUMENT`/`COMPONENT`/`SELF`). This is not the DOM event system — it is a logical bus a renderer must
provide.

## Agent operability — the MCP projection

The wire is self-describing, so it is not only a *rendering* protocol — it is an **agent-operation**
protocol. An MCP (Model Context Protocol) server is "a renderer of agents": same self-describing model,
tools instead of pixels. The rules below are **normative** so every host (the `frontend/mcp-server/`
sidecar and the native endpoint) produces the *same* projection, exactly like the derivation rules above
are shared by every renderer.

**The projection** — a `UIIncrementDto` deep-walked into a flat, agent-friendly screen:

| Projected | Derived from |
|---|---|
| `title` | `SetWindowTitle` command → else `Page.pageTitle`/`title` → else `Crudl.title`. |
| `route`, `serverSideType`, `pageType` | the primary `ServerSide` component node. |
| `fields[]` `{id,label,dataType,stereotype,required,readOnly,value,options?}` | every `FormField` metadata node, de-duplicated by `fieldId`, declaration order. `value` from the fragment `state` (else the `ServerSide.initialData`). |
| `actions[]` `{id,label,shortcut?,confirmationRequired?}` | `ServerSide.actions[].id`; label enriched from a `Button` whose `actionId` matches. **RBAC is already applied server-side** — an action a token may not run never reaches the wire, so it never appears as a tool. |
| `listing?` `{title,searchable,columns,filters}` | a `Crudl` metadata node. |
| `messages[]`, `commands[]` | `UIIncrementDto.messages`; and non-`SetWindowTitle` `commands` (e.g. `navigateTo`) surfaced so the agent sees navigation/effects. |

**The request mapping** — a tool call becomes a sync request (see [The exchange](#the-exchange)):
- `describe_screen(route)` → load: `actionId: ""`.
- `run_action(route, actionId, componentState)` → the action; `componentState` seeds/overrides fields.
- `search(route, searchText, filters)` → the `search` action.

**Two transport gotchas** (verified against a live backend, both belong to the contract):
- `consumedRoute` **must be `null`** for a fresh load — an empty string `""` makes the server resolve
  to nothing.
- the server encodes the root/empty route as **`"_empty"`** on the wire; a host normalizes it to `""`.

**Two hosts, one projection.** The **sidecar** (`frontend/mcp-server/`, zero-dependency Node) speaks only
this wire, so it operates a Java, .NET or Python backend with no backend change. The **native endpoint**
serves the same projection from `MateuService` directly, enforcing RBAC natively. Reference
implementation + the tool surface: `frontend/mcp-server/README.md`; design: `design/riu-agent-operability-plan.md`.

## Conformance

A renderer's coverage is measured, not asserted, by the harness in `e2e/conformance.*` against shared
fixtures, at three levels — **Core** / **Standard** / **Full**. The producer side is pinned by the wire
[conformance corpus](/design-systems/renderer-contract/) (`conformance/cases/*`), run by all three
backends (`WireConformanceTest` / `test_wire_conformance.py` / `WireConformanceTests`). Passing the
corpus at a wire version **is** the definition of "wire-equivalent at that version".

## What is NOT normative (escape hatches)

Deliberately outside the contract, and relegated so they are never the entry cost:
`run-js`, an arbitrary custom web-component behind a `custom` field or renderer, and a `ComponentAdapter`
that renders a non-Mateu object. A renderer may decline these and still be Core/Standard conformant;
they do not travel as portable data the way the declared model does. See
[Escaping the framework](/java-user-manual/advanced/escaping-the-framework/).
