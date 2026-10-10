"""Method-level decorators (the analogue of Java's method annotations: @Button, @Action, @Menu, @KPI, @Fab, ...)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .class_decorators import (
    _Banner,
    _Fab,
    _ListToolbarButton,
)
from .messages import BannerTheme


# ── Method-level decorators ────────────────────────────────────────────────────
def _maybe_bare(arg, attr: str, build):
    """Supports both ``@deco`` and ``@deco("label")`` forms for method decorators."""
    if callable(arg) and not isinstance(arg, str):  # used bare: arg is the method
        setattr(arg, attr, build(None))
        return arg

    def deco(fn):
        setattr(fn, attr, build(arg))
        return fn

    return deco


def button(arg=None):
    return _maybe_bare(arg, "__mateu_button__", lambda label: label or True)


def action(arg=None):
    """Declares a method as a server-side ACTION without rendering a button for it: the target
    of an undoable toast (``Message.undoable``'s undo action id), of a returned ``RunAction``
    flow step, a drawer/dialog opener fired from client code… Only declared actions can be
    invoked from the wire — a method that is neither marked (``@action``/``@button``/``@fab``,
    ``@list_toolbar_button`` for bulk row actions) nor advertised by the view (an
    ``OnRowSelected`` value, a ``@subscribe_to`` action, an action id of its component tree) is
    NOT an action. Supports ``@action`` and ``@action()``. The Python analogue of Java's
    ``@Action``."""
    return _maybe_bare(arg, "__mateu_action__", lambda _: True)


def menu_item(
    arg=None,
    group: str = "",
    description: str = "",
    icon: str = "",
    image: str = "",
):
    """A menu entry. ``group`` nests the entry under that folder (entries sharing a group become
    its submenu); empty = a top-level leaf entry. A ``/`` in the group nests folders
    (``"Bookings/Reservations"`` = the Reservations folder inside Bookings). ``description``,
    ``icon`` and ``image`` are the entry's look when it shows as a card (its group is a
    ``@menu_group(..., display="cards")``)."""
    if group or description or icon or image:
        label = arg if isinstance(arg, str) else None

        def deco(fn):
            fn.__mateu_menu_item__ = label or True
            fn.__mateu_menu_group__ = group
            fn.__mateu_menu_look__ = MenuLook(description=description, icon=icon, image=image)
            return fn

        return deco
    return _maybe_bare(arg, "__mateu_menu_item__", lambda label: label or True)


class MenuDisplay:
    """How a menu group shows its entries (the values of ``@menu_group(display=...)``). The
    Python analogue of Java's ``MenuDisplay``."""

    list = "list"
    cards = "cards"


@dataclass(frozen=True)
class MenuLook:
    """The card look of a menu entry or folder: ``display`` ("cards" on a group), and the
    ``description``/``icon``/``image`` of an entry shown as a card. The Python analogue of Java's
    ``MenuPresentation``."""

    display: str = ""
    description: str = ""
    icon: str = ""
    image: str = ""


def menu_group(
    group: str, display: str = "", description: str = "", icon: str = "", image: str = ""
) -> Callable[[type], type]:
    """The look of a menu folder declared through ``@menu_item(group=...)``, on the ``@app`` class.
    ``display="cards"`` opens the folder as a panel of CARDS (title, description, icon/image, and
    each entry's own children as the card's actions) instead of the usual list — like the product
    menus of a docs site. ``description``/``icon``/``image`` style the folder itself when it is a
    card of an enclosing cards group (``"Bookings/Reservations"`` addresses a nested folder).
    Repeatable. The Python analogue of Java's ``@Menu(display, description, image)`` + ``@Icon``
    on a group field."""

    def deco(cls: type) -> type:
        looks = dict(getattr(cls, "__mateu_menu_groups__", {}))
        looks.setdefault(
            group.strip("/"),
            MenuLook(display=display, description=description, icon=icon, image=image),
        )
        cls.__mateu_menu_groups__ = looks
        return cls

    return deco


