"""Field types (``specs/ui/types.yaml`` + ``FieldTypeCatalogSupplier``) and SAMPLE data on REST
sources (``sample:`` / ``sampleFile:`` in sources.yaml) — the Python mirror of Java's
``FieldTypesSyncTest`` and ``SampleSourcesSyncTest``.

A ``FormField`` naming a type by ``fieldType:`` (or a listing column whose row field carries
``FieldType("X")``) takes the type's attributes as DEFAULTS; its own win; an unknown type WARNs and
renders as declared; authored types win over code-supplied ones. Samples are answered instead of
calling the endpoint ONLY in sample mode (``MATEU_SOURCES_MOCK=true``) — the sampled source points at
a closed port, so a real call fails and a sample is unmistakable.
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.field_type_registry import FieldTypeRegistry, resolve_field_types  # noqa: E402
from mateu_core.rest_source_registry import RestSourceRegistry  # noqa: E402
from mateu_core.route_registry import RouteRegistry  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_uidl import (  # noqa: E402
    FieldType,
    FieldTypeCatalogSupplier,
    FieldTypeEntry,
    Label,
    Listing,
    rest_action,
    button,
    ui,
)

MODULE = sys.modules[__name__]

TYPES = """\
type: Types
types:
  - id: OrderStatus
    label: Status
    dataType: status
    options:
      - {value: OPEN, label: Open}
      - {value: SHIPPED, label: Shipped}
    tones: {OPEN: warning, SHIPPED: success}
  - id: Money
    dataType: money
    align: end
  - id: Email
    label: E-mail
    stereotype: email
    placeholder: name@example.com
    required: true
"""

SOURCES = """\
type: Sources
sources:
  - name: orders
    # 127.0.0.1:1 refuses at once: a real call fails, so a test can tell sample from fetch
    source: {url: "http://127.0.0.1:1/orders", itemsPath: data, proxy: true}
    totalPath: meta.total
    sample:
      data:
        - {id: 1, customer: Acme, status: OPEN, total: 120.5}
        - {id: 2, customer: Globex, status: SHIPPED, total: 80}
      meta: {total: 2}
  - name: customers
    source: {url: "http://127.0.0.1:1/customers", proxy: true}
    sampleFile: fixtures/customers.json
