"""The whole UI: a CRUD over ``Product`` at /products."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_uidl import Crud, Required, title, ui


class ProductStatus(Enum):
    Available = "Available"
    OutOfStock = "OutOfStock"
    Discontinued = "Discontinued"


class Product:
    """The model, declared once: columns, form fields and validation are derived from it."""

    id: Annotated[str, Required()] = ""
    name: Annotated[str, Required()] = ""
    price: float = 0.0
    status: ProductStatus = ProductStatus.Available


def _product(id: str, name: str, price: float, status: ProductStatus) -> Product:
    p = Product()
    p.id, p.name, p.price, p.status = id, name, price, status
    return p


# The view model is created per request; the data lives in a module-level store that outlives it.
_STORE: dict[str, Product] = {
    p.id: p
    for p in [
        _product("P-001", "Espresso machine", 249.0, ProductStatus.Available),
        _product("P-002", "Coffee grinder", 89.5, ProductStatus.Available),
        _product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock),
        _product("P-004", "Pour-over kettle", 59.0, ProductStatus.Discontinued),
    ]
}


@ui("products")
@title("Products")
class Products(Crud[Product]):
    def fetch(self, search):
        s = (search or "").lower()
        return [p for p in _STORE.values() if not s or s in p.name.lower() or s in p.id.lower()]

    def get(self, id):
        return _STORE.get(id)

    def save(self, entity):
        _STORE[entity.id] = entity

    def delete(self, id):
        _STORE.pop(id, None)
