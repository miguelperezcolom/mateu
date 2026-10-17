"""The CRUD / listing search pipeline a user drives from the smart search bar: every filter kind
(text containment, Yes/No, number equality, enum IN, date and number ranges), header sorting,
paging, aggregates (sum/avg/min/max/count) and the database-pushdown ``find`` / ``ListingData``
paths — the Python mirror of Java's CrudStore.find defaults and FilterStateAssembler."""

from __future__ import annotations

import sys
from datetime import date, datetime
from enum import Enum
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Aggregate,
    AggregateFunction,
    Crud,
    DateRange,
    Filterable,
    GroupBy,
    Listing,
    ListingData,
    NumberRange,
    PageResult,
    Searchable,
    ui,
)

MODULE = sys.modules[__name__]


class Status(Enum):
    open = "open"
    closed = "closed"
    void = "void"


class Booking:
    id: str = ""
    guest: str = ""
    nights: int = 0
    vip: bool = False
    status: Status = Status.open
    arrival: date = date(2026, 1, 1)
    stamp: datetime = datetime(2026, 1, 1, 10, 0)
    amount: Annotated[float, Aggregate(AggregateFunction.avg)] = 0.0
    low: Annotated[float, Aggregate(AggregateFunction.min)] = 0.0
    high: Annotated[float, Aggregate(AggregateFunction.max)] = 0.0
    note: Annotated[str, Aggregate(AggregateFunction.sum)] = ""

    def __init__(self, id="", guest="", nights=0, vip=False, status=Status.open, arrival=date(2026, 1, 1), amount=0.0):
        self.id, self.guest, self.nights, self.vip, self.status = id, guest, nights, vip, status
        self.arrival, self.amount, self.low, self.high = arrival, amount, amount, amount
        self.stamp = datetime(arrival.year, arrival.month, arrival.day, 12, 0)
        self.note = "text"


ROWS = [
    Booking("1", "Ana Gómez", 2, True, Status.open, date(2026, 3, 1), 100.0),
    Booking("2", "Luis Pérez", 5, False, Status.closed, date(2026, 3, 10), 300.0),
    Booking("3", "Ana Ruiz", 1, False, Status.void, date(2026, 4, 2), 50.0),
]


@ui("csp-bookings")
class Bookings(Crud[Booking]):
    def fetch(self, search):
        return [r for r in ROWS if not search or search.lower() in r.guest.lower()]


PUSHED: list = []


@ui("csp-pushdown")
class Pushdown(Crud[Booking]):
    def fetch(self, search):
        return list(ROWS)

    def find(self, search_text, filters, pageable):
        PUSHED.append((search_text, dict(filters), pageable))
        return PageResult(content=[ROWS[1]], total_elements=42)


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def search(cls, state: dict | None = None) -> dict:
    inc = handler().handle(
        RunActionRq(server_side_type=type_name(cls), action_id="search", initiator_component_id="c",
                    component_state=state or {})
    )
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["data"]["crud"]


def ids(state: dict, cls=Bookings) -> list[str]:
    return [r["id"] for r in search(cls, state)["page"]["content"]]


def test_text_filters_match_by_case_insensitive_containment():
    assert ids({"guest": "ana"}) == ["1", "3"]
    assert ids({"guest": "  "}) == ["1", "2", "3"]  # blank = not applied


def test_the_free_text_search_reaches_fetch():
    assert ids({"searchText": "ruiz"}) == ["3"]


def test_boolean_filters_accept_a_bool_or_its_text():
    assert ids({"vip": True}) == ["1"]
    assert ids({"vip": "false"}) == ["2", "3"]


def test_number_filters_compare_numerically_and_ignore_garbage():
    assert ids({"nights": "5"}) == ["2"]
    assert ids({"nights": 5.0}) == ["2"]
    assert ids({"nights": "lots"}) == ["1", "2", "3"]


def test_enum_filters_are_an_in_over_a_list_or_a_comma_joined_restore():
    assert ids({"status": ["open", "void"]}) == ["1", "3"]
    assert ids({"status": "closed, void"}) == ["2", "3"]
    assert ids({"status": []}) == ["1", "2", "3"]


def test_date_ranges_compare_at_day_granularity():
    assert ids({"arrival_from": "2026-03-05"}) == ["2", "3"]
    assert ids({"arrival_to": "2026-03-10T23:00"}) == ["1", "2"]
    assert ids({"stamp_from": "2026-03-10", "stamp_to": "2026-03-10"}) == ["2"]
    assert ids({"arrival_from": "not-a-date"}) == ["1", "2", "3"]


