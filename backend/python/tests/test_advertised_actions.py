"""Every button the port draws is an action its component ADVERTISES. The web client only sends an
action some component on the page claims — anything else bubbles out unclaimed and is lost — and
this port answers the CRUD form's, the wizard's and a page FAB's actions in place (there is no
mediator above them, as in Java). Found walking the demo in the Vaadin renderer: Save, Edit,
Cancel, Back and the FAB did nothing."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Creatable,
    Crud,
    Editable,
    Listing,
    Message,
    Navigable,
    Step,
    Wizard,
    button,
    fab,
    shortcut,
    title,
    ui,
)

MODULE = sys.modules[__name__]


class Item:
    id: str = ""
    name: str = ""

    def __init__(self, id="", name=""):
        self.id, self.name = id, name


ITEMS = [Item("1", "One")]


@ui("adv-items")
@title("Items")
class Items(Crud[Item]):
    def fetch(self, search):
        return list(ITEMS)

    def get(self, id):
        return ITEMS[0]

    def save(self, entity):
        pass

    def delete(self, id):
        pass


@ui("adv-books")
@title("Books")
class Books(Listing[Item], Navigable[Item, str], Editable[Item, str], Creatable[Item, str]):
    def search(self, request, http=None):
        return list(ITEMS)

    def view(self, id, http=None):
        return ITEMS[0]

    def edit(self, id, http=None):
        return ITEMS[0]

    def save(self, editor, http=None):
        return "1"

    def creation_form(self, http=None):
        return Item()

    def create(self, form, http=None):
        return "1"


@ui("adv-wizard")
@title("Signup")
class Signup(Wizard):
    email: Annotated[str | None, Step(1)] = None
    company: Annotated[str | None, Step(2)] = None

    def complete(self) -> Message:
        return Message("done")


@ui("adv-fab")
@title("Fab page")
class FabPage:
    name: str = "Ada"

    @fab("vaadin:plus", "Add")
    def add(self) -> Message:
        return Message("Added")

    @button()
    @shortcut("ctrl+s")
    def save(self) -> Message:
        return Message("Saved")


def _handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def _component(route: str, view, action: str = "", state: dict | None = None):
    inc = _handler().handle(RunActionRq(
        route=route, consumed_route="", server_side_type=type_name(view), action_id=action,
        component_state=state or {},
    ))
    return inc.fragments[0].component


def _toolbar_ids(component) -> list[str]:
    return [b.action_id for b in component.children[0].metadata.toolbar]


def _advertised(component) -> dict[str, bool]:
    return {a.id: a.validation_required for a in component.actions}


def test_every_crud_form_button_is_advertised_and_save_validates():
    for route in ("adv-items/new", "adv-items/1", "adv-items/1/edit"):
        component = _component(route, Items)
        advertised = _advertised(component)
        assert set(_toolbar_ids(component)) <= set(advertised), route
    assert _advertised(_component("adv-items/new", Items))["create"] is True
    assert _advertised(_component("adv-items/1", Items))["edit"] is False


def test_crud_create_and_edit_forms_are_form_pages_that_guard_unsaved_changes():
    # Java's crud forms answer pageType "form" and opt into the dirty guard (found diffing a
    # second-request conformance trial: the ports said "collection" and guarded nothing)
    for route, guarded in (("adv-items/new", True), ("adv-items/1/edit", True), ("adv-items/1", False)):
        component = _component(route, Items)
        assert component.confirm_on_navigation_if_dirty is guarded, route
        if guarded:
            assert component.page_type == "form", route


def test_every_capability_form_button_is_advertised():
    for route in ("adv-books/new", "adv-books/1", "adv-books/1/edit"):
        component = _component(route, Books)
        assert set(_toolbar_ids(component)) <= set(_advertised(component)), route


def test_the_wizard_advertises_back_and_next():
    advertised = _advertised(_component("adv-wizard", Signup))
    assert advertised["next"] is True
    assert advertised["back"] is False


def test_a_page_fab_is_advertised_without_validation():
    assert _advertised(_component("adv-fab", FabPage))["add"] is False


def _navigates_to(route: str, view, action: str) -> str | None:
    inc = _handler().handle(RunActionRq(
        route=route, consumed_route=route, server_side_type=type_name(view), action_id=action,
    ))
    assert not inc.messages or inc.messages[0].variant != "error", inc.messages
    return next((c.data for c in inc.commands if c.type == "NavigateTo"), None)


def test_the_crud_toolbar_actions_move_between_the_crud_routes():
    # answered "Action not found" until they were advertised and the browser started sending them
    assert _navigates_to("/adv-items", Items, "new") == "/adv-items/new"
    assert _navigates_to("/adv-items/1", Items, "new") == "/adv-items/new"
    assert _navigates_to("/adv-items/1", Items, "edit") == "/adv-items/1/edit"
    assert _navigates_to("/adv-items/1", Items, "cancel-view") == "/adv-items"
    assert _navigates_to("/adv-items/new", Items, "cancel-new") == "/adv-items"
    assert _navigates_to("/adv-items/1/edit", Items, "cancel-edit") == "/adv-items/1"


def test_the_capability_form_toolbar_actions_move_between_the_listing_routes():
    assert _navigates_to("/adv-books", Books, "new") == "/adv-books/new"
    assert _navigates_to("/adv-books/1", Books, "edit") == "/adv-books/1/edit"
    assert _navigates_to("/adv-books/1", Books, "cancel-view") == "/adv-books"
    assert _navigates_to("/adv-books/1/edit", Books, "cancel-edit") == "/adv-books/1"


def test_archetype_toolbars_are_advertised():
    # the calendar's ‹ Today › + Create and the data-management view switcher were dead buttons:
    # the sync handler answers them, but no method of that name exists on the view
    from tests.test_archetype_calendarpage import TeamCalendar
    from tests.test_data_management import ScheduleBoard

    calendar = SyncHandler(MateuRegistry(sys.modules["tests.test_archetype_calendarpage"])).handle(
        RunActionRq(route="team-calendar", server_side_type=type_name(TeamCalendar))
    ).fragments[0].component
    assert {"previousCalendarMonth", "goCalendarToday", "nextCalendarMonth"} <= {a.id for a in calendar.actions}
    board = SyncHandler(MateuRegistry(sys.modules["tests.test_data_management"])).handle(
        RunActionRq(route="/schedule-board", server_side_type=type_name(ScheduleBoard))
    ).fragments[0].component
    assert {"switchToGrid", "switchToGantt"} <= {a.id for a in board.actions}


def test_the_refresh_on_change_action_is_advertised():
    # the CollectionDetail search fires filterCollection through an AutoSave trigger; unadvertised,
    # the web dropped it and React Native sent it to the APP type ("Action not found")
    from tests.test_archetypes_collection_overview import HotelDirectory, RequisitionOverview

    module = sys.modules["tests.test_archetypes_collection_overview"]
    for view, route, action in ((HotelDirectory, "hotel-directory", "filterCollection"),
                                (RequisitionOverview, "requisition-overview", "switchRecord")):
        component = SyncHandler(MateuRegistry(module)).handle(
            RunActionRq(route=route, server_side_type=type_name(view))
        ).fragments[0].component
        assert action in {a.id for a in component.actions}, view


class Typed:
    active: bool = True
    count: int = 0
    price: float = 0.0


def test_text_typed_numbers_and_booleans_bind_to_their_types():
    # the web number field sends "77"; a restored URL or a Yes/No option sends "false" — which
    # bool() read as True
    typed = Typed()
    _handler().bind_state(typed, {"active": "false", "count": "3", "price": "77.5"})
    assert typed.active is False and typed.count == 3 and typed.price == 77.5


def test_a_button_shortcut_rides_on_its_advertised_action():
    # the web client scans the component's ACTIONS for shortcuts: on the button only, Ctrl+S did
    # nothing
    actions = {a.id: a for a in _component("adv-fab", FabPage).actions}
    assert actions["save"].shortcut == "ctrl+s"
