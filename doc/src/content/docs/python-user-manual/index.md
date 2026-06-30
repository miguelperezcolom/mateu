---
title: "Python"
description: "Build Mateu apps with a Python server — annotate Python classes and any Mateu renderer renders them, with zero client changes."
---

Mateu has a **Python server-side implementation**. You annotate plain Python classes, and the
**existing renderers** (web, JavaFX, Compose) render them with **zero client changes** — exactly as
they render the Java backend.

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

## Python 3.14+ note

Under [PEP 649](https://peps.python.org/pep-0649/) annotations evaluate lazily and are no longer
eagerly stored in `__dict__['__annotations__']`. Mateu reads them via `inspect.get_annotations(...)`,
so the field markers work on Python 3.11 through 3.14+.

## Status

Forms + sections + field types + validation, `Crud[T]` (list / detail / edit / new / save / delete),
the `@app` shell + menu navigation, wizards, page decorations, tabs, stereotypes, KPIs, FABs,
shortcuts, compact, the unsaved-changes guard, i18n, events and security scaffolding. 13 golden-JSON
tests assert wire compatibility; the live `showcase` view is byte-identical to the C# reference.
