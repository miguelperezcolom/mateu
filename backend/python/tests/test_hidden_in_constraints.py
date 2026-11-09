"""A field a crud record form hides with ``HiddenInCreate()`` / ``HiddenInEditor()`` carries no
Min/Max/Length/Pattern there — no client-side validation is emitted for it, and the server-side
re-check on create / save / update-row skips it — while the form that DOES render it checks it.
Mirrors Java's ServerConstraintCheck (PageFormBuilder.rendersAsInput) and the conformance cases
``crud-hidden-constraints-new`` / ``-edit``."""

from __future__ import annotations

import copy
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud,
    HiddenInCreate,
    HiddenInEditor,
    HiddenInList,
    HiddenInView,
    Max,
    Min,
    Pattern,
    inline_editing,
    ui,
)

MODULE = sys.modules[__name__]


class Seat:
    id: str = ""
    name: str = ""
    code: Annotated[str, HiddenInCreate(), Pattern("^[A-Z]{3}$")] = ""
    quota: Annotated[int | None, HiddenInEditor(), Min(1), Max(9)] = None
    note: Annotated[str, HiddenInList(), Pattern("^[a-z]*$")] = ""
    secret: Annotated[str, HiddenInView(), Pattern("^[0-9]*$")] = ""


STORE: dict[str, Seat] = {}


def _seed():
    STORE.clear()
    s = Seat()
    s.id, s.name, s.code, s.quota = "S-1", "Front", "FRT", 2
    STORE["S-1"] = s


@ui("hic-seats")
@inline_editing
class Seats(Crud[Seat]):
    def fetch(self, search):
        return list(STORE.values())

    def get(self, id):
        s = STORE.get(id)
        return copy.copy(s) if s is not None else None

    def save(self, entity):
        if not entity.id:
            entity.id = f"S-{len(STORE) + 1}"
        STORE[entity.id] = entity


def handle(**rq):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(server_side_type=type_name(Seats), **rq)
    )


def validated_ids(route: str) -> set[str]:
    comp = handle(route=route).model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    return {v["fieldId"] for v in comp.get("validations") or []}


def test_the_create_form_sends_no_validation_for_a_hidden_in_create_field():
    _seed()
    assert validated_ids("/hic-seats/new") == {"quota", "note", "secret"}


def test_the_edit_form_sends_no_validation_for_a_hidden_in_editor_field():
    _seed()
    assert validated_ids("/hic-seats/S-1/edit") == {"code", "note", "secret"}


def test_a_create_does_not_check_a_hidden_in_create_fields_constraint():
    _seed()
    inc = handle(route="/hic-seats/new", action_id="create",
                 component_state={"name": "Back", "code": "nope", "quota": 3})
    assert all(m.variant != "error" for m in inc.messages), [m.text for m in inc.messages]
    assert any(s.name == "Back" for s in STORE.values())


def test_a_create_still_checks_the_fields_it_renders():
    _seed()
    inc = handle(route="/hic-seats/new", action_id="create",
                 component_state={"name": "Back", "quota": 42})
    assert inc.messages[0].variant == "error"
    assert "Quota: Must be at most 9" in inc.messages[0].text
    assert not any(s.name == "Back" for s in STORE.values())


def test_an_edit_does_not_check_a_hidden_in_editor_fields_constraint():
    _seed()
    STORE["S-1"].quota = 99  # stored out of bounds: not the edit form's to judge
    inc = handle(route="/hic-seats/S-1/edit", action_id="save",
                 component_state={"name": "Front row", "code": "FRT"})
    assert all(m.variant != "error" for m in inc.messages), [m.text for m in inc.messages]
    assert STORE["S-1"].name == "Front row"


def test_an_edit_still_checks_the_fields_it_renders():
    _seed()
    inc = handle(route="/hic-seats/S-1/edit", action_id="save",
                 component_state={"name": "Front", "code": "bad"})
    assert inc.messages[0].variant == "error"
    assert "Code: Invalid format" in inc.messages[0].text


def test_an_inline_edited_row_is_checked_like_the_edit_form():
    _seed()
    STORE["S-1"].quota = 99
    ok = handle(action_id="update-row", initiator_component_id="c1",
                parameters={"_editedRow": {"id": "S-1", "name": "Row"}})
    assert all(m.variant != "error" for m in ok.messages), [m.text for m in ok.messages]
    bad = handle(action_id="update-row", initiator_component_id="c1",
                 parameters={"_editedRow": {"id": "S-1", "code": "bad"}})
    assert bad.messages[0].variant == "error"
    assert "Code: Invalid format" in bad.messages[0].text
