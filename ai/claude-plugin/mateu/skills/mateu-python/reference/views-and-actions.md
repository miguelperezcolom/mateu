# Python views: markers, layout, actions

Everything below imports from `mateu_ui.uidl` unless noted. Field markers go inside
`Annotated[T, ...]` (instances: `Required()`); class and method features are decorators.

## Field markers

| Marker | Effect |
|---|---|
| `Required()`, `Min(n)`, `Max(n)`, `Length(min=, max=)`, `Pattern(regexp)` | validation (client + server) |
| `Label("…")`, `Help("…")` | label / help text |
| `Section("Title")` on the first field of a group | titled card the following fields join |
| `Tab("Name")` (`open=True` = initially selected) | consecutive fields form a tab strip |
| `PlainText()` (class-level `@plain_text`), `Disabled()` | not editable (`@read_only` = whole view) |
| `Hidden()` / `Hidden("!state.special")` | always / conditionally hidden (client expression over `state`) |
| `Multiline()` (a textarea), `Password()`, `Money()`, `Stereotype("…")` | control overrides |
| `Colspan(n)` | span n columns (grids, textareas span the row on their own) |
| `UseRadioButtons()` | enum as radio group |
| `Lookup()` + the view's `options(field_name)` method | search-as-you-type select |
| `TreeSelect(leaves_only=True)` + `options(field_name)` returning `Option(children=[…])` | tree dropdown |
| `Signature()`, `PhotoCapture()` | capture into a data-URI string |
| `LinkTo("/customers/${state.customerId}")` | navigation icon on the field |
| `HeaderBadge(color="success")` | status chip in the page header |
| `InlineEditing()` on a `list[Row]` | edit grid cells in place (default: a row editor beside the grid) |
| `OnRowSelected("on_guest")` on a `list[Row]` | runs `on_guest(self, row: Row)` on row click |
| `EyesOnly(roles=["admin"])`, `ReadOnlyUnless(...)`, `DisabledUnless(...)` | identity gates (roles/groups/scopes/permissions) |

`Option` lives in `mateu_ui.dtos`.

```python
from typing import Annotated
from mateu_ui.dtos import Option
from mateu_ui.uidl import (Colspan, InlineEditing, Lookup, Message, Multiline, Required, Section,
                           Tab, button, title, ui)

class Companion:
    name: Annotated[str, Required()] = ""
    age: int = 0

@ui("check-in")
@title("Check-in")
class CheckIn:
    name: Annotated[str, Required(), Section("Guest")] = ""
    country: Annotated[str, Lookup()] = ""
    notes: Annotated[str, Tab("Notes"), Multiline(), Colspan(2)] = ""
    companions: Annotated[list[Companion], InlineEditing()] = []

    def options(self, field_name):
        return [Option(value="es", label="Spain"), Option(value="pt", label="Portugal")] if field_name == "country" else []

    @button()
    def save(self) -> Message:
        return Message(f"{len(self.companions)} companions")
```

## Class decorators

`@title`, `@subtitle`, `@overline`, `@compact`, `@auto_layout` (layout inference),
`@confirm_on_navigation_if_dirty`, `@page_width(...)`, `@zones(...)`, `@read_only`, `@plain_text`,
`@eyes_only(roles=[…])` (whole view refused with 403 and hidden from menus).

## Actions

| Decorator | Renders | Notes |
|---|---|---|
| `@button` / `@button("Label")` | button in the form footer | validates first |
| `@toolbar("Label", button_style="primary")` | button in the page header toolbar | validates first |
| `@action` | nothing | invocable target of a component `action_id`, an undo toast… |
| `@fab("plus", "Add", 0)` | floating action button | |
| `@kpi("Open tickets")` on a method | header KPI card showing its return value | |
| `@banner(BannerTheme.INFO, "Heads up")` on a method returning `str` | banner below the header | |
| `@shortcut("ctrl+s")`, `@action_options(timeout_millis=…, idempotent=True)` | stack with the above | |

A parameter annotated `ActionRequest` (or named `request`) receives the request (its
`parameters`, `component_state`); a parameter annotated with a row class receives the clicked row
of an `OnRowSelected` grid.

```python
from mateu_ui.uidl import CloseOverlay, Emit, Message, Navigate, PageBanner, BannerTheme, action, button, toolbar
from mateu_ui.uidl.components import Drawer, Text

class Examples:
    @toolbar()
    def delete(self):
        return [Message("Deleted"), Navigate("/orders")]

    @button()
    def details(self):
        return Drawer(header_title="Details", content=Text(text="…"))

    @action
    def close(self):
        return CloseOverlay("saved")          # closes the overlay and emits "saved"

    @button()
    def warn(self):
        return PageBanner(theme=BannerTheme.WARNING, title="Careful")
```

Raise `UserFacingException("…", title="…")` for a business refusal shown as written; anything
else shows a generic error with a reference id (logged with the traceback).

## Events between views

```python
@ui("orders-board")
@emits("order-created")
@subscribe_to("inventory-changed", "refresh")
class OrdersBoard:
    @action
    def refresh(self):
        return self                          # re-render when the event fires

    @button()
    def create(self):
        return Emit("order-created")
```

## Semantic annotations

A reusable `Annotated` alias is the composed annotation:

```python
TotalAmount = Annotated[float, Money(), Label("Total amount")]

class Invoice:
    total: TotalAmount = 0.0
```
