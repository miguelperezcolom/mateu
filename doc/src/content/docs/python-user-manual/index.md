---
title: "Python"
description: "Build Mateu apps with a Python server — annotate Python classes and any Mateu renderer renders them, with zero client changes."
---

Mateu has a **Python server-side implementation**. You annotate plain Python classes, and the
**existing renderers** (web and native) render them with **zero client changes** — exactly as
they render the Java backend.

> Coming from Java? The [Language Rosetta](/reference/language-rosetta/) maps every declaration
> idiom side by side, and the [parity matrix](/reference/parity/) shows exactly what this server
> supports today.

## How it works

Every Mateu renderer speaks one protocol: `POST /{baseUrl}/mateu/v3/sync/{route}` in, a
`UIIncrement` JSON tree out. So the Python side does **not** re-implement the whole framework — it
**emits the same JSON**. FastAPI hosts the `sync` endpoint; a reflection mapper turns your annotated
classes into the Mateu component tree; Pydantic v2 discriminated unions produce the `type`
discriminators the renderers expect.

The implementation lives at [`backend/python`](https://github.com/miguelperezcolom/mateu/tree/master/backend/python)
(`DESIGN.md` for the plan, `README.md` for status). Its output was verified byte-identical to the C#
reference for the same view.

## The Python idiom: `Annotated` + decorators

Python attributes can't carry C#-style attributes, so:

- **Field modifiers** ride inside `Annotated[T, Marker(...)]`.
- **Class and method features** are decorators.

## Run it

```bash
cd backend/python
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn samples.demo.main:app --host 0.0.0.0 --port 8594   # serves the sync API
pytest                                                     # golden tests
```

Point any Mateu renderer at it — e.g. set the Compose app's `mateu.baseUrl=http://localhost:8594`.
The server binds to `0.0.0.0`, so the iOS simulator and Android emulator reach it too.

Wire it up:

```python
from fastapi import FastAPI
from mateu_fastapi import add_mateu
from samples.demo import views      # a module holding your @ui / @app classes

app = FastAPI()
add_mateu(app, views)
```

## Forms

A `@ui` class becomes a routed form. Public type-hinted fields become fields (the type is inferred:
`str`, `int`→integer, `float`/`Decimal`→number, `bool`→boolean, `date`/`datetime`→date, `Enum`→
dropdown). `Required()` makes a field required and is enforced server-side. A `@button` method
returning a `Message` shows a toast.

```python
from typing import Annotated
from mateu_uidl import ui, title, subtitle, section, button, Required, Section, Message

@ui("person")
@title("Person")
@subtitle("Personal data")
class Person:
    name: Annotated[str | None, Required(), Section("Identity")] = None
    age: int = 0
    subscribed: Annotated[bool, Section("Preferences")] = False
    role: Role = Role.GUEST            # Enum → dropdown

    @button()
    def save(self) -> Message:
        return Message(f"Saved {self.name}")
```

`Section("…")` on the first field of a group starts a titled card that following fields join.

## CRUD

Derive from `Crud[T]` and override `fetch` (and, as needed, `get` / `save` / `delete`). You get a
searchable listing — a table on desktop, cards on mobile — plus full detail / edit / new flows
(routes `/x`, `/x/{id}`, `/x/{id}/edit`, `/x/new`), with `Required()` validation on save.

```python
@ui("reservations")
@title("Reservations")
class Reservations(Crud[Reservation]):
    def fetch(self, search):
        return [r for r in store if not search or search in r.locator]

    def get(self, id): return store_by_id.get(id)
    def save(self, entity): store_by_id[entity.id] = entity
    def delete(self, id): store_by_id.pop(id, None)
```

The listing renders a **smart search bar** whose filters come straight from the entity: enums
become multi-selects (IN over the picked values), `date`/`datetime` fields become from–to date
ranges, numerics annotated `RangeFilter()` become min–max ranges, and strings/bools/plain numbers
keep single-value widgets. The values are applied automatically over what `fetch` returns — no
filter code to write:

```python
class Reservation:
    id: str = ""
    guest: str = ""
    channel: Channel = Channel.WEB                       # multi-select filter
    arrival: date = date(2026, 1, 1)                     # date-range filter
    total: Annotated[float, RangeFilter()] = 0.0         # number-range filter
```

## App shell & navigation

An `@app` class is the application shell; each `@menu_item` method contributes a menu entry that
navigates to the view it returns (read from the method's return annotation).

```python
@app("My Python Mateu app")
class DemoApp:
    @menu_item("Reservations")
    def reservations(self) -> Reservations: return Reservations()

    @menu_item("Person")
    def person(self) -> Person: return Person()
```

## Wizards

Derive from `Wizard`, tag each field with `Step(n)`, and implement `complete()`. Mateu renders a
progress bar plus Back/Next; the step + field values round-trip through component state.

```python
@ui("signup")
@title("Sign up")
class SignupWizard(Wizard):
    email: Annotated[str | None, Step(1)] = None
    password: Annotated[str | None, Step(2), Password()] = None

    def complete(self) -> Message:
        return Message(f"Welcome {self.email}")
```

## Tabs & field stereotypes

Tag consecutive fields with `Tab("Name")` to group them into a tab strip. Field stereotypes:

| Marker | Effect |
|---|---|
| `Multiline()` | multi-line text area |
| `Password()` | password input |
| `Money()` | tagged `money` so the renderer formats it as currency |
| `PlainText()` | read-only plain text (also valid class-level via `@plain_text`) |
| `Stereotype("…")` | an explicit stereotype |

```python
class Profile:
    name: Annotated[str | None, Tab("Identity")] = None
    secret: Annotated[str | None, Tab("Identity"), Password()] = None
    bio: Annotated[str | None, Tab("About"), Multiline()] = None
    salary: Annotated[float, Tab("About"), Money()] = 0.0
```

## KPIs, FABs, shortcuts & page flags

```python
from mateu_uidl import kpi, fab, shortcut, button, compact, confirm_on_navigation_if_dirty

@ui("dashboard")
@compact                            # high-density rendering
@confirm_on_navigation_if_dirty     # warn before leaving with unsaved changes
class Dashboard:
    @kpi("Open tickets")
    def open_tickets(self) -> str: return "42"

    @fab("plus", "Add", 0)          # floating action button
    def add(self) -> Message: return Message("Added")

    @button()
    @shortcut("ctrl+s")             # keyboard shortcut
    def save(self) -> Message: return Message("Saved")
```

## Dashboards, foldouts & UX-pattern components

The UX-pattern components from the Java backend are available as **fluent components** in
`mateu_uidl.components` — they emit the exact same wire JSON, so every renderer that supports them
renders the Python backend unchanged:

| Component | Purpose |
|---|---|
| `MetricCard` (+ `MetricTrend`) | KPI tile: title, value, unit, trend (`up`/`down`/`neutral`), drill-in `action_id` |
| `Scoreboard` | horizontal band of metric cards |
| `DashboardPanel` | titled tile wrapping any component; `col_span`/`row_span` |
| `DashboardLayout` | responsive dashboard grid (`columns=0` = auto-fit) |
| `FoldoutPanel` / `FoldoutLayout` | Redwood-style foldout: fixed overview + lateral fold-out panels |
| `HeroSection` | big page hero: title, subtitle, background image, slotted content |
| `EmptyState` | friendly "nothing here yet" placeholder with an optional call-to-action |
| `Skeleton` (+ `SkeletonVariant`) | shimmering loading placeholder (`text`/`card`/`grid`/`form`) |
| `Gantt` / `GanttTask` | read-only Gantt/timeline chart (ISO dates, progress 0–100, color) |

The **declarative archetypes** compose them from your fields, exactly like the Java
`Dashboard`/`Foldout`/`ItemOverview`/`Welcome` orchestrators. Declare type-hinted fields holding
components; mark titled panels with `Panel(...)` inside `Annotated[...]` (the analogue of Java's
`@Panel`):

```python
from datetime import date
from typing import Annotated
from mateu_uidl import ui, title, Dashboard, Panel
from mateu_uidl.components import MetricCard, MetricTrend, Gantt, GanttTask

@ui("dashboard")
@title("Sales dashboard")
class SalesDashboard(Dashboard):
    # consecutive MetricCards group into a full-width Scoreboard KPI band
    revenue: MetricCard = MetricCard(title="Revenue", value="1.2", unit="M€",
                                     trend=MetricTrend.up, action_id="openRevenue")
    incidents: MetricCard = MetricCard(title="Incidents", value="3", trend=MetricTrend.down)

    # Panel(...) fields become titled tiles on a responsive grid
    plan: Annotated[Gantt, Panel("Rollout plan", col_span=2)] = Gantt(tasks=(
        GanttTask(id="t1", title="Design", start=date(2026, 7, 1), end=date(2026, 7, 20),
                  progress=80.0),
    ))

    def open_revenue(self):     # runs when the Revenue tile is clicked
        ...
```

- **`Dashboard`** — consecutive `MetricCard` fields → `Scoreboard` band; `Panel(...)` fields →
  titled tiles; other component fields land on the grid as-is. Override `columns()` to fix the
  column count.
- **`Foldout`** — the first component field without `Panel` is the always-visible overview;
  `Panel(title, subtitle, icon, open)` fields are lateral fold-out panels.
- **`ItemOverview`** — the first component field without `Panel` is the key-info panel (left,
  sticky); `Panel(title)` fields become tabs on the right. Override `panel_width()`.
- **`Welcome`** — fluent `Button` fields become hero call-to-action buttons; `Panel(title)` fields
  become highlight tiles below. Override `hero_title()` / `hero_subtitle()` / `hero_image()`.

For full control, subclass `ComponentTreeSupplier` and return any fluent component tree:

```python
from mateu_uidl import ui, title, ComponentTreeSupplier
from mateu_uidl.components import Gantt, GanttTask

@ui("project-plan")
@title("Project plan")
class ProjectPlan(ComponentTreeSupplier):
    def component(self) -> Gantt:
        return Gantt(tasks=(
            GanttTask(id="a", title="Analysis", start=date(2026, 1, 7), end=date(2026, 2, 1),
                      progress=100.0),
            GanttTask(id="b", title="Build", start=date(2026, 2, 1), end=date(2026, 5, 1)),
        ))
```

Action ids referenced by `MetricCard`, `EmptyState` or `Button` components are advertised
automatically and dispatch to the method of the same (camelCased) name.

## Page decorations

- `@subtitle("…")` — a subtitle under the page title.
- `@banner(BannerTheme.INFO, "Title")` on a method — a banner below the header; if the method returns
  a string, that's the description. Themes: `INFO`, `SUCCESS`, `WARNING`, `DANGER`.
- `HeaderBadge(color="success")` in a field's `Annotated[...]` — a status chip in the header strip.

## i18n, events & security

- **i18n** — subclass `Translator`, override `translate`, and pass it to `add_mateu(..., translator=…)`.
- **Events** — `@emits("event-name")` advertises an event; `@subscribe_to("event", "action")` runs
  `action` when that event fires.
- **Security** — `@secured("permission")` marks a view as requiring a permission.

```python
class UpperTranslator(Translator):
    def translate(self, key: str) -> str: return key.upper()
```

## Navigation links, radio groups & adaptive layout

`Annotated[str, LinkTo("/customers/${state.customerId}")]` puts a navigation icon on a field
(templates interpolate client-side); give the view a `link(member_name)` method for runtime
decisions. `UseRadioButtons()` forces an enum to render as a radio group, and `@auto_layout`
enables the adaptive layout inference (small enums become radios, long forms fold, section-heavy
forms become tabs) — the same heuristics as the Java server.

## Application context selector

An `@app_context` method of the app class becomes a selector on the app header that fixes a value
for EVERY screen (the active hotel, the company…) — return the options as `Option` objects or
`(value, label)` pairs, or annotate the return type as an Enum. The picked value travels in the
`app_state` of every request:

```python
@app("Backoffice")
class BackofficeApp:
    @app_context("Hotel")
    def hotel(self):
        return [(h.id, h.name) for h in hotels]
```

## Capture fields & tree selects

`Annotated[str, Signature()]` renders a drawing pad (the accepted strokes land in the value as a
PNG data URI) and `Annotated[str, PhotoCapture()]` a camera capture (JPEG data URI) — no upload
endpoint, the image travels in the string. `Annotated[str, TreeSelect(leaves_only=True)]` unfolds
the field's dropdown as a TREE; the hierarchy comes from the view's `options(field_name)` method
returning options with children:

```python
@ui("checkin")
class CheckIn:
    guest_signature: Annotated[str, Signature()] = ""
    document_photo: Annotated[str, PhotoCapture()] = ""
    zone: Annotated[str, TreeSelect()] = ""

    def options(self, field_name):
        if field_name == "zone":
            return [
                Option(value="es", label="Spain", children=[Option(value="mca", label="Mallorca")]),
                Option(value="pt", label="Portugal"),
            ]
        return []
```

## Semantic annotations

The Python analogue of Java's composed annotations needs **no framework machinery at all**: a
reusable `Annotated` alias IS the semantic annotation — one domain word bundling markers —

```python
ImporteTotal = Annotated[float, Money(), Label("Importe total")]

@ui("/invoice")
class Invoice:
    total: ImporteTotal = 0.0   # behaves as Money() + Label(...) directly
```

and class/method decorators compose as plain functions:

```python
def pantalla_compacta(cls):
    return compact(read_only(cls))
```

## AI chat (SSE)

`@ai(sse="/ai/chat")` on the `@app` class emits `sseUrl` in the app metadata; every renderer then
shows the floating AI chat button. The endpoint is yours to implement — the chat panel POSTs

```json
{ "message": "user text", "sessionId": "…", "menuContext": "… (first message only)" }
```

with `Accept: text/event-stream` (plus `Authorization: Bearer …` and `X-Session-Id` when
available) and renders the streamed `data:` lines as the reply. Special `data:` payloads: a JSON
`{"event": "...", "detail": {...}}` is re-dispatched on the client event bus (`agent-error` shows
an error bubble), and a token-usage JSON updates the usage footer. A minimal FastAPI endpoint:

```python
from fastapi.responses import StreamingResponse

@fastapi_app.post("/ai/chat")
async def chat(rq: dict):
    async def stream():
        async for chunk in my_agent.stream(rq["message"], rq.get("sessionId")):
            yield f"data: {chunk}\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")
```

## Python 3.14+ note

Under [PEP 649](https://peps.python.org/pep-0649/) annotations evaluate lazily and are no longer
eagerly stored in `__dict__['__annotations__']`. Mateu reads them via `inspect.get_annotations(...)`,
so the field markers work on Python 3.11 through 3.14+.

## Status

Forms + sections + field types + validation, `Crud[T]` (list / detail / edit / new / save / delete),
the `@app` shell + menu navigation, wizards, page decorations, tabs, stereotypes, KPIs, FABs,
shortcuts, compact, the unsaved-changes guard, i18n, events, security scaffolding, and the
UX-pattern components (MetricCard/Scoreboard/DashboardPanel/DashboardLayout, FoldoutLayout,
HeroSection, EmptyState, Skeleton, Gantt) with the Dashboard/Foldout/ItemOverview/Welcome
declarative archetypes. 43 golden-JSON tests assert wire compatibility; the live `showcase` view
is byte-identical to the C# reference.
