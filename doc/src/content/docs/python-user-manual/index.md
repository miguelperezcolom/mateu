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
(`DESIGN.md` for the plan, `README.md` for status). It mirrors the C# reference behaviour, emitting
the same wire JSON for the same view.

## The Python idiom: `Annotated` + decorators

Python attributes can't carry C#-style attributes, so:

- **Field modifiers** ride inside `Annotated[T, Marker(...)]`.
- **Class and method features** are decorators.

## Install

```bash
pip install "mateu-ui[server]"     # the package + uvicorn
pip install "mateu-ui[all]"        # the FastAPI server extras
```

The distribution is **`mateu-ui`** (the PyPI name `mateu` belongs to an unrelated project); you
import `mateu_uidl`, `mateu_dtos`, `mateu_core` and `mateu_fastapi`. Versions move in lockstep with
the Java artifacts: the `v3.0-alpha.N` release publishes `3.0.0aN`. Python 3.11–3.13 are tested.

## Run it

```bash
cd backend/python
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[dev,all]"
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

### `add_mateu` options

```python
add_mateu(
    app, views,
    cors_origins=["https://app.example.com"],      # CORS is OFF unless you list origins
    secrets_provider=lambda key: vault.read(key),  # ${secret.KEY} in proxied REST sources
    dev=False,                                     # exception detail in error toasts (or MATEU_DEV)
    proxy_timeout_seconds=30,
)
```

- **Identity.** `EyesOnly` / `ReadOnlyUnless` / `DisabledUnless` / `@eyes_only` match the caller's
  `Identity(roles, groups, scopes, permissions)`. **Mateu does not authenticate**: by default it
  takes the identity your app established — `request.state.mateu_identity` (set by your dependency
  or middleware), else Starlette's `AuthenticationMiddleware`. Verify tokens in your app and hand
  Mateu the result:

  ```python
  from mateu_core.identity import identity_from_claims

  @app.middleware("http")
  async def authenticate(request, call_next):
      claims = verify_with_your_idp(request.headers.get("authorization"))  # e.g. PyJWT + JWKS
      if claims is not None:
          request.state.mateu_identity = identity_from_claims(claims)
      return await call_next(request)
  ```

  No identity → every gate denies. `identity_provider=` replaces the default with your own
  parameterless provider.
- **Secrets.** `secrets_provider(key)` resolves `${secret.KEY}`; unset → the env var `MATEU_SECRET_<KEY>` (only that prefix, never an arbitrary variable). Only
  proxied fetches (`__restfetch__`) see them.
- **CORS (breaking change).** `add_mateu` used to allow every origin. Now CORS is off unless
  `cors_origins` lists them; `cors=True` without origins raises. A renderer served by the same app
  needs none.
- **Errors.** An unhandled exception answers an error toast, never a raw 500 — the same texts as
  Java and .NET ("Something went wrong" / "An unexpected error occurred. Reference: <id>"), the
  reference being the request's correlation id (also in the `X-Mateu-Correlation-Id` header and the
  logged traceback). `dev=True` / `MATEU_ERRORS_DETAILED=true` shows the exception; raise
  `mateu_uidl.UserFacingException("…", title="…")` for a message written for the user. A denied
  action answers 403.
- **Concurrency.** The handler runs in the threadpool (a slow proxied upstream never blocks the event
  loop); per-request state lives in `ContextVar`s.
- **Audience is a projection, not security.** `Audience()` / `@audience` read the client-controlled
  `appState["audience"]` — any caller can send any value. Tailor screens with it; hide data with
  `EyesOnly`.

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

Decorate the crud class with `@edit_in_drawer` and New/row clicks open the create/edit form in a
**drawer sliding over the listing** (the listing never unmounts; saving persists, closes the
drawer and refreshes the rows in place).

Two more archetypes mirror the Java orchestrators: subclass `CollectionDetail` (searchable card
list on the left, the selected item's detail re-rendered in place on the right) or
`GeneralOverview` (a record context switcher over the selected record's overview). Both are built
on the fluent `FormField` primitive — a live field you can compose into any fluent tree.

## Listings & capabilities

When you don't want the whole CRUD pack, subclass `Listing` — one method — and grow the page by
**declaring capabilities as extra base classes** (multiple inheritance is the Python idiom for
the Java capability interfaces):

```python
@ui("/orders")
class Orders(Listing[OrderRow], Searchable, Filterable[OrderFilters]):
    def search(self, request: SearchRequest, http=None):
        text = request.search_text              # filled because Searchable
        filters = self.filters(request)         # typed OrderFilters, from Filterable
        return ListingData.of(repo.find(text, filters, request.pageable))
