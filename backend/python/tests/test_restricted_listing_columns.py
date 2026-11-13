"""A row field the caller may not see (``EyesOnly``) or that the audience projects out
(``Audience``) is neither a column nor a value of the row data (GA review S2): the column used to
be dropped while the rows still carried the value."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Audience, Crud, EyesOnly, Identity, Listing, Navigable, title, ui  # noqa: E402

MODULE = sys.modules[__name__]
SECRET = "SALARY-SECRET-123"
STAFF_ONLY = "STAFF-NOTE-456"


class Emp:
    id: str = ""
    name: str = ""
    salary: Annotated[str, EyesOnly(roles=["hr"])] = ""
    note: Annotated[str, Audience("staff")] = ""

    def __init__(self, id="", name="", salary="", note=""):
        self.id, self.name, self.salary, self.note = id, name, salary, note


class Team:
    id: str = ""
    name: str = ""
    members: list[Emp] = []

    def __init__(self, id="", name="", members=None):
        self.id, self.name, self.members = id, name, members or []


def _emps():
    return [Emp("e1", "Ana", SECRET, STAFF_ONLY)]


@ui("emp-listing")
@title("Employees")
class EmpListing(Listing[Emp]):
    def search(self, request, http=None):
        return _emps()


@ui("emp-navigable")
@title("Employees")
class EmpNavigable(Listing[Emp], Navigable):
    def search(self, request, http=None):
        return _emps()

    def view(self, id):
        return _emps()[0]


@ui("emp-crud")
@title("Employees")
class EmpCrud(Crud[Emp]):
    def fetch(self, search):
        return _emps()

    def get(self, id_):
        return _emps()[0] if id_ == "e1" else None

    def save(self, entity):
        pass


def _handler(roles=()):
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))


def _wire(inc) -> str:
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def _columns(text: str) -> set[str]:
    out: set[str] = set()

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "GridColumn" and isinstance(node.get("id"), str):
                out.add(node["id"])
            meta = node.get("metadata")
            if isinstance(meta, dict) and meta.get("type") == "GridColumn":
                out.add(node.get("id") or meta.get("dataPath") or "")
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(json.loads(text))
    return out


def _load_and_search(h, cls, route, app_state=None):
    load = _wire(h.handle(RunActionRq(route=route, consumed_route=route, app_state=app_state or {})))
    search = _wire(h.handle(RunActionRq(
        route=route, consumed_route=route, server_side_type=type_name(cls), action_id="search",
        initiator_component_id="c1", component_state={}, app_state=app_state or {},
    )))
    return load, search


@pytest.mark.parametrize("cls,route", [(EmpListing, "emp-listing"), (EmpNavigable, "emp-navigable"),
                                       (EmpCrud, "emp-crud")])
def test_an_eyes_only_row_field_is_neither_a_column_nor_a_value(cls, route):
    load, search = _load_and_search(_handler(), cls, route)
    assert "salary" not in _columns(load)
    assert SECRET not in search and SECRET not in load
    assert "Ana" in search
    hr_load, hr_search = _load_and_search(_handler(("hr",)), cls, route)
    assert "salary" in _columns(hr_load)
    assert SECRET in hr_search


@pytest.mark.parametrize("cls,route", [(EmpListing, "emp-listing"), (EmpCrud, "emp-crud")])
def test_an_audience_row_field_is_projected_out_of_the_rows_too(cls, route):
    load, search = _load_and_search(_handler(), cls, route, app_state={"audience": "cliente"})
    assert "note" not in _columns(load)
    assert STAFF_ONLY not in search
    staff_load, staff_search = _load_and_search(_handler(), cls, route, app_state={"audience": "staff"})
    assert STAFF_ONLY in staff_search


@ui("emp-sorted")
class EmpSorted(Listing[Emp]):
    def search(self, request, http=None):
        return [Emp("e1", "Zoe", "1"), Emp("e2", "Ana", "9"), Emp("e3", "Max", "5")]


@ui("team-tree")
class TeamTree(Listing[Team]):
    def search(self, request, http=None):
        return [Team("t1", "Ops", [Emp("e1", "Ana", SECRET)])]


def _names(search: str) -> list[str]:
    content = json.loads(search)["fragments"][0]["data"]["crud"]["page"]["content"]
    return [r["name"] for r in content]


def _search(h, cls, route, state):
    return _wire(h.handle(RunActionRq(
        route=route, consumed_route=route, server_side_type=type_name(cls), action_id="search",
        initiator_component_id="c1", component_state=state,
    )))


def test_a_hidden_field_is_no_sort_key_for_the_caller():
    by_salary = {"sort": [{"fieldId": "salary", "direction": "descending"}]}
    assert _names(_search(_handler(), EmpSorted, "emp-sorted", by_salary)) == ["Zoe", "Ana", "Max"]
    assert _names(_search(_handler(("hr",)), EmpSorted, "emp-sorted", by_salary)) == ["Ana", "Max", "Zoe"]


def test_child_rows_of_a_tree_follow_the_same_filter():
    assert SECRET not in _search(_handler(), TeamTree, "team-tree", {})
    assert SECRET in _search(_handler(("hr",)), TeamTree, "team-tree", {})
