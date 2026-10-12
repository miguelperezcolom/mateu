"""A ``list[Enum]`` with no stereotype is a multi-select of the enum's constants (Java's
ChoiceCollections; owner, 2026-10-12): it was a bare array field with no options."""

import json
import sys
from enum import Enum
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Message, button, ui  # noqa: E402


class Preference(Enum):
    HIGH_FLOOR = "HIGH_FLOOR"
    QUIET_ROOM = "QUIET_ROOM"
    NEAR_LIFT = "NEAR_LIFT"


@ui("enum-collections")
class EnumCollections:
    preferences: list[Preference] = []

    @button
    def echo(self):
        return Message(" ".join(p.name if isinstance(p, Preference) else str(p) for p in self.preferences))


def handler():
    return SyncHandler(MateuRegistry(EnumCollections))


def field(body, field_id):
    found = []

    def walk(o):
        if isinstance(o, dict):
            if o.get("fieldId") == field_id and o.get("type") == "FormField":
                found.append(o)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(body)
    return found[0]


def test_a_list_of_enums_with_no_stereotype_is_a_multi_select():
    body = json.loads(handler().handle(RunActionRq(route="/enum-collections", consumed_route="")).model_dump_json(by_alias=True))
    f = field(body, "preferences")
    assert f["stereotype"] == "multiSelect"
    assert [o["value"] for o in f["options"]] == ["HIGH_FLOOR", "QUIET_ROOM", "NEAR_LIFT"]


def test_the_chosen_constants_round_trip():
    inc = handler().handle(RunActionRq(
        route="/enum-collections", consumed_route="", action_id="echo",
        server_side_type=type_name(EnumCollections),
        component_state={"preferences": ["HIGH_FLOOR", "NEAR_LIFT"]},
    ))
    assert [m.text for m in inc.messages] == ["HIGH_FLOOR NEAR_LIFT"]
