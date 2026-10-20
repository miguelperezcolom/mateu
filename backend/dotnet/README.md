# Mateu server-side for .NET (C#)

A C# implementation of Mateu's **server side**: turn annotated C# classes into the Mateu component
tree and serve the `/mateu/v3/sync` API, so the **existing renderers** (web, React Native, IntelliJ plugin) render a
C# backend with **zero client changes**. See [`DESIGN.md`](DESIGN.md) for the full plan and roadmap.

> Status: **M1–M4 working & verified live** in the Compose renderer (desktop + iOS; since retired) against this server:
> - **M1** — `[UI]` form + `[Button]` action (e.g. `SimpleForm` → "Hello {name}" toast).
> - **M2** — field types (string/int/bool/date/enum→options), `[Required]`→required, `[Section]`→cards.
> - **M3** — `Crud<T>`: a searchable listing (table on desktop, cards on phone) **plus full
>   detail / edit / new** — row → read-only view, Edit/New → form, **Save** (with server-side
>   `[Required]` validation; untouched fields preserved), Delete, and back-to-list navigation, all via
>   the route flow (`/reservations`, `/{id}`, `/{id}/edit`, `/new`) the renderer already drives.
> - **Capability listings** — `IListing<TRow>` + `ISearchable`/`IFilterable<F>`/`INavigable`/
>   `IEditable`/`ICreatable`/`IDeletable`: a listing that grows by declaring capabilities
>   (mirror of the Java model; `Crud<T>` = all of them at once).
> - **M4** — `[App]` shell + a menu from `[MenuItem]` methods + route navigation between views.
> - **M5** — `Wizard` (multi-step, `[Step(n)]`, progress + Back/Next, state via componentState);
>   page decorations (`[Subtitle]`, `[Banner]`, `[HeaderBadge]`); **i18n** (`ITranslator`); **events**
>   (`[Emits]` → `emitsName`, `[SubscribeTo]` → OnCustomEvent trigger); **security** scaffolding
>   (`[Secured]`, app login URLs).
> - **Tail features** — `[Tab]` (fields grouped into a `TabLayout`; `[Tab("Name", Open = true)]` makes
>   that tab the one selected on first render instead of the first-declared one); field stereotypes (`[Multiline]`
>   → textarea, `[Password]`, `[Money]` → `money` dataType, `[PlainText]` field/class → read-only text,
>   `[Stereotype("…")]`); `[LinkTo(href, Icon=…, Title=…, Target=…)]` → a nav-link icon on the field
>   (href/title travel as raw `${...}` templates, interpolated client-side; implement `ILinkSupplier`
>   on the view for programmatic links — it wins, null falls back to the attribute); `[Kpi]` methods
>   → page KPI cards; `[Fab]` methods → floating action buttons; `[Shortcut("ctrl+s")]` on action
>   methods; `[ConfirmOnNavigationIfDirty]` and `[Compact]` page flags.
> - **Layout inference (`[AutoLayout]`)** — the deterministic decision table ported 1:1 from the
>   Java reference (`LayoutInference`, same constants/thresholds): heavy unstructured editable
>   forms fold optional fields into a collapsed "More options" accordion (required stay visible);
>   heavy read-only views (`[ReadOnly]`) with ≥ 5 sections present them as tabs (id `_tabs`,
>   `groupRelationship=alternative`, `adaptable=true`); small enums (≤ 4 constants) render as radio
>   buttons (`[UseRadioButtons]` forces radio at any size); developer-declared `[Tab]` layouts
>   always carry `groupRelationship=alternative` and are `adaptable` when the class opts in.
> - **Fluent components & archetypes** — the nine dashboard/UX component types (`MetricCard`,
>   `Scoreboard`, `DashboardPanel`, `DashboardLayout`, `FoldoutLayout`, `HeroSection`, `EmptyState`,
>   `Skeleton`, `Gantt`) as fluent records a view can emit via `IComponentTreeSupplier`, plus the
>   declarative page archetypes (`Dashboard`, `Foldout`, `Welcome`, `ItemOverview`) that compose them
>   from component-holding properties (`[Panel]` carries title/subtitle/colSpan/rowSpan/icon/open).
>
> The Mateu server surface is covered (520+ tests on net8.0 and net10.0), and the shared wire-conformance corpus is a HARD gate (`WireConformanceTests`). Component adapters, embedded islands, the REST source/component catalogues, `layoutDelta:`, listing exports (the `IListingExporter` port; CSV built in), group actions and the grid-field row editor are in. The web renderer renders all of it; the Compose
> renderer (a subset) renders forms/CRUD/app-shell/wizards/banners/tabs.

## Projects

