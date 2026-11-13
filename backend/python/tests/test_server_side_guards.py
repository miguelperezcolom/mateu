"""Guards that only a crafted request exercises (the Python twin of .NET's ServerSideGuardsTests):
class-level gates on view models bound only by routes.yaml, read-only fields on a crud save, the
crud write gate keyed on what the save will do, the preview's alias budget, a route's pinned
parameters on the proxied leg, a definition-only page's bulk action and the proxy's refusal to
follow redirects."""

from __future__ import annotations

import http.server
import json
import sys
import threading
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.rest_source_registry import RestSourceRegistry  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Crud, Identity, ReadOnly, Version, eyes_only, read_only, ui  # noqa: E402

MODULE = sys.modules[__name__]


def over_specs(specs: Path, roles=None) -> SyncHandler:
    h = SyncHandler(
        MateuRegistry(MODULE),
        rest_sources=RestSourceRegistry(directory=str(specs)),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles is not None else None,
    )
    h.routes = RouteRegistry(str(specs))
    h.yaml_specs = YamlSpecLoader(str(specs), h.routes)
    return h


# ── class-level eyes_only on a view model bound only by the authored table ────────────────────


class AuditEntry:
    id: str = ""
    text: str = ""

    def __init__(self, id="", text=""):
        self.id, self.text = id, text


AUDIT_ROWS: dict[str, AuditEntry] = {}


@eyes_only(roles=["admin"])
class AuditLog(Crud[AuditEntry]):
    def fetch(self, search):
        return list(AUDIT_ROWS.values())

    def get(self, id_):
        return AUDIT_ROWS.get(id_)

    def save(self, entity):
        AUDIT_ROWS[entity.id] = entity


@eyes_only(roles=["admin"])
class SecretPage:
    note: str = "classified"


def bound_routes(tmp_path: Path) -> Path:
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        f"  - route: audit\n    viewModel: {__name__}.AuditLog\n"
        f"  - route: secret\n    viewModel: {__name__}.SecretPage\n"
    )
    return tmp_path


@pytest.mark.parametrize("route,server_side_type", [("secret", None), ("audit", f"{__name__}.AuditLog")])
def test_a_view_model_bound_only_by_routes_yaml_keeps_its_class_gate(tmp_path, route, server_side_type):
    h = over_specs(bound_routes(tmp_path))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(route=route, server_side_type=server_side_type))


def test_the_class_gate_lets_the_authorized_through(tmp_path):
    h = over_specs(bound_routes(tmp_path), roles=["admin"])
    assert h.handle(RunActionRq(route="secret")).fragments


def test_a_refused_caller_cannot_write_through_a_route_bound_crud(tmp_path):
    AUDIT_ROWS.clear()
    h = over_specs(bound_routes(tmp_path))
    with pytest.raises(MateuForbiddenException):
        h.handle(RunActionRq(
            route="audit/new", server_side_type=f"{__name__}.AuditLog", action_id="create",
            component_state={"id": "x", "text": "forged"},
        ))
    assert AUDIT_ROWS == {}


# ── read-only fields and the create / update gate on a crud save ──────────────────────────────


class Invoice:
    id: str = ""
    customer: str = ""
    paid: Annotated[float, ReadOnly()] = 0.0
    status: Annotated[str, ReadOnly()] = "DRAFT"
    version: Annotated[int, Version(), ReadOnly()] = 0

    def __init__(self, id="", customer="", paid=0.0, status="DRAFT"):
        self.id, self.customer, self.paid, self.status = id, customer, paid, status
        self.version = 0


INVOICES: dict[str, Invoice] = {}


class _InvoiceStore(Crud[Invoice]):
    def fetch(self, search):
        return list(INVOICES.values())

    def get(self, id_):
        return INVOICES.get(id_)

    def save(self, entity):
        INVOICES[entity.id or "generated"] = entity


@ui("invoices")
class Invoices(_InvoiceStore):
    pass


@ui("invoices-no-create")
class InvoicesNoCreate(_InvoiceStore):
    def can_create(self):
        return False


@ui("invoices-no-edit")
class InvoicesNoEdit(_InvoiceStore):
    def can_edit(self):
        return False


@read_only
class LockedRecord:
    id: str = ""
    text: str = "stored"


LOCKED: dict[str, LockedRecord] = {}


@ui("locked-records")
class LockedRecords(Crud[LockedRecord]):
    def fetch(self, search):
        return list(LOCKED.values())

    def get(self, id_):
        return LOCKED.get(id_)

    def save(self, entity):
        LOCKED[entity.id] = entity


def crud_call(route: str, action_id: str, cls=Invoices, state=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route="/" + route.split("/")[0], server_side_type=f"{__name__}.{cls.__name__}",
        action_id=action_id, initiator_component_id="c1", component_state=state or {},
    ))


