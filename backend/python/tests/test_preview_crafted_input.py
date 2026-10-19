"""N4: a crafted definition an anonymous caller can preview — a Partial with no ref, list items
written as ``null`` — answers cleanly AND logs no ERROR with a stack (Java's
``ReservedAuthoringActionsSyncTest.craftedNullsAndARefLessPartialLogNoError``): otherwise every such
request floods the log."""

import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402

CRAFTED = [
    "type: Partial\n",
    "type: VerticalLayout\ncontent:\n  - type: Partial\n",
    "type: VerticalLayout\ncontent:\n  - null\n  - type: Text\n    text: a\n",
    "type: MatrixGrid\ncolumns: []\nsections:\n  - title: s\n    rows: [null]\n",
    "type: MatrixGrid\nsections: [null]\n",
    "type: RecordMerge\nrecords: [null]\nfields: [null]\n",
    "type: PlanningBoard\nresources: [null]\nblocks: [null]\n",
    "type: FoldoutLayout\npanels: [null]\n",
    "type: ActionPanel\ncategories: [null]\n",
]


@pytest.mark.parametrize("yaml_text", CRAFTED)
def test_a_crafted_preview_logs_no_error(yaml_text, caplog):
    caplog.set_level(logging.WARNING)
    inc = SyncHandler(MateuRegistry(sys.modules[__name__])).handle(
        RunActionRq(route="", consumed_route="_empty", action_id="__preview__", parameters={"_yaml": yaml_text})
    )
    assert inc is not None
    errors = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert errors == [], [(r.getMessage(), r.exc_info is not None) for r in errors]
