# Mateu server-side for .NET (C#)

A C# implementation of Mateu's **server side**: turn annotated C# classes into the Mateu component
tree and serve the `/mateu/v3/sync` API, so the **existing renderers** (web, JavaFX, Compose) render a
C# backend with **zero client changes**. See [`DESIGN.md`](DESIGN.md) for the full plan and roadmap.

> Status: **M1–M4 working & verified live** in the Compose renderer (desktop + iOS) against this server:
> - **M1** — `[UI]` form + `[Button]` action (e.g. `SimpleForm` → "Hello {name}" toast).
> - **M2** — field types (string/int/bool/date/enum→options), `[Required]`→required, `[Section]`→cards.
> - **M3** — `Crud<T>`: a searchable listing (table on desktop, cards on phone) **plus full
>   detail / edit / new** — row → read-only view, Edit/New → form, **Save** (with server-side
>   `[Required]` validation; untouched fields preserved), Delete, and back-to-list navigation, all via
>   the route flow (`/reservations`, `/{id}`, `/{id}/edit`, `/new`) the renderer already drives.
> - **M4** — `[App]` shell + a menu from `[MenuItem]` methods + route navigation between views.
> - **M5** — `Wizard` (multi-step, `[Step(n)]`, progress + Back/Next, state via componentState);
>   page decorations (`[Subtitle]`, `[Banner]`, `[HeaderBadge]`); **i18n** (`ITranslator`); **events**
>   (`[Emits]` → `emitsName`, `[SubscribeTo]` → OnCustomEvent trigger); **security** scaffolding
>   (`[Secured]`, app login URLs).
> - **Tail features** — `[Tab]` (fields grouped into a `TabLayout`); field stereotypes (`[Multiline]`
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
> The core Mateu surface is covered (35 golden tests). The web renderer renders all of it; the Compose
> renderer (a subset) renders forms/CRUD/app-shell/wizards/banners/tabs.

## Projects

| Project | Role |
|---|---|
| `src/Mateu.Uidl` | Public API — attributes (`[UI]`,`[Title]`,`[Button]`,`[Panel]`…), fluent components (`MetricCard`, `Gantt`, …), archetypes (`Dashboard`, `Foldout`, …) + data types (`Message`) |
| `src/Mateu.Dtos` | The wire model — `UIIncrementDto`, `ComponentDto` + metadata (System.Text.Json polymorphism on `type`) |
| `src/Mateu.Core` | The engine — `MateuRegistry` (route/type resolution), `ReflectionMapper` (model→tree), `SyncHandler` (action dispatch) |
| `src/Mateu.AspNetCore` | `AddMateu()` / `MapMateu()` — DI + the `POST /mateu/v3/sync/{route}` endpoint |
| `samples/Mateu.Demo` | A runnable ASP.NET app (`SimpleForm`, `Person`) |
| `test/Mateu.Tests` | Golden-JSON tests asserting wire compatibility with the Java backend |

## Run

```bash
# .NET 8 SDK required (e.g. ~/.dotnet/dotnet via https://dot.net/v1/dotnet-install.sh --channel 8.0)
dotnet build
dotnet run --project samples/Mateu.Demo        # serves on http://0.0.0.0:8593
dotnet test                                     # golden tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8593`.
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
`Skeleton`, `Gantt`/`GanttTask`, plus the generic `Text`, `Button`, `Card`, `HorizontalLayout`,
`VerticalLayout` and `TabLayout`/`TabPanel`. They serialize to the exact wire shape of the Java
DTOs (same `type` discriminators, field names and `slot`s), so every renderer that supports them
renders the C# output unchanged. `MetricCard.ActionId` / `EmptyState.ActionId` / `Button.ActionId`
dispatch the method of the same name on the view (drill-in navigation, CTAs).

### Page archetypes

`Dashboard`, `Foldout`, `Welcome` and `ItemOverview` (C# analogues of the Java declarative
orchestrators) reflect over the subclass's public component-holding properties and compose the
layout for you — `[Panel(Title, Subtitle, ColSpan, RowSpan, Icon, Open)]` marks tiles / fold-out
panels / tabs. See `samples/Mateu.Demo/SalesDashboard.cs`.