@pytest.fixture(autouse=True)
def seeded():
    INVOICES.clear()
    INVOICES["7"] = Invoice("7", "Acme", paid=10.0, status="PENDING")


def test_a_save_keeps_the_stored_value_of_a_read_only_field():
    crud_call("invoices/7/edit", "save", state={
        "customer": "Globex", "paid": 0, "status": "APPROVED", "version": 0,
    })
    saved = INVOICES["7"]
    assert (saved.customer, saved.paid, saved.status) == ("Globex", 10.0, "PENDING")


def test_a_create_starts_a_read_only_field_from_the_server():
    crud_call("invoices/new", "create", state={"id": "8", "customer": "New", "paid": 99, "status": "APPROVED"})
    assert (INVOICES["8"].paid, INVOICES["8"].status) == (0.0, "DRAFT")


def test_a_read_only_record_class_takes_nothing_from_the_client():
    LOCKED.clear()
    stored = LockedRecord()
    stored.id = "1"
    LOCKED["1"] = stored
    crud_call("locked-records/1/edit", "save", cls=LockedRecords, state={"text": "forged"})
    assert LOCKED["1"].text == "stored"


def test_a_save_on_the_new_route_needs_create_permission():
    with pytest.raises(MateuForbiddenException):
        crud_call("invoices-no-create/new", "save", cls=InvoicesNoCreate, state={"id": "9", "customer": "x"})
    assert "9" not in INVOICES


def test_a_create_on_a_record_route_needs_edit_permission():
    with pytest.raises(MateuForbiddenException):
        crud_call("invoices-no-edit/7", "create", cls=InvoicesNoEdit, state={"customer": "overwritten"})
    assert INVOICES["7"].customer == "Acme"


def test_each_save_still_works_where_it_is_allowed():
    crud_call("invoices-no-create/7/edit", "save", cls=InvoicesNoCreate, state={"customer": "Edited"})
    assert INVOICES["7"].customer == "Edited"
    crud_call("invoices-no-edit/new", "create", cls=InvoicesNoEdit, state={"id": "10", "customer": "Created"})
    assert INVOICES["10"].customer == "Created"


# ── the live preview's alias budget ───────────────────────────────────────────────────────────


def preview(text: str) -> str:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(action_id="__preview__", parameters={"_yaml": text}))
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


def bomb(levels: int = 9) -> str:
    lines = ["a0: &a0 {type: Text, text: x}"]
    for level in range(1, levels + 1):
        refs = ", ".join([f"*a{level - 1}"] * 10)
        lines.append(f"a{level}: &a{level} {{type: VerticalLayout, content: [{refs}]}}")
    lines.append(f"layout: *a{levels}")
    return "\n".join(lines)


def test_an_alias_bomb_is_answered_without_being_built():
    assert "too many nodes" in preview(bomb())


def test_a_cycle_of_aliases_is_answered_without_being_built():
    assert "too many nodes" in preview("layout: &a {type: VerticalLayout, content: [*a, *a]}")


def test_an_ordinary_alias_still_previews():
    answer = preview("a: &a {type: Text, text: Twice}\nlayout: {type: VerticalLayout, content: [*a, *a]}")
    assert answer.count("Twice") == 2


# ── a definition-only page on the proxied leg ─────────────────────────────────────────────────

PEOPLE = """
actions:
  - id: removeAll
    restAction:
      forEachSelectedRow: true
      source: {url: "https://api.example.com/${state.tenant}/people/${state.id}", method: DELETE, proxy: true}
layout: {type: Text, text: People}
"""


class _Answer:
    status = 200

    def read(self):
        return b""

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


@pytest.fixture
def people(tmp_path, monkeypatch):
    (tmp_path / "routes.yaml").write_text(
        "routes:\n  - route: tenants/acme/people\n    layout: people.yaml\n    fixedParams: {tenant: acme}\n"
    )
    (tmp_path / "people.yaml").write_text(PEOPLE)
    calls: list[str] = []

    def fake_open(req, timeout=None):
        calls.append(f"{req.get_method()} {req.full_url}")
        return _Answer()

    monkeypatch.setattr("mateu_ui.core.sync_handler.proxy._open", fake_open)
    return over_specs(tmp_path), calls


def rest_fetch(h: SyncHandler, state: dict, **parameters):
    return h.handle(RunActionRq(
        route="tenants/acme/people", action_id="__restfetch__", component_state=state,
        parameters={"_sourceKind": "action", "_sourceId": "removeAll", **parameters},
    ))


def test_a_definition_only_bulk_action_runs_once_per_row(people):
    h, calls = people
    inc = rest_fetch(h, {"crud_selected_items": [{"id": "1"}, {"id": "2"}, {"id": "3"}]}, _forEachSelectedRow=True)
    assert inc.app_data == {"_restfetch": {}}
    assert calls == [f"DELETE https://api.example.com/acme/people/{n}" for n in (1, 2, 3)]


