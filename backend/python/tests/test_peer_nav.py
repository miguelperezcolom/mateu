"""A page implementing ``PeerNavigationSupplier`` carries the previous/next peer-object arrows
(the Oracle Redwood "next/previous object" header element) on the wire as ``PageMetadata.peerNav``;
a ``None`` route on a side disables that arrow, and a page that supplies none leaves ``peerNav``
null. The Python mirror of Java's ``PeerNavigationSyncTest``.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import (  # noqa: E402
    MateuRegistry,
    RunActionRq,
    SyncHandler,
    type_name,
)
from typing import Annotated  # noqa: E402

from mateu_uidl import PeerNav, PeerNavigationSupplier, Timestamp, title, ui  # noqa: E402


@ui("/peer-middle")
@title("Record 2")
class PeerMiddle(PeerNavigationSupplier):
    name: str = "Two"

    def peers(self) -> PeerNav | None:
        return PeerNav("Record 1", "/records/1", "Record 3", "/records/3")


@ui("/peer-first")
@title("Record 1")
class PeerFirst(PeerNavigationSupplier):
    name: str = "One"

    def peers(self) -> PeerNav | None:
        return PeerNav(None, None, "Record 2", "/records/2")


@ui("/peer-none")
@title("Lonely")
class PeerNone:
    name: str = "alone"


@ui("/stamped")
@title("Stamped")
class Stamped:
    name: str = "Widget"
    updated_at: Annotated[str, Timestamp("Last updated")] = "2026-07-20 12:00"


@ui("/unstamped")
@title("No stamp")
class Unstamped:
    name: str = "Widget"


MODULE = sys.modules[__name__]


def _page(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]

    def walk(node):
        if not isinstance(node, dict):
            return
        yield node
        for child in node.get("children") or []:
            yield from walk(child)

    for c in walk(root):
        meta = c.get("metadata")
        if isinstance(meta, dict) and meta.get("type") == "Page":
            return meta
    raise AssertionError(f"no page metadata for {view_cls}")


def test_a_record_with_both_neighbours_carries_both_arrows():
    peer_nav = _page(PeerMiddle)["peerNav"]
    assert peer_nav is not None
    assert peer_nav["prevLabel"] == "Record 1"
    assert peer_nav["prevRoute"] == "/records/1"
    assert peer_nav["nextLabel"] == "Record 3"
    assert peer_nav["nextRoute"] == "/records/3"


def test_the_first_record_disables_the_previous_arrow_with_a_null_route():
    peer_nav = _page(PeerFirst)["peerNav"]
    assert peer_nav is not None
    assert peer_nav["prevRoute"] is None
    assert peer_nav["nextRoute"] == "/records/2"


def test_a_page_that_supplies_no_peers_leaves_peer_nav_null():
    assert _page(PeerNone)["peerNav"] is None


def test_the_timestamp_field_travels_with_its_label_prefix():
    assert _page(Stamped)["timestamp"] == "Last updated 2026-07-20 12:00"


def test_a_page_without_a_timestamp_field_leaves_it_null():
    assert _page(Unstamped)["timestamp"] is None