def test_number_ranges_bound_both_ends_and_ignore_unparseable_bounds():
    assert ids({"nights_from": "2", "nights_to": "4"}) == ["1"]
    assert ids({"amount_to": "100"}) == ["1", "3"]
    assert ids({"amount_from": "x"}) == ["1", "2", "3"]


def test_header_sorting_accepts_the_grid_fieldid_key():
    assert ids({"sort": [{"fieldId": "nights", "direction": "descending"}]}) == ["2", "1", "3"]
    assert ids({"sort": [{"field": "guest", "direction": "ascending"}, {"fieldId": "", "direction": "ascending"}]}) == ["1", "3", "2"]


def test_paging_windows_the_filtered_rows_and_a_zero_size_shows_all():
    page = search(Bookings, {"page": 1, "size": 2})["page"]
    assert [r["id"] for r in page["content"]] == ["3"]
    assert page["totalElements"] == 3
    assert len(search(Bookings, {"size": -1})["page"]["content"]) == 3


def test_aggregates_cover_the_whole_filtered_set_and_skip_non_numeric_columns():
    data = search(Bookings, {"guest": "ana", "size": 1})
    assert data["aggregates"] == {"amount": 75.0, "low": 50.0, "high": 100.0}  # note is text → omitted
    assert data["groups"] == []


def test_a_pushdown_find_answers_the_page_with_its_real_total():
    PUSHED.clear()
    data = search(Pushdown, {"searchText": "x", "page": 3, "size": 1, "sort": [{"fieldId": "guest", "direction": "descending"}]})
    assert data["page"]["totalElements"] == 42
    assert data["page"]["pageNumber"] == 3
    assert [r["id"] for r in data["page"]["content"]] == ["2"]
    text, filters, pageable = PUSHED[0]
    assert text == "x"
    assert pageable.size == 1 and pageable.sort[0].field == "guest" and pageable.sort[0].descending
    # the summaries are still computed in memory over fetch
    assert data["aggregates"]["amount"] == 150.0


# ── declarative listings ─────────────────────────────────────────────────────────


class Region:
    id: str = ""
    region: Annotated[str, GroupBy()] = ""

    def __init__(self, id="", region=""):
        self.id, self.region = id, region


@ui("csp-paged-listing")
class PagedListing(Listing[Region]):
    def search(self, request, http=None):
        return ListingData(rows=[Region("a", "North"), Region("b", "North")], total_elements=9)


@ui("csp-iterable-listing")
class IterableListing(Listing[Region]):
    def search(self, request, http=None):
        return iter([Region("z", "S"), Region("y", "N")])


class Filters:
    stay: DateRange | None = None
    price: NumberRange | None = None
    statuses: set[Status] = set()
    name: str = ""
    nights: int = 0


SEEN: list = []


@ui("csp-typed")
class Typed(Listing[Region], Searchable, Filterable[Filters]):
    def search(self, request, http=None):
        SEEN.append(request)
        return []


def test_a_listing_with_its_own_total_is_not_repaged_and_gets_synthesized_groups():
    data = search(PagedListing, {"page": 2, "size": 2})
    assert data["page"]["totalElements"] == 9
    assert data["page"]["pageNumber"] == 2
    assert [r["id"] for r in data["page"]["content"]] == ["a", "b"]
    assert data["groups"] == [{"value": "North", "count": 2, "aggregates": {}}]


def test_a_listing_may_return_any_iterable_and_is_sorted_in_memory():
    data = search(IterableListing, {"sort": [{"fieldId": "id", "direction": "ascending"}]})
    assert [r["id"] for r in data["page"]["content"]] == ["y", "z"]


def test_typed_filters_assemble_ranges_and_enum_sets_dropping_stale_or_blank_values():
    SEEN.clear()
    search(Typed, {
        "searchText": "q",
        "stay_from": "2026-05-01", "stay_to": " ",
        "price_from": "abc", "price_to": "99.5",
        "statuses": "open,gone",
        "name": "Ana", "nights": "3",
        "sort": [{"fieldId": "id"}],  # no direction → ignored
    })
    request = SEEN[0]
    assert request.search_text == "q"
    f = request.filters
    assert f.stay == DateRange(from_=date(2026, 5, 1), to=None)
    assert f.price == NumberRange(from_=None, to=99.5)
    assert f.statuses == {Status.open}
    assert f.name == "Ana"
    assert f.nights == 3
    assert request.pageable.sort == ()


def test_typed_filters_left_untouched_keep_their_defaults():
    SEEN.clear()
    search(Typed, {"stay_from": "garbage", "price_to": ""})
    f = SEEN[0].filters
    assert f.stay is None and f.price is None
    assert f.statuses == set()
