# Mateu server-side for Python — design

> Status: **implemented & verified**. Forms + sections + field types + validation, `Crud[T]`
> (list / detail / edit / new / save / delete), the `@app` shell + menu navigation, wizards,
> page decorations, i18n, events, security scaffolding, and the tail features (tabs, stereotypes,
> KPIs, FABs, shortcuts, compact, unsaved-changes guard). 13 golden-JSON tests pass; the live
> `showcase` view is byte-identical to the C# reference.

## 1. Guiding principle: the renderers are backend-agnostic

Every Mateu renderer speaks one protocol:

```
POST /{baseUrl}/mateu/v3/sync/{route}
  request  (RunActionRq): { route, consumedRoute, actionId, serverSideType,
                            initiatorComponentId, componentState, appState, parameters }
  response (UIIncrement): { commands[], messages[], fragments[], banners[], appendBanners,
                            appData, appState }
```

So the Python task is **not** "rewrite the framework" — it is **"emit the same JSON"**. We validate
by pointing a real renderer (or the C# reference server) at the Python server and diffing the JSON for
the same view.

## 2. Stack (decided)

- **FastAPI** (ASP.NET-minimal-API analogue) for the single `sync` route family.
- **Pydantic v2** for the wire model, using **discriminated unions** (`Field(discriminator="type")`
  + a `Literal["…"]` `type` field per model) for the `type` discriminators — the Python analogue of
  Java's `@JsonTypeInfo` and C#'s `[JsonPolymorphic]`/`[JsonDerivedType]`. camelCase via
  `alias_generator=to_camel`; nulls kept; dump with `by_alias=True`.
- **Reflection** over user classes: type hints for fields, `Annotated[...]` metadata for field
  modifiers, decorators for class/method features. Read via `inspect.get_annotations` (PEP 649-safe).

## 3. The Python idiom: `Annotated` + decorators

C# attributes don't exist on Python attributes, so:

- **Field modifiers** ride in `Annotated[T, Marker(...)]`: `Required()`, `Section("…")`, `Tab("…")`,
  `Stereotype("…")`, `Multiline()`, `Password()`, `Money()`, `PlainText()`, `HeaderBadge(...)`,
  `Step(n)`, `Label("…")`.
- **Class features** are decorators: `@ui`, `@title`, `@subtitle`, `@app`, `@compact`,
  `@confirm_on_navigation_if_dirty`, `@plain_text`, `@emits`, `@subscribe_to`, `@secured`.
- **Method features** are decorators: `@button`, `@menu_item`, `@kpi`, `@fab`, `@banner`,
  `@shortcut`. Each stamps a `__mateu_*__` attribute the mapper reads.

Validation reuses "a field has `Required()`" (the analogue of `@NotEmpty` / `[Required]`), enforced
server-side on CRUD save.

## 4. Solution layout

```
backend/python/
  mateu_uidl/     ← public API: decorators + field markers + Message/Crud/Wizard/Translator
  mateu_dtos/     ← the wire model (Pydantic): UIIncrement, Component + metadata subtypes
  mateu_core/     ← the engine: naming, reflection, MateuRegistry, ReflectionMapper, SyncHandler
  mateu_fastapi/  ← add_mateu(app, *sources): the POST /mateu/v3/sync/{route} endpoint
  samples/demo/   ← a runnable FastAPI app (Person, Reservations, SignupWizard, Showcase, …)
  tests/          ← golden-JSON tests (pytest) — same suite as the C# port
```

## 5. Mapping pipeline (mateu_core)

```
HTTP sync ─▶ MateuRegistry.resolve(serverSideType|route) ─▶ instantiate the view type
          ─▶ (action?) bind componentState → set attributes → invoke the action method
          ─▶ ReflectionMapper.map_view(instance) ─▶ Component tree
          ─▶ wrap in UIFragment(targetComponentId="ux_main"/"crud") ─▶ UIIncrement
```

- **MateuRegistry** scans the given modules/classes once for `@app`/`@ui` and resolves a request by
  `serverSideType` (a stable `module.qualname`), by route, or — for CRUD sub-routes — by the longest
  route prefix.
- **ReflectionMapper** is the heart: class → App/Page shell; fields → FormField metadata (type
  inferred from the hint, label from `Label`/humanized name, stereotypes, options from `Enum`);
  methods → buttons / KPIs / FABs / banners; `Section`/`Tab` → cards / tab strips.
- **SyncHandler** dispatches: app shell, CRUD (list/detail/edit/new + search/create/save/delete),
  wizards (back/next/finish), and plain views (render or run an action → `Message` → toast).

## 6. Validation strategy

- **Golden-JSON tests** (`tests/`) — for each sample view, assert the serialized `UIIncrement` has
  the expected wire shape (ignoring volatile bits like the random SSC id). Same assertions as the C#
  suite.
- **Live diff** — run the demo on `:8594` and diff its JSON against the C# reference on `:8593` for
  the same view. The `showcase` view (tabs + stereotypes + KPIs + FABs + shortcut + compact + dirty
  guard) is byte-identical apart from the (demo-level) `serverSideType` name.

## 7. Beyond the core

The remaining Java features (component adapters, federated microfrontends, framework adapters,
SSE/AI chat) follow the same pattern: add a metadata DTO, extend the mapper, add a golden test.
