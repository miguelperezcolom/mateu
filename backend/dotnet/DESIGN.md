# Mateu server-side for .NET (C#) — design & plan

> Status: **Milestone 1 implemented & verified** (see README). The vertical slice — a `[UI]` form +
> `[Button]` action — renders end-to-end in the Compose renderer (desktop + iOS) against this C#
> server, with golden-JSON tests asserting wire compatibility. M2–M5 below remain the roadmap.
> Goal: a C# implementation of Mateu's *server side* — turn annotated C# classes into the Mateu
> component tree and serve the `/mateu/v3/sync` API — so the **existing renderers** (web, JavaFX,
> Compose) render a C# backend with zero client changes.

## 1. Guiding principle: the renderers are backend-agnostic

Every Mateu renderer speaks one protocol:

```
POST /{baseUrl}/mateu/v3/sync/{route}
  request  (RunActionRq): { route, consumedRoute, actionId, serverSideType,
                            initiatorComponentId, componentState, appState, parameters }
  response (UIIncrement): { commands[], messages[], fragments[], banners[], appendBanners,
                            appData, appState }
```

So the C# task is **not** "rewrite the framework" — it is **"emit the same JSON"**. The Java
backend (~865 files) is the reference, but we only need the subset that produces this wire shape.
We validate continuously by pointing a real renderer (our Compose app, or the web build) at the C#
server and diffing its JSON against the Java reference for the same `@UI` class.

## 2. Stack (decided)

- **.NET 8**, **ASP.NET Core minimal API** for the `sync` endpoint (lightweight, no controller
  ceremony for the single route family). Controllers can be added later for app integration.
- **System.Text.Json** for serialization, using **polymorphic serialization** for the `type`
  discriminators (`ComponentDto`: `ClientSide`/`ServerSide`; `ComponentMetadata`: `App`/`Page`/
  `Form`/`FormField`/`Button`/…). `[JsonPolymorphic]` + `[JsonDerivedType(…, "Name")]`.
- **Reflection** over user assemblies for the model→tree mapping (the C# analogue of Java's
  reflection mappers). No source generators initially (keep it simple; revisit for AOT later).
- Validation via **System.ComponentModel.DataAnnotations** (`[Required]` ≈ `@NotEmpty`, `[Range]` ≈
  `@Min/@Max`).

## 3. Solution layout

```
backend/dotnet/
  Mateu.sln
  src/
    Mateu.Uidl/         ← public API: attributes ([UI],[Title],[Section],[Button],[Action]…),
                          interfaces (ICrudRepository<T>, IListingBackend…), data types (Message…)
    Mateu.Dtos/         ← the wire model (UIIncrementDto, ComponentDto + metadata subtypes, …),
                          a 1:1 mirror of backend/shared/dtos, serialized to the same JSON
    Mateu.Core/         ← the engine: route registry, reflection mapper (model → component tree),
                          action dispatch, the sync use-case
    Mateu.AspNetCore/   ← AddMateu()/MapMateu() DI + endpoint wiring for ASP.NET Core
  samples/
    Mateu.Demo/         ← a runnable ASP.NET app with @UI classes (SimpleForm first)
  test/
    Mateu.Tests/        ← golden-JSON tests: C# output vs the Java reference response
```

## 4. The wire model in C# (Mateu.Dtos)

Records mirroring `io.mateu.dtos`, e.g.:

```csharp
public record UIIncrementDto(IReadOnlyList<UICommandDto> Commands, IReadOnlyList<MessageDto> Messages,
    IReadOnlyList<UIFragmentDto> Fragments, IReadOnlyList<BannerDto> Banners, bool AppendBanners,
    object? AppData, object? AppState);

public record UIFragmentDto(string TargetComponentId, ComponentDto? Component, object? State,
    object? Data, string Action /* Replace|Add */, string? ContainerId);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(ClientSideComponentDto), "ClientSide")]
[JsonDerivedType(typeof(ServerSideComponentDto), "ServerSide")]
public abstract record ComponentDto;

public record ClientSideComponentDto(ComponentMetadataDto Metadata, string? Id,
    IReadOnlyList<ComponentDto> Children, string? Style, string? CssClasses, string? Slot) : ComponentDto;
```

`ComponentMetadataDto` is itself polymorphic on `type` with subtypes `AppMetadataDto`,
`PageMetadataDto`, `FormMetadataDto`, `FormFieldMetadataDto`, `ButtonMetadataDto`, `CrudMetadataDto`,
`CardMetadataDto`, layout types… The exact field sets are taken from the live JSON (we captured
dozens of real responses) and the Java DTOs — JSON property names must match exactly (camelCase).