def test_a_selected_row_cannot_override_a_fixed_param(people):
    h, calls = people
    rest_fetch(h, {"crud_selected_items": [{"id": "1", "tenant": "other"}]}, _forEachSelectedRow=True)
    assert calls == ["DELETE https://api.example.com/acme/people/1"]


def test_the_definition_only_branch_applies_fixed_params_over_the_parameters(people):
    h, calls = people
    rest_fetch(h, {"id": "1"}, tenant="other")
    assert calls == ["DELETE https://api.example.com/acme/people/1"]


# ── redirects are not followed ────────────────────────────────────────────────────────────────


class _Recorder(http.server.BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802 - http.server's naming
        self.server.seen.append(dict(self.headers))  # type: ignore[attr-defined]
        target = getattr(self.server, "redirect_to", None)
        self.send_response(302 if target else 200)
        if target:
            self.send_header("Location", target)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, *args):
        pass


@pytest.fixture
def server_pair():
    servers = [http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Recorder) for _ in range(2)]
    for server in servers:
        server.seen = []  # type: ignore[attr-defined]
        threading.Thread(target=server.serve_forever, daemon=True).start()
    yield servers
    for server in servers:
        server.shutdown()
        server.server_close()


def test_a_redirect_is_a_failed_call_and_the_secret_stays_home(tmp_path, monkeypatch, server_pair):
    first, attacker = server_pair
    first.redirect_to = f"http://127.0.0.1:{attacker.server_address[1]}/stolen"  # type: ignore[attr-defined]
    monkeypatch.setenv("MATEU_SECRET_KEY", "s3cret")
    (tmp_path / "routes.yaml").write_text("routes:\n  - route: p\n    layout: p.yaml\n")
    (tmp_path / "p.yaml").write_text(
        "actions:\n  - id: go\n    restAction:\n      source:\n"
        f'        url: "http://127.0.0.1:{first.server_address[1]}/start"\n'
        '        proxy: true\n        headers: {X-Api-Key: "${secret.KEY}"}\n'
        "layout: {type: Text, text: P}\n"
    )
    inc = over_specs(tmp_path).handle(RunActionRq(
        route="p", action_id="__restfetch__", parameters={"_sourceKind": "action", "_sourceId": "go"},
    ))
    assert inc.app_data["_restfetchError"]["status"] == 302
    assert first.seen[0]["X-Api-Key"] == "s3cret"  # type: ignore[attr-defined]
    assert attacker.seen == []  # type: ignore[attr-defined]


# ── __restfetch__ applies the gates of the DECLARING member (GA review P2) ─────────────────────

from mateu_ui.uidl import EyesOnly, RestOptions, button, disabled_unless, rest_action  # noqa: E402


@ui("proxy-gates")
class ProxyGates:
    payroll: Annotated[
        str | None,
        EyesOnly(roles=["hr"]),
        RestOptions(url="https://hr.internal/payroll?k=${secret.K}", proxy=True),
    ] = None
    id: str = "7"

    @button
    @disabled_unless(roles=["admin"])
    @rest_action(url="https://api.internal/people/${state.id}", method="DELETE", proxy=True)
    def purge(self): ...

    @eyes_only(roles=["manager"])
    @rest_action(url="https://api.internal/records", method="DELETE", proxy=True)
    def wipe(self): ...

    @rest_action(url="https://api.internal/ping", proxy=True)
    def ping(self): ...


@pytest.fixture
def upstream(monkeypatch):
    calls: list[str] = []

    def fake_open(req, timeout=None):
        calls.append(f"{req.get_method()} {req.full_url}")
        return _Answer()

    monkeypatch.setattr("mateu_ui.core.sync_handler.proxy._open", fake_open)
    return calls


def _gates(roles):
    return SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles is not None else None,
    )


def _fetch(h, kind, source_id):
    return h.handle(RunActionRq(
        route="/proxy-gates", server_side_type=f"{MODULE.__name__}.ProxyGates",
        action_id="__restfetch__", component_state={"id": "7"},
        parameters={"_sourceKind": kind, "_sourceId": source_id},
    ))


@pytest.mark.parametrize("roles", [("viewer",), None])
@pytest.mark.parametrize("kind,source_id", [("action", "purge"), ("action", "wipe"), ("options", "payroll")])
def test_a_proxied_source_whose_member_the_caller_may_not_use_is_refused(upstream, roles, kind, source_id):
    with pytest.raises(MateuForbiddenException):
        _fetch(_gates(roles), kind, source_id)
    assert upstream == []


@pytest.mark.parametrize(
    "roles,kind,source_id",
    [(("admin",), "action", "purge"), (("manager",), "action", "wipe"), (("hr",), "options", "payroll"),
     (("viewer",), "action", "ping")],
)
def test_a_proxied_source_runs_for_a_caller_the_member_admits(upstream, roles, kind, source_id):
    _fetch(_gates(roles), kind, source_id)
    assert len(upstream) == 1
