"""The REST source catalogue (named endpoints referenced by ``source=``/``ref``) and proxy mode for
views that declare their sources at runtime (``RestSourceSupplier``) — the Python mirror of Java's
``RestSourceRegistryTest`` and the RestSourceSupplier proxy suite."""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import urllib.request  # noqa: E402

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.rest_source_registry import RestSourceRegistry, merged_over  # noqa: E402
from mateu_uidl import (  # noqa: E402
    DeclaredRestSource,
    RestDataSource,
    RestOptions,
    RestSourceCatalogSupplier,
    RestSourceEntry,
    RestSourceKind,
    RestSourceProvenance,
    RestSourceSupplier,
    app,
    menu_item,
    rest_data,
    rest_source,
    title,
    ui,
)

MODULE = sys.modules[__name__]


@ui("cat-home")
@app("Catalogue app")
@rest_source(
    "countries",
    url="https://restcountries.com/v3.1/all?fields=cca2,name",
    value_path="cca2",
    label_path="name.common",
    description="ISO country codes",
)
@rest_source(
    "orders",
    url="/api/orders?since=${state.since}",
    items_path="data",
    total_path="meta.total",
    fields=("customerName=customer.name",),
)
@rest_source("secret-thing", url="https://api.example.com/things", proxy=True,
             headers=("X-Api-Key: ${secret.API_KEY}",))
class CatalogueApp:
    @menu_item("Form")
    def form(self) -> "CountryForm":
        return CountryForm()


class FromConfig(RestSourceCatalogSupplier):
    def rest_sources(self):
        return [
            RestSourceEntry(
                "invoices",
                RestDataSource(url="https://api.example.com/invoices", items_path="items"),
                provenance=RestSourceProvenance.generate,
            )
        ]


@ui("cat-form")
@title("Countries")
class CountryForm:
    country: Annotated[str, RestOptions(source="countries")] = ""
    thing: Annotated[str, RestOptions(source="secret-thing")] = ""


@ui("cat-direct")
class DirectOnly:
    country: Annotated[str, RestOptions(source="countries")] = ""


@ui("cat-data")
@rest_data(source="orders")
class OrdersData:
    since: str = ""


@ui("cat-runtime")
class RuntimeForm(RestSourceSupplier):
    """A view assembled at runtime: no annotation for the proxy to read, so it declares its sources
    (from what the server holds — a constant here)."""

    city: str = ""

    def declared_rest_sources(self):
        return [
            DeclaredRestSource(
                RestSourceKind.OPTIONS,
                RestDataSource(url="https://cities.example.com/list", proxy=True),
                id="city",
            )
        ]


def handler(tmp_specs: Path | None = None) -> SyncHandler:
    registry = MateuRegistry(MODULE)
    sources = None
    if tmp_specs is not None:
        sources = RestSourceRegistry(
            directory=str(tmp_specs), classes=registry.classes, suppliers=registry.catalog_suppliers
        )
    return SyncHandler(registry, rest_sources=sources)


