"""The guided CSV import wizard (``ImportWizard[Row]`` archetype) — the Python mirror of Java's
``ImportWizardSyncTest``: upload/paste a CSV, auto-map its columns onto the row class (adjustable
in an inline-editable grid whose target-field cell is a select fed by the wizard's ``options()``
supplier), review a per-line validation report (conversion failures + ``Required()`` violations),
then import exactly the valid rows. Driven through the same wire the browser uses (the fragment's
initialData is echoed back as the componentState).

Port deltas vs Java: the import runs on the validation step's Next (the port's wizards have no
@WizardCompletionAction button), and the validation surface is ``Required()`` only (the Python
port has no Min/Max markers)."""

import base64
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import (  # noqa: E402
    ImportWizard,
    MateuRegistry,
    RunActionRq,
    SyncHandler,
    detect_separator,
    parse_csv,
    type_name,
)
from mateu_uidl import Required, ui  # noqa: E402


class Product:
    name: Annotated[str | None, Required()] = None
    units: int = 0
    active: bool = False


imported: list[Product] | None = None


@ui("product-import")
class ProductImport(ImportWizard[Product]):
    def import_rows(self, rows: list[Product]) -> None:
        global imported
        imported = list(rows)


MODULE = sys.modules[__name__]

# 3 good rows + 1 missing name (Required()) + 1 uncoercible units
CSV = (
    "Name,Units,Active\n"
    "Keyboard,10,true\n"
    "Mouse,25,false\n"
    ",5,true\n"
    "Screen,abc,true\n"
    "Cable,3,false\n"
)


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def sync():
    return handler().handle(RunActionRq(server_side_type=type_name(ProductImport)))


def next_step(state: dict):
    return handler().handle(
        RunActionRq(action_id="next", server_side_type=type_name(ProductImport),
                    component_state=state)
    )


def state_of(increment) -> dict:
    """The wizard fragment's initialData — the state the browser would echo back."""
    return increment.model_dump(by_alias=True, mode="json")["fragments"][0]["component"][
        "initialData"
    ]


def test_the_wizard_parses_maps_validates_and_imports_only_the_valid_rows():
    global imported
    imported = None
    first_state = state_of(sync())
    assert first_state["__step"] == 1

    # step 1 → 2: paste the CSV and go next — the mapping auto-detects by name similarity
    s1 = {**first_state, "pasted": CSV}
    second_state = state_of(next_step(s1))
    assert second_state["__step"] == 2
    mappings = second_state["mappings"]
    assert [m["csvColumn"] for m in mappings] == ["Name", "Units", "Active"]
    assert [m["targetField"] for m in mappings] == ["name", "units", "active"]
    # the sample column carries the first data row
    assert mappings[0]["sample"] == "Keyboard"

    # step 2 → 3: the validation report counts 3 valid / 2 invalid and details the issues
    third_state = state_of(next_step(second_state))
    assert third_state["__step"] == 3
    assert third_state["validRows"] == 3
    assert third_state["invalidRows"] == 2
    issues = third_state["issues"]
    assert len(issues) == 2
    problems = [issue["problem"] for issue in issues]
    assert any("Must not be empty" in p for p in problems)
    assert any("Cannot convert" in p for p in problems)

    # validation → result: Next imports exactly the 3 valid rows, typed; the result step shows
    # the counts (the port equivalent of Java's doImport completion action)
    done_state = state_of(next_step(third_state))
    assert imported is not None
    assert [p.name for p in imported] == ["Keyboard", "Mouse", "Cable"]
    assert imported[0].units == 10
    assert imported[0].active is True
    assert done_state["__step"] == 4
    assert done_state["imported"] == 3
    assert done_state["skipped"] == 2

    # Finish on the result step completes with the summary message
    finished = next_step(done_state)
    assert [m.text for m in finished.messages] == ["Imported 3 rows (2 skipped)"]


def test_the_target_field_cell_is_an_inline_select_fed_by_the_row_class_field_names():
    first_state = state_of(sync())
    second = next_step({**first_state, "pasted": CSV})
    doc = second.model_dump(by_alias=True, mode="json")

    def grid_columns(node, out):
        if isinstance(node, dict):
            meta = node.get("metadata")
            if isinstance(meta, dict):
                for column in meta.get("columns") or []:
                    out.append(column["metadata"])
            for child in node.get("children") or []:
                grid_columns(child, out)
            if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
                grid_columns(meta["content"], out)
        return out

    columns = grid_columns(doc["fragments"][0]["component"], [])
    target = next(c for c in columns if c["id"] == "targetField")
    assert target["editable"] is True
    assert target["editorType"] == "select"
    option_values = [o["value"] for o in target["editorOptions"]]
    assert option_values == ["", "name", "units", "active"]
    assert target["editorOptions"][0]["label"] == "— skip —"
    # the read-only cells stay display-only
    csv_column = next(c for c in columns if c["id"] == "csvColumn")
    assert csv_column["editable"] is False


def test_edited_mappings_and_semicolon_separated_uploads_are_honoured():
    global imported
    imported = None
    # headers that do NOT match the field names, semicolon-separated, as an uploaded data URI
    csv = "Producto;Cantidad\nTeclado;4\nRaton;7\n"
    data_uri = "data:text/csv;name=productos.csv;base64," + base64.b64encode(
        csv.encode("utf-8")
    ).decode("ascii")
    first_state = state_of(sync())
    second_state = state_of(next_step({**first_state, "file": data_uri}))
    mappings = second_state["mappings"]
    assert len(mappings) == 2
    # nothing auto-mapped — the user edits the target-field cells in the grid
    assert all(m["targetField"] == "" for m in mappings)
    mappings[0]["targetField"] = "name"
    mappings[1]["targetField"] = "units"

    third_state = state_of(next_step(second_state))
    assert third_state["validRows"] == 2
    assert third_state["invalidRows"] == 0

    next_step(third_state)
    assert [p.name for p in imported] == ["Teclado", "Raton"]
    assert [p.units for p in imported] == [4, 7]


# ── CSV parser unit tests ────────────────────────────────────────────────────────
def test_csv_parser_handles_quotes_doubled_quotes_embedded_newlines_and_blank_lines():
    rows = parse_csv('a,b\n"1,5","say ""hi"""\r\n\n"multi\nline",x\r')
    assert rows == [["a", "b"], ["1,5", 'say "hi"'], ["multi\nline", "x"]]


def test_csv_parser_detects_the_semicolon_separator_on_the_first_line_outside_quotes():
    assert detect_separator("a;b;c\n1,2;3\n") == ";"
    assert detect_separator("a,b,c\n") == ","
    assert detect_separator('"a;b",c\n') == ","  # ; inside quotes ignored
    assert parse_csv("Producto;Cantidad\nTeclado;4\n") == [
        ["Producto", "Cantidad"],
        ["Teclado", "4"],
    ]
