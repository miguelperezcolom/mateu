"""Card menus — the Python mirror of Java's MenuCardsSyncTest (and .NET's MenuCardsTests).

A menu group that opens as a panel of CARDS (``@menu_group(group, display="cards")``): the group
carries display "cards"; each card its description, icon and image, and its own children (the
card's actions). A plain menu travels exactly as before (no display, no image, no icon).
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_dtos import MenuItem  # noqa: E402
from mateu_uidl import MenuDisplay, MenuSupplier, app, menu_group, menu_item, title, ui  # noqa: E402


@ui("/cards/reservations")
@title("Reservations")
class CardsReservationsPage:
    name: str = "reservations"


@ui("/cards/new")
@title("New reservation")
class CardsNewReservationPage:
    name: str = "new"


@ui("/cards/diary")
@title("Room diary")
class CardsRoomDiaryPage:
    name: str = "diary"


@app("PMS")
@menu_group("Bookings", display=MenuDisplay.cards)
@menu_group(
    "Bookings/Reservations",
    description="Search, create and modify reservations",
    icon="vaadin:calendar",
    image="/img/res.png",
)
class CardsMenuApp:
    @menu_item("Search", group="Bookings/Reservations")
    def search(self) -> CardsReservationsPage:
        return CardsReservationsPage()

    @menu_item("Create", group="Bookings/Reservations")
    def create(self) -> CardsNewReservationPage:
        return CardsNewReservationPage()

    @menu_item("Room diary", group="Bookings", description="Rooms by day, drag to move a stay")
    def room_diary(self) -> CardsRoomDiaryPage:
        return CardsRoomDiaryPage()

    @menu_item("Plain")
    def plain(self) -> CardsRoomDiaryPage:
        return CardsRoomDiaryPage()


@app("PMS code")
class CodeCardsMenuApp(MenuSupplier):
    """The same card menu authored IN CODE: the wire fields are set directly."""

    def menu(self) -> list:
        return [
            MenuItem(
                label="Bookings", route="", server_side_type="", display=MenuDisplay.cards,
                submenus=[
                    MenuItem(
                        label="Reservations", route="", server_side_type="",
                        description="Search, create and modify reservations",
                        icon="vaadin:calendar", image="/img/res.png",
                        submenus=[
                            MenuItem(label="Search", route="/search", server_side_type=""),
                            MenuItem(label="Create", route="/create", server_side_type=""),
                        ],
                    )
                ],
            )
        ]


def _menu(app_cls):
    reg = MateuRegistry(app_cls, CardsReservationsPage, CardsNewReservationPage, CardsRoomDiaryPage)
    inc = SyncHandler(reg).handle(RunActionRq(route="", consumed_route="_empty"))
    return inc, inc.fragments[0].component.metadata.menu


def _find(menu, label):
    for option in menu:
        if option.label == label:
            return option
        found = _find(option.submenus, label)
        if found is not None:
            return found
    return None


def test_a_cards_group_carries_its_display_and_each_card_its_look():
    _, menu = _menu(CardsMenuApp)
    group = _find(menu, "Bookings")
    assert group.display == "cards"
    card = _find(group.submenus, "Reservations")
    assert card.description == "Search, create and modify reservations"
    assert card.image == "/img/res.png"
    assert card.icon == "vaadin:calendar"
    assert card.display is None
    # the card's own children are its actions
    assert [s.label for s in card.submenus] == ["Search", "Create"]
    leaf_card = _find(group.submenus, "Room diary")
    assert leaf_card.description == "Rooms by day, drag to move a stay"
    assert leaf_card.submenus == []


def test_a_plain_entry_travels_as_before():
    _, menu = _menu(CardsMenuApp)
    plain = _find(menu, "Plain")
    assert plain.display is None
    assert plain.image is None
    assert plain.icon is None
    assert plain.description is None


def test_the_card_fields_travel_on_the_wire_with_the_java_names():
    inc, _ = _menu(CardsMenuApp)
    j = json.dumps(inc.model_dump(by_alias=True, mode="json"))
    assert '"display": "cards"' in j
    assert '"image": "/img/res.png"' in j
    assert '"description": "Rooms by day, drag to move a stay"' in j


def test_a_code_authored_menu_carries_the_card_look():
    _, menu = _menu(CodeCardsMenuApp)
    group = _find(menu, "Bookings")
    assert group.display == "cards"
    card = _find(group.submenus, "Reservations")
    assert card.image == "/img/res.png"
    assert [s.label for s in card.submenus] == ["Search", "Create"]
