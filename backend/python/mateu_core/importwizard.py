"""Guided CSV import wizard — the Python analogue of Java's ``ImportWizard<Row>`` archetype.

Upload (or paste) a CSV, map its columns onto the row class's fields (auto-mapped by name
similarity, adjustable in an inline-editable grid whose target-field cell is a select fed by the
wizard's ``options()`` supplier), review a validation report (conversion failures + ``Required()``
violations per line), then import the valid rows through :meth:`ImportWizard.import_rows`. The
result step shows imported/skipped counts.

Steps: 1 upload → 2 mapping → 3 validation → 4 result. Moving forward computes the next step's
content (:meth:`ImportWizard.on_next`); the import itself runs on the validation step's Next —
the port's wizards have no completion-action button, Next/Finish is the driver.
"""

from __future__ import annotations

import base64
import binascii
import urllib.parse
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, Any, Generic, TypeVar, get_args, get_origin

from mateu_uidl import (
    FileUpload,
    InlineEditing,
    Label,
    Message,
    PlainText,
    ReadOnly,
    Required,
    Step,
    Stereotype,
    Wizard,
)

from .naming import camel_case
from .reflection import view_fields

Row = TypeVar("Row")


class ColumnMapping:
    """One row of the import wizard's mapping grid: a CSV column, a sample value from the first
    data row, and the target row-class field it pours into (``target_field`` is the only editable
    cell — an inline select whose options are the row class's assignable field names; blank =
    skip the column)."""

    csv_column: Annotated[str | None, ReadOnly(), Label("CSV column")] = None
    sample: Annotated[str | None, ReadOnly(), Label("Sample")] = None
    target_field: Annotated[str | None, Label("Target field")] = None

    def __init__(self, csv_column: str | None = None, sample: str | None = None,
                 target_field: str | None = None):
        self.csv_column = csv_column
        self.sample = sample
        self.target_field = target_field


class RowIssue:
    """One problem found while validating a CSV data row in the import wizard."""

    line: Annotated[int, Label("Line")] = 0
    column: Annotated[str | None, Label("Column")] = None
    value: Annotated[str | None, Label("Value")] = None
    problem: Annotated[str | None, Label("Problem")] = None

    def __init__(self, line: int = 0, column: str | None = None, value: str | None = None,
                 problem: str | None = None):
        self.line = line
        self.column = column
        self.value = value
        self.problem = problem


