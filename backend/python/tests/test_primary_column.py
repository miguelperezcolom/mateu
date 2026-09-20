"""The rich "primary" column (coherence-plan #6), the Python mirror of Java's PrimaryColumnSyncTest:
a field marked ``PrimaryColumn(caption=…, leading=…)`` becomes a column with stereotype ``primary``
carrying ``caption_path``/``leading_path`` — the title + secondary caption line + leading avatar the
renderer composes into one cell."""

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import Listing, PrimaryColumn, title, ui  # noqa: E402


class Person:
    id: str = ""
    name: Annotated[str, PrimaryColumn(caption="email", leading="avatar")] = ""
    email: str = ""
    avatar: str = ""


@ui("primary-people")
@title("People")
class PrimaryPeople(Listing[Person]):
    def search(self, request, http=None):
        return []


MODULE = sys.modules[__name__]


def _crud(inc) -> dict:
    doc = inc.model_dump(by_alias=True, mode="json")

    def walk(node):
        if not isinstance(node, dict):
            return
        yield node
        meta = node.get("metadata")
        if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
            yield from walk(meta["content"])
        for child in node.get("children") or []:
            yield from walk(child)

    for fragment in doc.get("fragments") or []:
        for node in walk(fragment.get("component")):
            meta = node.get("metadata")
            if isinstance(meta, dict) and meta.get("type") == "Crud":
                return meta
    raise AssertionError("no Crud metadata in the increment")


def _column(crud: dict, col_id: str) -> dict:
    for col in crud["columns"]:
        meta = col.get("metadata", {})
        if meta.get("id") == col_id:
            return meta
    raise AssertionError(f"column {col_id} not found")


def test_a_primary_column_carries_the_stereotype_and_the_caption_and_leading_paths():
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(route="primary-people", consumed_route="primary-people"))
    crud = _crud(inc)

    name = _column(crud, "name")
    assert name["stereotype"] == "primary"
    assert name["captionPath"] == "email"
    assert name["leadingPath"] == "avatar"

    # A plain column keeps the defaults — no caption/leading leaks onto it.
    email = _column(crud, "email")
    assert email.get("stereotype") in (None, "regular")
    assert email.get("captionPath") is None
    assert email.get("leadingPath") is None
