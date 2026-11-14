"""rc.1 re-verification of the GA review round 2 Python findings (Y2-Y6, B-1, B-3, minors), each
probe written from the review's own scenario, mostly over HTTP through ``add_mateu``. The ones still
open on rc.1 are pinned ``xfail(strict=True)`` with the finding they wait for."""

from __future__ import annotations

import json
import sys
import textwrap
from dataclasses import dataclass, field
from pathlib import Path
from typing import Annotated

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud, EyesOnly, Identity, InMemoryPresenceStore, Message, ReadOnlyUnless, Required, app, button, ui,
)

MODULE = sys.modules[__name__]


def http(tmp_path, monkeypatch, roles=()) -> TestClient:
    monkeypatch.setenv("MATEU_SPECS_DIR", str(tmp_path))
    a = FastAPI()
    add_mateu(a, MODULE, identity_provider=lambda: Identity(roles=tuple(roles)))
    return TestClient(a, raise_server_exceptions=False)


def post(client: TestClient, route: str, action_id: str = "", state=None, sst=None, params=None):
    body = {"route": route, "actionId": action_id, "componentState": state or {}, "parameters": params or {}}
    if sst is not None:
        body["serverSideType"] = sst
    return client.post("/mateu/v3/sync/x", json=body)


def said(r) -> str:
    return " ".join(m.get("text", "") for m in r.json().get("messages", []))


# ── Y3: bindings follow the view model that RUNS, not the wire name ──────────────────────────────


@ui("rv-payroll-code")
class RvPayroll:
    salary: float = 100.0

    @button
    def pay(self):
        return Message(f"paid {self.salary}")


@ui("rv-conv-code")
class RvConv:
    salary: float = 100.0

    @button
    def pay(self):
        return Message(f"paid {self.salary}")


LOCKED = (
    "layout:\n  type: VerticalLayout\n  content:\n"
    "    - {type: FormField, id: salary, label: Salary, dataType: number, readOnlyUnless: {roles: [admin]},"
    " eyesOnly: {roles: [admin]}}\n"
)


def y3_specs(tmp_path: Path) -> None:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: rv-payroll\n    viewModel: {type_name(RvPayroll)}\n    access: {{roles: [admin]}}\n"
        f"  - route: rv-payroll-locked\n    layout: locked.yaml\n    viewModel: {type_name(RvPayroll)}\n"
        "  - route: hello\n    layout: hello.yaml\n"
    )
    (tmp_path / "locked.yaml").write_text(LOCKED)
    (tmp_path / "hello.yaml").write_text("type: Text\ntext: Hello\n")
    (tmp_path / "rv-conv.yaml").write_text(f"viewModel: {type_name(RvConv)}\n" + LOCKED)


@pytest.mark.parametrize("sst", [None, "", "garbage.Nothing", type_name(RvPayroll)])
def test_y3a_type_omitted_at_the_code_route_keeps_the_locks(tmp_path, monkeypatch, sst):
    y3_specs(tmp_path)
    r = post(http(tmp_path, monkeypatch), "/rv-payroll-code", "pay", {"salary": 999}, sst)
    assert said(r) == "paid 100.0", (sst, r.status_code, r.text[:200])


def test_y3a_the_load_does_not_send_the_eyes_only_value(tmp_path, monkeypatch):
    y3_specs(tmp_path)
    r = post(http(tmp_path, monkeypatch), "/rv-payroll-code")
    assert r.status_code == 200 and '"salary": 100' not in json.dumps(r.json())


@pytest.mark.parametrize("route", ["/hello", "/nowhere", "", "/rv-conv-code"])
def test_y3b_a_convention_page_declaring_view_model_binds_the_type(tmp_path, monkeypatch, route):
    y3_specs(tmp_path)
    r = post(http(tmp_path, monkeypatch), route, "pay", {"salary": 999}, type_name(RvConv))
    assert said(r) == "paid 100.0", (route, r.status_code, said(r))


# ── Y5 / Y4: EyesOnly one level down, list rows keep their protected values ───────────────────────


@dataclass
class RvAddr:
    city: str = ""
    code: Annotated[str, EyesOnly(roles=["finance"])] = ""


@dataclass
class RvLine:
    sku: str = ""
    price: Annotated[float, ReadOnlyUnless(roles=["finance"])] = 0.0
    cost: Annotated[str, EyesOnly(roles=["finance"])] = ""


@dataclass
class RvOrder:
    id: str = ""
    note: str = ""
    addr: RvAddr = field(default_factory=RvAddr)
    lines: list[RvLine] = field(default_factory=list)


ORDERS: dict[str, RvOrder] = {}


@ui("rv-orders")
class RvOrders(Crud[RvOrder]):
    def fetch(self, search):
        return list(ORDERS.values())

    def get(self, id):
        return ORDERS.get(id)

    def save(self, entity):
        ORDERS[entity.id] = entity


