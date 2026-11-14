"""``EyesOnly`` holds INSIDE what a row or a form carries: a nested object of a crud row, the rows of
a list field (a grid), at every depth — on the listing, the detail and the edit loads (GA review 2,
Y5: the top-level fields were filtered, the values one level down still travelled). And saving
such a list keeps the protected values of its rows instead of wiping them (Y4)."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud, Editable, EyesOnly, Identity, Listing, Navigable, ReadOnlyUnless, ui,
)

MODULE = sys.modules[__name__]

COST, CODE, DEEP = "COST-SECRET", "CODE-SECRET", "DEEP-SECRET"


@dataclass
class Tag:
    label: str = ""
    note: Annotated[str, EyesOnly(roles=["finance"])] = ""


@dataclass
class Line:
    sku: str = ""
    qty: int = 0
    price: Annotated[float, ReadOnlyUnless(roles=["finance"])] = 0.0
    cost: Annotated[str, EyesOnly(roles=["finance"])] = ""
    tag: Tag = field(default_factory=Tag)


@dataclass
class Addr:
    city: str = ""
    code: Annotated[str, EyesOnly(roles=["finance"])] = ""


@dataclass
class Order:
    id: str = ""
    note: str = ""
    addr: Addr = field(default_factory=Addr)
    lines: list[Line] = field(default_factory=list)


DB: dict[str, Order] = {}


def reset() -> None:
    DB.clear()
    DB["o1"] = Order(
        "o1", "hello", Addr("Palma", CODE),
        [Line("A", 1, 10.0, COST, Tag("t", DEEP)), Line("B", 2, 20.0, COST, Tag("u", DEEP))],
    )


@ui("orders")
class Orders(Crud[Order]):
    def fetch(self, search):
        return list(DB.values())

    def get(self, id_):
        return DB.get(id_)

    def save(self, entity):
        DB[entity.id] = entity


@ui("order-listing")
class OrderListing(Listing[Order], Navigable, Editable):
    def search(self, request, http=None):
        return list(DB.values())

    def view(self, id):
        return DB.get(id)

    def edit(self, id):
        return DB.get(id)

    def save(self, e):
        DB[e.id] = e
        return e.id


def handler(roles=()) -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))


def wire(rq: RunActionRq, roles=()) -> str:
    return json.dumps(handler(roles).handle(rq).model_dump(by_alias=True, mode="json"))


@pytest.fixture(autouse=True)
def _db():
    reset()
    yield
    reset()


CRUD, LISTING = type_name(Orders), type_name(OrderListing)


@pytest.mark.parametrize(
    "rq",
    [
        RunActionRq(route="orders", server_side_type=CRUD, action_id="search", component_state={}),
        RunActionRq(route="orders", server_side_type=CRUD, action_id="search",
                    component_state={"searchText": "hello"}),
        RunActionRq(route="orders/o1", server_side_type=CRUD),
        RunActionRq(route="orders/o1/edit", server_side_type=CRUD),
        RunActionRq(route="order-listing", server_side_type=LISTING, action_id="search", component_state={}),
        RunActionRq(route="order-listing/o1", server_side_type=LISTING),
        RunActionRq(route="order-listing/o1/edit", server_side_type=LISTING),
    ],
    ids=["crud-search", "crud-search-text", "crud-detail", "crud-edit", "listing-search",
         "listing-detail", "listing-edit"],
)
def test_an_eyes_only_value_one_level_down_never_travels(rq):
    out = wire(rq)
    for secret in (COST, CODE, DEEP):
        assert secret not in out, secret


def test_the_authorized_caller_still_gets_them():
    out = wire(RunActionRq(route="orders", server_side_type=CRUD, action_id="search", component_state={}),
               roles=("finance",))
    assert COST in out and CODE in out and DEEP in out


def _edit_state(route: str, sst: str) -> dict:
    inc = handler().handle(RunActionRq(route=route, server_side_type=sst))
    found: list[dict] = []

    def walk(n):
        if isinstance(n, dict):
            for k in ("state", "initialData"):
                if isinstance(n.get(k), dict) and "lines" in n[k]:
                    found.append(n[k])
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(inc.model_dump(by_alias=True, mode="json"))
    return dict(found[0])


@pytest.mark.parametrize("route,sst", [("orders/o1/edit", CRUD), ("order-listing/o1/edit", LISTING)])
def test_saving_a_list_keeps_the_protected_values_of_its_rows(route, sst):
    """Y4: the caller edits the note and sends back the state they were sent — the rows' locked
    price and hidden cost are the STORED ones afterwards, not the row type's defaults."""
    state = _edit_state(route, sst)
    state["note"] = "edited"
    for line in state["lines"]:
        line["price"] = 0.5  # a forged price is not written either
    inc = handler().handle(RunActionRq(route=route, server_side_type=sst, action_id="save", component_state=state))
    assert [m.text for m in inc.messages if m.variant == "error"] == []
    stored = DB["o1"]
    assert stored.note == "edited"
    assert [(ln.sku, ln.price, ln.cost, ln.tag.note) for ln in stored.lines] == [
        ("A", 10.0, COST, DEEP), ("B", 20.0, COST, DEEP),
    ]
