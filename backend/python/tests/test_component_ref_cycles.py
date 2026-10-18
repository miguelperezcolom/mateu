"""A business component whose composition references itself — directly or through another
component — used to recurse in ``map_component`` until a ``RecursionError`` (external review,
2026-10-18). The cycle is broken where it closes, with the placeholder an unknown name gets, and the
rest of the page renders. The mirror of Java's ComponentRefCycleSyncTest and .NET's
ComponentCatalogueTests cycle facts."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.component_registry import ComponentRegistry  # noqa: E402
from mateu_ui.uidl import ComponentTreeSupplier, ui  # noqa: E402
from mateu_ui.uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]

CATALOGUE = (
    "components:\n"
    "  - name: Loop\n"
    "    component: {type: VerticalLayout, content: [{type: Text, text: loop body}, {type: ComponentRef, ref: Loop}]}\n"
    "  - name: PingA\n"
    "    component: {type: VerticalLayout, content: [{type: Text, text: ping a}, {type: ComponentRef, ref: PingB}]}\n"
    "  - name: PingB\n"
    "    component: {type: VerticalLayout, content: [{type: Text, text: ping b}, {type: ComponentRef, ref: PingA}]}\n"
    "  - name: Price\n"
    "    component: {type: Text, text: the price}\n"
)


@ui("cycle-direct")
class Direct(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(fluent.ComponentRef("Loop"), fluent.ComponentRef("Price")))


@ui("cycle-indirect")
class Indirect(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=(fluent.ComponentRef("PingA"),))


def wire(cls, tmp_path) -> str:
    (tmp_path / "components.yaml").write_text(CATALOGUE)
    registry = MateuRegistry(MODULE)
    components = ComponentRegistry(
        directory=str(tmp_path), classes=registry.classes, suppliers=registry.component_suppliers
    )
    h = SyncHandler(registry, components=components)
    return json.dumps(h.handle(RunActionRq(server_side_type=type_name(cls))).model_dump(by_alias=True, mode="json"))


def test_a_self_referencing_component_renders_once_and_the_rest_of_the_page_too(tmp_path):
    j = wire(Direct, tmp_path)
    assert j.count("loop body") == 1
    assert "the price" in j
    assert "Unknown business component: Loop" in j


def test_an_indirect_cycle_is_broken_where_it_closes(tmp_path):
    j = wire(Indirect, tmp_path)
    assert j.count("ping a") == 1 and j.count("ping b") == 1
    assert "Unknown business component: PingA" in j
