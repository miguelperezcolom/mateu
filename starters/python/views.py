"""The whole UI: an app shell (``Shell``) with a menu, a home page (``Home``) and a CRUD over
``Product`` at /products."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_uidl import (
    Crud,
    HomeRouteSupplier,
    Panel,
    Required,
    Welcome,
    app,
    menu_item,
    title,
    ui,
)
from mateu_uidl.components import Button, Text


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
    """A CRUD over ``Product`` at /products: listing, create, detail, edit and delete."""

    def fetch(self, search):
        s = (search or "").lower()
        return [p for p in _STORE.values() if not s or s in p.name.lower() or s in p.id.lower()]

    def get(self, id):
        return _STORE.get(id)

    def save(self, entity):
        _STORE[entity.id] = entity

    def delete(self, id):
        _STORE.pop(id, None)


@ui("home")
class Home(Welcome):
    """The home page, a ``Welcome``: a hero with a title and an intro, ``Button`` fields as its
    calls to action and ``Panel(...)`` fields as tiles below. A button runs the method named by
    its action id (``browseProducts`` → ``browse_products``); returning a route navigates."""

    browse: Button = Button(label="Browse products", action_id="browseProducts", button_style="primary")
    products: Annotated[Text, Panel("Products")] = Text(
        text="Search, create, edit and delete products: a whole CRUD derived from one class."
    )
    next: Annotated[Text, Panel("Your next screen")] = Text(
        text="Write a class for it and add a @menu_item method returning it to Shell."
    )

    def hero_title(self) -> str:
        return "My app"

    def hero_subtitle(self) -> str:
        return "Every screen here is declared in Python; Mateu renders it."

    def browse_products(self) -> str:
        return "/products"


@app("My app")
class Shell(HomeRouteSupplier):
    """The app shell, at the app root: the title and the menu around every screen. Each
    ``@menu_item`` method is a menu entry returning that screen; ``home_route`` names the one the
    app opens on."""

    @menu_item("Home")
    def home(self) -> Home:
        return Home()

    @menu_item("Products")
    def products(self) -> Products:
        return Products()

    def home_route(self) -> str:
        return "home"
