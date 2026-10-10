# Mateu server-side for Python

A Python implementation of Mateu's **server side**: annotate plain Python classes and serve the
`/mateu/v3/sync` API, so the **existing renderers** (web, React Native, IntelliJ plugin) render a Python backend
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
- **Capability listings** — `Listing[Row]` + mixins `Searchable`/`Filterable[F]`/`Navigable`/
  `Editable`/`Creatable`/`Deletable`: a listing that grows by declaring capabilities as base
  classes (mirror of the Java model; `Crud[T]` = all of them at once).
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
  `GanttTask`, plus fluent `Text` and `Button`. `PlanningBoard` (tape chart: `PlanningResource`
  rows × days, `PlanningBlock`s) also carries the OPERA Room Diary extras — `attribute_columns`
  + per-resource `attributes`/`icon`, block `icon`/`summary` (hover text), and
  `resize_action_id` / `open_action_id` (double click) / `range_select_action_id` (drag across
  empty cells) next to `move_action_id`/`select_action_id`. `Map` / `MapMarker` (street map: `position`
  "lat, lon", `zoom`, `markers`; a marker click runs `marker_action_id` with `_markerId`).
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

## Install

```bash
pip install "mateu-ui[server]"          # the package + uvicorn
pip install "mateu-ui[all]"             # + PyJWT (identity), openpyxl/reportlab (Excel/PDF export)
```

The distribution is **`mateu-ui`** (the PyPI name `mateu` belongs to an unrelated project); the
import names are `mateu_uidl`, `mateu_dtos`, `mateu_core` and `mateu_fastapi`. Versions move in
lockstep with the Java artifacts: the `v3.0-alpha.N` release publishes `3.0.0aN`.

## Run

```bash
cd backend/python
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev,all]"
uvicorn samples.demo.main:app --host 0.0.0.0 --port 8594   # serves the sync API
pytest                                                     # golden tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8594`.
The server binds to `0.0.0.0`, so the iOS simulator (`localhost:8594`) and Android emulator
(`10.0.2.2:8594`) reach it too.

## Serving: `add_mateu`

```python
from fastapi import FastAPI
from mateu_fastapi import add_mateu
from mateu_core.identity import jwt_identity_provider

app = FastAPI()
add_mateu(
    app, views,
    cors_origins=["https://app.example.com"],            # CORS is OFF unless you list origins
    identity_provider=jwt_identity_provider(key=PUBLIC_KEY, algorithms=["RS256"]),
    secrets_provider=lambda key: vault.read(key),        # ${secret.KEY} in proxied REST sources
)
```

- **Identity.** `EyesOnly` / `ReadOnlyUnless` / `DisabledUnless` (and `disabled_unless`) match the
  caller's `Identity(roles, groups, scopes, permissions)`. The provider is **parameterless** (the
  port's idiom); it reads the request in flight from a per-request `ContextVar`:
  `mateu_core.request_context.current_request()` (headers, base url, correlation id) or
  `bearer_token()`. The default is `jwt_identity_provider()`, which maps the Bearer JWT's claims
  exactly like Java's `Authorizer` (Keycloak `realm_access`/`resource_access` roles + `roles`,
  `groups`, `scope`/`scp`, `permissions`). **Without a `key` it reads the claims unverified** —
  as Java does, assuming a gateway/middleware verified the token; pass `key=` to verify here. It
  needs the `jwt` extra; without PyJWT no identity is resolved and every gate denies.
- **Secrets.** `secrets_provider(key) -> str | None` resolves `${secret.KEY}`; unset → the
  same-named environment variable. Only the proxy channel (`__restfetch__`) ever sees them.
- **CORS (breaking).** `add_mateu` used to install `allow_origins=["*"]` by default. CORS is now
  off unless `cors_origins=[...]` lists the allowed origins (`["*"]` still works if you mean it);
  `cors=True` without origins raises. A renderer served by the same app needs no CORS.
- **Errors.** An unhandled exception answers an error toast, never a raw 500: a generic text
  carrying a correlation id (also in the `X-Mateu-Correlation-Id` header and in the logged
  traceback). `dev=True` (or `MATEU_DEV=true`) shows the exception class and message instead, like
  Java; raise `mateu_uidl.UserFacingError("…", title="…")` for a message written for the user,
  which is always shown. A denied action still answers 403.
- **Concurrency.** The handler runs in Starlette's threadpool, so a slow proxied upstream
  (`proxy_timeout_seconds`, default 30) never blocks the event loop; per-request state (the
  request, the matched route seed, the audience) lives in `ContextVar`s, never on the shared
  handler.
- **Audience is a projection, not security.** `Audience()` / `@audience` read the client-controlled
  `appState["audience"]`; any caller can send any value. Use it to tailor a screen to a persona, and
  `EyesOnly` (identity) for anything that must stay hidden.

## Define views

```python
from typing import Annotated
from mateu_uidl import ui, title, section, button, Required, Section, Message, app, menu_item, menu_group, MenuDisplay, Crud

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

# A card menu (like the product dropdowns of a docs site): @menu_group(display="cards") opens a
# folder as a panel of cards; @menu_item(description=, icon=, image=) / @menu_group on a nested
# folder ("Bookings/Reservations") give each card its look, and a nested folder's entries are its
# actions. Code-authored menus (MenuSupplier / AppSupplier) set MenuItem.display/description/icon/image.
@app("PMS")
@menu_group("Bookings", display=MenuDisplay.cards)
@menu_group("Bookings/Reservations", description="Search, create and modify",
            icon="vaadin:calendar", image="/img/res.png")
class PmsApp:
    @menu_item("Search", group="Bookings/Reservations")
    def search(self) -> Reservations: return Reservations()

    @menu_item("Room diary", group="Bookings", description="Rooms by day")
    def diary(self) -> Person: return Person()
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
