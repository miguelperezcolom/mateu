# Python CRUDs and listings

## `Crud[T]` — the full pack

```python
from datetime import date
from enum import Enum
from typing import Annotated
from mateu_ui.uidl import Crud, Money, RangeFilter, Required, title, ui

class Status(Enum):
    AVAILABLE = "AVAILABLE"
    OUT_OF_STOCK = "OUT_OF_STOCK"

class Product:
    id: Annotated[str, Required()] = ""                 # the id is always the `id` attribute
    name: Annotated[str, Required()] = ""
    price: Annotated[float, Money(), RangeFilter()] = 0.0   # number-range filter
    status: Status = Status.AVAILABLE                   # multi-select filter
    since: date = date(2026, 1, 1)                      # date-range filter

_STORE: dict[str, Product] = {}                         # views are per request: keep data outside

@ui("products")
@title("Products")
class Products(Crud[Product]):
    def fetch(self, search):
        s = (search or "").lower()
        return [p for p in _STORE.values() if s in p.name.lower()]

    def get(self, id):
        return _STORE.get(id)

    def save(self, entity):                             # REQUIRED: the default silently does nothing
        _STORE[entity.id] = entity

    def delete(self, id):                               # REQUIRED: the default silently does nothing
        _STORE.pop(id, None)
```

**Server-generated ids:** leave `id` without `Required()` and assign it in `save` when blank
(`entity.id = entity.id or f"P-{len(_STORE) + 1:03}"`). The port has no per-context hiding
(Java's `@HiddenInCreate`), so the Id box still shows, empty, on the new form — say so in its
label/help or accept it.

You get the listing (smart search bar; filters derived from the entity, applied in memory over
`fetch`), detail `/products/{id}`, edit `/products/{id}/edit`, new `/products/new`, delete and
validation. Entities are plain classes with defaults (no constructor arguments needed).

- `@edit_in_drawer` on the class: create/edit open in a drawer over the listing.
- Drop affordances: `def display(self): return dataclasses.replace(CrudDisplay.defaults(), create=Toggle.off)`
  (`Toggle.disabled` shows it inert; also `delete`, `save_and_next`, `error_banner`).
- Exports: `def csv_exportable(self): return True` (built-in writer); Excel/PDF only with a
  `ListingExporter` subclass of yours in a module passed to `add_mateu`.
- `@inline_editing` on the class edits listing cells in place (`ReadOnly()` keeps a column fixed).

**Database pushdown** — override `find` and the in-memory pipeline is skipped:

```python
from mateu_ui.uidl import PageResult

class Orders(Crud[Product]):
    def fetch(self, search):
        return []

    def find(self, search_text, filters, pageable):
        # filters: raw component state (<field>, <field>_from/_to, multi-selects as lists)
        rows = [p for p in _STORE.values() if not search_text or search_text in p.name]
        start = pageable.page * pageable.size
        return PageResult(content=rows[start:start + pageable.size], total_elements=len(rows))
```

## Capability listings — grow by adding base classes

```python
from dataclasses import dataclass
from mateu_ui.uidl import (Deletable, Filterable, Listing, ListingData, Navigable, SearchRequest,
                           Searchable, title, ui)

@dataclass
class OrderRow:
    id: str = ""
    customer: str = ""
    total: float = 0.0

@dataclass
class OrderFilters:
    customer: str = ""

class OrderView:
    customer: str = ""

ORDERS = [OrderRow("1", "Acme", 120.0), OrderRow("2", "Globex", 80.5)]

@ui("orders")
@title("Orders")
class OrdersListing(Listing[OrderRow], Searchable, Filterable[OrderFilters],
                    Navigable[OrderView, str], Deletable[str]):
    def search(self, request: SearchRequest, http=None):
        text = (request.search_text or "").lower()       # filled because Searchable
        f = self.filters(request)                        # typed OrderFilters, from Filterable
        return ListingData.of(o for o in ORDERS if text in o.customer.lower()
                              and (not f or not f.customer or f.customer == o.customer))

    def view(self, id):
        v = OrderView()
        v.customer = next(o for o in ORDERS if o.id == id).customer
        return v

    def delete_all_by_id(self, ids):
        ORDERS[:] = [o for o in ORDERS if o.id not in ids]
```

| Base class | Implement | You get |
|---|---|---|
| (bare `Listing[Row]`) | `search(request, http=None)` | table with sorting + paging |
| `Searchable` | — | search box (`request.search_text`) |
| `Filterable[F]` | — | filter bar built from `F` (`self.filters(request)`) |
| `Navigable[Detail, Id]` | `view(id)` | clickable rows + `/:id` |
| `Editable[Editor, Id]` | `edit(id)`, `save(editor)` | edit; in a drawer when not navigable |
| `Creatable[Form, Id]` | `creation_form()`, `create(form)` | New + `/new` |
| `Deletable[Id]` | `delete_all_by_id(ids)` | row selection + Delete |

`ListingData.of(rows)` sorts and pages in memory; `ListingData(rows=page, total_elements=n)`
means the rows are already the page. `SmartSearchPage[F, R]` is the search-first page.

Grouping: `Annotated[str, GroupBy()]` on a row field groups the listing; `@group_action("Label")`
on a listing method adds a button per group header.