class kpi:
    """A KPI: usable BOTH as a method decorator (``@kpi("Amount")``) and as a field marker
    (``Annotated[str, kpi("Amount")]``). As a decorator it stamps ``__mateu_kpi__`` on the method;
    as a marker its instance is found in the field's Annotated metadata. Either way the field/method
    value becomes a header KPI and is hoisted out of the form body (Java parity)."""

    def __init__(self, title_: str):
        self.title = title_

    def __call__(self, fn):
        fn.__mateu_kpi__ = self.title
        return fn


def fab(icon: str, label: str | None = None, order: int = 0):
    def deco(fn):
        fn.__mateu_fab__ = _Fab(icon, label, order)
        return fn

    return deco


def action_options(timeout_millis: int = 0, idempotent: bool = False):
    """Per-action transport knobs. Composes with ``@button``/``@toolbar``/``@fab`` on the same
    method — it says nothing about the UI, only how the CLIENT should call this action.

    ``timeout_millis``: how long to wait before giving up (0 = the client default, 60s). One
    global ceiling cannot serve both a type-ahead lookup, which should give up in seconds so the
    user can retype, and a report export, which may legitimately run for minutes.

    ``idempotent``: re-running this action cannot apply the same change twice, so the client may
    retry it by itself after a transient network failure. Only for genuine reads or naturally
    idempotent writes — when a request times out the client does NOT know whether the server
    processed it, so marking a create idempotent risks a silent duplicate.
    """

    def deco(fn):
        fn.__mateu_action_options__ = (timeout_millis, idempotent)
        return fn

    return deco


def banner(theme: BannerTheme = BannerTheme.INFO, title_: str | None = None):
    def deco(fn):
        fn.__mateu_banner__ = _Banner(theme, title_)
        return fn

    return deco


def shortcut(keys: str):
    def deco(fn):
        fn.__mateu_shortcut__ = keys
        return fn

    return deco


def drag_rows(drag_type: str) -> Callable[[type], type]:
    """Class-level: the rows of the decorated listing (a ``Listing[Row]`` / Crud) can be DRAGGED
    onto a :class:`~mateu_uidl.components.DropZone` accepting ``drag_type`` — the selected rows, or
    the one under the pointer. The drop runs the zone's action with ``_draggedIds`` and
    ``_dragType``. Python analogue of Java's @DragRows."""

    def deco(cls: type) -> type:
        cls.__mateu_drag_rows__ = drag_type
        return cls

    return deco


def list_toolbar_button(arg=None, confirmation_required: bool = False, rows_selected_required: bool = True):
    """A toolbar button on a Crud LISTING running the decorated method as a BULK action over the
    rows selected in the grid. The frontend keeps the selection in the ``crud_selected_items``
    component state key and blocks the dispatch while ``rows_selected_required`` and nothing is
    selected; on the server a ``list[Row]``-annotated parameter receives the selected rows
    rebuilt as typed entities. Returning None re-runs the search so the listing reflects the
    changes. Supports ``@list_toolbar_button``, ``@list_toolbar_button("Label")`` and keyword
    flags (mirrors Java's @ListToolbarButton)."""
    return _maybe_bare(
        arg,
        "__mateu_list_toolbar_button__",
        lambda label: _ListToolbarButton(label, confirmation_required, rows_selected_required),
    )


def wizard_completion_action(label: str = "Finish"):
    """Marks the wizard method that COMPLETES it (Java's ``@WizardCompletionAction``): the
    penultimate step shows a primary ``label`` button running it (instead of Next), and the LAST
    step becomes the read-only result screen shown after it ran — progress at 100%, no navigation
    buttons. The method reads the bound state of every step and may set the result step's fields;
    a returned ``Message`` is shown as well. Without it, the last step's Finish runs
    ``complete()``."""

    def deco(fn):
        fn.__mateu_wizard_completion__ = label
        return fn

    return deco


def group_action(label: str):
    """Marks a listing / crud method as an action on a ``GroupBy()`` group (Java's
    ``@GroupAction``): the grid renders a ``label`` button on every group header row, dispatching
    ``action-on-row-<method>`` with the clicked group's value in ``_groupValue``. A parameter named
    ``group_value`` receives it."""

    def deco(fn):
        fn.__mateu_group_action__ = label
        return fn

    return deco
