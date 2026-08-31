"""The two remaining text elements of the Redwood canonical page header: ``overlineText`` (the
small line ABOVE the title) and ``pageTitlePlaceholder`` (what the header shows while the title is
still empty). The Python mirror of Java's ``PageOverlineSyncTest``.

Note the port convention: Java offers both an annotation and a supplier interface for these, while
the ports carry only the declarative form — same as ``@subtitle``.
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

from mateu_uidl import overline, title, title_placeholder, ui  # noqa: E402


@ui("/overlined")
@title("Requisition 4471")
@overline("Requisitions")
class Overlined:
    name: str = "Widget"


@ui("/new-booking")
@title_placeholder("New booking…")
class NewBooking:
    name: str = ""


@ui("/plain-header")
@title("Plain")
class PlainHeader:
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


def test_the_overline_travels_on_the_wire():
    assert _page(Overlined)["overline"] == "Requisitions"


def test_the_overline_does_not_disturb_the_title():
    assert _page(Overlined)["title"] == "Requisition 4471"


def test_the_title_placeholder_travels_on_the_wire():
    assert _page(NewBooking)["titlePlaceholder"] == "New booking…"


def test_a_page_declaring_neither_leaves_both_null():
    page = _page(PlainHeader)
    assert page["overline"] is None
    assert page["titlePlaceholder"] is None