**Serialization contract:** `JsonSerializerOptions { PropertyNamingPolicy = CamelCase,
DefaultIgnoreCondition = Never }` — Mateu's JSON keeps nulls (the renderers read `path()` defensively,
but we match the Java output to be safe). Verified against golden files.

## 5. Mapping pipeline (Mateu.Core)

```
HTTP sync ─▶ RouteRegistry.resolve(route) ─▶ instantiate model type
          ─▶ (action?) deserialize componentState → set properties → invoke action method
          ─▶ ReflectionUiMapper.map(modelInstance) ─▶ ComponentDto tree
          ─▶ wrap in UIFragment(targetComponentId="ux_main"/sscId) ─▶ UIIncrementDto
```

- **RouteRegistry** — scans loaded assemblies once for `[UI]` types; maps route → Type. (The Java
  side does this at compile time via an annotation processor; in C# we do it at startup via
  reflection — simpler, no codegen.)
- **ReflectionUiMapper** — the heart. For a model instance:
  - class `[UI]`/`[Title]` → the `App`/`Page` shell + window title command.
  - public properties → `FormField` metadata (type inferred from the CLR type: string→string,
    bool→bool, int/decimal→number, DateOnly→date, enum→options…). DataAnnotations → `required`,
    label from `[Label]` or property name.
  - methods with `[Button]`/`[Action]`/`[Toolbar]` → `Button`/action entries.
  - layout attributes (`[Section]`, `[Tab]`, `[Inline]`, `[Compact]`) → containers (later milestones).
- **Action dispatch** — `RunMethodActionRunner` analogue: bind `componentState` JSON to the model
  instance, invoke the method, then map its return value to the increment:
  - `Message` → a `MessageDto`; `void`/model → re-render fragment; `UICommand`/`NavigateTo` → commands.

## 6. Milestone roadmap

| # | Deliverable | Renderable proof |
|---|---|---|
| **M1** | sync endpoint + DTO model + mapper for **SimpleForm** (`[UI]` class, one string field, a `[Button] greet → Message`) | Point the **Compose app** at the C# server → see the form + Greet showing "Hello {name}" toast |
| **M2** | field types (string/number/bool/date/enum→options), **validation** (`[Required]`→required + server-side check), `[Section]`/`[Tab]` layout, page title/subtitle | A multi-field form renders & validates identically to the Java one |
| **M3** | **AutoCrud<T>** + `ICrudRepository<T>`: listing (columns, search, pagination as data-only fragments) + detail/edit/new via the mediator/route-resolver pattern | Reservations-style CRUD list + cards on mobile |
| **M4** | App shell variants (NAVIGATION_LAYOUT / MENU_ON_LEFT / HAMBURGUER_MENU / MEDIATOR), menu from routes, navigation commands (PushStateToHistory) | Full multi-screen app shell |
| **M5+** | wizards, banners/badges/KPIs, `@SubscribeTo`/`@Emits`, semantic annotations, i18n, security — as needed | parity, incrementally |

Each milestone ends green and demoable; we don't move on until a renderer shows it.

## 7. Validation strategy

- **Golden JSON tests** (`Mateu.Tests`): for each sample `@UI`, capture the Java backend's response
  (we already have many) and assert the C# `UIIncrement` serializes to the same shape (ignoring
  volatile bits like random SSC ids / session). This keeps the wire contract honest.
- **Live render**: run the C# demo on `:8593` and point the Compose app's `mateu.baseUrl` at it.

## 8. Open questions (for review)

1. **Scope ambition** — target broad parity (eventually a real alternative backend) or a focused
   "good-enough for forms + CRUD" subset? (Affects how much of M4/M5 we chase.)
2. **Route registration** — pure reflection scan at startup (proposed) vs. a Roslyn source generator
   mirroring Java's annotation processor (better AOT/startup, more work). Start with reflection.
3. **Attribute parity** — mirror Java attribute names (`[UI]`,`[Section]`,`[Button]`) for a familiar
   API, or lean into C# idioms (DataAnnotations where they exist). Proposed: mirror Mateu names but
   reuse DataAnnotations for validation.
4. **Packaging** — NuGet packages (`Mateu.AspNetCore` etc.) eventually, or in-repo only for now.

## 9. First concrete step (M1)

1. Install the **.NET 8 SDK**.
2. `Mateu.sln` + the four `src/` projects + `samples/Mateu.Demo`.
3. Implement just enough DTOs + mapper for `SimpleForm`; wire `MapMateu()`.
4. Run on `:8593`, point the Compose app at it, verify the form + Greet toast.
5. Add the first golden-JSON test.
