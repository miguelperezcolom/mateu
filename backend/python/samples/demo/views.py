"""Demo views for the Python Mateu server — mirrors samples/Mateu.Demo in the C# port."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_uidl import (
    BannerTheme,
    Crud,
    Message,
    Money,
    Multiline,
    Password,
    PlainText,
    Required,
    Section,
    Step,
    Tab,
    Wizard,
    app,
    banner,
    button,
    compact,
    confirm_on_navigation_if_dirty,
    emits,
    fab,
    kpi,
    menu_item,
    shortcut,
    subscribe_to,
    subtitle,
    title,
    ui,
)


class Role(Enum):
    GUEST = "GUEST"
    ADMIN = "ADMIN"


@ui("simple-form")
@title("Simple form")
@emits("greeting-sent")
@subscribe_to("refresh", "greet")
class SimpleForm:
    name: Annotated[str | None, Required()] = None

    @button()
    def greet(self) -> Message:
        return Message(f"Hello {self.name}!")


@ui("person")
@title("Person")
@subtitle("Personal data")
class Person:
    name: Annotated[str | None, Required(), Section("Identity")] = None
    age: int = 0
    subscribed: Annotated[bool, Section("Preferences")] = False
    role: Role = Role.GUEST

    @banner(BannerTheme.INFO, "Heads up")
    def note(self) -> str:
        return "Fields marked * are required"

    @button()
    def save(self) -> Message:
        return Message(f"Saved {self.name}")


class Reservation:
    id: str = ""
    locator: str = ""
    guest: str = ""


class _Store:
    items: dict[str, Reservation] = {}


def _seed() -> None:
    if _Store.items:
        return
    for i, (loc, guest) in enumerate([("ABC123", "Ada Lovelace"), ("XYZ789", "Alan Turing")], start=1):
        r = Reservation()
        r.id, r.locator, r.guest = str(i), loc, guest
        _Store.items[r.id] = r


@ui("reservations")
@title("Reservations")
class Reservations(Crud[Reservation]):
    def fetch(self, search):
        _seed()
        return [
            r for r in _Store.items.values()
            if not search or search.lower() in r.locator.lower() or search.lower() in r.guest.lower()
        ]

    def get(self, id):
        _seed()
        return _Store.items.get(id)

    def save(self, entity):
        if not entity.id:
            entity.id = str(max((int(k) for k in _Store.items), default=0) + 1)
        _Store.items[entity.id] = entity

    def delete(self, id):
        _Store.items.pop(id, None)


@ui("signup")
@title("Sign up")
class SignupWizard(Wizard):
    email: Annotated[str | None, Step(1)] = None
    company: Annotated[str | None, Step(1)] = None
    password: Annotated[str | None, Step(2), Password()] = None
    accept_terms: Annotated[bool, Step(2)] = False

    def complete(self) -> Message:
        return Message(f"Welcome {self.email}")


@ui("showcase")
@title("Showcase")
@subtitle("Tail features")
@compact
@confirm_on_navigation_if_dirty
class Showcase:
    name: Annotated[str | None, Tab("Identity")] = None
    secret: Annotated[str | None, Tab("Identity"), Password()] = None
    bio: Annotated[str | None, Tab("Profile"), Multiline()] = None
    salary: Annotated[float, Tab("Profile"), Money()] = 0.0
    member_since: Annotated[str | None, Tab("Profile"), PlainText()] = "2021-03-14"

    @kpi("Open tickets")
    def open_tickets(self) -> str:
        return "42"

    @kpi("Revenue")
    def revenue(self) -> str:
        return "€ 1.2M"

    @fab("plus", "Add", 0)
    def add(self) -> Message:
        return Message("Added")

    @button()
    @shortcut("ctrl+s")
    def save(self) -> Message:
        return Message(f"Saved {self.name}")


@app("My Python Mateu app")
class DemoApp:
    @menu_item("Reservations")
    def reservations(self) -> Reservations:
        return Reservations()

    @menu_item("Simple form")
    def simple_form(self) -> SimpleForm:
        return SimpleForm()

    @menu_item("Person")
    def person(self) -> Person:
        return Person()

    @menu_item("Sign up")
    def signup(self) -> SignupWizard:
        return SignupWizard()

    @menu_item("Showcase")
    def showcase(self) -> Showcase:
        return Showcase()
