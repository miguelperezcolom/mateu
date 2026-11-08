"""MasterDetailView (Java's MasterDetailView + RunnersAndMasterDetailSyncTest): the master fields
always shown, a button bar of DetailPart fields, the selected part's button primary and only that
part rendered; picking another part re-renders in place (port idiom)."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import DetailPart, MasterDetailView, Section, title, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("reserva-md")
@title("Reserva")
class ReservaMd(MasterDetailView):
    code: Annotated[str, Section("Resumen")] = ""
    pagos: Annotated[str, DetailPart(label="Pagos")] = "pagos-data"
    historial: Annotated[str, DetailPart(label="Historial")] = "historial-data"

    def load(self) -> None:
        self.code = "R-42"


def run(action="", route="reserva-md", state=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, server_side_type=type_name(ReservaMd), action_id=action,
        component_state=state or {},
    )).model_dump(by_alias=True, mode="json")


def bar(inc):
    meta = inc["fragments"][0]["component"]["children"][0]["metadata"]
    return [(b["label"], b["actionId"], b.get("buttonStyle")) for b in meta["toolbar"]]


def test_the_first_part_is_selected_by_default():
    inc = run()
    assert bar(inc) == [
        ("Pagos", "__md_pick:pagos", "primary"),
        ("Historial", "__md_pick:historial", "tertiary"),
    ]
    body = json.dumps(inc["fragments"][0]["component"]["children"])
    assert '"pagos"' in body and '"historial"' not in body
    comp = inc["fragments"][0]["component"]
    assert comp["initialData"]["code"] == "R-42" and comp["initialData"]["_mdPart"] == "pagos"
    assert {"__md_pick:pagos", "__md_pick:historial"} <= {a["id"] for a in comp["actions"]}


def test_picking_a_part_re_renders_with_that_part():
    inc = run("__md_pick:historial")
    assert bar(inc)[1][2] == "primary"
    body = json.dumps(inc["fragments"][0]["component"]["children"])
    assert '"historial"' in body and '"pagos"' not in body


def test_the_selection_survives_in_the_state_and_the_route():
    assert bar(run(state={"_mdPart": "historial"}))[1][2] == "primary"
    assert bar(run(route="reserva-md/__md/historial"))[1][2] == "primary"


def test_an_unknown_part_is_refused():
    with pytest.raises(MateuForbiddenException):
        run("__md_pick:nope")
