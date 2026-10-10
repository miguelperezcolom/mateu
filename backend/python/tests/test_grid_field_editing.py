"""Grid (list-of-rows) fields on a form: the row editor wiring on the wire (Edit column, editor
position/columns, wide-field auto-colspan) and the row-editing actions — add / select / create /
save / prev / next / remove / move / cancel, plus the inline-editing "+" that appends a row in place.
The Python mirror of Java's crud-field action handlers."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Colspan,
    DetailForm,
    InlineEditing,
    Multiline,
    Required,
    form_layout,
    read_only,
    title,
    ui,
)

MODULE = sys.modules[__name__]


class GuestRow:
    name: Annotated[str, Required()] = ""
    age: int = 0


@ui("ge-form")
@title("Guests")
class GuestsForm:
    reference: str = "R-1"
    guests: list[GuestRow] = []
    notes: Annotated[str, Multiline()] = ""

    def __init__(self):
        a, b = GuestRow(), GuestRow()
        a.name, a.age = "Alice", 34
        b.name, b.age = "Bob", 29
        self.guests = [a, b]


@ui("ge-wide")
@form_layout(columns=3)
class ThreeColumns:
    notes: Annotated[str, Multiline()] = ""
    small: Annotated[str, Colspan(2)] = ""
    guests: Annotated[list[GuestRow], DetailForm(position="modal", columns=1)] = []


@ui("ge-ro")
@read_only
class ReadOnlyGuests:
    guests: list[GuestRow] = []


@ui("ge-inline")
class InlineGuests:
    guests: Annotated[list[GuestRow], InlineEditing()] = []


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def dump(inc) -> dict:
    return inc.model_dump(by_alias=True, mode="json")


def fields_of(cls) -> dict:
    out = {}

    def walk(n):
        if isinstance(n, dict):
            meta = n.get("metadata")
            if isinstance(meta, dict) and meta.get("type") == "FormField":
                out[meta["fieldId"]] = meta
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(dump(handler().handle(RunActionRq(server_side_type=type_name(cls)))))
    return out


def act(action: str, state: dict, cls=GuestsForm, **params):
    return dump(
        handler().handle(
            RunActionRq(
                server_side_type=type_name(cls),
                route="ge-form",
                action_id=action,
                initiator_component_id="cmp",
                component_state=state,
                parameters=params,
            )
        )
    )


ROWS = [
    {"name": "Alice", "age": 34, "_rowNumber": "a"},
    {"name": "Bob", "age": 29, "_rowNumber": "b"},
]


# ── the wire ─────────────────────────────────────────────────────────────────


def test_an_editable_grid_carries_the_row_editor_wiring():
    grid = fields_of(GuestsForm)["guests"]
    ids = [c["metadata"]["id"] for c in grid["columns"]]
    assert ids == ["name", "age", "_select"]
    select = grid["columns"][-1]["metadata"]
    assert (select["stereotype"], select["text"], select["actionId"]) == ("button", "Edit", "guests_select")
    assert grid["formPosition"] == "right" and grid["formColumns"] == 2
    assert grid["minHeightWhenDetailVisible"] == "16rem;"
    assert grid["onItemSelectionActionId"] == "guests_selected"
    assert grid["colspan"] == 2  # a grid spans the whole row of a two-column form


def test_wide_fields_span_the_whole_row_unless_told_otherwise():
    fields = fields_of(ThreeColumns)
    assert fields["notes"]["colspan"] == 3
    assert fields["small"]["colspan"] == 2
    assert fields["guests"]["colspan"] == 3
    assert (fields["guests"]["formPosition"], fields["guests"]["formColumns"]) == ("modal", 1)


def test_a_read_only_grid_has_no_editor_and_no_selection_action():
    grid = fields_of(ReadOnlyGuests)["guests"]
    assert [c["metadata"]["id"] for c in grid["columns"]] == ["name", "age"]
    assert grid.get("onItemSelectionActionId") is None


def test_an_inline_grid_edits_its_cells_instead():
    grid = fields_of(InlineGuests)["guests"]
    assert grid["inlineEditing"] is True
    assert "_select" not in [c["metadata"]["id"] for c in grid["columns"]]


def test_the_row_actions_are_advertised():
    comp = dump(handler().handle(RunActionRq(server_side_type=type_name(GuestsForm))))["fragments"][0]["component"]
    ids = [a["id"] for a in comp["actions"]]
    assert ids[:12] == [f"guests{s}" for s in (
        "_create", "_create-and-stay", "_add", "_select", "_selected", "_prev", "_next",
        "_save", "_remove", "_move-up", "_move-down", "_cancel")]
    create = comp["actions"][0]
    assert create["validationRequired"] is True and create["fieldsToValidate"] == "name"


# ── the actions ──────────────────────────────────────────────────────────────


def test_add_opens_an_empty_row_editor_in_the_detail_container():
    out = act("guests_add", {"guests": ROWS})
    state, editor = out["fragments"]
    assert state["targetComponentId"] == "cmp"
    assert state["state"]["_show_detail"] == {"guests": True}
    assert editor["targetComponentId"] == "guests-container" and editor["containerId"] == "guests-container"
    form = editor["component"]["children"][0]["metadata"]
    assert form["type"] == "Form" and form["title"] == "New guest"
    assert [b["label"] for b in form["buttons"]] == ["Save", "Save and add another", "Cancel"]
    assert editor["component"]["initialData"] == {"name": "", "age": 0}


def test_create_appends_the_edited_row_and_closes_the_editor():
    out = act("guests_create", {"guests": ROWS}, initiatorState={"name": "Carol", "age": 41})
    [frag] = out["fragments"]
    rows = frag["state"]["guests"]
    assert [r["name"] for r in rows] == ["Alice", "Bob", "Carol"]
    assert rows[2]["age"] == 41 and rows[2]["_rowNumber"]
    assert frag["state"]["_show_detail"] == {"guests": False}


def test_create_and_stay_keeps_an_empty_editor_open():
    out = act("guests_create-and-stay", {"guests": ROWS}, initiatorState={"name": "Carol", "age": 41})
    state, editor = out["fragments"]
    assert len(state["state"]["guests"]) == 3
    assert editor["component"]["initialData"]["name"] == ""


def test_select_opens_the_row_with_its_position_and_peers():
    out = act("guests_select", {"guests": ROWS}, _rowNumber="b")
    _, editor = out["fragments"]
    form = editor["component"]["children"][0]["metadata"]
    assert form["title"] == "Edit guest"
    assert [b["actionId"] for b in form["toolbar"]] == ["guests_prev", "guests_next"]
    assert editor["component"]["initialData"]["name"] == "Bob"
    assert editor["component"]["initialData"]["_position"] == "2/2"


def test_save_writes_the_edited_row_back():
    out = act("guests_save", {"guests": ROWS}, initiatorState={"name": "Bobby", "age": 30, "_rowNumber": "b"})
    rows = out["fragments"][0]["state"]["guests"]
    assert rows[1] == {"name": "Bobby", "age": 30, "_rowNumber": "b"}
    assert rows[0]["name"] == "Alice"


def test_prev_and_next_page_through_the_rows_inside_the_editor():
    out = act("guests_prev", {"guests": ROWS}, initiatorState={"_rowNumber": "b"})
    [frag] = out["fragments"]
    assert frag["targetComponentId"] == "guests-container"
    assert frag["state"]["name"] == "Alice" and frag["state"]["_position"] == "1/2"
    edge = act("guests_next", {"guests": ROWS}, initiatorState={"_rowNumber": "b"})
    assert edge["messages"][0]["variant"] == "error"


def test_remove_drops_the_selected_rows():
    out = act("guests_remove", {"guests": ROWS, "guests_selected_items": [ROWS[0]]})
    assert [r["name"] for r in out["fragments"][0]["state"]["guests"]] == ["Bob"]


def test_move_up_and_down_reorder_the_selection():
    up = act("guests_move-up", {"guests": ROWS, "guests_selected_items": [ROWS[1]]})
    assert [r["name"] for r in up["fragments"][0]["state"]["guests"]] == ["Bob", "Alice"]
    down = act("guests_move-down", {"guests": ROWS, "guests_selected_items": [ROWS[0]]})
    assert [r["name"] for r in down["fragments"][0]["state"]["guests"]] == ["Bob", "Alice"]


def test_cancel_closes_the_editor():
    out = act("guests_cancel", {"guests": ROWS, "_show_detail": {"guests": True}})
    assert out["fragments"][0]["state"]["_show_detail"] == {"guests": False}


def test_selected_mirrors_the_clicked_row_into_the_state():
    out = act("guests_selected", {"guests": ROWS, "guests_selected_items": [ROWS[1]]})
    state = out["fragments"][0]["state"]
    assert state["guests-name"] == "Bob" and state["guests_position"] == "2/2"


def test_the_inline_plus_appends_an_empty_row_in_place():
    out = act("guests_add", {"guests": ROWS}, cls=InlineGuests)
    [frag] = out["fragments"]
    rows = frag["state"]["guests"]
    assert len(rows) == 3 and rows[2]["name"] == "" and rows[2]["_rowNumber"]
    assert frag["state"]["_show_detail"] == {"guests": False}


def test_the_edited_rows_save_with_the_form():
    from mateu_uidl import Message, button

    seen = {}

    @ui("ge-save")
    class Saving:
        guests: list[GuestRow] = []

        @button()
        def save(self):
            seen["names"] = [g.name for g in self.guests]
            return Message("ok")

    h = SyncHandler(MateuRegistry(Saving))
    h.handle(
        RunActionRq(
            server_side_type=type_name(Saving),
            action_id="save",
            component_state={"guests": ROWS + [{"name": "Carol", "age": 41, "_rowNumber": "x"}]},
        )
    )
    assert seen["names"] == ["Alice", "Bob", "Carol"]
