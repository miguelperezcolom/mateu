# Mateu server-side for Python

A Python implementation of Mateu's **server side**: annotate plain Python classes and serve the
`/mateu/v3/sync` API, so the **existing renderers** (web, JavaFX, Compose) render a Python backend
with **zero client changes**. See [`DESIGN.md`](DESIGN.md) for the plan and the [C# port](../dotnet)
for the sibling implementation.

> **The leverage:** the renderers are backend-agnostic — they POST `/mateu/v3/sync/{route}` and
> consume the `UIIncrement` JSON. So this is **not** a port of the ~865-file Java framework; it just
> **emits the same JSON**. Verified by diffing the live output against the C# reference: the
> `showcase` view is byte-identical (344/344 lines). 20 golden-JSON tests pass.

## What works

- **Forms** — `@ui` classes; public type-hinted fields become fields (type inferred: `str`,
  `int`→integer, `float`/`Decimal`→number, `bool`→boolean, `date`/`datetime`→date, `Enum`→dropdown);
  `Required()` → required (enforced server-side); `Section("…")` → cards; `@button` → action + toast.
- **CRUD** — `Crud[T]`: searchable listing (table on desktop, cards on mobile) **plus** full
  detail / edit / new (routes `/x`, `/x/{id}`, `/x/{id}/edit`, `/x/new`), save with validation,
  delete, back-to-list navigation.
- **App shell** — `@app` + a menu from `@menu_item` methods + route navigation.
- **Wizards** — `Wizard` base, `Step(n)` fields, progress + Back/Next, state round-trip.
- **Decorations** — `@subtitle`, `@banner`, `HeaderBadge`.
- **Tail features** — `Tab` → tab strip (`Tab("Name", open=True)` makes that tab the one selected on
  first render instead of the first-declared one); field stereotypes (`Multiline`, `Password`, `Money`,
  `PlainText`, `Stereotype`); `LinkTo(href, icon, title, target)` → a nav-link icon on the field
  (href/title travel as raw `${...}` templates, interpolated client-side; implement `LinkSupplier`
  on the view for programmatic links — it wins, `None` falls back to the marker); `@kpi` → KPI
  cards; `@fab` → floating action buttons; `@shortcut`; `@compact`;
  `@confirm_on_navigation_if_dirty`.
- **i18n / events / security** — `Translator`; `@emits` / `@subscribe_to`; `@secured`.
- **Layout inference** — `@auto_layout` (opt-in, `@auto_layout(False)` opts out) ports the Java
  `LayoutInference` decision table (same constants/thresholds): heavy unstructured editable forms
  fold optional fields into a collapsed "More options" accordion panel; heavy `@read_only` views
  with ≥ 5 sections become an adaptable `TabLayout` (id `_tabs`, `groupRelationship="alternative"`);
  enums with ≤ 4 members render as radio buttons (`UseRadioButtons()` forces radio always);
  developer-declared tabs always carry `groupRelationship="alternative"` and are `adaptable` when
  the class opted in. Explicit layout markers always win.
- **UX-pattern components** (`mateu_uidl.components`, same wire JSON as the Java
  `MetricCardDto`…`GanttDto`) — `MetricCard` (+ `MetricTrend`), `Scoreboard`, `DashboardPanel`,
  `DashboardLayout`, `FoldoutPanel`/`FoldoutLayout` (overview slotted `overview`, panel contents
  slotted `panel-N`), `HeroSection`, `EmptyState`, `Skeleton` (+ `SkeletonVariant`), `Gantt` /
  `GanttTask`, plus fluent `Text` and `Button`.
- **Declarative archetypes** — subclass `Dashboard` / `Foldout` / `ItemOverview` / `Welcome` and
  declare type-hinted fields holding components; `Panel(title, subtitle, col_span, row_span, icon,
  open)` in `Annotated[...]` marks titled panels/tabs/tiles (the analogue of Java's `@Panel`).
  Or subclass `ComponentTreeSupplier` and return any fluent component tree from `component()`.

## Projects

| Package | Role |
|---|---|
| `mateu_uidl` | Public API — decorators (`@ui`, `@app`, `@button`, …) + field markers + `Message`, `Crud`, `Wizard`, `Translator` |
| `mateu_dtos` | The wire model in Pydantic — `UIIncrement`, `Component` + metadata (polymorphism on `type`) |
| `mateu_core` | The engine — `MateuRegistry`, `ReflectionMapper`, `SyncHandler` |
| `mateu_fastapi` | `add_mateu(app, …)` — the `POST /mateu/v3/sync/{route}` endpoint |
| `samples/demo` | A runnable FastAPI app |
| `tests` | Golden-JSON tests asserting wire compatibility with the Java/C# backends |

## Run

```bash
cd backend/python
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn samples.demo.main:app --host 0.0.0.0 --port 8594   # serves the sync API
pytest                                                     # golden tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8594`.
The server binds to `0.0.0.0`, so the iOS simulator (`localhost:8594`) and Android emulator
(`10.0.2.2:8594`) reach it too.

## Define views

```python
from typing import Annotated
from mateu_uidl import ui, title, section, button, Required, Section, Message, app, menu_item, Crud

@ui("person")
@title("Person")
class Person:
    name: Annotated[str | None, Required(), Section("Identity")] = None
    age: int = 0

    @button()
    def save(self) -> Message:
        return Message(f"Saved {self.name}")

@ui("reservations")
@title("Reservations")
class Reservations(Crud[Reservation]):
    def fetch(self, search): ...

@app("My Python Mateu app")
class DemoApp:
    @menu_item("Person")
    def person(self) -> Person: return Person()
```

Dashboards, foldouts and Gantt charts use the fluent components + archetypes:

```python
from datetime import date
from mateu_uidl import ui, title, Dashboard, Panel
from mateu_uidl.components import MetricCard, MetricTrend, Gantt, GanttTask

@ui("dashboard")
@title("Sales dashboard")
class SalesDashboard(Dashboard):
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2", unit="M€",
                                     trend=MetricTrend.up, action_id="openRevenue")
    incidents: MetricCard = MetricCard(title="Incidents", value="3", trend=MetricTrend.down)
    plan: Annotated[Gantt, Panel("Rollout plan", col_span=2)] = Gantt(tasks=(
        GanttTask(id="t1", title="Design", start=date(2026, 7, 1), end=date(2026, 7, 20),
                  progress=80.0),
    ))

    def open_revenue(self): ...   # runs when the Revenue tile is clicked
```

## Note for Python 3.14+

Under [PEP 649](https://peps.python.org/pep-0649/) annotations are evaluated lazily and are no longer
eagerly stored in `__dict__['__annotations__']`. The reflection layer reads them via
`inspect.get_annotations(...)`, so the field markers work on 3.11 through 3.14+.