@pytest.fixture()
def orders():
    ORDERS.clear()
    ORDERS["o1"] = RvOrder("o1", "n", RvAddr("Palma", "CODE-SECRET"),
                           [RvLine("A", 10.0, "COST-SECRET"), RvLine("B", 20.0, "COST-SECRET")])
    yield ORDERS
    ORDERS.clear()


@pytest.mark.parametrize("route,action", [("rv-orders", "search"), ("rv-orders/o1", ""), ("rv-orders/o1/edit", "")])
def test_y5_nested_eyes_only_values_never_travel(tmp_path, monkeypatch, orders, route, action):
    r = post(http(tmp_path, monkeypatch), route, action, sst=type_name(RvOrders))
    assert r.status_code == 200
    assert "Palma" in r.text or action == "", r.text[:300]
    assert "CODE-SECRET" not in r.text and "COST-SECRET" not in r.text


def _state_with_lines(body) -> dict:
    found: list[dict] = []

    def walk(n):
        if isinstance(n, dict):
            for k in ("state", "initialData"):
                if isinstance(n.get(k), dict) and "lines" in n[k]:
                    found.append(n[k])
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(body)
    return dict(found[0])


def test_y4_saving_a_list_keeps_the_rows_protected_values(tmp_path, monkeypatch, orders):
    c = http(tmp_path, monkeypatch)
    state = _state_with_lines(post(c, "rv-orders/o1/edit", sst=type_name(RvOrders)).json())
    state["note"] = "edited"
    r = post(c, "rv-orders/o1/edit", "save", state, type_name(RvOrders))
    assert r.status_code == 200
    stored = ORDERS["o1"]
    assert stored.note == "edited"
    assert [(ln.price, ln.cost) for ln in stored.lines] == [(10.0, "COST-SECRET"), (20.0, "COST-SECRET")]


# ── Y6: object attributes of a view ──────────────────────────────────────────────────────────────


@dataclass
class RvSvc:
    base_url: str = "https://real"
    api_key: str = "API-KEY-SECRET"


SHARED_SVC = RvSvc()


@ui("rv-svc")
class RvSvcView:
    name: str = "x"
    _priv: RvSvc = SHARED_SVC

    @button
    def go(self):
        return Message(f"priv {self._priv.base_url}")


@ui("rv-svc-public")
class RvSvcPublicView:
    name: str = "x"
    svc: RvSvc = SHARED_SVC

    @button
    def go(self):
        return Message(f"svc {self.svc.base_url}")


def test_y6_a_private_object_attribute_is_neither_sent_nor_written(tmp_path, monkeypatch):
    c = http(tmp_path, monkeypatch)
    assert "API-KEY-SECRET" not in post(c, "/rv-svc").text
    r = post(c, "/rv-svc", "go", {"_priv": {"base_url": "http://evil"}, "_priv-base_url": "http://evil"})
    assert said(r) == "priv https://real" and SHARED_SVC.base_url == "https://real"


@pytest.mark.xfail(strict=True, reason="rc.2: Y6 (public part) — a public annotated object attribute is still a nested form: its values are sent")
def test_y6_a_public_object_attribute_is_not_sent(tmp_path, monkeypatch):
    assert "API-KEY-SECRET" not in post(http(tmp_path, monkeypatch), "/rv-svc-public").text


# ── Y2: __preview__ partials ─────────────────────────────────────────────────────────────────────


def test_y2_outside_refs_existing_and_missing_answer_alike(tmp_path, monkeypatch):
    from mateu_ui.core import yaml_preview
    from mateu_ui.core.partial_registry import PartialRegistry

    root = tmp_path / "specs" / "ui"
    (root / "partials").mkdir(parents=True)
    (tmp_path / "secrets").mkdir()
    (tmp_path / "secrets" / "form.yaml").write_text("type: Text\ntext: OUTSIDE-SECRET\n")
    (root / "partials" / "adminpart.yaml").write_text("type: Text\ntext: ADMIN-ONLY\neyesOnly: {roles: [admin]}\n")
    monkeypatch.setattr(yaml_preview, "_DEFAULT_PARTIALS", PartialRegistry(str(root)))
    c = http(root, monkeypatch)

    def preview(ref):
        r = post(c, "", "__preview__", params={"_yaml": f"type: Partial\nref: {ref}\n"})
        return r.status_code, json.dumps(r.json()).replace(ref, "<ref>")

    existing, missing = preview("../../secrets/form.yaml"), preview("../../secrets/nope.yaml")
    assert "OUTSIDE-SECRET" not in existing[1]
    assert existing == missing
    assert "ADMIN-ONLY" not in preview("adminpart")[1]


# ── B-1: the Python skill's Products example, verbatim ───────────────────────────────────────────

_SKILL = Path(__file__).resolve().parents[3] / "ai/claude-plugin/mateu/skills/mateu-python/reference/crud-and-listings.md"
_code = _SKILL.read_text().split("```python", 1)[1].split("```", 1)[0]
_ns: dict = {"__name__": __name__}
exec(compile(textwrap.dedent(_code), str(_SKILL), "exec"), _ns)  # noqa: S102 — the doc's own example
Products, _SKILL_STORE = _ns["Products"], _ns["_STORE"]


