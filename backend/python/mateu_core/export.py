"""Listing exports: which exporter writes each format (Java's ExportActionRunner + the
``ListingExporter`` beans).

Mateu ships no spreadsheet or PDF engine: Excel and PDF are offered only when the application
registers a :class:`mateu_uidl.ListingExporter` for them. CSV has a dependency-free built-in writer
(:class:`BuiltInCsvExporter`), which an application CSV exporter replaces.
"""

from __future__ import annotations

import csv
import io
from collections.abc import Iterable

from mateu_uidl.export import ExportedFile, ExportFormat, ListingExport, ListingExporter

#: action id → the crud hook that opts into it, in Java's toolbar order (CSV, Excel, PDF)
FORMATS: dict[str, tuple[str, ExportFormat]] = {
    "export-csv": ("csv_exportable", ExportFormat.CSV),
    "export-excel": ("excel_exportable", ExportFormat.EXCEL),
    "export-pdf": ("pdf_exportable", ExportFormat.PDF),
}


class BuiltInCsvExporter(ListingExporter):
    """RFC 4180 CSV, UTF-8, ``\\n`` line ends (mirrors Java's DefaultCsvExporter)."""

    format = ExportFormat.CSV

    def export(self, export: ListingExport) -> ExportedFile:
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow([c.label for c in export.columns])
        for row in export.rows:
            writer.writerow([c.text_of(row) for c in export.columns])
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
