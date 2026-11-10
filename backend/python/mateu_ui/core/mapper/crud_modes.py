"""Which crud record form is being drawn, so ``HiddenInView`` / ``HiddenInEditor`` /
``HiddenInCreate`` drop their fields from it (Java's FormFieldFilter.hiddenInView / hiddenInEditor)."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar

from mateu_ui.uidl import HiddenInCreate, HiddenInEditor, HiddenInView, ReadOnly, Version

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
    """The submitted state minus what the form did not let the user write — a field it did not
    render (HiddenInCreate() on a create, HiddenInEditor() on an edit) or rendered read-only
    (ReadOnly() on the field or the record class) — so a crafted request cannot write it (Java's
    ClientWritableFields). The Version() field stays: the save compares it."""
    from ..naming import camel_case
    from ..reflection import class_flag, view_fields

    from mateu_ui.uidl.markers import EditableOnlyWhenCreating, GeneratedValue

    marker = HiddenInCreate if creating else HiddenInEditor
    read_only_record = bool(class_flag(element, "__mateu_read_only__", False))
    owned = [
        f for f in view_fields(element)
        if f.has(marker)
        or ((read_only_record or f.has(ReadOnly)) and not f.has(Version))
        # the server's own values: a GeneratedValue() on an edit (the stored one stands; on a
        # create the client keeps the copy the server handed out) and an
        # EditableOnlyWhenCreating() on an edit
        or (not creating and (f.has(GeneratedValue) or f.has(EditableOnlyWhenCreating)))
    ]
    names = {camel_case(f.name) for f in owned} | {f.name for f in owned}
    if not names or not state:
        return state
    # a nested record also arrives flattened, as <field>-<key>
    return {k: v for k, v in state.items() if k.split("-", 1)[0] not in names}


def current_mode() -> str | None:
    """The crud record form being drawn ("view" | "edit" | "new"), None outside one."""
    return _mode.get()


def server_owned(f, creating: bool) -> bool:
    """Whether the server owns the field's value on this form (Java's PageFormBuilder.isReadOnly
    for these two markers): a ``GeneratedValue()`` always (read-only), an
    ``EditableOnlyWhenCreating()`` on anything but a creation form."""
    from mateu_ui.uidl.markers import EditableOnlyWhenCreating, GeneratedValue

    return f.has(GeneratedValue) or (not creating and f.has(EditableOnlyWhenCreating))


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