class ImportWizard(Wizard, Generic[Row]):
    """Extend it, route it with ``@ui``, and implement :meth:`import_rows`::

        @ui("product-import")
        class ProductImport(ImportWizard[Product]):
            def import_rows(self, rows):
                for row in rows:
                    repository.save(row)

    ``row_class()`` defaults to the ``Row`` generic argument."""

    file: Annotated[str | None, Step(1), FileUpload(accept=".csv"), Label("CSV file")] = None
    pasted: Annotated[str | None, Step(1), Stereotype("textarea"),
                      Label("...or paste the CSV")] = None
    mappings: Annotated[list[ColumnMapping], Step(2), InlineEditing(),
                        Label("Column mapping")] = ()
    valid_rows: Annotated[int, Step(3), PlainText(), Label("Valid rows")] = 0
    invalid_rows: Annotated[int, Step(3), PlainText(), Label("Rows with problems")] = 0
    issues: Annotated[list[RowIssue], Step(3), ReadOnly(), Label("Issues")] = ()
    imported: Annotated[int, Step(4), PlainText(), Label("Imported")] = 0
    skipped: Annotated[int, Step(4), PlainText(), Label("Skipped")] = 0

    # ── the developer's surface ─────────────────────────────────────────────────
    def import_rows(self, rows: list[Row]) -> None:
        """Receives the valid typed rows when the user confirms the import (Next on the
        validation step)."""
        raise NotImplementedError

    def row_class(self) -> type:
        """The class each CSV data row hydrates into; defaults to the ``Row`` generic argument."""
        for klass in type(self).__mro__:
            for base in getattr(klass, "__orig_bases__", ()):
                origin = get_origin(base)
                if isinstance(origin, type) and issubclass(origin, ImportWizard):
                    args = get_args(base)
                    if args and isinstance(args[0], type):
                        return args[0]
        raise TypeError(f"{type(self).__name__} must subscribe ImportWizard[Row]")

    # ── wizard machinery ────────────────────────────────────────────────────────
    def complete(self) -> Message:
        return Message(f"Imported {self.imported} rows ({self.skipped} skipped)")

    def on_next(self, from_step: int, to_step: int) -> None:
        if from_step == 1 and to_step == 2:
            self._populate_mappings()
        if from_step == 2 and to_step == 3:
            valid, issues, invalid_count = self._assemble()
            self.valid_rows = len(valid)
            self.invalid_rows = invalid_count
            self.issues = issues
        if from_step == 3 and to_step == 4:
            valid, _, invalid_count = self._assemble()
            self.import_rows(valid)
            self.imported = len(valid)
            self.skipped = invalid_count

    def options(self, field_name: str):
        """The mapping grid's target-field select options: "— skip —" plus the row class's
        assignable (coercible) field names."""
        if field_name != "targetField":
            return []
        options: list[tuple[str, str]] = [("", "— skip —")]
        options.extend(
            (camel_case(f.name), camel_case(f.name)) for f in _assignable_fields(self.row_class())
        )
        return options

    # ── internals ───────────────────────────────────────────────────────────────
    def _populate_mappings(self) -> None:
        """Parses the CSV header + first data row and auto-maps columns by name similarity
        (exact case-insensitive match first, then containment either way; blank = unmapped)."""
        self.mappings = []
        records = parse_csv(self._content())
        if not records:
            return
        header = records[0]
        sample = records[1] if len(records) > 1 else []
        targets = [camel_case(f.name) for f in _assignable_fields(self.row_class())]
        for i, column in enumerate(header):
            self.mappings.append(ColumnMapping(
                csv_column=column,
                sample=sample[i] if i < len(sample) else "",
                target_field=_auto_map(column, targets),
            ))

    def _assemble(self) -> tuple[list[Row], list[RowIssue], int]:
        """Builds typed rows from the parsed CSV per the mappings: coerces each cell into the
        target field (str/int/float/Decimal/bool/dates/Enum), collects conversion failures, then
        checks ``Required()`` fields — the port's server-side validation surface."""
        row_class = self.row_class()
        valid: list[Row] = []
        issues: list[RowIssue] = []
        invalid_count = 0
        records = parse_csv(self._content())
        mappings = list(self.mappings or [])
        if len(records) < 2 or not mappings:
            return valid, issues, invalid_count
        header = records[0]
        fields = {camel_case(f.name): f for f in _assignable_fields(row_class)}
        for r in range(1, len(records)):
            line = r + 1  # 1-based, counting the header line
            record = records[r]
            row_issues: list[RowIssue] = []
            row = row_class()
            for mapping in mappings:
                target = mapping.target_field
                if not target or not target.strip():
                    continue
                index = header.index(mapping.csv_column) if mapping.csv_column in header else -1
                if index < 0 or index >= len(record):
                    continue
                raw = record[index]
                if raw is None or not raw.strip():
                    continue  # leave the field default; requiredness → the constraint pass
                f = fields.get(target)
                if f is None:
                    row_issues.append(RowIssue(line, mapping.csv_column, target,
                                               "Unknown target field"))
                    continue
                try:
                    setattr(row, f.name, _coerce(f.type, raw.strip()))
                except (ValueError, KeyError, TypeError):
                    row_issues.append(RowIssue(
                        line, mapping.csv_column, raw,
                        "Cannot convert to " + getattr(f.type, "__name__", str(f.type)),
                    ))
            row_issues.extend(_validate_required(row_class, row, line, mappings))
            if not row_issues:
                valid.append(row)
            else:
                invalid_count += 1
                issues.extend(row_issues)
        return valid, issues, invalid_count

    def _content(self) -> str:
        """The CSV text: the uploaded file (base64-decoded data URI) when present, else the
        pasted text."""
        if self.file and self.file.strip():
            return _decode_data_uri(self.file)
        return self.pasted or ""


def _auto_map(column: str, targets: list[str]) -> str:
    normalized = column.strip().lower()
    for target in targets:
        if target.lower() == normalized:
            return target
    for target in targets:
        name = target.lower()
        if normalized and (normalized in name or name in normalized):
            return target
    return ""


