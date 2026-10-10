"""``@group_action`` buttons on ``GroupBy()`` group header rows (``_groupValue`` → ``group_value``),
``GroupActionVisibility`` per group, and group summaries synthesized for custom listings — the
Python mirror of Java's GroupActionsTest / ListingDataTest.withSynthesizedGroups."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Crud,
    GroupActionVisibility,
    GroupBy,
    GroupSummary,
    Listing,
    ListingData,
    Message,
    group_action,
    ui,
)

MODULE = sys.modules[__name__]
CANCELLED: list[str] = []


class Reservation:
    id: str = ""
    file: Annotated[str, GroupBy()] = ""
    guest: str = ""

    def __init__(self, id: str = "", file: str = "", guest: str = ""):
        self.id, self.file, self.guest = id, file, guest


ROWS = [
    Reservation("1", "F-2", "Ann"),
    Reservation("2", "F-1", "Bob"),
    Reservation("3", "F-2", "Cy"),
]


@ui("ga-files")
class Files(Crud[Reservation], GroupActionVisibility):
    def fetch(self, search):
        return list(ROWS)

    @group_action("Cancel file")
    def cancel_file(self, group_value):
        CANCELLED.append(group_value)
        return Message(f"Cancelled {group_value}")

    def group_action_visible(self, method_name, group_value):
        return group_value != "F-1"


@ui("ga-listing")
class FilesListing(Listing[Reservation]):
    def search(self, request, http=None):
        return ListingData(rows=list(ROWS))

    @group_action("Print")
    def print_file(self, group_value):
        return Message(f"Printing {group_value}")


@ui("ga-own-groups")
class OwnGroups(Listing[Reservation]):
    def search(self, request, http=None):
        return ListingData(rows=list(ROWS), groups=[GroupSummary("F-2", 7, {}, ("printFile",))])


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def search(cls) -> dict:
    inc = handler().handle(
        RunActionRq(server_side_type=type_name(cls), action_id="search", initiator_component_id="c")
    )
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["data"]["crud"]


def crud_meta(cls) -> dict:
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))

    def walk(n):
        if isinstance(n, dict):
            yield n
            for v in n.values():
                yield from walk(v)
        elif isinstance(n, list):
            for v in n:
                yield from walk(v)

    return next(n for n in walk(inc.model_dump(by_alias=True, mode="json")) if n.get("type") == "Crud")


def test_group_actions_travel_on_the_listing():
    assert [(b["label"], b["actionId"]) for b in crud_meta(Files)["groupActions"]] == [
        ("Cancel file", "cancelFile")
    ]
    assert crud_meta(FilesListing)["groupActions"][0]["actionId"] == "printFile"


def test_a_group_action_runs_with_the_clicked_group_value():
    CANCELLED.clear()
    inc = handler().handle(
        RunActionRq(
            server_side_type=type_name(Files),
            route="ga-files",
            action_id="action-on-row-cancelFile",
            parameters={"_groupValue": "F-2"},
        )
    )
    assert CANCELLED == ["F-2"]
    assert inc.messages[0].text == "Cancelled F-2"


def test_visibility_hides_the_action_on_groups_that_answer_false():
    groups = {g["value"]: g for g in search(Files)["groups"]}
    assert groups["F-1"]["hiddenActions"] == ["cancelFile"]
    assert "hiddenActions" not in groups["F-2"]


def test_a_custom_listing_gets_its_groups_synthesized():
    groups = search(FilesListing)["groups"]
    assert groups == [
        {"value": "F-2", "count": 2, "aggregates": {}},
        {"value": "F-1", "count": 1, "aggregates": {}},
    ]


def test_groups_the_listing_computed_itself_are_kept():
    assert search(OwnGroups)["groups"] == [
        {"value": "F-2", "count": 7, "aggregates": {}, "hiddenActions": ["printFile"]}
    ]


def test_a_method_that_is_not_a_group_action_is_not_reachable():
    inc = handler().handle(
        RunActionRq(
            server_side_type=type_name(Files),
            route="ga-files",
            action_id="action-on-row-groupActionVisible",
            parameters={"_groupValue": "F-2"},
        )
    )
    assert inc.messages[0].variant == "error"