def app_meta(h: SyncHandler) -> dict:
    inc = h.handle(RunActionRq(server_side_type=type_name(CatalogueApp)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]


def component(h: SyncHandler, cls) -> dict:
    inc = h.handle(RunActionRq(server_side_type=type_name(cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


# ── the catalogue ────────────────────────────────────────────────────────────


def test_the_derived_half_rides_the_app_metadata_with_effective_provenance():
    meta = app_meta(handler())
    by_name = {e["name"]: e for e in meta["restSources"]}
    assert list(by_name) == ["countries", "orders", "secret-thing", "invoices"]
    assert by_name["countries"]["provenance"] == "existing"  # another origin → somebody else's
    assert by_name["orders"]["provenance"] == "generate"  # relative → ours to build
    assert by_name["orders"]["fields"] == {"customerName": "customer.name"}
    assert by_name["orders"]["totalPath"] == "meta.total"
    assert by_name["invoices"]["provenance"] == "generate"  # declared wins over the url
    assert "rest-sources" in meta["requiredCapabilities"]


def test_the_authored_file_wins_in_place_and_appends_new_names(tmp_path):
    (tmp_path / "sources.yaml").write_text(
        "sources:\n"
        "  - name: countries\n"
        "    description: from yaml\n"
        "    source:\n"
        "      url: https://staging.example.com/countries\n"
        "      valuePath: code\n"
        "  - name: extra\n"
        "    provenance: existing\n"
        "    source: {url: /api/extra}\n"
    )
    meta = app_meta(handler(tmp_path))
    names = [e["name"] for e in meta["restSources"]]
    assert names == ["countries", "orders", "secret-thing", "invoices", "extra"]
    countries = meta["restSources"][0]
    assert countries["description"] == "from yaml"
    assert countries["source"]["url"] == "https://staging.example.com/countries"
    assert meta["restSources"][-1]["provenance"] == "existing"


def test_a_broken_file_yields_the_derived_half(tmp_path):
    (tmp_path / "sources.yaml").write_text("sources: [ {name: x, source: {url: ")
    assert [e["name"] for e in app_meta(handler(tmp_path))["restSources"]][0] == "countries"


def test_an_app_without_a_catalogue_requires_no_rest_sources_capability(tmp_path):
    registry = RestSourceRegistry(directory=str(tmp_path))
    h = SyncHandler(MateuRegistry(MODULE), rest_sources=registry)
    meta = app_meta(h)
    assert meta.get("restSources") == [] and "rest-sources" not in meta["requiredCapabilities"]


def test_merge_is_authored_over_derived():
    a = RestSourceEntry("a", RestDataSource(url="/a"))
    b = RestSourceEntry("b", RestDataSource(url="/b"))
    a2 = RestSourceEntry("a", RestDataSource(url="/a2"))
    assert [e.source.url for e in merged_over([a2], [a, b])] == ["/a2", "/b"]


# ── surfaces reference by name ───────────────────────────────────────────────


def test_a_surface_carries_only_the_name():
    comp = component(handler(), CountryForm)
    sources = []

    def walk(n):
        if isinstance(n, dict):
            if isinstance(n.get("optionsSource"), dict):
                sources.append(n["optionsSource"])
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(comp)
    assert [s["ref"] for s in sources] == ["countries", "secret-thing"]
    assert sources[0]["url"] == ""


def test_proxy_is_read_off_the_resolved_source():
    # the field only names the source; the catalogue entry is the one that says proxy
    assert "__restfetch__" in [a["id"] for a in component(handler(), CountryForm)["actions"]]
    assert "__restfetch__" not in [a["id"] for a in component(handler(), DirectOnly)["actions"]]


def test_rest_data_by_reference():
    comp = component(handler(), OrdersData)
    restdata = next(a for a in comp["actions"] if a["id"] == "__restdata__")
    assert restdata["restAction"]["source"]["ref"] == "orders"


# ── proxy fetches resolve on the server ──────────────────────────────────────


class _Response(io.BytesIO):
    status = 200

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


@pytest.fixture
def fetched(monkeypatch):
    calls = []

    def fake_urlopen(req, timeout=None):
        calls.append(req)
        return _Response(json.dumps([{"code": "x"}]).encode())

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    monkeypatch.setenv("MATEU_SECRET_API_KEY", "k-123")  # env fallback reads MATEU_SECRET_<KEY> only
    return calls


def restfetch(h: SyncHandler, cls, kind: str, id_: str):
    return h.handle(
        RunActionRq(
            server_side_type=type_name(cls),
            action_id="__restfetch__",
            parameters={"_sourceKind": kind, "_sourceId": id_},
        )
    )


def test_a_by_reference_proxy_fetch_resolves_the_catalogue_entry_and_injects_the_secret(fetched):
    inc = restfetch(handler(), CountryForm, "options", "thing")
    assert inc.app_data == {"_restfetch": [{"code": "x"}]}
    [req] = fetched
    assert req.full_url == "https://api.example.com/things"
    assert req.get_header("X-api-key") == "k-123"


def test_a_runtime_view_declares_its_proxy_sources(fetched):
    assert "__restfetch__" in [a["id"] for a in component(handler(), RuntimeForm)["actions"]]
    restfetch(handler(), RuntimeForm, "options", "city")
    assert fetched[0].full_url == "https://cities.example.com/list"


def test_the_proxy_never_fetches_what_the_view_did_not_declare(fetched):
    inc = restfetch(handler(), RuntimeForm, "options", "nope")
    assert inc.app_data == {"_restfetch": {}}
    assert fetched == []
