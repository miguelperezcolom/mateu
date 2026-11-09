"""Typed crud search criteria (Java's FilterCriteriaBuilder + CrudStore.find/4): a find override
that declares ``criteria`` gets the date / RangeFilter number ranges as between/gte/lte and the
enum multi-selects as IN, values converted, and the plain equality filters without their keys; an
older three-parameter override keeps receiving the raw state."""

from __future__ import annotations

import sys
from datetime import date
from enum import Enum
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.filter_criteria import extract  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud,
    FilterCriterion,
    FilterOperator,
    PageResult,
    RangeFilter,
    ui,
)

MODULE = sys.modules[__name__]
SEEN: list = []


class Status(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class Booking:
    id: str = ""
    guest: str = ""
    arrival: date | None = None
    nights: Annotated[int, RangeFilter()] = 0
    status: Status = Status.OPEN


@ui("bookings-db")
class BookingsDb(Crud[Booking]):
    def fetch(self, search):
        return []

    def find(self, search_text, filters, pageable, criteria=()):
        SEEN.append((filters, criteria))
        return PageResult(content=[], total_elements=0)


@ui("bookings-legacy")
class BookingsLegacy(Crud[Booking]):
    def fetch(self, search):
        return []

    def find(self, search_text, filters, pageable):
        SEEN.append((filters, None))
        return PageResult(content=[], total_elements=0)


STATE = {
    "guest": "ada",
    "arrival_from": "2026-01-01",
    "arrival_to": "2026-01-31",
    "nights_from": "2",
    "status": ["OPEN", "GONE"],
}


def search(cls):
    SEEN.clear()
    SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        server_side_type=type_name(cls), action_id="search", component_state=dict(STATE),
    ))
    return SEEN[0]


def test_a_criteria_aware_find_gets_typed_criteria_and_the_equality_values():
    filters, criteria = search(BookingsDb)
    assert criteria == (
        FilterCriterion("arrival", FilterOperator.between, (date(2026, 1, 1), date(2026, 1, 31))),
        FilterCriterion("nights", FilterOperator.gte, (2,)),
        FilterCriterion("status", FilterOperator.in_, (Status.OPEN,)),
    )
    assert filters == {"guest": "ada"}


def test_an_older_find_keeps_receiving_the_raw_state():
    filters, criteria = search(BookingsLegacy)
    assert criteria is None
    assert filters == STATE


def test_a_single_bare_enum_string_stays_an_equality_value():
    criteria, example = extract(Booking, {"status": "OPEN", "arrival_to": "2026-02-01"})
    assert criteria == (FilterCriterion("arrival", FilterOperator.lte, (date(2026, 2, 1),)),)
    assert example == {"status": "OPEN"}


def test_blank_or_unparseable_bounds_and_comma_joined_values():
    criteria, example = extract(
        Booking, {"arrival_from": "", "nights_to": "lots", "status": "OPEN,CLOSED"}
    )
    assert criteria == (FilterCriterion("status", FilterOperator.in_, (Status.OPEN, Status.CLOSED)),)
    assert example == {}
