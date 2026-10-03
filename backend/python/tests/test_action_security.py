"""Security regressions for the action pipeline (H1): an ``actionId`` coming from the wire may
only reach a method DECLARED as an action — a marker decorator the mapper advertises
(``@action``/``@button``/``@fab``; ``@list_toolbar_button`` for ``action-on-row-*``) or an id the
view itself advertises (``OnRowSelected``, ``@subscribe_to``, its component tree…). Private
(``_``) and name-mangled methods, nested classes, static/class methods, callable attributes and
framework base-class methods are never actions. The access gates (``disabled_unless``,
``audience``) are enforced at INVOCATION, and the wire cannot write fields hidden (``EyesOnly``)
or locked (``ReadOnlyUnless``) for the caller (mass assignment)."""

import json
import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_core.naming import camel_case  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Crud,
    Dashboard,
    EyesOnly,
    Identity,
    Listing,
    ListingData,
    Message,
    OnRowSelected,
    ReadOnlyUnless,
    audience,
    button,
    disabled_unless,
    list_toolbar_button,
    title,
    ui,
)
from mateu_uidl import components as fluent  # noqa: E402

CALLS: dict[str, int] = {}


def _hit(key: str) -> None:
    CALLS[key] = CALLS.get(key, 0) + 1


class _CallableThing:
    def __call__(self, *args, **kwargs):
        _hit("callable_attr")
        return Message("callable attribute ran")


class ProbeRow:
    code: str = ""


@ui("sec-probe")
@title("Security probe")
class SecProbe:
    name: str | None = None
    rows: Annotated[list[ProbeRow], OnRowSelected("pick_row")] = None

    dispatcher = _CallableThing()

    @button()
    def go(self):
        _hit("go")
        return Message("went")

    def helper(self):
        _hit("helper")
        return Message("helper ran")

    def _private_helper(self):
        _hit("private")
        return Message("private ran")

    def __mangled(self):
        _hit("mangled")
        return Message("mangled ran")

    @staticmethod
    def static_util():
        _hit("static")
        return Message("static ran")

    @classmethod
    def class_util(cls):
        _hit("classmethod")
        return Message("classmethod ran")

    class Inner:
        def __init__(self, *args):
            _hit("inner")

    @button()
    @disabled_unless(roles=("manager",))
    def approve(self):
        _hit("approve")
        return Message("approved")

    @button()
    @audience("staff")
    def audit(self):
        _hit("audit")
        return Message("audited")

    # Advertised by OnRowSelected on ``rows`` — no marker on the method itself.
    def pick_row(self, row: ProbeRow):
        _hit("pick_row")
        return Message(f"picked {row.code}")


@ui("sec-bind")
@title("Bind probe")
class SecBind:
    name: str | None = None
    secret: Annotated[str, EyesOnly(roles=("staff",))] = "server-secret"
    discount: Annotated[int, ReadOnlyUnless(roles=("manager",))] = 5

    @button()
    def show(self):
        return Message(f"{self.name}|{self.secret}|{self.discount}")


@ui("sec-dashboard")
@title("Sec dashboard")
class SecDashboard(Dashboard):
    revenue: fluent.MetricCard = fluent.MetricCard(title="Revenue", value="1", action_id="drill")

    # Advertised by the composed tree (the metric card's drill-in) — no marker needed.
    def drill(self):
        return Message("drilled")


class SecItem:
    id: str = ""
    name: str = ""


@ui("sec-crud")
@title("Sec crud")
class SecCrud(Crud[SecItem]):
    def fetch(self, search):
        it = SecItem()
        it.id, it.name = "s1", "Bolts"
        return [it]

    def save(self, entity):
        _hit("crud_save")

    def delete(self, id):
        _hit("crud_delete")

    def helper(self):
        _hit("crud_helper")
        return Message("crud helper ran")

    @list_toolbar_button(rows_selected_required=False)
    def bulk(self):
        return Message("bulk ran")


class CapRow:
    id: str = ""
    title: str = ""


@ui("sec-cap")
@title("Sec cap")
class SecCap(Listing[CapRow]):
    def search(self, request, http=None):
        r = CapRow()
        r.id, r.title = "b1", "Dune"
        return ListingData.of([r]) if hasattr(ListingData, "of") else [r]

    def purge(self):
        _hit("cap_purge")
        return Message("purged")

    @list_toolbar_button(rows_selected_required=False)
    def bulk(self):
        return Message("cap bulk ran")


MODULE = sys.modules[__name__]


def handler(identity: Identity | None = None) -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: identity)


def rq(route, action_id, state=None, app_state=None, parameters=None) -> RunActionRq:
    return RunActionRq(
        route=route,
        consumed_route=route,
        action_id=action_id,
        component_state=state or {},
        app_state=app_state or {},
        parameters=parameters or {},
    )


