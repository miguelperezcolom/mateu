"""Row tones and listing exports — the Python mirror of Java's ``RowStatusSyncTest`` and
``CrudExportToolbarSyncTest``: the row field marked ``RowStatus()`` travels as
``CrudMetadata.row_status_field``, and a ``csv_exportable()`` crud offers "Export CSV"
(``export-csv``), answered with a DownloadFile command carrying the filtered rows as CSV."""

import base64
import sys
from enum import Enum
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, Listing, RowStatus, title, ui  # noqa: E402


class Tone(Enum):
    success = "success"
    warning = "warning"
    danger = "danger"


class ReservationRow:
    id: str = ""
    guest: str = ""
    tone: Annotated[Tone, RowStatus()] = Tone.success

    def __init__(self, id: str = "", guest: str = "", tone: Tone = Tone.success):
        self.id = id
        self.guest = guest
        self.tone = tone


class PlainRow:
    id: str = ""
    name: str = ""

    def __init__(self, id: str = "", name: str = ""):
        self.id = id
        self.name = name


@ui("rs-toned")
@title("Toned")
class Toned(Listing[ReservationRow]):
    def search(self, request, http=None):
        return [ReservationRow("r1", "Ana", Tone.warning)]


@ui("rs-plain")
@title("Plain")
class Plain(Listing[PlainRow]):
    def search(self, request, http=None):
        return [PlainRow("p1", "x")]


@ui("rs-toned-crud")
@title("Toned crud")
class TonedCrud(Crud[ReservationRow]):
    def fetch(self, search):
        return [ReservationRow("r1", "Ana", Tone.danger)]


@ui("rs-guests-export")
@title("Guests")
class GuestsExport(Crud[PlainRow]):
    def csv_exportable(self) -> bool:
        return True

    def fetch(self, search):
        rows = [PlainRow("1", "Ana"), PlainRow("2", "Luis, Jr.")]
        return [r for r in rows if not search or search in r.name]


@ui("rs-guests-no-export")
@title("Guests")
class GuestsNoExport(Crud[PlainRow]):
    def fetch(self, search):
        return [PlainRow("1", "Ana")]


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def crud_of(cls):
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    return [n for n in walk(root) if n.get("type") == "Crud"][0]


def export(cls, route):
    return handler().handle(
        RunActionRq(
            route=route,
            action_id="export-csv",
            server_side_type=type_name(cls),
            initiator_component_id="c1",
            component_state={},
        )
    )


def test_the_row_status_field_travels_on_the_listing():
    assert crud_of(Toned)["rowStatusField"] == "tone"


def test_a_row_without_row_status_has_none():
    assert crud_of(Plain)["rowStatusField"] is None


def test_the_crud_listing_carries_the_row_status_field_too():
    assert crud_of(TonedCrud)["rowStatusField"] == "tone"


def test_an_exportable_crud_offers_the_export_button_and_exports():
    assert "export-csv" in [b["actionId"] for b in crud_of(GuestsExport)["toolbar"]]
    inc = export(GuestsExport, "/rs-guests-export")
    assert [c.type for c in inc.commands] == ["DownloadFile"]
    data = inc.commands[0].data
    assert data["filename"] == "export.csv"
    assert data["mimeType"] == "text/csv"
    csv = base64.b64decode(data["base64Content"]).decode("utf-8")
    assert csv == 'Id,Name\n1,Ana\n2,"Luis, Jr."\n'


def test_a_crud_that_is_not_exportable_offers_no_export_and_refuses_it():
    assert "export-csv" not in [b["actionId"] for b in crud_of(GuestsNoExport)["toolbar"]]
    inc = export(GuestsNoExport, "/rs-guests-no-export")
    assert "DownloadFile" not in [c.type for c in inc.commands]