"""


class CodeTypes(FieldTypeCatalogSupplier):
    """A code producer: one type the authored file overrides (Money), one only code declares."""

    def field_types(self):
        return [
            FieldTypeEntry("Money", data_type="number"),
            FieldTypeEntry("Phone", data_type="string", placeholder="+34 600 000 000"),
        ]


class OrderRow:
    id: int = 0
    status: Annotated[str, FieldType("OrderStatus")] = ""
    total: Annotated[float, FieldType("Money"), Label("Amount")] = 0.0
    note: Annotated[str, FieldType("Nope")] = ""


@ui("ft-orders")
class Orders(Listing[OrderRow]):
    def search(self, request, http=None):
        return []


@ui("ft-sampled")
class Sampled:
    customer: str = "Initech"

    @button("Load")
    @rest_action(source="orders", method="GET", proxy=True)
    def load(self):
        pass

    @button("Create")
    @rest_action(source="orders", method="POST", proxy=True, body='{"customer":"${state.customer}"}')
    def create(self):
        pass


@pytest.fixture
def specs(tmp_path: Path) -> Path:
    (tmp_path / "types.yaml").write_text(TYPES)
    (tmp_path / "sources.yaml").write_text(SOURCES)
    (tmp_path / "fixtures").mkdir()
    (tmp_path / "fixtures" / "customers.json").write_text('[{"id": 7, "name": "Acme"}]')
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: ft-customer\n    definition: customer.yaml\n"
        "  - route: ft-unknown\n    definition: unknown.yaml\n"
    )
    (tmp_path / "customer.yaml").write_text(
        "type: VerticalLayout\ncontent:\n"
        "  - {type: FormField, id: email, fieldType: Email}\n"
        "  - {type: FormField, id: backup, fieldType: Email, label: Backup e-mail, required: false}\n"
        "  - {type: FormField, id: phone, fieldType: Phone}\n"
        "  - {type: FormField, id: status, fieldType: OrderStatus}\n"
    )
    (tmp_path / "unknown.yaml").write_text(
        "type: VerticalLayout\ncontent:\n"
        "  - {type: FormField, id: nickname, fieldType: Nope, label: Nickname}\n"
    )
    return tmp_path


def handler(directory: Path) -> SyncHandler:
    registry = MateuRegistry(MODULE)
    h = SyncHandler(
        registry,
        rest_sources=RestSourceRegistry(directory=str(directory), classes=registry.classes),
        field_types=FieldTypeRegistry(str(directory), suppliers=registry.field_type_suppliers),
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes, field_types=h.field_types)
    return h


def wire(h: SyncHandler, **rq) -> dict:
    return h.handle(RunActionRq(**rq)).model_dump(by_alias=True, mode="json")


def collect(node, predicate, out=None) -> list[dict]:
    out = [] if out is None else out
    if isinstance(node, dict):
        if predicate(node):
            out.append(node)
        for v in node.values():
            collect(v, predicate, out)
    elif isinstance(node, list):
        for v in node:
            collect(v, predicate, out)
    return out


def field(w: dict, field_id: str) -> dict:
    found = collect(w, lambda n: n.get("fieldId") == field_id and n.get("type") == "FormField")
    assert found, f"field '{field_id}' on the wire"
    return found[0]


def column(w: dict, column_id: str) -> dict:
    found = collect(w, lambda n: n.get("type") == "GridColumn" and n.get("id") == column_id)
    assert found, f"column '{column_id}' on the wire"
    return found[0]


# ── field types ──────────────────────────────────────────────────────────────


def test_a_form_field_takes_its_types_attributes_as_defaults(specs):
    w = wire(handler(specs), route="ft-customer")
    email = field(w, "email")
    assert email["stereotype"] == "email"
    assert email["label"] == "E-mail"
    assert email["required"] is True
    assert "fieldType" not in json.dumps(w), "the wire never carries the reference"
    # a field naming a type with options gets them
    assert [o["value"] for o in field(w, "status")["options"]] == ["OPEN", "SHIPPED"]


def test_what_the_field_declares_itself_wins(specs):
    backup = field(wire(handler(specs), route="ft-customer"), "backup")
    assert backup["label"] == "Backup e-mail"
    assert backup["required"] is False
    assert backup["stereotype"] == "email"  # what it does not declare still comes from the type


def test_a_code_supplied_type_resolves_and_the_authored_file_wins_over_it(specs):
    h = handler(specs)
    assert h.field_types.get("Phone").placeholder == "+34 600 000 000"
    # Money is declared in code as `number` and in types.yaml as `money`: authored wins, whole
    assert h.field_types.get("Money").data_type == "money"
    assert h.field_types.get("Money").align == "end"
    total = column(wire(h, server_side_type=type_name(Orders)), "total")
    assert total["dataType"] == "money"


def test_a_listing_column_takes_its_type_including_the_badge_tones(specs):
    w = wire(handler(specs), server_side_type=type_name(Orders))
    status = column(w, "status")
    assert status["dataType"] == "status"
    assert status["label"] == "Status"
    assert status["tones"] == {"OPEN": "warning", "SHIPPED": "success"}
    total = column(w, "total")
    assert total["label"] == "Amount", "the column's own label wins"
    assert total["tones"] is None, "no tones declared → None on the wire"


def test_column_attributes_per_target_and_the_reference_is_removed():
    types = [FieldTypeEntry("OrderStatus", label="Status", options=[{"value": "A"}], tones={"A": "info"})]
    tree = {
        "type": "Listing",
        "columns": [{"type": "GridColumn", "id": "s", "fieldType": "OrderStatus"}],
        "filters": [{"type": "FormField", "id": "s", "fieldType": "OrderStatus"}],
    }
    resolved = resolve_field_types(tree, types)
    col, flt = resolved["columns"][0], resolved["filters"][0]
    assert col == {"type": "GridColumn", "id": "s", "label": "Status", "tones": {"A": "info"}}
    assert flt == {"type": "FormField", "id": "s", "label": "Status", "options": [{"value": "A"}]}
    assert "fieldType" in tree["columns"][0], "the authored tree is not mutated"


def test_an_unknown_type_is_warned_about_and_the_field_renders_as_declared(specs, caplog):
    with caplog.at_level(logging.WARNING, logger="mateu.field_types"):
        w = wire(handler(specs), route="ft-unknown")
    assert "Not found." not in json.dumps(w)
    assert field(w, "nickname")["label"] == "Nickname"
    warnings = [r for r in caplog.records if "'Nope'" in r.getMessage()]
    assert len(warnings) == 1 and warnings[0].levelno == logging.WARNING


def test_an_unknown_type_on_a_listing_column_renders_the_column_as_declared(specs, caplog):
    with caplog.at_level(logging.WARNING, logger="mateu.field_types"):
        note = column(wire(handler(specs), server_side_type=type_name(Orders)), "note")
    assert note["label"] == "Note"
    assert any("'Nope'" in r.getMessage() for r in caplog.records)


# ── sample data ──────────────────────────────────────────────────────────────


def restfetch(h: SyncHandler, action_id: str) -> dict:
    return h.handle(
        RunActionRq(
            server_side_type=type_name(Sampled),
            action_id="__restfetch__",
            parameters={"_sourceKind": "action", "_sourceId": action_id},
            component_state={"customer": "Initech"},
        )
    ).app_data


def test_without_the_opt_in_the_endpoint_is_called_for_real(specs, monkeypatch):
    monkeypatch.delenv("MATEU_SOURCES_MOCK", raising=False)
    # the closed endpoint is called and fails → the empty object of a failed proxy fetch
    assert restfetch(handler(specs), "load") == {"_restfetch": {}}


def test_with_the_opt_in_a_read_answers_with_the_sample(specs, monkeypatch):
    monkeypatch.setenv("MATEU_SOURCES_MOCK", "true")
    body = restfetch(handler(specs), "load")["_restfetch"]
    assert len(body["data"]) == 2
    assert body["meta"]["total"] == 2


def test_with_the_opt_in_a_write_succeeds_without_persisting(specs, monkeypatch):
    monkeypatch.setenv("MATEU_SOURCES_MOCK", "true")
    called = []
    import urllib.request

    monkeypatch.setattr(urllib.request, "urlopen", lambda *a, **k: called.append(a))
    assert restfetch(handler(specs), "create") == {"_restfetch": {}}
    assert called == [], "the endpoint is never called in sample mode"


def test_a_sample_file_is_read_relative_to_specs_ui(specs):
    entry = RestSourceRegistry(directory=str(specs)).get("customers")
    assert entry.sample_file == "fixtures/customers.json"
    assert entry.effective_sample() == [{"id": 7, "name": "Acme"}]


def app_meta(h: SyncHandler) -> dict:
    from mateu_uidl import app

    @app("Sampled app")
    class SampledApp:
        pass

    h.registry.app_type = SampledApp
    h.registry._by_name[type_name(SampledApp)] = SampledApp
    return wire(h, server_side_type=type_name(SampledApp))["fragments"][0]["component"]["metadata"]


def test_samples_and_mock_sources_travel_only_in_sample_mode(specs, monkeypatch):
    monkeypatch.delenv("MATEU_SOURCES_MOCK", raising=False)
    plain = app_meta(handler(specs))
    assert plain.get("mockSources") is None
    orders = next(e for e in plain["restSources"] if e["name"] == "orders")
    assert orders.get("sample") is None and orders["source"].get("sample") is None

    monkeypatch.setenv("MATEU_SOURCES_MOCK", "true")
    mocked = app_meta(handler(specs))
    assert mocked["mockSources"] is True
    by_name = {e["name"]: e for e in mocked["restSources"]}
    assert by_name["orders"]["sample"]["meta"] == {"total": 2}
    assert by_name["customers"]["sample"] == [{"id": 7, "name": "Acme"}]
