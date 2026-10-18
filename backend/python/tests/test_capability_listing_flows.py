"""The remaining record flows of a capability listing: the editable listing's New in a drawer and
its Cancel, a navigable + editable listing whose Save lands back on the record, the routed
toolbars' New/Edit/Cancel moves, and a toolbar method declared on the listing itself."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Creatable, Editable, Listing, Message, Navigable, button, ui  # noqa: E402

MODULE = sys.modules[__name__]
SAVED: list[str] = []


class Note:
    id: str = ""
    text: str = ""

    def __init__(self, id: str = "", text: str = ""):
        self.id, self.text = id, text


NOTES = [Note("n1", "Call Ana")]


@ui("drawer-notes")
class DrawerNotes(Listing[Note], Editable[Note, str], Creatable[Note, str]):
    def search(self, request, http=None):
        return list(NOTES)

    def edit(self, id, http=None):
        return NOTES[0]

    def save(self, editor, http=None):
        SAVED.append("save:" + editor.text)
        return editor.id

    def creation_form(self, http=None):
        return Note(text="draft")

    def create(self, form, http=None):
        SAVED.append("create:" + form.text)
        return "n2"


@ui("routed-notes")
class RoutedNotes(Listing[Note], Navigable[Note, str], Editable[Note, str], Creatable[Note, str]):
    def search(self, request, http=None):
        return list(NOTES)

    def view(self, id, http=None):
        return NOTES[0]

    def edit(self, id, http=None):
        return NOTES[0]

    def save(self, editor, http=None):
        SAVED.append("save:" + editor.text)
        return editor.id

    def creation_form(self, http=None):
        return Note()

    def create(self, form, http=None):
        SAVED.append("create:" + form.text)

    @button
    def archive_all(self):
        return Message("Archived")


def run(cls, route, action_id, state=None, parameters=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route=route, server_side_type=type_name(cls), action_id=action_id,
        initiator_component_id="c1", component_state=state or {}, parameters=parameters or {},
    ))


def navigated_to(inc):
    return [c.data for c in inc.commands if c.type == "NavigateTo"]


def setup_function():
    SAVED.clear()


def test_new_on_an_editable_listing_opens_the_creation_form_in_a_drawer():
    inc = run(DrawerNotes, "drawer-notes", "new")
    assert inc.fragments[0].action == "Add"
    dumped = str(inc.model_dump(by_alias=True, mode="json"))
    assert "'type': 'Drawer'" in dumped and "draft" in dumped


def test_create_from_the_drawer_closes_it_and_searches_again():
    inc = run(DrawerNotes, "drawer-notes", "create", {"text": "Buy milk"})
    assert SAVED == ["create:Buy milk"]
    types = [c.type for c in inc.commands]
    assert "CloseModal" in types and "RunAction" in types and "NavigateTo" not in types


def test_cancel_in_the_drawer_closes_it_and_marks_the_page_clean():
    inc = run(DrawerNotes, "drawer-notes", "cancel-edit")
    assert [c.type for c in inc.commands] == ["CloseModal", "MarkAsClean"]


def test_save_on_a_navigable_listing_lands_back_on_the_record():
    inc = run(RoutedNotes, "routed-notes/n1/edit", "save", {"id": "n1", "text": "Call Luis"})
    assert SAVED == ["save:Call Luis"]
    assert navigated_to(inc) == ["/routed-notes/n1"]
    assert [m.text for m in inc.messages] == ["Saved"]


def test_create_on_a_routed_listing_goes_back_to_the_listing():
    inc = run(RoutedNotes, "routed-notes/new", "create", {"text": "New"})
    assert SAVED == ["create:New"]
    assert navigated_to(inc) == ["/routed-notes"]


def test_the_routed_toolbars_move_between_the_listing_routes():
    assert navigated_to(run(RoutedNotes, "routed-notes", "new")) == ["/routed-notes/new"]
    assert navigated_to(run(RoutedNotes, "routed-notes/n1", "edit")) == ["/routed-notes/n1/edit"]
    assert navigated_to(run(RoutedNotes, "routed-notes/n1/edit", "cancel-edit")) == ["/routed-notes/n1"]
    assert navigated_to(run(RoutedNotes, "routed-notes/new", "cancel-new")) == ["/routed-notes"]
    assert navigated_to(run(RoutedNotes, "routed-notes/n1", "cancel-view")) == ["/routed-notes"]


def test_a_toolbar_method_declared_on_the_listing_runs():
    inc = run(RoutedNotes, "routed-notes", "archiveAll")
    assert [m.text for m in inc.messages] == ["Archived"]
