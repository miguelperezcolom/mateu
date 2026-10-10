"""Multi-state embedded islands (Java's EmbeddedOrchestratorFieldBuilder + EmbeddedIslandStateSeeding
SyncTest): a host field holding a routed VIEW mounts it as an independent sub-app — a MEDIATOR app
shell bound to the view's own route and type, its initialData seeded from the field value's simple
fields — and the island then loads, acts and switches between its server-decided states on its
own requests (route markers stripped, Inline() → no page chrome)."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import ComponentTreeSupplier, HeaderBadge, Inline, button, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]


@ui("documento")
class Documento(ComponentTreeSupplier):
    """Three server-decided states: empty → scanned → editing."""

    stay_id: str = ""
    phase: str = "empty"

    def component(self):
        if self.phase == "empty":
            return fluent.VerticalLayout(content=(
                fluent.Text(text=f"No document for stay {self.stay_id}"),
                fluent.Button(label="Scan", action_id="scan"),
            ))
        return fluent.Text(text=f"Document of stay {self.stay_id}: {self.phase}")

    @button()
    def scan(self):
        self.phase = "scanned"
        return self  # re-render in place, in the new state


@ui("summary")
@title("Summary")
class Summary:
    status: Annotated[str, HeaderBadge()] = "ok"
    note: str = "n"


@ui("checkin")
@title("Check-in")
class CheckIn:
    reference: str = "R-1"
    documento: Annotated[Documento, Inline()] = None  # type: ignore[assignment]
    summary: Summary = None  # type: ignore[assignment]

    def __init__(self):
        self.documento = Documento()
        self.documento.stay_id = "S-42"  # the host passes context by setting fields
        self.summary = Summary()


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def dump(inc) -> dict:
    return inc.model_dump(by_alias=True, mode="json")


def custom_fields(node, out):
    if isinstance(node, dict):
        meta = node.get("metadata")
        if isinstance(meta, dict) and meta.get("type") == "CustomField":
            out.append(meta)
        for v in node.values():
            custom_fields(v, out)
    elif isinstance(node, list):
        for v in node:
            custom_fields(v, out)
    return out


def test_the_host_mounts_the_view_as_a_mediator_island_with_seeded_state():
    comp = dump(handler().handle(RunActionRq(route="checkin")))["fragments"][0]["component"]
    islands = [c for c in custom_fields(comp, []) if c["content"]["type"] == "ServerSide"]
    doc = next(i for i in islands if i["content"]["serverSideType"] == type_name(Documento))
    wrapper = doc["content"]
    assert wrapper["route"] == "/documento?_embeddedMediator=1&_inline=1"
    assert wrapper["initialData"] == {
        "_embeddedMediator": True, "_inline": True, "stayId": "S-42", "phase": "empty",
    }
    assert "scan" in [a["id"] for a in wrapper["actions"]]
    app = wrapper["children"][0]["metadata"]
    assert (app["type"], app["variant"]) == ("App", "MEDIATOR")
    assert app["homeRoute"] == "/documento?_embeddedMediator=1&_inline=1"
    assert app["homeConsumedRoute"] == "/documento"
    assert doc["colspan"] == 2  # a sub-app spans the host form's whole row
    # the island is the island's business: nothing of it leaks into the host state
    assert set(comp["initialData"]) == {"reference"}


def island(action=None, state=None, route="documento?_embeddedMediator=1&_inline=1"):
    return dump(handler().handle(RunActionRq(
        route=route, server_side_type=type_name(Documento), action_id=action,
        component_state=state or {"_embeddedMediator": True, "_inline": True, "stayId": "S-42", "phase": "empty"},
    )))


def test_the_island_loads_its_first_state_from_the_seeded_context():
    assert "No document for stay S-42" in json.dumps(island())


def test_an_island_action_switches_it_to_another_server_decided_state():
    out = json.dumps(island("scan"))
    assert "Document of stay S-42: scanned" in out
    assert "No document" not in out


def test_an_inline_island_drops_its_page_chrome():
    page = dump(handler().handle(RunActionRq(route="summary?_embeddedMediator=1&_inline=1")))
    meta = page["fragments"][0]["component"]["children"][0]["metadata"]
    assert meta["level"] == 1 and meta["badges"] == []
    standalone = dump(handler().handle(RunActionRq(route="summary")))
    meta = standalone["fragments"][0]["component"]["children"][0]["metadata"]
    assert meta["level"] == 0 and meta["badges"]
