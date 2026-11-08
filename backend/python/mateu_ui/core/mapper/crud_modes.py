"""Which crud record form is being drawn, so ``HiddenInView`` / ``HiddenInEditor`` /
``HiddenInCreate`` drop their fields from it (Java's FormFieldFilter.hiddenInView / hiddenInEditor)."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar

from mateu_ui.uidl import HiddenInCreate, HiddenInEditor, HiddenInView

#: "view" | "edit" | "new" while a crud record form is mapped; None otherwise.
_mode: ContextVar[str | None] = ContextVar("mateu_crud_form_mode", default=None)


@contextmanager
def crud_form_mode(mode: str):
    token = _mode.set(mode)
    try:
        yield
    finally:
        _mode.reset(token)


def without_hidden_inputs(element, state: dict, creating: bool) -> dict:
    """The submitted state minus the fields the form did not render — HiddenInCreate() on a create,
    HiddenInEditor() on an edit — so a crafted request cannot write them (Java's
    ClientWritableFields)."""
    from ..naming import camel_case
    from ..reflection import view_fields

    marker = HiddenInCreate if creating else HiddenInEditor
    hidden = {camel_case(f.name) for f in view_fields(element) if f.has(marker)}
    hidden |= {f.name for f in view_fields(element) if f.has(marker)}
    if not hidden or not state:
        return state
    return {k: v for k, v in state.items() if k not in hidden}


def hidden_in_current_form(f) -> bool:
    """Whether the field has no place in the crud record form being drawn."""
    mode = _mode.get()
    if mode == "view":
        return f.has(HiddenInView)
    if mode == "edit":
        return f.has(HiddenInEditor)
    if mode == "new":
        return f.has(HiddenInCreate)
    return False
