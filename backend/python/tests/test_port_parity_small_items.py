"""Small parity items: a route's fixedParams win on the proxied REST leg (Java's
RestProxyCalls.fetch); GeneralOverview.record_label labels the switcher; a view class whose name
collides with a framework base ("Generic", "Crud", "Wizard") keeps its fields; lookup labels of an
EditableView's record."""

from __future__ import annotations

import io
import json
import sys
import urllib.request
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.reflection import view_fields  # noqa: E402
from mateu_ui.core.route_registry import RouteEntry, RouteEntrySupplier  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    AutoEditableView,
    GeneralOverview,
    Lookup,
    LookupLabelSupplier,
    RestOptions,
    ui,
)

MODULE = sys.modules[__name__]


@ui("pinned-proxy")
class PinnedProxy:
    tenant: str = ""
    city: Annotated[str, RestOptions(url="https://api.example.com/cities?tenant=${state.tenant}", proxy=True)] = ""


class PinnedRoutes(RouteEntrySupplier):
    def routes(self):
        return [RouteEntry(
            route="pinned-proxy", view_model=type_name(PinnedProxy), fixed_params={"tenant": "acme"},
        )]


class _Response(io.BytesIO):
    status = 200

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def test_a_routes_fixed_params_win_on_the_proxied_leg(monkeypatch):
    calls = []

    def fake_urlopen(req, timeout=None):
        calls.append(req.full_url)
        return _Response(json.dumps([]).encode())

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="pinned-proxy", server_side_type=type_name(PinnedProxy), action_id="__restfetch__",
        component_state={"tenant": "evil"}, parameters={"_sourceKind": "options", "_sourceId": "city"},
    ))
    assert calls == ["https://api.example.com/cities?tenant=acme"]


class Accounts(GeneralOverview):
    def switcher_options(self):
        return [("a1", "Acme")]

    def load(self, record_id):
        return {"id": record_id}

    def overview(self, row):
        from mateu_ui.uidl import components as fluent

        return fluent.Text(text=row["id"])

    def record_label(self):
        return "Customer"


def test_general_overview_record_label_labels_the_switcher():
    switcher = Accounts().component().content[0]
    assert switcher.field_id == "record" and switcher.label == "Customer"


def test_a_view_class_named_like_a_framework_base_keeps_its_fields():
    class Generic:
        name: str = "x"

    class Wizard:
        step: int = 1

    assert [f.name for f in view_fields(Generic)] == ["name"]
    assert [f.name for f in view_fields(Wizard)] == ["step"]


class Customer(LookupLabelSupplier):
    country: Annotated[str, Lookup()] = "ES"

    def label(self, field_name, value):
        return "Spain" if value == "ES" else None


@ui("customer-ev")
class CustomerView(AutoEditableView[Customer]):
    def load(self):
        return Customer()

    def persist(self, entity):
        pass


def test_an_editable_views_record_gets_its_lookup_labels():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="customer-ev", server_side_type=type_name(CustomerView),
    ))
    assert inc.fragments[0].data["country-label"] == "Spain"
