"""Class- and method-level ``@eyes_only`` (Java's ``@EyesOnly`` on a type / a method): a gated view is
refused (403) whichever way a request names it, its menu entries hide, and a gated button hides
and refuses invocation."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, Identity, Message, app, button, eyes_only, menu_item, title, ui  # noqa: E402

MODULE = sys.modules[__name__]
RAN: list[str] = []


@ui("eo-payroll")
@title("Payroll")
@eyes_only(roles=("hr",))
class Payroll:
    total: str = "1M"

    @button()
    def pay(self):
        RAN.append("pay")
        return Message("paid")


class Employee:
    id: str = ""
    name: str = ""


@ui("eo-staff")
@eyes_only(roles=("hr",))
class Staff(Crud[Employee]):
    def fetch(self, search):
        return []


@ui("eo-public")
@title("Public")
class Public:
    name: str = "x"

    @button()
    def hello(self):
        RAN.append("hello")
        return Message("hi")

    @button()
    @eyes_only(roles=("admin",))
    def purge(self):
        RAN.append("purge")
        return Message("purged")


@app("EO app")
class EoApp:
    @menu_item("Public")
    def public(self) -> Public:
        return Public()

    @menu_item("Payroll")
    def payroll(self) -> Payroll:
        return Payroll()

    @menu_item("Audit")
    @eyes_only(roles=("auditor",))
    def audit(self) -> Public:
        return Public()


def handler(*roles: str) -> SyncHandler:
    return SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(roles=roles)) if roles else None,
    )


def test_a_gated_view_is_refused_by_route_by_type_and_by_sub_route():
    with pytest.raises(MateuForbiddenException):
        handler().handle(RunActionRq(route="eo-payroll"))
    with pytest.raises(MateuForbiddenException):
        handler().handle(RunActionRq(server_side_type=type_name(Payroll)))
    with pytest.raises(MateuForbiddenException):
        handler().handle(RunActionRq(route="eo-staff/new"))


def test_a_gated_action_never_runs_for_the_unauthorized():
    RAN.clear()
    with pytest.raises(MateuForbiddenException):
        handler("sales").handle(
            RunActionRq(server_side_type=type_name(Payroll), action_id="pay", route="eo-payroll")
        )
    assert RAN == []


def test_the_authorized_get_the_view_and_its_actions():
    RAN.clear()
    inc = handler("hr").handle(RunActionRq(route="eo-payroll"))
    assert "1M" in inc.model_dump_json()
    handler("hr").handle(RunActionRq(server_side_type=type_name(Payroll), action_id="pay"))
    assert RAN == ["pay"]


def test_a_gated_button_hides_and_refuses():
    RAN.clear()
    j = handler().handle(RunActionRq(route="eo-public")).model_dump_json(by_alias=True)
    assert '"hello"' in j and '"purge"' not in j
    with pytest.raises(MateuForbiddenException):
        handler().handle(RunActionRq(server_side_type=type_name(Public), action_id="purge"))
    assert RAN == []
    assert '"purge"' in handler("admin").handle(RunActionRq(route="eo-public")).model_dump_json(by_alias=True)


def test_menu_entries_to_gated_views_or_gated_entries_hide():
    def labels(h):
        meta = h.handle(RunActionRq(server_side_type=type_name(EoApp))).model_dump(by_alias=True)
        return [m["label"] for m in meta["fragments"][0]["component"]["metadata"]["menu"]]

    assert labels(handler()) == ["Public"]
    assert labels(handler("hr", "auditor")) == ["Public", "Payroll", "Audit"]


def test_the_fastapi_edge_answers_403():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_fastapi import add_mateu

    app_ = fastapi.FastAPI()
    add_mateu(app_, MODULE, identity_provider=lambda: None)
    r = TestClient(app_).post("/mateu/v3/sync/eo-payroll", json={"route": "eo-payroll"})
    assert r.status_code == 403
