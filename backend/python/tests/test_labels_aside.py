"""Sync tests for the labels-aside inference — the Python mirror of Java's
``LabelsAsideInference`` fixtures: labels aside only for dense (>= 6 fields) single-column
forms of short-labelled (<= 20 chars), single-line widgets; the explicit
``@form_layout(labels_aside=ASIDE|TOP)`` always wins — asserted as the ``labelsAside`` flag on
the FormLayout wire metadata a real sync request produces.
"""

import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Label,
    LabelsAsideMode,
    Stereotype,
    form_layout,
    title,
    ui,
)


@ui("aside-six-one-col")
@title("Six one col")
@form_layout(columns=1)
class SixFieldsOneColumnForm:
    """(a) Dense single-column form of short-labelled single-line widgets: labels aside."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    zip_code: str = "z"


@ui("aside-six-two-col")
@title("Six two col")
class SixFieldsTwoColumnsForm:
    """(b) Same shape but the default two columns: labels stay on top."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    zip_code: str = "z"


@ui("aside-three-one-col")
@title("Three one col")
@form_layout(columns=1)
class ThreeFieldsOneColumnForm:
    """(c) Single column but under the density threshold (6 fields): labels on top."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"


@ui("aside-long-label")
@title("Long label")
@form_layout(columns=1)
class LongLabelForm:
    """(d) One 26-char label does not fit the aside label column: labels on top."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    tag_line: Annotated[str, Label("Twenty six character label")] = "t"


@ui("aside-textarea")
@title("Textarea")
@form_layout(columns=1)
class TextareaForm:
    """(e) A textarea is a tall widget needing the field's full width: labels on top."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    notes: Annotated[str, Stereotype("textarea")] = ""


@ui("aside-explicit-aside")
@title("Explicit aside")
@form_layout(columns=2, labels_aside=LabelsAsideMode.ASIDE)
class ExplicitAsideForm:
    """(f) The explicit ASIDE wins over the inference (two columns would keep labels on top)."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    zip_code: str = "z"


@ui("aside-explicit-top")
@title("Explicit top")
@form_layout(columns=1, labels_aside=LabelsAsideMode.TOP)
class ExplicitTopForm:
    """(g) The explicit TOP wins over the inference (the shape alone would infer aside)."""

    name: str = "n"
    email: str = "e"
    phone: str = "p"
    city: str = "c"
    country: str = "co"
    zip_code: str = "z"


MODULE = sys.modules[__name__]


# ── Helpers ─────────────────────────────────────────────────────────────────────
def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def walk(node):
    """Every component dict in the tree, descending children AND metadata content (Card/Div nest
    their content inside the metadata record, like the Java wire)."""
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def form_layouts(root) -> list[dict]:
    return [
        c["metadata"]
        for c in walk(root)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == "FormLayout"
    ]


# ── Inference (AUTO) ────────────────────────────────────────────────────────────
def test_six_fields_single_column_infers_labels_aside():
    (layout,) = form_layouts(component_tree(SixFieldsOneColumnForm))
    assert layout["labelsAside"] is True
    assert layout["maxColumns"] == 1


def test_six_fields_two_columns_keep_labels_on_top():
    (layout,) = form_layouts(component_tree(SixFieldsTwoColumnsForm))
    assert layout["labelsAside"] is False
    assert layout["maxColumns"] == 2


def test_under_six_fields_keeps_labels_on_top():
    (layout,) = form_layouts(component_tree(ThreeFieldsOneColumnForm))
    assert layout["labelsAside"] is False


def test_a_label_over_twenty_chars_keeps_labels_on_top():
    assert len("Twenty six character label") == 26
    (layout,) = form_layouts(component_tree(LongLabelForm))
    assert layout["labelsAside"] is False


def test_a_textarea_widget_keeps_labels_on_top():
    (layout,) = form_layouts(component_tree(TextareaForm))
    assert layout["labelsAside"] is False


# ── Explicit mode wins ──────────────────────────────────────────────────────────
def test_explicit_aside_wins_over_the_two_column_default():
    (layout,) = form_layouts(component_tree(ExplicitAsideForm))
    assert layout["labelsAside"] is True
    assert layout["maxColumns"] == 2


def test_explicit_top_wins_over_the_inference():
    (layout,) = form_layouts(component_tree(ExplicitTopForm))
    assert layout["labelsAside"] is False
