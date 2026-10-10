"""Enum options are called by the member's own __str__ when the enum defines one, else by its name
humanized exactly like Java (FieldMetadataExtractor.enumLabel) — never the raw constant."""

import sys
from enum import Enum
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.mapper import enum_label  # noqa: E402
from mateu_core.naming import humanize_constant  # noqa: E402


class Departure(Enum):
    EXTEND_ONE_NIGHT = 1
    CHECK_OUT = 2


class Room(Enum):
    JUNIOR_SUITE = 1

    def __str__(self):
        return "Junior suite (sea view)"


def test_constants_are_humanized_like_java():
    assert humanize_constant("CHECK_OUT") == "Check out"
    assert humanize_constant("CheckOut") == "Check out"
    assert humanize_constant("ROOM1") == "Room 1"
    assert humanize_constant("SMALL") == "Small"


def test_an_enum_member_is_called_by_its_str_or_its_name_humanized():
    assert [enum_label(m) for m in Departure] == ["Extend one night", "Check out"]
    assert enum_label(Room.JUNIOR_SUITE) == "Junior suite (sea view)"


# ── grid cells: an enum column carries its labels, rows keep the raw value ─────────────────────

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import Crud, title, ui  # noqa: E402


class Stay:
    id: str = ""
    guest: str = ""
    departure: Departure = Departure.CHECK_OUT

    def __init__(self, id: str = "", guest: str = "", departure: Departure = Departure.CHECK_OUT):
        self.id = id
        self.guest = guest
        self.departure = departure


@ui("enum-label-stays")
@title("Stays")
class EnumLabelStays(Crud[Stay]):
    element_type = Stay

    def fetch(self, search):
        return [Stay("1", "Ada", Departure.EXTEND_ONE_NIGHT)]

    def save(self, entity):
        pass


def test_an_enum_column_carries_its_value_labels_while_rows_keep_the_raw_value():
    handler = SyncHandler(MateuRegistry(sys.modules[__name__]))
    load = handler.handle(
        RunActionRq(route="/enum-label-stays", serverSideType=f"{__name__}.EnumLabelStays")
    ).model_dump_json(by_alias=True)
    assert '"valueLabels":{"EXTEND_ONE_NIGHT":"Extend one night","CHECK_OUT":"Check out"}' in load
    search = handler.handle(
        RunActionRq(route="/enum-label-stays", actionId="search",
                    serverSideType=f"{__name__}.EnumLabelStays", initiatorComponentId="ux_list")
    ).model_dump_json(by_alias=True)
    assert "EXTEND_ONE_NIGHT" in search and "Extend one night" not in search
