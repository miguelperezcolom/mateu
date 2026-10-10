"""Excel and PDF listing exports (openpyxl MIT, reportlab BSD — the ``export`` extra), the Python
mirror of Java's ExcelExporter / PdfExporter beans: offered in Java's order, real files, and not
offered when the library is missing (Java shows the button only with an exporter bean)."""

from __future__ import annotations

import base64
import io
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Crud, title, ui  # noqa: E402


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


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def toolbar_ids(cls) -> list[str]:
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))

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


def export(cls, action_id, search=""):
    return handler().handle(
        RunActionRq(
            route="/ex-all",
            action_id=action_id,
            server_side_type=type_name(cls),
            initiator_component_id="c1",
            component_state={"searchText": search} if search else {},
        )
    )


def test_every_format_is_offered_in_java_order():
    pytest.importorskip("openpyxl")
    pytest.importorskip("reportlab")
    assert toolbar_ids(AllFormats)[:3] == ["export-csv", "export-excel", "export-pdf"]
    assert not [i for i in toolbar_ids(NoExport) if i.startswith("export-")]


def test_excel_export_is_a_real_workbook_with_typed_cells():
    openpyxl = pytest.importorskip("openpyxl")
    data = export(AllFormats, "export-excel").commands[0].data
    assert data["filename"] == "export.xlsx"
    assert data["mimeType"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    book = openpyxl.load_workbook(io.BytesIO(base64.b64decode(data["base64Content"])))
    sheet = book["Export"]
    assert [[c.value for c in row] for row in sheet.iter_rows()] == [
        ["Id", "Name", "Nights"],
        ["1", "Ana", 3],
        ["2", "Luis <Jr>", 1],
    ]
    assert sheet["A1"].font.bold


def test_pdf_export_is_a_pdf():
    pytest.importorskip("reportlab")
    data = export(AllFormats, "export-pdf").commands[0].data
    assert (data["filename"], data["mimeType"]) == ("export.pdf", "application/pdf")
    assert base64.b64decode(data["base64Content"]).startswith(b"%PDF")


def test_a_format_whose_library_is_missing_is_neither_offered_nor_answered(monkeypatch):
    import mateu_core.export as export_module

    pytest.importorskip("reportlab")
    monkeypatch.setattr(export_module, "excel_available", lambda: False)
    ids = toolbar_ids(AllFormats)
    assert "export-excel" not in ids and "export-pdf" in ids
    assert "DownloadFile" not in [c.type for c in export(AllFormats, "export-excel").commands]


def test_a_crud_that_does_not_opt_in_refuses_the_export():
    assert "DownloadFile" not in [c.type for c in export(NoExport, "export-pdf").commands]