| Project | Role |
|---|---|
| `src/Mateu.Uidl` | Public API — attributes (`[UI]`,`[Title]`,`[Button]`,`[Panel]`…), fluent components (`MetricCard`, `Gantt`, …), archetypes (`Dashboard`, `Foldout`, …) + data types (`Message`) |
| `src/Mateu.Dtos` | The wire model — `UIIncrementDto`, `ComponentDto` + metadata (System.Text.Json polymorphism on `type`) |
| `src/Mateu.Core` | The engine — route/type resolution, model→tree mapping, action dispatch (internal: see **Public API** below) |
| `src/Mateu.AspNetCore` | `AddMateu()` / `MapMateu()` — DI + the `POST /mateu/v3/sync/{route}` endpoint |
| `samples/Mateu.Demo` | A runnable ASP.NET app (`SimpleForm`, `Person`) |
| `test/Mateu.Tests` | Golden-JSON tests asserting wire compatibility with the Java backend |

## Public API

What an app compiles against is **`Mateu.Uidl`** (attributes, fluent components, archetypes, the SPIs
an app implements: `ITranslator`, `ISecretsProvider`, `IListingExporter`, `IComponentAdapter`, the
code-authoring suppliers…), **`Mateu.AspNetCore`** (`AddMateu` / `MapMateu`, `MateuOptions`,
`ClaimsIdentityMapper`) and **`Mateu.Dtos`** (the wire model). Since 3.0-alpha.429 the engine in
`Mateu.Core` — `SyncHandler`, `MateuRegistry`, `ReflectionMapper`, the route/YAML/MCP machinery — is
`internal` (visible only to `Mateu.AspNetCore` and the test suite); hosting it outside ASP.NET Core is
no longer a supported path. `Mateu.Core` exports only:

| Type | Why it is public |
|---|---|
| `DevSpecs`, `ISpecsCache` | live reload: an app's own cache of `specs/ui/**` registers with `DevSpecs.Register` |
| `PartialRegistry` | partials registered in code (`PartialRegistry.Default.Register(ref, nodes)`) |
| `DocumentStore` (+ `Parked`) | the documented `DocumentStore.InlineMaxBytes` knob / a shared store |
| `Export.BuiltInCsvExporter` | an `IListingExporter` an app's own exporter can delegate to |
| `InferenceSwitches` | the names of the inference `AppContext` switches |
| `RouteEntry`, `IRouteEntrySupplier`, `IMenuSupplier`, `IAppSupplier`, `AppShell`, `MateuForbiddenException` | type forwards to `Mateu.Uidl` (binary compatibility) |

The list is pinned by `PublicSurfaceTests` (`test/Mateu.Tests/api/*.txt`): growing it is a reviewed
change (`MATEU_API_WRITE=true dotnet test` rewrites the files).

## Install (NuGet)

```bash
dotnet add package Mateu.AspNetCore --prerelease   # brings Mateu.Core, Mateu.Uidl, Mateu.Dtos
```

```csharp
builder.Services.AddMateu(o =>
{
    // defaults shown: identity from HttpContext.User claims (roles/groups/scope/permissions),
    // secrets from an ISecretsProvider service or env vars, error detail only in Development
    // o.Identity = ctx => …;  o.Secrets = key => …;  o.DetailedErrors = …;
}, typeof(Program).Assembly);
app.MapMateu();
```

Packages: `Mateu.Uidl`, `Mateu.Dtos`, `Mateu.Core`, `Mateu.AspNetCore` — one version for all four,
in lockstep with the Maven artifacts (`v3.0-alpha.N` → `3.0.0-alpha.N`), multi-targeting
**net8.0 and net10.0**. Released by the `nuget` job of `.github/workflows/buid-and-publish.yml`
(needs the `NUGET_API_KEY` secret). Local packages: `dotnet pack src/Mateu.AspNetCore -c Release
-p:MateuVersion=3.0.0-local`.

An exception escaping an action becomes an error toast: a `UserFacingException` shows its message,
anything else a generic message + correlation id (details in the log; on screen only in Development).

## Run

```bash
# .NET 10 SDK required (builds net8.0 + net10.0; running the net8.0 tests needs the 8.0 runtime)
dotnet build
dotnet run --project samples/Mateu.Demo        # serves on http://0.0.0.0:8593
dotnet test                                     # golden tests
```

