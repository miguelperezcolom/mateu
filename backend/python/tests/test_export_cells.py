"""What an exported listing cell becomes: enums by name, dates ISO, empty for a missing value —
through the real Export CSV action — plus the action-id ↔ format mapping exporters rely on."""

import base64
import sys
from datetime import date
from enum import Enum
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Crud, ui  # noqa: E402
from mateu_ui.uidl.export import ExportColumn, ExportFormat  # noqa: E402


class Kind(Enum):
    SUITE = "suite"


class Stay:
    id: str = ""
    kind: Kind | None = None
    arrival: date | None = None

    def __init__(self, id="", kind=None, arrival=None):
        self.id, self.kind, self.arrival = id, kind, arrival


@ui("ec-stays")
class Stays(Crud[Stay]):
    def csv_exportable(self) -> bool:
        return True

    def fetch(self, search):
        return [Stay("1", Kind.SUITE, date(2026, 5, 1)), Stay("2")]


def test_cells_are_exported_as_text_users_can_read():
    inc = SyncHandler(MateuRegistry(sys.modules[__name__])).handle(RunActionRq(
        route="/ec-stays", action_id="export-csv", server_side_type=type_name(Stays),
        initiator_component_id="c1", component_state={},
    ))
    csv = base64.b64decode(inc.commands[0].data["base64Content"]).decode("utf-8")
    assert csv.splitlines()[1:] == ["1,SUITE,2026-05-01", "2,,"]


def test_a_column_reads_dict_rows_too():
    assert ExportColumn("kind", "Kind").text_of({"kind": Kind.SUITE}) == "SUITE"
    assert ExportColumn("x", "X").text_of({}) == ""


def test_the_export_action_ids_name_their_format():
    assert [f.action_id for f in ExportFormat] == ["export-csv", "export-excel", "export-pdf"]
    assert ExportFormat.of_action_id("export-pdf") is ExportFormat.PDF
    assert ExportFormat.of_action_id("save") is None
