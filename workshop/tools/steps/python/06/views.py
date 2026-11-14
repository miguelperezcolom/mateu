"""The whole UI: an app shell (``Shell``) with a menu, a home page (``Home``), a CRUD over
``Product`` at /products and — workshop, lab 01 — a ``Quote`` screen of your own at /quote."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_ui.uidl import (
    Crud,
    EditableOnlyWhenCreating,
    EyesOnly,
    Max,
    Message,
    Min,
    HomeRouteSupplier,
    Money,
    Panel,
    ReadOnly,
    Required,
    Welcome,
    app,
    button,
    menu_item,
    title,
    ui,
)
from mateu_ui.uidl.components import Button, Text


class ProductStatus(Enum):
    Available = "Available"
    OutOfStock = "OutOfStock"
    Discontinued = "Discontinued"


class Product:
    """The model, declared once: columns, form fields and validation are derived from it."""

    # a product code the user types on create (without the marker the id would be technical: the
    # store assigns it and the creation form draws no input for it)
    id: Annotated[str, Required(), EditableOnlyWhenCreating()] = ""
    name: Annotated[str, Required()] = ""
    price: Annotated[float, Money()] = 0.0
    # workshop, lab 01: the field you added — a column, an input and a rule the server re-checks
    stock: Annotated[int, Min(0)] = 0
    status: ProductStatus = ProductStatus.Available

    def __str__(self) -> str:
        # The record's name: its page is titled "Espresso machine", not "Product".
        return self.name if self.name and self.name.strip() else "New product"


def _product(id: str, name: str, price: float, stock: int, status: ProductStatus) -> Product:
    p = Product()
    p.id, p.name, p.price, p.stock, p.status = id, name, price, stock, status
    return p


# The view model is created per request; the data lives in a module-level store that outlives it.
_STORE: dict[str, Product] = {
    p.id: p
    for p in [
        _product("P-001", "Espresso machine", 249.0, 12, ProductStatus.Available),
        _product("P-002", "Coffee grinder", 89.5, 30, ProductStatus.Available),
        _product("P-003", "Milk frother", 39.9, 0, ProductStatus.OutOfStock),
        _product("P-004", "Pour-over kettle", 59.0, 3, ProductStatus.Discontinued),
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
        return "Workshop"

    def hero_subtitle(self) -> str:
        return "Every screen here is declared in Python; Mateu renders it."

    def browse_products(self) -> str:
        return "/products"


@ui("quote")
@title("Quote")
class Quote:
    """Workshop, lab 01: a screen of your own. Fields are the state of the screen, the markers its
    rules, the ``@button`` method its behaviour. Reached through its ``@menu_item`` in ``Shell``."""

    quantity: Annotated[int, Min(1)] = 1
    unit_price: Annotated[float, Min(0), Money()] = 0.0
    # workshop, lab 06: only a manager sees (and so may give) a discount. Applied on the server, for
    # every renderer: for anybody else the field is not sent, and a value they send is dropped.
    discount: Annotated[int, Min(0), Max(100), EyesOnly(roles=("manager",))] = 0
    total: Annotated[float, ReadOnly(), Money()] = 0.0

    # An action answers with what the browser should do: returning the view itself sends the
    # changed fields back (a bare Message would change total on the server only), the Message shows
    # a toast.
    @button
    def calculate(self) -> list:
        self.total = round(self.quantity * self.unit_price * (100 - self.discount)) / 100
        return [self, Message(f"Total: {self.total}")]


@app("Workshop")
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

    # workshop, lab 01: one method, one menu entry
    @menu_item("Quote")
    def quote(self) -> Quote:
        return Quote()

    def home_route(self) -> str:
        return "home"