def render(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def assert_not_found(h: SyncHandler, request: RunActionRq) -> None:
    j = render(h.handle(request))
    assert '"variant": "error"' in j, j
    assert "Action not found" in j, j


def assert_forbidden(h: SyncHandler, request: RunActionRq) -> None:
    with pytest.raises(Exception) as e:
        h.handle(request)
    assert type(e.value).__name__ == "MateuForbiddenException", repr(e.value)


# ── 1. only declared actions are reachable ──────────────────────────────────────


@pytest.mark.parametrize(
    "member, key",
    [
        ("helper", "helper"),
        ("_private_helper", "private"),
        ("_SecProbe__mangled", "mangled"),
        ("static_util", "static"),
        ("class_util", "classmethod"),
        ("Inner", "inner"),
        ("dispatcher", "callable_attr"),
    ],
)
def test_non_action_members_are_not_reachable_from_the_wire(member, key):
    before = CALLS.get(key, 0)
    assert_not_found(handler(), rq("sec-probe", camel_case(member)))
    assert CALLS.get(key, 0) == before


@pytest.mark.parametrize("action_id", ["Helper", "PrivateHelper", "SecProbeMangled"])
def test_underscore_names_never_match(action_id):
    before = (CALLS.get("private", 0), CALLS.get("mangled", 0))
    assert_not_found(handler(), rq("sec-probe", action_id))
    assert (CALLS.get("private", 0), CALLS.get("mangled", 0)) == before


@pytest.mark.parametrize("action_id", ["columns", "style", "component"])
def test_framework_base_class_methods_are_not_actions(action_id):
    assert_not_found(handler(), rq("sec-dashboard", action_id))


def test_object_dunder_and_class_attributes_are_not_actions():
    for action_id in ("init", "repr", "class", "dict", "getattribute"):
        assert_not_found(handler(), rq("sec-probe", action_id))


def test_a_component_tree_advertised_method_still_runs():
    assert "drilled" in render(handler().handle(rq("sec-dashboard", "drill")))


def test_a_marked_button_still_runs():
    assert "went" in render(handler().handle(rq("sec-probe", "go")))


def test_an_on_row_selected_advertised_method_still_runs():
    j = render(handler().handle(rq("sec-probe", "pickRow", parameters={"_clickedRow": {"code": "R1"}})))
    assert "picked R1" in j


# ── 1b. action-on-row-* reaches only @list_toolbar_button methods ───────────────


@pytest.mark.parametrize(
    "action_id",
    ["action-on-row-delete", "action-on-row-save", "action-on-row-helper", "action-on-row-fetch",
     "action-on-row-idOf"],
)
def test_crud_row_actions_only_reach_list_toolbar_buttons(action_id):
    before = (CALLS.get("crud_delete", 0), CALLS.get("crud_save", 0), CALLS.get("crud_helper", 0))
    assert_not_found(handler(), rq("sec-crud", action_id))
    assert (CALLS.get("crud_delete", 0), CALLS.get("crud_save", 0), CALLS.get("crud_helper", 0)) == before


def test_a_crud_list_toolbar_button_still_runs():
    assert "bulk ran" in render(handler().handle(rq("sec-crud", "action-on-row-bulk")))


@pytest.mark.parametrize("action_id", ["action-on-row-purge", "action-on-row-search", "action-on-row-gridLayout"])
def test_listing_row_actions_only_reach_list_toolbar_buttons(action_id):
    before = CALLS.get("cap_purge", 0)
    assert_not_found(handler(), rq("sec-cap", action_id))
    assert CALLS.get("cap_purge", 0) == before


def test_a_listing_list_toolbar_button_still_runs():
    assert "cap bulk ran" in render(handler().handle(rq("sec-cap", "action-on-row-bulk")))


# ── 2. access gates are enforced at invocation ──────────────────────────────────


def test_a_disabled_unless_action_is_forbidden_without_the_role():
    before = CALLS.get("approve", 0)
    assert_forbidden(handler(), rq("sec-probe", "approve"))
    assert_forbidden(handler(Identity(roles=("staff",))), rq("sec-probe", "approve"))
    assert CALLS.get("approve", 0) == before
    assert "approved" in render(handler(Identity(roles=("manager",))).handle(rq("sec-probe", "approve")))


def test_an_audience_action_is_forbidden_for_another_audience():
    before = CALLS.get("audit", 0)
    assert_forbidden(handler(), rq("sec-probe", "audit", app_state={"audience": "cliente"}))
    assert CALLS.get("audit", 0) == before
    assert "audited" in render(handler().handle(rq("sec-probe", "audit")))
    assert "audited" in render(handler().handle(rq("sec-probe", "audit", app_state={"audience": "staff"})))


# ── 3. mass assignment ──────────────────────────────────────────────────────────

TAMPERED = {"name": "Ann", "secret": "hacked", "discount": 99}


def test_wire_state_cannot_write_eyes_only_or_read_only_unless_fields_without_the_role():
    j = render(handler().handle(rq("sec-bind", "show", state=dict(TAMPERED))))
    assert "Ann|server-secret|5" in j, j
    assert "hacked" not in j


def test_wire_state_writes_gated_fields_for_an_authorized_caller():
    h = handler(Identity(roles=("staff", "manager")))
    j = render(h.handle(rq("sec-bind", "show", state=dict(TAMPERED))))
    assert "Ann|hacked|99" in j, j


# ── 4. the HTTP edge answers a denied action with 403 ───────────────────────────


def test_the_fastapi_endpoint_answers_a_denied_action_with_403():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_fastapi import add_mateu

    app = fastapi.FastAPI()
    add_mateu(app, MODULE)
    before = CALLS.get("approve", 0)
    response = TestClient(app).post(
        "/mateu/v3/sync/sec-probe", json={"route": "sec-probe", "actionId": "approve"}
    )
    assert response.status_code == 403
    assert "Forbidden" in response.text
    assert CALLS.get("approve", 0) == before
    ok = TestClient(app).post("/mateu/v3/sync/sec-probe", json={"route": "sec-probe", "actionId": "go"})
    assert ok.status_code == 200 and "went" in ok.text
