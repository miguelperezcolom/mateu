"""The app the test harness drives in ``test_testing_harness.py``: a shell, a CRUD and a form."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_ui.uidl import (
    Crud,
    EditableOnlyWhenCreating,
    EyesOnly,
    HomeRouteSupplier,
    Message,
    Required,
    app,
    button,
    menu_item,
    title,
    ui,
)


class HarnessStatus(Enum):
    Available = "Available"
    OutOfStock = "OutOfStock"


class HarnessProduct:
    # a product code the user types on create (without the marker the id would be technical: the
    # store assigns it and the creation form draws no input for it)
    id: Annotated[str, Required(), EditableOnlyWhenCreating()] = ""
    name: Annotated[str, Required()] = ""
    price: float = 0.0
    status: HarnessStatus = HarnessStatus.Available

    def __str__(self) -> str:
        return self.name or "New product"


def _product(id: str, name: str, price: float) -> HarnessProduct:
    p = HarnessProduct()
    p.id, p.name, p.price = id, name, price
    return p


STORE: dict[str, HarnessProduct] = {}


def reset() -> None:
    STORE.clear()
    for p in (_product("P-001", "Espresso machine", 249.0), _product("P-002", "Coffee grinder", 89.5),
              _product("P-003", "Milk frother", 39.9)):
        STORE[p.id] = p


@ui("harness-products")
@title("Products")
class HarnessProducts(Crud[HarnessProduct]):
    def fetch(self, search):
        s = (search or "").lower()
        return [p for p in STORE.values() if not s or s in p.name.lower()]

    def get(self, id):
        return STORE.get(id)

    def save(self, entity):
        STORE[entity.id] = entity

    def delete(self, id):
        STORE.pop(id, None)


@ui("harness-greeting")
@title("Greeting")
class HarnessGreeting:
    name: Annotated[str, Required()] = ""
    note: Annotated[str, EyesOnly(roles=("admin",))] = "only admins"

    @button
    def greet(self) -> Message:
        return Message(f"Hello {self.name}!")


@app("Harness app")
class HarnessShell(HomeRouteSupplier):
    @menu_item("Products")
    def products(self) -> HarnessProducts:
        return HarnessProducts()

    @menu_item("Greeting")
    def greeting(self) -> HarnessGreeting:
        return HarnessGreeting()

    def home_route(self) -> str:
        return "harness-products"
