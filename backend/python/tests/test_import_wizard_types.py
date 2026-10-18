"""The import wizard's coercion and mapping rules for every column type a user imports (numbers,
decimals, dates, timestamps, enums by name or value, booleans), the auto-mapping by containment,
and the CSV sources it accepts (URL-encoded data URIs, broken uploads, header-only files)."""

import base64
import sys
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import ImportWizard, parse_csv  # noqa: E402
from mateu_ui.core.importwizard import ColumnMapping  # noqa: E402


class Size(Enum):
    SMALL = "s"
    LARGE = "l"


class Item:
    code: str = ""
    price: float = 0.0
    cost: Decimal = Decimal(0)
    since: date | None = None
    at: datetime | None = None
    size: Size = Size.SMALL
    active: bool = False


IMPORTED: list = []


class ItemImport(ImportWizard[Item]):
    def import_rows(self, rows):
        IMPORTED.extend(rows)


def run(csv: str, *, file: str | None = None, edit=None):
    w = ItemImport()
    if file is None:
        w.pasted = csv
    else:
        w.file = file
    w.on_next(1, 2)
    if edit:
        edit(w.mappings)
    w.on_next(2, 3)
    return w


def test_every_basic_column_type_is_coerced():
    w = run("Code,Price,Cost,Since,At,Size,Active\n"
            "A1,1.5,2.25,2026-05-01,2026-05-01T10:30,LARGE,no\n"
            "A2,3,4,2026-06-01,2026-06-01T00:00,s,yes\n")
    assert (w.valid_rows, w.invalid_rows) == (2, 0)
    IMPORTED.clear()
    w.do_import()
    a, b = IMPORTED
    assert a.price == 1.5 and a.cost == Decimal("2.25")
    assert a.since == date(2026, 5, 1) and a.at == datetime(2026, 5, 1, 10, 30)
    assert a.size is Size.LARGE and a.active is False
    assert b.size is Size.SMALL and b.active is True  # enum by value, "yes" is true


@pytest.mark.parametrize("column,value", [
    ("Price", "cheap"), ("Since", "yesterday"), ("Size", "HUGE"), ("Active", "maybe"),
])
def test_an_uncoercible_cell_is_reported_on_its_line(column, value):
    w = run(f"Code,{column}\nA1,{value}\n")
    assert w.invalid_rows == 1
    assert w.issues[0].line == 2
    assert w.issues[0].problem.startswith("Cannot convert to")


def test_columns_auto_map_by_containment_and_unknown_or_missing_targets_are_handled():
    def edit(mappings):
        mappings.append(ColumnMapping(csv_column="Ghost", sample="", target_field="code"))
        mappings[1].target_field = "nonexistent"

    w = run("Item code,Extra\nA1,x\n", edit=edit)
    assert w.mappings[0].target_field == "code"  # "item code" contains "code"
    assert w.invalid_rows == 1
    assert [i.problem for i in w.issues] == ["Unknown target field"]


def test_a_short_record_leaves_the_missing_cells_at_their_defaults():
    w = run("Code,Price\nA1\n")
    assert w.valid_rows == 1


def test_a_url_encoded_data_uri_is_decoded():
    w = run("", file="data:text/csv,Code%2CPrice%0AA1%2C2%0A")
    assert w.valid_rows == 1


@pytest.mark.parametrize("uri", ["data:text/csv;base64,@@@notbase64", "data:broken"])
def test_an_unreadable_upload_yields_no_mappings(uri):
    w = run("", file=uri)
    assert w.mappings == [] and w.valid_rows == 0


def test_a_header_only_file_validates_nothing():
    w = run("Code,Price\n")
    assert [m.csv_column for m in w.mappings] == ["Code", "Price"]
    assert (w.valid_rows, w.invalid_rows) == (0, 0)


def test_a_file_without_a_trailing_newline_keeps_its_last_row():
    assert parse_csv("a,b\n1,2") == [["a", "b"], ["1", "2"]]
    assert parse_csv("   ") == []


def test_an_unsubscribed_import_wizard_says_what_is_missing():
    class Bare(ImportWizard):
        pass

    with pytest.raises(TypeError, match="must subscribe ImportWizard"):
        Bare().row_class()
