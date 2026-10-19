---
name: mateu-python
description: Build Mateu UIs in Python on FastAPI (package mateu-ui) — classes decorated @ui become forms, CRUDs, listings, wizards, dashboards and an app shell, served on the Mateu wire so any Mateu renderer draws them. Use when writing or fixing a Python Mateu app: add_mateu wiring, views, Annotated[...] field markers, actions, Crud[T], capability listings, @app/@menu_item menus, security, pytest. Triggers on @ui decorator, mateu_ui, mateu-ui on PyPI, add_mateu, Crud[...], Listing[...], @menu_item, MATEU_UI with .py files.
---

# Mateu in Python (FastAPI)

The Python server emits the **same wire** as the Java server (`POST /mateu/v3/sync/{route}` → a
`UIIncrement` JSON), so the stock renderers (Vaadin web, Redwood, React Native, IntelliJ) draw it
unchanged. You write plain classes; **never** write routes, templates or frontend code for the UI.
Java (`@UI`) → skill `mateu`; YAML pages/routes → skill `mateu-yaml`; C# → `mateu-dotnet`.

## Setup

```bash
pip install "mateu-ui[server]" fastapi      # PyPI name is mateu-ui ([server] adds uvicorn); one package: mateu_ui
```

Versions follow the Java release: `3.0-beta.N` → `3.0.0bN` (pin it: `mateu-ui==3.0.0bN`).
Python 3.11+. Import from `mateu_ui.uidl` (authoring API), `mateu_ui.uidl.components` (fluent
components), `mateu_ui.fastapi` (`add_mateu`), `mateu_ui.dtos` (wire model, e.g. `Option`).
The old top-level names `mateu_uidl`/`mateu_core`/… still import but are deprecated.

```python
# main.py
from fastapi import FastAPI
from mateu_ui.fastapi import add_mateu
import views                      # module(s) holding your @ui / @app classes

app = FastAPI()
add_mateu(app, views)             # POST /mateu/v3/sync/{route}; add_mateu(app, views, ui="...") also serves the page
```

Run `uvicorn main:app --port 8080`. **To see it in a browser** set `MATEU_UI` (or `ui=`) to the
`io.mateu:mateu-vaadin` jar of the same version
(`https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/<v>/mateu-vaadin-<v>.jar`) or its extracted
`static/` folder; without it the server answers the sync API only. Fastest start: the generator
(VS Code "Mateu: New Project", IntelliJ New Project › Mateu, runtime "Python") or `starters/python`
from https://github.com/miguelperezcolom/mateu.

## A screen is a class

```python
from typing import Annotated
from mateu_ui.uidl import Message, Required, Section, button, title, toolbar, ui

@ui("signup-form")
@title("Sign up")
class SignupForm:
    name: Annotated[str, Required(), Section("Identity")] = ""
    email: Annotated[str, Required()] = ""
    greeting: str = ""

    @button("Say hi")
    def greet(self):
        self.greeting = f"Hi, {self.name}"
        return self                         # re-render with the new state

    @toolbar("Save", button_style="primary")
    def save(self) -> Message:
        return Message(f"Saved {self.name}")

    @button()
    def cancel(self) -> str:
        return "/home"                      # a route → navigate
```

Type-hinted public class attributes are state/fields (`str`, `int`, `float`/`Decimal`, `bool`,
`date`, `datetime`, `time`, `Enum` → dropdown, `list[Row]` → grid). Field modifiers ride in
`Annotated[T, Marker(), …]`; class/method features are decorators. The JSON action id is the
camelCased method name (`browse_products` ↔ `browseProducts`).

## What an action returns

| Return | Effect |
|---|---|
| `None` | nothing changes on screen (state changes are NOT shown — return `self`) |
| `self` | re-render in place with the new state |
| `Message("…")` / any other `str` | toast (`Message(text, variant=MessageVariant.ERROR)` …) |
| `"/route"` (str starting with `/`) | navigate |
| `Drawer(...)` / `Dialog(...)` (components) | open an overlay |
| `PageBanner(...)` / `PageBanners` | banner(s) |
| `Navigate`, `Emit`, `CloseOverlay`, `MarkClean`, `RunAction`, `Announce` | client commands |
| `[a, b, …]` | several of the above in order — but `self` inside a list does NOT re-render |

## Rules that bite

- **Actions are declared** (always strict): a wire action id only reaches a method marked
  `@button`, `@toolbar`, `@action` (no button) or `@fab`, or one the view advertises (a component's
  `action_id`, `OnRowSelected`, `@subscribe_to`). Anything else → 403. `_private` names never run.
- **Views are per request**: a fresh instance per call — keep data in a module-level store or a
  service.
- `Crud[T]`: implement `fetch` AND `save`/`delete` — the defaults of `save`/`delete` silently do
  nothing. The id is the entity's `id` attribute.
- `@button`/`@toolbar` re-check `Required()`/`Min`/`Max`/`Length`/`Pattern` on the server.
- Mateu does not authenticate: set `request.state.mateu_identity` in your own middleware.
- Use snake_case everywhere; markers are instances (`Required()`, not `Required`).

## References (read on demand)

- [views-and-actions.md](reference/views-and-actions.md) — markers, layout, validation, actions,
  overlays, events, page decorations.
- [crud-and-listings.md](reference/crud-and-listings.md) — `Crud[T]`, capability listings, filters,
  drawer editing, database pushdown, exports.
- [pages-and-shell.md](reference/pages-and-shell.md) — `@app` shell + menu + home, wizards,
  archetypes (Dashboard, Welcome, Foldout, ItemOverview, CollectionDetail…), fluent components.
- [hosting-and-testing.md](reference/hosting-and-testing.md) — `add_mateu` options, identity,
  secrets, errors, CORS, YAML specs, how Python differs from Java, pytest.

Canonical docs: https://mateu.io/python-user-manual/ · Rosetta (Java ↔ C# ↔ Python):
https://mateu.io/reference/language-rosetta/ · Parity: https://mateu.io/reference/parity/