def test_b1_the_skill_example_creates_two_records(tmp_path, monkeypatch):
    c = http(tmp_path, monkeypatch)
    sst = type_name(Products)
    new = post(c, "products/new", sst=sst)
    assert new.status_code == 200 and '"fieldId": "id"' not in json.dumps(new.json())
    for name in ("n0", "n1"):
        r = post(c, "products/new", "create", {"name": name, "id": "P-FORGED"}, sst)
        assert r.status_code == 200, r.text[:300]
    assert sorted(p.name for p in _SKILL_STORE.values()) == ["n0", "n1"]
    assert "" not in _SKILL_STORE and "P-FORGED" not in _SKILL_STORE


class OldProduct:
    id: Annotated[str, Required()] = ""
    name: Annotated[str, Required()] = ""


OLD_STORE: dict = {}


@ui("rv-old-products")
class RvOldProducts(Crud[OldProduct]):
    """The pre-beta.65 manual pattern: keyed by an id nobody assigns."""

    def fetch(self, search):
        return list(OLD_STORE.values())

    def get(self, id):
        return OLD_STORE.get(id)

    def save(self, entity):
        OLD_STORE[entity.id] = entity


def test_b1_the_old_pattern_is_refused_not_saved(tmp_path, monkeypatch):
    r = post(http(tmp_path, monkeypatch), "rv-old-products/new", "create", {"name": "a"}, type_name(RvOldProducts))
    variants = [m.get("variant") for m in r.json().get("messages", [])]
    assert "success" not in variants and "saved without an id" in json.dumps(r.json())


# ── B-3: presence on a worker that never loaded the record's route ──────────────────────────────


@ui("/rv-desk")
@app("Desk", presence=True)
class RvDesk:
    pass


@ui("/rv-desk/known/:id")
class RvKnownRecord:
    pass


def test_b3_control_presence_answers_for_a_view_the_process_knows():
    h = SyncHandler(MateuRegistry(MODULE))
    h.presence_store = InMemoryPresenceStore()
    h.mapper.identity_provider = lambda: Identity(name="ana")
    inc = h.handle(RunActionRq(
        server_side_type=type_name(RvDesk), route="/rv-desk", action_id="_presence",
        parameters={"route": "known/1", "view": type_name(RvKnownRecord), "tab": "a", "state": "viewing"},
    ))
    assert [c for c in inc.commands if c.type == "PresenceChanged"]


@pytest.mark.xfail(strict=True, reason="rc.2: B-3 — presence uses known_type, blind to a routes.yaml-bound view model not yet imported in this process")
def test_b3_presence_for_a_routes_yaml_view_model_never_loaded_here(tmp_path):
    mod = tmp_path / "rv_unloaded_vm.py"
    mod.write_text("class RecordView:\n    name: str = ''\n")
    sys.path.insert(0, str(tmp_path))
    try:
        (tmp_path / "routes.yaml").write_text("routes:\n  - route: rv-desk/rec/:id\n    viewModel: rv_unloaded_vm.RecordView\n")
        h = SyncHandler(MateuRegistry(MODULE))
        h.presence_store = InMemoryPresenceStore()
        h.mapper.identity_provider = lambda: Identity(name="ana")
        h.routes = RouteRegistry(str(tmp_path))
        h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
        inc = h.handle(RunActionRq(
            server_side_type=type_name(RvDesk), route="/rv-desk", action_id="_presence",
            parameters={"route": "rec/1", "view": "rv_unloaded_vm.RecordView", "tab": "a", "state": "viewing"},
        ))
        assert [c for c in inc.commands if c.type == "PresenceChanged"]
    finally:
        sys.path.remove(str(tmp_path))
        sys.modules.pop("rv_unloaded_vm", None)


# ── Minors ───────────────────────────────────────────────────────────────────────────────────────


@pytest.mark.xfail(strict=True, reason="rc.2 (minor): load_spec caches every request route, misses included, without a bound")
def test_minor_load_spec_cache_is_bounded(tmp_path):
    loader = YamlSpecLoader(str(tmp_path), RouteRegistry(str(tmp_path)))
    for i in range(5000):
        loader.load_spec(f"/nothing-{i}")
    assert len(loader._by_route) < 5000


def _uploads():
    import test_file_uploads as fu

    client, _ = fu._app(fu.MemoryStorage())
    return fu, client, fu._attributes(fu._form(client), "contract")["uploadTicket"]


@pytest.mark.xfail(strict=True, reason="rc.2 (minor): an upload refused 413 by its declared Content-Length still burns one of the ticket's uses")
def test_minor_an_oversized_upload_does_not_use_up_the_ticket():
    fu, client, ticket = _uploads()
    assert fu._post(client, ticket, data=b"x" * 21).status_code == 413  # declared too large
    assert all(fu._post(client, ticket).status_code == 200 for _ in range(10))  # the 10 a single field gets
