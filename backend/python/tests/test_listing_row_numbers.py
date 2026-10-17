"""Every row of a listing page carries ``_rowNumber`` — its position in the whole result — because
the web grid tells rows apart by it (``item-id-path="_rowNumber"``): without it selection and the
active row compared undefined ids. Java's DataMapper stamps it on every page it serves."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, Listing, ListingData, ui  # noqa: E402

MODULE = sys.modules[__name__]


class Item:
    id: str = ""
    name: str = ""

    def __init__(self, id="", name=""):
        self.id, self.name = id, name


ITEMS = [Item(str(i), f"Item {i}") for i in range(5)]


@ui("rn-crud")
class Items(Crud[Item]):
    def fetch(self, search):
        return list(ITEMS)

    def get(self, id):
        return None

    def save(self, entity):
        pass

    def delete(self, id):
        pass


@ui("rn-listing")
class ItemListing(Listing[Item]):
    def search(self, request, http=None):
        return list(ITEMS)


@ui("rn-pushdown")
class PagedListing(Listing[Item]):
    def search(self, request, http=None):
        start = request.pageable.page * request.pageable.size
        return ListingData(rows=ITEMS[start:start + request.pageable.size], total_elements=len(ITEMS))


def numbers(view, page: int, size: int) -> list[int]:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        server_side_type=type_name(view), action_id="search",
        component_state={"page": page, "size": size},
    ))
    return [r["_rowNumber"] for r in inc.fragments[0].data["crud"]["page"]["content"]]


def test_a_crud_page_numbers_its_rows_from_the_page_start():
    assert numbers(Items, 1, 2) == [2, 3]


def test_a_listing_page_numbers_its_rows_from_the_page_start():
    assert numbers(ItemListing, 2, 2) == [4]


def test_a_listing_that_pages_itself_numbers_its_window_too():
    assert numbers(PagedListing, 1, 3) == [3, 4]
