"""Business components (the component catalogue): a named, bound composition declared once and
referenced by ``ComponentRef(name)`` — resolved server-side, shipped on the app metadata for the
backend-less case. The Python mirror of Java's ComponentRefSyncTest /
BusinessComponentFieldSyncTest."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.component_registry import ComponentRegistry  # noqa: E402
from mateu_uidl import (  # noqa: E402
    ComponentCatalogSupplier,
    ComponentEntry,
    ComponentTreeSupplier,
    app,
    business_component,
    menu_item,
    ui,
)
from mateu_uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]


class Catalogue(ComponentCatalogSupplier):
    def business_components(self):
        return [ComponentEntry("AgencySelector", fluent.Text(text="agency selector"))]


class Compositions:
    @staticmethod
    @business_component("Greeting")
    def greeting():
        return fluent.HorizontalLayout(content=(fluent.Text(text="hello"), fluent.Text(text="world")))


@ui("biz-ref")
class BizRef(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(fluent.ComponentRef("AgencySelector"), fluent.ComponentRef("Greeting")))


@ui("biz-unknown")
class BizUnknown(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(fluent.ComponentRef("Nope"),))


@app("Biz app")
class BizApp:
    @menu_item("Ref")
    def ref(self) -> BizRef:
        return BizRef()


def handler(specs: Path | None = None) -> SyncHandler:
    registry = MateuRegistry(MODULE)
    components = None
    if specs is not None:
        components = ComponentRegistry(
            directory=str(specs), classes=registry.classes, suppliers=registry.component_suppliers
        )
    return SyncHandler(registry, components=components)


def wire(cls, h=None) -> str:
    return json.dumps(
        (h or handler()).handle(RunActionRq(server_side_type=type_name(cls))).model_dump(by_alias=True, mode="json")
    )


def test_a_reference_is_substituted_by_the_composition_and_never_reaches_the_wire():
    j = wire(BizRef)
    assert "agency selector" in j and "hello" in j and "world" in j
    assert '"type": "ComponentRef"' not in j


def test_an_unknown_reference_is_a_visible_placeholder():
    assert "Unknown business component: Nope" in wire(BizUnknown)


def test_the_app_ships_the_resolved_catalogue():
    meta = json.loads(wire(BizApp))["fragments"][0]["component"]["metadata"]
    by_name = {e["name"]: e for e in meta["components"]}
    assert set(by_name) == {"Greeting", "AgencySelector"}
    assert by_name["AgencySelector"]["component"]["metadata"]["text"] == "agency selector"


def test_the_authored_file_wins(tmp_path):
    (tmp_path / "components.yaml").write_text(
        "components:\n"
        "  - name: AgencySelector\n"
        "    component: {type: Text, text: from yaml}\n"
        "  - name: Nested\n"
        "    component: {type: ComponentRef, ref: Greeting}\n"
    )
    h = handler(tmp_path)
    j = wire(BizRef, h)
    assert "from yaml" in j and "agency selector" not in j
    meta = json.loads(wire(BizApp, h))["fragments"][0]["component"]["metadata"]
    nested = next(e for e in meta["components"] if e["name"] == "Nested")
    assert "hello" in json.dumps(nested)  # a reference inside a composition resolves too
