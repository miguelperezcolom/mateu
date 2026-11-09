"""MicroFrontend.chrome (Java's EmbeddedChrome + EmbeddedMicroFrontendSyncTest): an EMBEDDED micro
frontend is a block of the host page — its requests carry ``embeddedChrome`` and the answer has no
SetWindowTitle / SetFavicon / PushStateToHistory, loads and actions alike; the host keeps naming
the window; the chrome travels on the wire only when set."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.dtos import UICommand  # noqa: E402
from mateu_ui.uidl import ComponentTreeSupplier, button, title, ui  # noqa: E402
from mateu_ui.uidl import components as fluent  # noqa: E402
from mateu_ui.uidl.components import EmbeddedChrome, MicroFrontend  # noqa: E402

MODULE = sys.modules[__name__]
WINDOW = {"SetWindowTitle", "SetFavicon", "PushStateToHistory"}


@ui("remote-orders")
@title("Orders")
class RemoteOrders:
    note: str = ""

    @button()
    def refresh(self):
        return [
            UICommand(target_component_id="x", type="PushStateToHistory", data="/remote-orders/1"),
            UICommand.dispatch_event("orders-refreshed"),
        ]


@ui("host-page")
@title("Host")
class HostPage(ComponentTreeSupplier):
    def component(self):
        return fluent.VerticalLayout(content=tuple(
            [MicroFrontend(base_url="https://orders", route="/remote-orders", chrome=c) for c in EmbeddedChrome]
            + [MicroFrontend(base_url="https://orders", route="/remote-orders")]
        ))


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def types(inc) -> list[str]:
    return [c.type for c in inc.commands]


def test_a_top_level_load_still_names_the_window():
    assert "SetWindowTitle" in types(handler().handle(RunActionRq(route="remote-orders")))


def test_an_embedded_load_sends_no_window_commands_whatever_the_chrome():
    for chrome in EmbeddedChrome:
        inc = handler().handle(RunActionRq(route="remote-orders", embedded_chrome=chrome.value))
        assert not WINDOW & set(types(inc)), chrome
        assert inc.fragments


def test_an_embedded_action_sends_no_window_commands_either():
    rq = dict(route="remote-orders", server_side_type=type_name(RemoteOrders), action_id="refresh")
    top = types(handler().handle(RunActionRq(**rq)))
    assert "PushStateToHistory" in top
    embedded = types(handler().handle(RunActionRq(**rq, embedded_chrome="COMPACT")))
    assert not WINDOW & set(embedded)
    assert "DispatchEvent" in embedded


def test_the_chrome_travels_on_the_wire_only_when_set():
    out = json.dumps(
        handler().handle(RunActionRq(route="host-page")).model_dump(by_alias=True, mode="json")
    )
    assert out.count('"chrome"') == len(EmbeddedChrome)
    assert '"chrome": "NONE"' in out and '"chrome": "PAGE"' in out


def test_an_older_request_without_the_marker_is_top_level():
    rq = RunActionRq.model_validate({"route": "x"})
    assert not rq.embedded()
    marked = RunActionRq.model_validate({"route": "x", "embeddedChrome": "NONE"})
    assert marked.embedded() and marked.embedded_chrome == "NONE"


def test_the_host_asks_a_server_resolved_island_as_an_embedded_one():
    from mateu_ui.core import microfrontends as mfe
    from mateu_ui.dtos.overlays import MicroFrontendMetadata

    meta = MicroFrontendMetadata(base_url="https://orders", route="/remote-orders", chrome="NONE")

    class _Found:
        metadata = meta

    class _Plan:
        found = _Found()
        route = "/remote-orders"
        base_url = "https://orders"

    resolver = mfe.MicroFrontendServerResolver.__new__(mfe.MicroFrontendServerResolver)
    body = resolver._request_for(_Plan())  # type: ignore[arg-type]
    assert body["embeddedChrome"] == "NONE"
    meta_top = MicroFrontendMetadata(base_url="https://orders", route="/remote-orders")
    _Found.metadata = meta_top
    assert "embeddedChrome" not in resolver._request_for(_Plan())  # type: ignore[arg-type]
