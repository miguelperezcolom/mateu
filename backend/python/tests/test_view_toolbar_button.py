"""@view_toolbar_button (Java's @ViewToolbarButton + CrudViewToolbarRefreshSyncTest): a crud method
offered on the RECORD VIEW page's toolbar as action-on-view-<method>, run on the record shown; a
message answer shows the message over the record reloaded, an answer that navigates is left alone,
and only a marked method is reachable."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import Crud, Message, Navigate, ui, view_toolbar_button  # noqa: E402

MODULE = sys.modules[__name__]
STATUS: dict[str, str] = {}


class Loan:
    id: str = ""
    status: str = ""


@ui("loans")
class Loans(Crud[Loan]):
    def fetch(self, search):
        out = []
        for k, v in STATUS.items():
            loan = Loan()
            loan.id, loan.status = k, v
            out.append(loan)
        return out

    @view_toolbar_button("Give back")
    def give_back(self, loan: Loan):
        STATUS[loan.id] = "RETURNED"
        return Message("Returned")

    @view_toolbar_button(confirmation_required=False)
    def give_back_and_go(self, loan: Loan):
        STATUS[loan.id] = "RETURNED"
        return Navigate("/elsewhere")

    def not_a_button(self, loan: Loan):
        STATUS[loan.id] = "HACKED"


@pytest.fixture(autouse=True)
def _reset():
    STATUS.clear()
    STATUS["l1"] = "OPEN"


def handler():
    return SyncHandler(MateuRegistry(MODULE))


def on_view(method: str):
    return handler().handle(RunActionRq(
        route="loans/l1", consumed_route="/loans", server_side_type=type_name(Loans),
        action_id="action-on-view-" + method, component_state={"id": "l1", "status": "OPEN"},
        initiator_component_id="ln_app",
    )).model_dump(by_alias=True, mode="json")


def test_the_view_page_offers_the_buttons_before_back_and_edit():
    inc = handler().handle(RunActionRq(
        route="loans/l1", server_side_type=type_name(Loans),
    )).model_dump(by_alias=True, mode="json")
    comp = inc["fragments"][0]["component"]
    toolbar = comp["children"][0]["metadata"]["toolbar"]
    assert [b["actionId"] for b in toolbar] == [
        "action-on-view-giveBack", "action-on-view-giveBackAndGo", "cancel-view", "edit",
    ]
    assert toolbar[0]["label"] == "Give back"
    actions = {a["id"]: a for a in comp["actions"]}
    assert actions["action-on-view-giveBack"]["confirmationRequired"] is True
    assert actions["action-on-view-giveBackAndGo"]["confirmationRequired"] is False


def test_a_message_answer_shows_the_message_and_the_reloaded_record():
    inc = on_view("giveBack")
    assert STATUS["l1"] == "RETURNED"
    assert [m["text"] for m in inc["messages"]] == ["Returned"]
    fragments = json.dumps(inc["fragments"])
    assert "RETURNED" in fragments and "OPEN" not in fragments


def test_an_answer_that_navigates_is_left_alone():
    inc = on_view("giveBackAndGo")
    assert [(c["type"], c["data"]) for c in inc["commands"]] == [("NavigateTo", "/elsewhere")]


def test_only_a_marked_method_is_reachable():
    with pytest.raises(MateuForbiddenException):
        on_view("notAButton")
    assert STATUS["l1"] == "OPEN"
