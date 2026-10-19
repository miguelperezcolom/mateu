# C# app shell, wizards, archetypes, fluent trees

## App shell, menu, home page

```csharp
[App("My app")]
public class Shell : IHomeRouteSupplier
{
    [MenuItem("Home")] public Home Home() => new();
    [MenuItem("Products")] public Products Products() => new();
    [MenuItem("Orders", Group = "Sales")] public Orders Orders() => new();   // nested under "Sales"

    public string HomeRoute() => "home";   // without it: the first navigable menu entry
}
```

Menu entries are **methods returning the target view** (Java uses `@Menu` fields). Federation:
`[RemoteMenu("Billing", "https://billing.example.com", Explode = true)]` on the app class; a
`MicroFrontend("https://billing.example.com", "/invoices")` component embeds a remote route in a
page. An `[AppContext("Hotel")]` member (enum property, or method returning
`IReadOnlyList<OptionDto>`) adds a header selector whose value travels in every request's
`appState`. Code-authored shells/routes: `IAppSupplier`, `IMenuSupplier`, `IRouteEntrySupplier`.

## Wizard

```csharp
[UI("onboarding"), Title("Onboarding"), WizardProgress("steps")]   // "bar" | "steps" | "rail"
public class Onboarding : Wizard
{
    [Step(1), Required] public string? Email { get; set; }
    [Step(2)] public string? Company { get; set; }
    public override Message Complete() => new($"Welcome {Email}");
}
```

Steps are **numbered** (`[Step(n)]`, 1-based), not step classes. Overrides: `StepTitle(n)`,
`CompletionActionLabel`, `StepSkippable(n)`, `BeforeStepNavigate(from, to)` (non-null result
cancels and becomes the answer), `OnNext(from, to)`.

## Archetypes — declare component properties, the page composes itself

```csharp
[UI("sales"), Title("Sales")]
public class SalesDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new()
        { Title = "Revenue", Value = "1.2", Unit = "M€", Trend = MetricTrend.Up, ActionId = "openRevenue" };
    public MetricCard OrdersCount { get; } = new() { Title = "Orders", Value = "3,421" };

    [Panel(Title = "Rollout", ColSpan = 2)]
    public Gantt Plan { get; } = new() { Tasks = [ new GanttTask
        { Id = "t1", Title = "Design", Start = new(2026, 7, 1), End = new(2026, 7, 20), Progress = 80 } ] };

    public string OpenRevenue() => "/orders";    // advertised by the tile's ActionId → may run
}

[UI("home")]
public class Home : Welcome
{
    protected override string? HeroTitle => "My app";
    public Button BrowseProducts { get; } = new("Browse products", "browse") { Primary = true };
    [Panel(Title = "Products")] public Text Tile { get; } = new("A whole CRUD from one class.");
    public string Browse() => "/products";       // runs for ActionId "browse" (camelCased method name)
}
```

Don't give a property and the action method the same name (C# forbids it): the button's action id
`browse` maps to the method `Browse()`, so the property is `BrowseProducts`.

| Archetype | Shape |
|---|---|
| `Dashboard` | consecutive `MetricCard`s → KPI band; `[Panel]` components → tiles (`Columns` fixes the grid) |
| `Welcome` | `Button` properties → hero CTAs; `[Panel]` → tiles; `HeroTitle`/`HeroSubtitle`/`HeroImage` |
| `Foldout` | first non-panel component = overview; `[Panel(Open = false)]` = lateral fold-out panels |
| `ItemOverview` | first non-panel component = sticky key info; `[Panel]` = tabs |
| `CollectionDetail<TRow>` | override `Rows(search)`, `IdOf`, `TitleOf`, `Detail(row)` → card list + detail |
| `GeneralOverview<TRow>`, `TodoList<TRow>`, `CalendarPage`, `GanttPage`, `DataManagement`, `SmartSearchPage<F,R>`, `HeroSearch<T>` | see the C# manual |

`[AutoPage]` inference is on: a plain `[UI]` class whose properties are `MetricCard`s composes a
dashboard; only `Button`s + `[Panel]`s composes a welcome page.

## Fluent component trees

```csharp
[UI("plan"), Title("Plan")]
public class Plan : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout { Content = [
        new Text("Next milestones"),
        new Gantt { Tasks = [ new GanttTask { Id = "a", Title = "Build", Start = new(2026, 2, 1), End = new(2026, 5, 1) } ] },
    ] };
}
```

Fluent records (all in `Mateu.Uidl`): `Text`, `Button`, `Card`, `VerticalLayout`,
`HorizontalLayout`, `TabLayout`/`TabPanel`, `FormField`, `MetricCard`, `Scoreboard`,
`DashboardPanel`, `ResponsiveGrid`, `HeroSection`, `EmptyState`, `Skeleton`, `Gantt`, `Map`,
`Drawer`, `Dialog`, `MicroFrontend`, `EmbeddedView`, `ComponentRef`… An `ActionId` set on a
component reaches the view method of that camelCased name (advertised automatically).
