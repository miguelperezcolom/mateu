"""Listing exporters: CSV (built in), Excel and PDF (Java's CsvExporter / ExcelExporter /
PdfExporter beans + ExportActionRunner).

Excel is written with **openpyxl** (MIT) and PDF with **reportlab** (BSD) — both permissive and
both optional (``pip install mateu-ui[export]``). As in Java, where the buttons only show when an
exporter bean is on the classpath, a format whose library is not installed is simply not offered:
``excel_exportable()`` on a crud adds no button and the action is not answered.

Each exporter takes the rows (objects) and the columns (``(attribute, label)`` pairs) and returns the
file's bytes; ``FORMATS`` maps the action id to ``(filename, mime type, exporter)``.
"""

from __future__ import annotations

import csv
import io
from collections.abc import Callable, Sequence
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any

Columns = Sequence[tuple[str, str]]


def cell_text(value: Any) -> str:
    """A value as an export cell shows it: enums by name, None empty, everything else str()."""
    if value is None:
        return ""
    if isinstance(value, Enum):
        return str(value.name)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def _cell_value(value: Any) -> Any:
    """Excel keeps numbers and dates typed (sortable, summable); the rest is text."""
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value
    return cell_text(value)


def csv_bytes(rows: Sequence[Any], columns: Columns, title: str = "") -> bytes:
    out = io.StringIO()
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow([label for _, label in columns])
    for row in rows:
        writer.writerow([cell_text(getattr(row, name, None)) for name, _ in columns])
    return out.getvalue().encode("utf-8")


def excel_available() -> bool:
    try:
        import openpyxl  # noqa: F401
    except ImportError:
        return False
    return True


def pdf_available() -> bool:
    try:
        import reportlab  # noqa: F401
    except ImportError:
        return False
    return True


def excel_bytes(rows: Sequence[Any], columns: Columns, title: str = "") -> bytes:
    """One sheet "Export": a bold, grey-filled header row then one row per item, columns sized to
    their content (Java's ApachePoiExcelExporter)."""
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Export"
    sheet.append([label for _, label in columns])
    bold = Font(bold=True)
    grey = PatternFill(start_color="FFD9D9D9", end_color="FFD9D9D9", fill_type="solid")
    for cell in sheet[1]:
        cell.font = bold
        cell.fill = grey
    for row in rows:
        sheet.append([_cell_value(getattr(row, name, None)) for name, _ in columns])
    for i, (name, label) in enumerate(columns, start=1):
        width = max([len(label)] + [len(cell_text(getattr(r, name, None))) for r in rows])
        sheet.column_dimensions[sheet.cell(row=1, column=i).column_letter].width = min(width + 2, 60)
    out = io.BytesIO()
    workbook.save(out)
    return out.getvalue()


def pdf_bytes(rows: Sequence[Any], columns: Columns, title: str = "") -> bytes:
    """A landscape A4 document: the title, then a table with a repeated header row (Java's
    PdfBoxPdfExporter)."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    out = io.BytesIO()
    doc = SimpleDocTemplate(out, pagesize=landscape(A4), title=title or "Export")
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    data = [[Paragraph(f"<b>{_escape(label)}</b>", body) for _, label in columns]]
    for row in rows:
        data.append([Paragraph(_escape(cell_text(getattr(row, name, None))), body) for name, _ in columns])
    table = Table(data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D9D9D9")),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story = []
    if title:
        story += [Paragraph(_escape(title), styles["Heading2"]), Spacer(1, 8)]
    story.append(table)
    doc.build(story)
    return out.getvalue()


def _escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


Exporter = Callable[[Sequence[Any], Columns, str], bytes]

#: action id → (hook name, button label, filename, mime type, exporter, availability check)
FORMATS: dict[str, tuple[str, str, str, str, Exporter, Callable[[], bool]]] = {
    "export-csv": ("csv_exportable", "Export CSV", "export.csv", "text/csv", csv_bytes, lambda: True),
    "export-excel": (
        "excel_exportable",
        "Export Excel",
        "export.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        excel_bytes,
        lambda: excel_available(),
    ),
    "export-pdf": ("pdf_exportable", "Export PDF", "export.pdf", "application/pdf", pdf_bytes, lambda: pdf_available()),
}


__all__ = [
    "FORMATS",
    "cell_text",
    "csv_bytes",
    "excel_available",
    "excel_bytes",
    "pdf_available",
    "pdf_bytes",
]