```

A bare `Listing[Row]` is just the table (sorting + pagination free). Then:

| Declare | Contract | You get |
|---|---|---|
| `Searchable` | — (marker) | the search box |
| `Filterable[F]` | — (marker; or a `filters_class` attribute) | the filter bar, built reflectively from `F` |
| `Navigable[Detail, Id]` | `view(id)` | clickable rows + the `/:id` detail page |
| `Editable[Editor, Id]` | `edit(id)` + `save(editor)` | editing — in a **drawer over the listing** when not navigable |
| `Creatable[Form, Id]` | `creation_form()` + `create(form)` | the New button + `/new` form |
| `Deletable[Id]` | `delete_all_by_id(ids)` | row selection + the Delete button |

Capability methods receive **typed objects** (the framework hydrates the submitted state —
`save(editor)`, `create(form)`). `ListingData.of(rows)` sorts and pages in memory; pass an
explicit `total_elements` to push paging to the database. `Crud[T]` is the full pack — all
capabilities at once, restricted with the subtractive decorators as before. Note: `Searchable`
keeps its second role as the selector-field marker, mirroring Java's interface/annotation pair.

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
progress bar plus Back/Next; the step + field values round-trip through component state. Decorate
the class with `@wizard_progress("steps")` for connected step bullets, or
`@wizard_progress("rail")` for the guided-process lateral rail (a sticky right band with a big
`current | total` counter over the vertical step list).

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
| `FoldoutPanel` / `FoldoutLayout` | Foldout: a fixed overview with lateral fold-out panels |
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
- **Security** — `EyesOnly(...)` on a field hides it, `ReadOnlyUnless(...)` / `DisabledUnless(...)`
  lock it; `@eyes_only(...)` on a **class** refuses the whole view (403, by route, type or sub-route)
  and hides menu entries leading to it, on a **method** hides the button / menu entry and refuses the
  call. All match the identity `add_mateu` resolves (see above).

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

## Database pushdown

By default `fetch()` returns rows and the framework filters/sorts/paginates in memory. For real
databases override `find` — run search+filter+sort+paginate as **one query** (count + page
inside) and the in-memory pipeline is skipped entirely:

```python
class Orders(Crud[Order]):
    def find(self, search_text, filters, pageable):
        # filters = raw component state: <field> values, <field>_from/_to bounds,
        # multi-selects as value lists. pageable = Pageable(page, size, sort).
        query = build_query(search_text, filters)
        total = query.count()
        rows = query.order_by(*pageable.sort).offset(pageable.page * pageable.size).limit(pageable.size)
        return PageResult(content=list(rows), total_elements=total)
```

(The Python analogue of Java's `CrudStore.find`.)

## Federation (microfrontends)

Several Mateu backends compose into one shell **at runtime** — the frontend does the fetching, no
server-side proxying:

```python
@app("Back office")
@remote_menu("Payments", "https://payments.example.com")           # nests the remote menu
@remote_menu("Billing", "https://billing.example.com", explode=True)  # inlines its entries
class Shell: ...
```

To embed a remote view as an island *inside a page*, put a `MicroFrontend` in a component tree:

```python
def component(self):
    return MicroFrontend(base_url="https://billing.example.com", route="/invoices")
```

The island mounts its own `mateu-ux` against the remote backend and runs its own sync loop.

## Adapting foreign classes (component adapters)

The `ComponentAdapter` SPI (Java's `ComponentAdapter<T>`) renders a class that carries no Mateu
markers and rebuilds it from the state:

```python
from mateu_uidl import AdaptedView, ComponentAdapter, ui
from mateu_uidl import components as fluent

