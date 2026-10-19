# Python app shell, wizards, archetypes, fluent trees

## App shell, menu, home page

```python
from __future__ import annotations       # lets the menu name views defined further down
from mateu_ui.uidl import HomeRouteSupplier, app, menu_item, remote_menu

@app("My app")
@remote_menu("Billing", "https://billing.example.com", explode=True)   # federated entries
class Shell(HomeRouteSupplier):
    @menu_item("Home")
    def home(self) -> Home:              # the return ANNOTATION names the target view
        return Home()

    @menu_item("Orders", group="Sales")  # nested under "Sales" ("A/B" nests folders)
    def orders(self) -> OrdersListing:
        return OrdersListing()

    def home_route(self) -> str:         # without it: the first navigable menu entry
        return "home"
```

Menu entries are **methods returning the target view** (Java uses `@Menu` fields). An
`@app_context("Hotel")` method returning `(value, label)` pairs adds a header selector whose
value travels in every request's app state. A `MicroFrontend(base_url=…, route=…)` component
embeds a remote route in a page. Code-authored shells/routes: `AppSupplier`, `MenuSupplier`,
`RouteEntrySupplier`.

## Wizard

```python
from typing import Annotated
from mateu_ui.uidl import Message, Required, Step, Wizard, title, ui, wizard_progress

@ui("onboarding")
@title("Onboarding")
@wizard_progress("steps")                # "bar" | "steps" | "rail"
class Onboarding(Wizard):
    email: Annotated[str, Required(), Step(1)] = ""
    company: Annotated[str, Step(2)] = ""

    def complete(self) -> Message:
        return Message(f"Welcome {self.email}")
```

Steps are **numbered** (`Step(n)`, 1-based). Hooks: `step_title(n)`, `step_skippable(n)`,
`before_step_navigate(from_step, to_step)` (non-None result cancels and becomes the answer),
`on_next(from_step, to_step)`; `@wizard_completion_action("Book")` on a method turns the
penultimate step's Next into that button and the last step into the result screen.

## Archetypes — declare component fields, the page composes itself

```python
from datetime import date
from typing import Annotated
from mateu_ui.uidl import Dashboard, Panel, Welcome, title, ui
from mateu_ui.uidl.components import Button, Gantt, GanttTask, MetricCard, MetricTrend, Text

@ui("sales")
@title("Sales")
class SalesDashboard(Dashboard):
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2", unit="M€",
                                     trend=MetricTrend.up, action_id="openRevenue")
    orders: MetricCard = MetricCard(title="Orders", value="3,421")
    plan: Annotated[Gantt, Panel("Rollout", col_span=2)] = Gantt(tasks=(
        GanttTask(id="t1", title="Design", start=date(2026, 7, 1), end=date(2026, 7, 20), progress=80.0),
    ))

    def open_revenue(self) -> str:       # advertised by the tile's action_id → may run
        return "/orders"

@ui("home")
class Home(Welcome):
    browse: Button = Button(label="Browse products", action_id="browseProducts", button_style="primary")
    products: Annotated[Text, Panel("Products")] = Text(text="A whole CRUD from one class.")

    def hero_title(self) -> str:
        return "My app"

    def browse_products(self) -> str:    # action id browseProducts ↔ browse_products
        return "/products"
```

| Archetype | Shape |
|---|---|
| `Dashboard` | consecutive `MetricCard`s → KPI band; `Panel(...)` fields → tiles (`columns()` fixes the grid) |
| `Welcome` | `Button` fields → hero CTAs; `Panel(...)` → tiles; `hero_title()`/`hero_subtitle()`/`hero_image()` |
| `Foldout` | first non-panel component = overview; `Panel(title, open=False)` = fold-out panels |
| `ItemOverview` | first non-panel component = sticky key info; `Panel(title)` = tabs; `panel_width()` |
| `CollectionDetail` | override `rows(search)`, `id_of`, `title_of`, `detail(row)` → card list + detail |
| `GeneralOverview`, `TodoList`, `CalendarPage`, `GanttPage`, `DataManagement`, `SmartSearchPage`, `HeroSearch` | see the Python manual |

`@auto_page` inference is on: a plain `@ui` class whose fields are `MetricCard`s composes a
dashboard; only `Button`s + `Panel` fields composes a welcome page.

## Fluent component trees

```python
from datetime import date
from mateu_ui.uidl import ComponentTreeSupplier, title, ui
from mateu_ui.uidl.components import Gantt, GanttTask

@ui("project-plan")
@title("Project plan")
class ProjectPlan(ComponentTreeSupplier):
    def component(self):
        return Gantt(tasks=(
            GanttTask(id="a", title="Analysis", start=date(2026, 1, 7), end=date(2026, 2, 1), progress=100.0),
        ))
```

Components live in `mateu_ui.uidl.components` (snake_case keyword arguments): `Text`, `Button`,
`FormField`, `MetricCard`, `Scoreboard`, `DashboardPanel`, `ResponsiveGrid`, `HeroSection`,
`EmptyState`, `Skeleton`, `Gantt`, `Map`, `Drawer`, `Dialog`, `MicroFrontend`, `ComponentRef`…
An `action_id` on a component reaches the view method with that camelCased name.
