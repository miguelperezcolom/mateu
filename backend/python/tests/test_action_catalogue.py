"""The shared ACTION catalogue — actions.yaml plus any ``type: Actions`` file over
``ActionCatalogSupplier`` classes, owner first (the Python mirror of Java's
``ActionCatalogueSyncTest``)."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.action_registry import ActionRegistry  # noqa: E402
from mateu_uidl import (  # noqa: E402
    ActionCatalogSupplier,
    CatalogAction,
    ComponentTreeSupplier,
    Navigate,
    app,
    menu_item,
    ui,
)
from mateu_uidl.components import Button, VerticalLayout  # noqa: E402

MODULE = sys.modules[__name__]

ACTIONS = """
type: Actions
actions:
  - id: newOrder
    description: Start a new order
    steps:
      - type: MarkClean
      - type: Navigate
        route: orders/new
  - id: refreshCustomers
    restAction:
      source:
        url: https://example.test/api/customers
        method: POST
      successMessage: Refreshed
  - id: refresh
    steps:
      - type: Emit
        event: catalogue-refresh
  - id: chained
    steps:
      - type: RunAction
        actionId: newOrder
  - id: serverOnly
    confirmationRequired: true
"""

MORE = """
type: Actions
actions:
  - id: fromOtherFile
    steps:
      - type: Navigate
        route: home
"""


@pytest.fixture
def specs(tmp_path: Path) -> Path:
    (tmp_path / "actions.yaml").write_text(ACTIONS, encoding="utf-8")
    (tmp_path / "catalogs").mkdir()
    (tmp_path / "catalogs" / "more.yaml").write_text(MORE, encoding="utf-8")
    # an unrelated spec is not part of the catalogue
    (tmp_path / "home.yaml").write_text("layout:\n  type: VerticalLayout\n", encoding="utf-8")
    return tmp_path


class Supplied(ActionCatalogSupplier):
    def action_catalog(self):
        return [
            CatalogAction("newOrder", steps=(Navigate("elsewhere"),)),
            CatalogAction("supplied", steps=(Navigate("home"),)),
            CatalogAction("notRunnable"),
        ]


@ui("catalogue-shell")
@app("Catalogue shell")
class CatalogueShell:
    @menu_item("Page")
    def page(self) -> "CataloguePage":
        return CataloguePage()


@ui("catalogue-page")
class CataloguePage(ComponentTreeSupplier):
    """A tree page whose buttons name catalogue ids; it handles ``refresh`` itself."""

    def component(self):
        return VerticalLayout(
            content=(
                Button(label="New", action_id="newOrder"),
                Button(label="Refresh", action_id="refresh"),
                Button(label="Chained", action_id="chained"),
            )
        )

    def refresh(self):
        return None


def handler(specs: Path, suppliers=None) -> SyncHandler:
    return SyncHandler(
        MateuRegistry(MODULE), action_catalog=ActionRegistry(directory=str(specs), suppliers=suppliers or [])
    )


def test_the_catalogue_reads_actions_yaml_and_every_type_actions_file(specs):
    catalog = ActionRegistry(directory=str(specs)).catalog()
    assert [a.id for a in catalog] == ["newOrder", "refreshCustomers", "refresh", "chained", "fromOtherFile"]
    assert catalog[0].description == "Start a new order"
    assert catalog[1].rest_action.source.url == "https://example.test/api/customers"


def test_a_non_client_runnable_entry_is_dropped_with_a_warning(specs, caplog):
    with caplog.at_level(logging.WARNING, logger="mateu.actions"):
        assert ActionRegistry(directory=str(specs)).get("serverOnly") is None
    assert any("serverOnly" in r.getMessage() and "not client-runnable" in r.getMessage() for r in caplog.records)


def test_an_authored_entry_replaces_a_supplied_one(specs):
    registry = ActionRegistry(directory=str(specs), suppliers=[Supplied])
    assert registry.get("supplied") is not None
    assert registry.get("notRunnable") is None
    assert registry.get("newOrder").steps[1] == Navigate("orders/new")


def test_the_supplier_is_discovered_by_the_registry():
    assert Supplied in MateuRegistry(MODULE).action_suppliers


def test_the_app_carries_the_catalogue_lowered_to_commands(specs):
    inc = handler(specs).handle(RunActionRq(server_side_type=type_name(CatalogueShell)))
    meta = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]
    entries = {a["id"]: a for a in meta["actionCatalogue"]}
    assert list(entries) == ["newOrder", "refreshCustomers", "refresh", "chained", "fromOtherFile"]
    assert entries["newOrder"]["commands"] == [
        {"targetComponentId": None, "type": "MarkAsClean", "data": None},
        {"targetComponentId": None, "type": "NavigateTo", "data": "orders/new"},
    ]
    assert entries["refreshCustomers"]["restAction"]["source"]["url"] == "https://example.test/api/customers"
    assert entries["chained"]["commands"][0]["data"] == {"actionId": "newOrder"}


def test_an_app_without_a_catalogue_carries_an_empty_one(tmp_path):
    inc = handler(tmp_path).handle(RunActionRq(server_side_type=type_name(CatalogueShell)))
    meta = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]
    assert meta["actionCatalogue"] == []


def test_a_page_resolves_catalogue_ids_after_its_own_methods(specs):
    inc = handler(specs).handle(RunActionRq(server_side_type=type_name(CataloguePage)))
    actions = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["actions"]
    ids = [a["id"] for a in actions]
    by_id = {a["id"]: a for a in actions}
    assert [c["type"] for c in by_id["newOrder"]["commands"]] == ["MarkAsClean", "NavigateTo"]
    # a flow running another entry brings it along, once
    assert ids.count("chained") == 1 and ids.count("newOrder") == 1
    # OWNER FIRST: the view's own refresh() wins over the catalogue's refresh
    assert by_id["refresh"]["commands"] is None
    assert "fromOtherFile" not in ids