@ui("/order")                    # routing only: the adapter owns the UI
class Order:                     # a plain domain class
    customer = "Ana"
    def confirm(self): self.confirmed = True

class OrderAdapter(ComponentAdapter[Order]):
    def type(self): return Order
    def adapt(self, order):
        return AdaptedView(
            components=[fluent.FormField(field_id="customer", label="Customer"),
                        fluent.Button(label="Confirm", action_id="confirm")],
            state={"customer": order.customer},
            actions=["confirm"],
        )
    def deserialize(self, state):
        order = Order()
        if "customer" in state: order.customer = state["customer"]
        return order
```

Put the adapter in a module you pass to `add_mateu`. A routed model renders through its adapter; a
model held by a **field** of an ordinary form renders as an independent island with its own state
and actions. Only the action ids the adapted view lists reach the model; returning `None` (or the
model) re-renders it.

The lighter idiom still works when you control the screen: **wrap** the foreign object in a view —
the mapper renders plain fields reflectively, and your actions write back:

```python
@ui("/pedido")
class PedidoView:            # Pedido is a third-party class you cannot touch
    cliente: str = ""
    importe: float = 0.0

    def __init__(self):
        self._pedido = pedido_repo.load()
        self.cliente, self.importe = self._pedido.cliente, self._pedido.importe

    @button()
    def guardar(self):
        self._pedido.cliente, self._pedido.importe = self.cliente, self.importe
        pedido_repo.save(self._pedido)
        return Message("Saved")
```

For full control of the UI, make the wrapper a `ComponentTreeSupplier` and emit a fluent tree.

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

## Partials

A YAML file under `<specs>/partials/` is not a page but a **partial** — one component, or a
`content:` list of them, usable anywhere a component is:

```yaml
# specs/ui/partials/address-block.yaml
content:
  - type: FormField
    id: street
    label: Street
  - type: FormField
    id: city
    label: City
```

```yaml
# any page
- type: Partial
  ref: address-block
```

A partial standing for several components is **spliced** into its parent's content, not wrapped, so
one inside a form yields form fields. Partials are resolved while the tree is built and never reach
the wire. A missing ref costs the partial, not the page; a cycle is broken rather than followed.

```python
loader.partials.register("legal-notice", [{"type": "Text", "text": "Prices include VAT."}])
```

Unlike the Java server, a `ref` here cannot name a class — the declarative form only. Full reference:
[Partials](/java-ui-definition/partials/).

## Route registry (`routes.yaml`)

Routes can also be declared as **data**, in a `routes.yaml` next to the definitions under your specs
directory (`specs/ui/` by default, or `MATEU_SPECS_DIR`). An entry binds a `definition` (the layout),
a `viewModel` and its parameters independently, so one screen can answer several routes with
different parameters pinned:

```yaml
routes:
  - route: tickets/open
    viewModel: myapp.views.Tickets
    fixedParams:
      status: open
  - route: tickets/closed
    viewModel: myapp.views.Tickets
    fixedParams:
      status: closed