To open it in a browser, tell the server where a web renderer is — `app.MapMateu(ui: "<path>")` or `MATEU_UI=<path>`: the `io.mateu:mateu-vaadin` (or `mateu-redwood`) jar from Maven Central, or its extracted `static/` folder (e.g. `MATEU_UI=mateu-vaadin-3.0-beta.8.jar dotnet run --project samples/Mateu.Demo` → http://localhost:8593). It then serves the page at the mount and its deep links and the assets at the origin root, like a Java app; the NuGet packages do not include the renderer. Without it the server answers the sync API only (a browser opening the mount gets a short hint page, with status 404, saying so) — point a renderer served elsewhere at it, e.g. the React Native app (`cd frontend/app/react-native && EXPO_PUBLIC_MATEU_BACKEND_PORT=8593 npx expo start --web`; the server must list that origin in its CORS settings).
The server binds to `0.0.0.0` so the iOS simulator (`localhost:8593`) and Android emulator
(`10.0.2.2:8593`) reach it too.

## Define views

```csharp
// A form with sections + an action
[UI("person"), Title("Person")]
public class Person
{
    [Required, Section("Identity")] public string? Name { get; set; }
    public int Age { get; set; }
    [Section("Preferences")] public bool Subscribed { get; set; }
    public Role Role { get; set; }            // enum → dropdown
    [Button] public Message Save() => new($"Saved {Name}");
}

// A CRUD listing
[UI("reservations"), Title("Reservations")]
public class Reservations : Crud<Reservation>
{
    public override IEnumerable<Reservation> Fetch(string? search) => /* your query */;
}

// The app shell + menu
[App("My C# Mateu app")]
public class DemoApp
{
    [MenuItem("Reservations")] public Reservations Reservations() => new();
    [MenuItem("Person")] public Person Person() => new();
}

// A card menu (like the product dropdowns of a docs site): [MenuGroup(Display = "cards")] opens a
// folder as a panel of cards; [MenuItem(Description, Icon, Image)] / [MenuGroup] on a nested folder
// ("Bookings/Reservations") give each card its look, and a nested folder's entries are its actions.
// Code-authored menus (IMenuSupplier / IAppSupplier) set MenuItemDto.Display/Description/Icon/Image.
[App("PMS")]
[MenuGroup("Bookings", Display = MenuDisplay.Cards)]
[MenuGroup("Bookings/Reservations", Description = "Search, create and modify", Icon = "vaadin:calendar", Image = "/img/res.png")]
public class PmsApp
{
    [MenuItem("Search", Group = "Bookings/Reservations")] public Reservations Search() => new();
    [MenuItem("Room diary", Group = "Bookings", Description = "Rooms by day")] public Person Diary() => new();
}

// A declarative dashboard: consecutive MetricCard properties form a Scoreboard KPI band,
// [Panel] component properties become titled tiles on a responsive grid.
[UI("dashboard"), Title("Sales dashboard")]
public class SalesDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new()
        { Title = "Revenue", Value = "1.2", Unit = "M€", Trend = MetricTrend.Up, TrendLabel = "+12%" };

    [Panel(Title = "Delivery plan", ColSpan = 2)]
    public Gantt Plan { get; } = new() { Tasks = [ new GanttTask
        { Id = "t1", Title = "Build", Start = new(2026, 7, 1), End = new(2026, 8, 20), Progress = 40 } ] };

    [Panel(Title = "Alerts")]
    public EmptyState Alerts { get; } = new() { Icon = "🎉", Title = "No alerts" };
}

// A Redwood-style foldout record page: overview on the left + lateral fold-out panels.
[UI("booking"), Title("Booking")]
public class BookingFoldout : Foldout
{
    public Text Overview { get; } = new("Booking 2026/0042 — 2 nights, Deluxe room");
    [Panel(Title = "Guests", Icon = "👥")] public Text Guests { get; } = new("…");
    [Panel(Title = "Payments", Open = false)] public Text Payments { get; } = new("…");
}
```

### Fluent components

Beyond reflected forms, any view can implement `IComponentTreeSupplier` and return a fluent
component tree (`Mateu.Uidl` records). Supported types: `MetricCard`, `Scoreboard`,
`DashboardPanel`, `DashboardLayout`, `FoldoutLayout`/`FoldoutPanel`, `HeroSection`, `EmptyState`,
`Skeleton`, `Gantt`/`GanttTask`, `PlanningBoard`/`PlanningResource`/`PlanningBlock` (tape chart;
with the OPERA Room Diary extras — `AttributeColumns` + per-resource `Attributes`/`Icon`, block
`Icon`/`Summary` hover text, and `ResizeActionId` / `OpenActionId` (double click) /
`RangeSelectActionId` (drag across empty cells) next to `MoveActionId`/`SelectActionId`), `Map`/`MapMarker`
(street map: `Position` "lat, lon", `Zoom`, `Markers`; a marker click runs `MarkerActionId` with
`_markerId`), plus the
generic `Text`, `Button`, `Card`, `HorizontalLayout`, `VerticalLayout` and `TabLayout`/`TabPanel`. They serialize to the exact wire shape of the Java
DTOs (same `type` discriminators, field names and `slot`s), so every renderer that supports them
renders the C# output unchanged. `MetricCard.ActionId` / `EmptyState.ActionId` / `Button.ActionId`
dispatch the method of the same name on the view (drill-in navigation, CTAs).

### Page archetypes

`Dashboard`, `Foldout`, `Welcome` and `ItemOverview` (C# analogues of the Java declarative
orchestrators) reflect over the subclass's public component-holding properties and compose the
layout for you — `[Panel(Title, Subtitle, ColSpan, RowSpan, Icon, Open)]` marks tiles / fold-out
panels / tabs. See `samples/Mateu.Demo/SalesDashboard.cs`.
