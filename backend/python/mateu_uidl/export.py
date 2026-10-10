"""The listing export port (Java's ``ListingExporter`` / ``ListingExport`` / ``ExportedFile``).

Mateu ships the UI of exporting — the Export buttons, which columns, rows and filters are exported,
and the download — but **no spreadsheet or PDF engine**. The application writes the file: subclass
:class:`ListingExporter` (one per :class:`ExportFormat`) in a module you register with
``add_mateu`` / ``MateuRegistry``; it is discovered like the other suppliers and instantiated with
no arguments. A crud's Excel / PDF button shows only while an exporter for that format exists. CSV
is the one format with a built-in, dependency-free writer, which a CSV exporter of yours replaces.

.. code-block:: python

    from openpyxl import Workbook

    class ExcelExporter(ListingExporter):
        format = ExportFormat.EXCEL

        def export(self, export: ListingExport) -> ExportedFile:
            book = Workbook()
            sheet = book.active
            sheet.append([c.label for c in export.columns])
            for row in export.rows:
                sheet.append([c.text_of(row) for c in export.columns])
            out = io.BytesIO()
            book.save(out)
            return ExportedFile(out.getvalue())
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from enum import Enum
from typing import Any, Sequence


class ExportFormat(str, Enum):
    """A format a listing can be exported to; each has its toolbar button and action id."""

    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"

    @property
    def action_id(self) -> str:
        """``export-csv`` | ``export-excel`` | ``export-pdf``."""
        return "export-" + self.value

    @property
    def button_label(self) -> str:
        return {"csv": "Export CSV", "excel": "Export Excel", "pdf": "Export PDF"}[self.value]

    @property
    def default_filename(self) -> str:
        return {"csv": "export.csv", "excel": "export.xlsx", "pdf": "export.pdf"}[self.value]

    @property
    def default_media_type(self) -> str:
        return {
            "csv": "text/csv",
            "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "pdf": "application/pdf",
        }[self.value]

    @classmethod
    def of_action_id(cls, action_id: str | None) -> ExportFormat | None:
        for f in cls:
            if f.action_id == action_id:
                return f
        return None


@dataclass(frozen=True)
class ExportColumn:
    """An exported column: the row attribute it reads and its header label."""

    name: str
    label: str

    def value_of(self, row: Any) -> Any:
        """The raw cell value (a dict key or an attribute); None when the row has none."""
        if isinstance(row, dict):
            return row.get(self.name)
        return getattr(row, self.name, None)

    def text_of(self, row: Any) -> str:
        """The cell as text: enums by name, dates ISO, None empty, everything else ``str()``."""
        value = self.value_of(row)
        if value is None:
            return ""
        if isinstance(value, Enum):
            return str(value.name)
        if isinstance(value, (date, datetime)):
            return value.isoformat()
        return str(value)


@dataclass(frozen=True)
class ListingExport:
    """What Mateu hands a :class:`ListingExporter`: the format, the listing's title, the columns in
    order and the WHOLE filtered result set (not just the page on screen), plus the search text."""

    format: ExportFormat
    title: str | None
    columns: Sequence[ExportColumn]
    rows: Sequence[Any]
    search_text: str | None = None


@dataclass(frozen=True)
class ExportedFile:
    """The file an exporter produced; Mateu delivers it as a download. ``None`` media type /
    filename take the format's defaults."""

    content: bytes
    media_type: str | None = None
    filename: str | None = None


class ListingExporter:
    """The port that WRITES a listing export file — implemented by the application (subclass it,
    set ``format`` and implement :meth:`export`). Mateu ships no Excel / PDF engine."""

    #: The format this exporter writes.
    format: ExportFormat = ExportFormat.CSV

    def export(self, export: ListingExport) -> ExportedFile:  # pragma: no cover - the app's job
        raise NotImplementedError


__all__ = ["ExportColumn", "ExportFormat", "ExportedFile", "ListingExport", "ListingExporter"]