def _assignable_fields(row_class: type):
    """The row-class fields a CSV column can pour into (coercible basics, enums and temporals)."""
    return [f for f in view_fields(row_class) if _is_coercible(f.type)]


def _is_coercible(t) -> bool:
    return t in (str, bool, int, float, Decimal, date, datetime) or (
        isinstance(t, type) and issubclass(t, Enum)
    )


def _coerce(t, raw: str):
    """A CSV cell into the target field type; raises on unconvertible values."""
    if t is str:
        return raw
    if t is bool:
        lowered = raw.lower()
        if lowered in ("true", "1", "yes"):
            return True
        if lowered in ("false", "0", "no"):
            return False
        raise ValueError(raw)
    if t is int:
        return int(raw)
    if t is float:
        return float(raw)
    if t is Decimal:
        return Decimal(raw)
    if t is date:
        return date.fromisoformat(raw)
    if t is datetime:
        return datetime.fromisoformat(raw)
    if isinstance(t, type) and issubclass(t, Enum):
        try:
            return t[raw]
        except KeyError:
            return t(raw)
    raise ValueError(raw)


def _validate_required(row_class: type, row, line: int, mappings) -> list[RowIssue]:
    """``Required()`` fields must end up non-None and non-blank — the Python port's validation
    surface (it has no Min/Max markers)."""
    issues: list[RowIssue] = []
    for f in _assignable_fields(row_class):
        if not f.has(Required):
            continue
        value = getattr(row, f.name, None)
        if value is None or (isinstance(value, str) and not value.strip()):
            field_id = camel_case(f.name)
            column = next((m.csv_column for m in mappings if m.target_field == field_id), field_id)
            issues.append(RowIssue(line, column, "", "Must not be empty"))
    return issues


def _decode_data_uri(value: str) -> str:
    """Decodes a ``data:`` URI into text (base64 payload after the first comma, UTF-8); a plain
    (non-data-URI) value is returned as-is."""
    if not value.startswith("data:"):
        return value
    comma = value.find(",")
    if comma < 0:
        return ""
    meta, payload = value[:comma], value[comma + 1:]
    if ";base64" in meta:
        try:
            return base64.b64decode(payload).decode("utf-8")
        except (binascii.Error, ValueError):
            return ""
    return urllib.parse.unquote(payload)


def parse_csv(content: str | None) -> list[list[str]]:
    """Minimal RFC-4180-ish CSV parser (the Python port of Java's CsvParser): quoted fields may
    embed the separator, doubled quotes ("") and newlines; rows end at \\n, \\r\\n or \\r. Both
    ``,`` and ``;`` separate fields — the separator is detected by counting the candidates
    (outside quotes) on the first line. Fully-blank lines are dropped."""
    if content is None or not content.strip():
        return []
    separator = detect_separator(content)
    rows: list[list[str]] = []
    row: list[str] = []
    cell: list[str] = []
    in_quotes = False
    i = 0
    length = len(content)
    while i < length:
        c = content[i]
        if in_quotes:
            if c == '"':
                if i + 1 < length and content[i + 1] == '"':
                    cell.append('"')
                    i += 2
                    continue
                in_quotes = False
                i += 1
                continue
            cell.append(c)
            i += 1
            continue
        if c == '"':
            in_quotes = True
            i += 1
            continue
        if c == separator:
            row.append("".join(cell))
            cell = []
            i += 1
            continue
        if c in ("\r", "\n"):
            row.append("".join(cell))
            cell = []
            rows.append(row)
            row = []
            if c == "\r" and i + 1 < length and content[i + 1] == "\n":
                i += 1
            i += 1
            continue
        cell.append(c)
        i += 1
    if cell or row:
        row.append("".join(cell))
        rows.append(row)
    return [cells for cells in rows if any(cell.strip() for cell in cells)]


def detect_separator(content: str) -> str:
    """The field separator, detected on the first line: ``;`` when it outnumbers ``,`` outside
    quotes, else ``,``."""
    commas = 0
    semicolons = 0
    in_quotes = False
    for c in content:
        if c == '"':
            in_quotes = not in_quotes
        elif not in_quotes:
            if c in ("\r", "\n"):
                break
            if c == ",":
                commas += 1
            if c == ";":
                semicolons += 1
    return ";" if semicolons > commas else ","
