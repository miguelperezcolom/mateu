"""The CollectionDetail / GeneralOverview archetypes (Redwood "Collection Detail" and "General
Overview" templates), built on the fluent FormField primitive — mirroring Java's
CollectionDetailSyncTest / GeneralOverviewSyncTest and the .NET ArchetypeTests."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import CollectionDetail, GeneralOverview, title, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402


class Hotel:
    def __init__(self, id: str, name: str, city: str):
        self.id = id
        self.name = name
        self.city = city


HOTELS = [
    Hotel("h1", "Riu Palace", "Palma"),
    Hotel("h2", "Riu Plaza", "Madrid"),
    Hotel("h3", "Riu Playa", "Cancún"),
]


@ui("hotel-directory")
@title("Hotels")
class HotelDirectory(CollectionDetail):
    def rows(self, search):
        if not search:
            return HOTELS
        needle = search.lower()
        return [h for h in HOTELS if needle in (h.name + " " + h.city).lower()]

    def id_of(self, row):
        return row.id

    def title_of(self, row):
        return row.name

    def caption_of(self, row):
        return row.city

    def detail(self, row):
        return fluent.EntityHeader(title=row.name, subtitle=row.city)


@ui("requisition-overview")
@title("Requisitions")
class RequisitionOverview(GeneralOverview):
    RECORDS = {"r1": ("Requisition 204", "Vision Operations"), "r2": ("Requisition 205", "Vision Services")}

    def switcher_options(self):
        return [(rid, data[0]) for rid, data in self.RECORDS.items()]

    def load(self, record_id):
        return self.RECORDS.get(record_id)

    def overview(self, row):
        return fluent.EntityHeader(
            title=row[0], facts=(fluent.Fact(label="Business Unit", value=row[1]),)
        )


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def render(inc) -> str:
    return inc.model_dump_json(by_alias=True)


def test_collection_detail_renders_the_search_field_the_list_and_the_empty_detail():
    inc = handler().handle(
        RunActionRq(route="/hotel-directory", serverSideType=f"{__name__}.HotelDirectory",
                    initiatorComponentId="ux_main")
    )
    j = render(inc).replace(" ", "")
    assert '"type":"FormField"' in j
    assert '"fieldId":"search"' in j
    assert '"type":"TaskQueue"' in j
    assert "RiuPalace" in j
    assert "3items" in j
    assert '"type":"EmptyState"' in j
    # typing re-filters through the AutoSave trigger
    assert '"type":"AutoSave"' in j
    assert '"actionId":"filterCollection"' in j


def test_selecting_an_item_renders_its_detail_and_marks_the_card():
    inc = handler().handle(
        RunActionRq(route="/hotel-directory", actionId="selectCollectionItem",
                    serverSideType=f"{__name__}.HotelDirectory", initiatorComponentId="ux_main",
                    parameters={"_item": "h2"})
    )
    j = render(inc).replace(" ", "")
    assert '"type":"EntityHeader"' in j
    assert "RiuPlaza" in j
    assert '"selected":true' in j
    assert '"type":"EmptyState"' not in j
    # the selection survives the response: it rides in initialData
    assert '"selectedId":"h2"' in j


def test_typing_in_the_search_box_filters_the_list():
    inc = handler().handle(
        RunActionRq(route="/hotel-directory", actionId="filterCollection",
                    serverSideType=f"{__name__}.HotelDirectory", initiatorComponentId="ux_main",
                    componentState={"search": "cancún"})
    )
    j = render(inc).replace(" ", "")
    assert "RiuPlaya" in j
    assert "RiuPalace" not in j
    assert "1items" in j


def test_general_overview_selects_the_first_record_and_renders_the_switcher():
    inc = handler().handle(
        RunActionRq(route="/requisition-overview", serverSideType=f"{__name__}.RequisitionOverview",
                    initiatorComponentId="ux_main")
    )
    j = render(inc).replace(" ", "")
    assert '"fieldId":"record"' in j
    assert "Requisition205" in j  # in the switcher options
    assert '"type":"EntityHeader"' in j
    assert "VisionOperations" in j  # the FIRST record's overview
    assert '"record":"r1"' in j  # initialData carries the selection


def test_switching_the_record_re_renders_the_overview_in_place():
    inc = handler().handle(
        RunActionRq(route="/requisition-overview", actionId="switchRecord",
                    serverSideType=f"{__name__}.RequisitionOverview", initiatorComponentId="ux_main",
                    componentState={"record": "r2"})
    )
    j = render(inc).replace(" ", "")
    assert "VisionServices" in j
    assert "VisionOperations" not in j
    assert not any(c.type == "NavigateTo" for c in inc.commands)
