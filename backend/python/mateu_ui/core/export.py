"""Listing exports: which exporter writes each format (Java's ExportActionRunner + the
``ListingExporter`` beans).

Mateu ships no spreadsheet or PDF engine: Excel and PDF are offered only when the application
registers a :class:`mateu_ui.uidl.ListingExporter` for them. CSV has a dependency-free built-in writer
(:class:`BuiltInCsvExporter`), which an application CSV exporter replaces.
"""

from __future__ import annotations

import csv
import io
import re
from collections.abc import Iterable

from mateu_ui.uidl.export import ExportedFile, ExportFormat, ListingExport, ListingExporter

#: action id → the crud hook that opts into it, in Java's toolbar order (CSV, Excel, PDF)
FORMATS: dict[str, tuple[str, ExportFormat]] = {
    "export-csv": ("csv_exportable", ExportFormat.CSV),
    "export-excel": ("excel_exportable", ExportFormat.EXCEL),
    "export-pdf": ("pdf_exportable", ExportFormat.PDF),
}


_PLAIN_NUMBER = re.compile(r"[+-]?[0-9]+([.,][0-9]+)?")


def _neutralized(value: str) -> str:
    """A value a spreadsheet would run as a formula, prefixed with ``'`` so it stays text (the cells
    come from what users typed). A plain number (-12.5, +34) is data and is left alone."""
    if not value or value[0] not in "=+-@\t\r" or _PLAIN_NUMBER.fullmatch(value):
        return value
    return "'" + value


class BuiltInCsvExporter(ListingExporter):
    """RFC 4180 CSV, UTF-8, ``\\n`` line ends (mirrors Java's DefaultCsvExporter)."""

    format = ExportFormat.CSV

    def export(self, export: ListingExport) -> ExportedFile:
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow([_neutralized(c.label) for c in export.columns])
        for row in export.rows:
            writer.writerow([_neutralized(c.text_of(row)) for c in export.columns])
        return ExportedFile(out.getvalue().encode("utf-8"))


class Exporters:
    """The exporters a SyncHandler answers export-* with: the application's, plus the built-in CSV
    writer when none of them writes CSV."""

    def __init__(self, exporters: Iterable[ListingExporter] = ()):
        own = [e for e in exporters if e is not None]
        if not any(e.format == ExportFormat.CSV for e in own):
            own.append(BuiltInCsvExporter())
        self._exporters = own

    def for_format(self, fmt: ExportFormat) -> ListingExporter | None:
        return next((e for e in self._exporters if e.format == fmt), None)

    def offers(self, fmt: ExportFormat) -> bool:
        return self.for_format(fmt) is not None


__all__ = ["FORMATS", "BuiltInCsvExporter", "Exporters"]