```

Entries are merged **over** the decorator-declared views and win. Parameters resolve as
`fixed > client state > path > defaults`: defaults only fill what nothing else supplied, while fixed
ones are re-applied on the server over everything, including the state the client sends back.

Both `viewModel` and `view_model` are accepted — the file is the same one a Java or C# app consumes,
but snake_case reads more naturally here.

See the full reference, including the JSON Schema for editor completion, in
[Route registry](/java-ui-definition/route-registry/). Not available in this port: the static-bundle
exporter, so nothing ships the table to a browser.

## Validation

`Required()`, `Min(n)`, `Max(n)`, `Size(min=, max=)` and `Pattern(regexp)` in a field's
`Annotated[...]`, `@validation(condition, field_id, message)` on the class and a `ValidationSupplier`
travel as the component's `validations` (the same conditions and messages Java emits), so the
renderer refuses to submit an invalid form — and the same constraints are checked again on the
server when a crud form is saved and in the import wizard's report.

## Grid fields

A `list[Row]` field is a grid with a row editor: `+` / Edit open the row form beside the grid
(`DetailForm(position=, columns=)` customises it), Save / Save and add another / Prev / Next /
remove / move up / move down edit the rows held in the form state, saved with the form.
`InlineEditing()` edits the cells in place instead (its `+` appends an empty row). Grids,
textareas and rich text span the whole row of a multi-column form; `Colspan(n)` sets a span.

## Wizards with a completion action

`@wizard_completion_action("Book")` on a wizard method: the penultimate step shows that button
instead of Next; the last step becomes the read-only result screen, reached only through it.

## Exports

`csv_exportable()`, `excel_exportable()` and `pdf_exportable()` on a `Crud` add Export CSV / Excel
/ PDF buttons (the whole filtered result set). Mateu ships **no spreadsheet or PDF engine**: CSV
has a built-in writer, and Excel / PDF are written by a `ListingExporter` subclass of yours, in a
module you register (it is discovered like the other suppliers and built with no arguments). It
receives a `ListingExport` (format, title, columns, every filtered row, search text) and returns an
`ExportedFile` (bytes, optional media type and filename). Without one, the Excel / PDF buttons are
not offered. A starting point with openpyxl (your dependency, not Mateu's):

```python
import io
from openpyxl import Workbook
from mateu_uidl import ExportedFile, ExportFormat, ListingExport, ListingExporter

class ExcelExporter(ListingExporter):
    format = ExportFormat.EXCEL

    def export(self, export: ListingExport) -> ExportedFile:
        book = Workbook()
        sheet = book.active
        sheet.append([c.label for c in export.columns])
        for row in export.rows:
            sheet.append([c.text_of(row) for c in export.columns])
        out = io.BytesIO()
        book.save(out)
        return ExportedFile(out.getvalue())
```

## Catalogues: REST sources and business components

`@rest_source("countries", url=…, value_path=…)` on any app class, a `RestSourceCatalogSupplier`
class, or `specs/ui/sources.yaml` declare a named endpoint once; surfaces reference it with
`RestOptions(source="countries")`, `@rest_listing(source=…)`, `@rest_action(source=…)`,
`@rest_data(source=…)`. The catalogue rides the app metadata; proxy fetches resolve it on the
server. A view assembled at runtime declares its proxy sources with `RestSourceSupplier`.

`@business_component("AgencySelector")` on a method returning a composition, a
`ComponentCatalogSupplier`, or `specs/ui/components.yaml` declare a reusable composition;
`fluent.ComponentRef("AgencySelector")` references it anywhere a component goes.

## Embedded islands

A field holding a routed view (`documento: Annotated[Documento, Inline()]`) mounts it as an
independent sub-app: its own route, type, state and actions; the host passes context by setting
fields on the value (they seed the island's state). `Inline()` drops the island's page chrome.
A view action returning `self` re-renders it in place — that is how an island switches between
its own server-decided states.

## `layoutDelta:` pages

A `specs/ui/<route>.yaml` with `viewModel:` + `layoutDelta: {order, hidden, overrides}` re-applies
the human's decisions over the view model's INFERRED layout on every request, so the screen keeps
following its model.

## Status

Forms + sections + field types + validation, `Crud[T]` (list / detail / edit / new / save / delete),
the `@app` shell + menu navigation, wizards, page decorations, tabs, stereotypes, KPIs, FABs,
shortcuts, compact, the unsaved-changes guard, i18n, events, security scaffolding, and the
UX-pattern components (MetricCard/Scoreboard/DashboardPanel/DashboardLayout, FoldoutLayout,
HeroSection, EmptyState, Skeleton, Gantt) with the Dashboard/Foldout/ItemOverview/Welcome
declarative archetypes, plus everything above. Over 570 tests cover this port, including the
shared wire-conformance corpus (`test_wire_conformance.py`) as a HARD gate: every case must match
the Java golden except an explicit allow-list of known Java-golden defects.
