"""Listing exports through the ``ListingExporter`` port (Java's ExportActionRunner + the
ListingExporter beans): Mateu ships no Excel / PDF engine, so the application's exporters are
discovered among the registered sources; the buttons follow Java's order, and a format nobody
writes is neither offered nor answered with a crash."""

from __future__ import annotations

import base64
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Crud,
    ExportedFile,
    ExportFormat,
    ListingExport,
    ListingExporter,
    title,
    ui,
)
from mateu_uidl.messages import UserFacingException  # noqa: E402


class Row:
    id: str = ""
    name: str = ""
    nights: int = 0

    def __init__(self, id: str = "", name: str = "", nights: int = 0):
        self.id, self.name, self.nights = id, name, nights


@ui("ex-all")
@title("Guests")
class AllFormats(Crud[Row]):
    def csv_exportable(self) -> bool:
        return True

    def excel_exportable(self) -> bool:
        return True

    def pdf_exportable(self) -> bool:
        return True

    def fetch(self, search):
        rows = [Row("1", "Ana", 3), Row("2", "Luis <Jr>", 1)]
        return [r for r in rows if not search or search in r.name]


@ui("ex-none")
class NoExport(Crud[Row]):
    def fetch(self, search):
        return []


class SampleExcelExporter(ListingExporter):
    """A stand-in for the app's spreadsheet engine (openpyxl, xlsxwriter…): a readable digest."""

    format = ExportFormat.EXCEL
    last: ListingExport | None = None

    def export(self, export: ListingExport) -> ExportedFile:
        SampleExcelExporter.last = export
        lines = [" | ".join(c.label for c in export.columns)]
        lines += [" | ".join(c.text_of(r) for c in export.columns) for r in export.rows]
        return ExportedFile(f"{export.title}\n".encode() + "\n".join(lines).encode())


class SamplePdfExporter(ListingExporter):
    format = ExportFormat.PDF

    def export(self, export: ListingExport) -> ExportedFile:
        return ExportedFile(b"%PDF-sample", filename="guests.pdf")


MODULE = sys.modules[__name__]


def handler(with_exporters: bool = True) -> SyncHandler:
    if with_exporters:
        return SyncHandler(MateuRegistry(MODULE))
    return SyncHandler(MateuRegistry(AllFormats, NoExport))


def toolbar_ids(cls, with_exporters: bool = True) -> list[str]:
    inc = handler(with_exporters).handle(RunActionRq(server_side_type=type_name(cls)))

    def walk(n):
        if isinstance(n, dict):
            yield n
            for v in n.values():
                yield from walk(v)
        elif isinstance(n, list):
            for v in n:
                yield from walk(v)

    crud = next(n for n in walk(inc.model_dump(by_alias=True, mode="json")) if n.get("type") == "Crud")
    return [b["actionId"] for b in crud["toolbar"]]


def export(cls, action_id, search="", with_exporters: bool = True):
    return handler(with_exporters).handle(
        RunActionRq(
            route="/ex-all",
            action_id=action_id,
            server_side_type=type_name(cls),
            initiator_component_id="c1",
            component_state={"searchText": search} if search else {},
        )
    )


def test_every_format_is_offered_in_java_order():
    assert toolbar_ids(AllFormats)[:3] == ["export-csv", "export-excel", "export-pdf"]
    assert not [i for i in toolbar_ids(NoExport) if i.startswith("export-")]


def test_the_exporter_receives_the_title_columns_and_rows():
    data = export(AllFormats, "export-excel").commands[0].data
    # no filename / media type answered: the format's defaults
    assert data["filename"] == "export.xlsx"
    assert data["mimeType"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert base64.b64decode(data["base64Content"]).decode() == (
        "Guests\nId | Name | Nights\n1 | Ana | 3\n2 | Luis <Jr> | 1"
    )
    handed = SampleExcelExporter.last
    assert handed is not None and handed.format is ExportFormat.EXCEL
    assert handed.columns[2].value_of(handed.rows[0]) == 3


def test_the_exporters_filename_wins():
    data = export(AllFormats, "export-pdf").commands[0].data
    assert (data["filename"], data["mimeType"]) == ("guests.pdf", "application/pdf")
    assert base64.b64decode(data["base64Content"]) == b"%PDF-sample"


def test_csv_is_built_in():
    data = export(AllFormats, "export-csv", with_exporters=False).commands[0].data
    assert data["filename"] == "export.csv"
    assert base64.b64decode(data["base64Content"]).decode() == "Id,Name,Nights\n1,Ana,3\n2,Luis <Jr>,1\n"


def test_without_an_exporter_excel_and_pdf_are_neither_offered_nor_crash():
    ids = toolbar_ids(AllFormats, with_exporters=False)
    assert "export-csv" in ids
    assert "export-excel" not in ids and "export-pdf" not in ids
    with pytest.raises(UserFacingException) as raised:
        export(AllFormats, "export-excel", with_exporters=False)
    assert raised.value.title == "Export not available"


def test_a_crud_that_does_not_opt_in_refuses_the_export():
    assert "DownloadFile" not in [c.type for c in export(NoExport, "export-pdf").commands]
