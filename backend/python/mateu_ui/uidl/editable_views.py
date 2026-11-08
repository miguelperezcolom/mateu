"""Editable views and master-detail views — the Python analogue of Java's ``EditableView`` /
``AutoEditableView`` / ``MasterDetailView`` orchestrators.

An :class:`EditableView` is a READ view with an Edit toolbar button that flips it into an editor and
back: ``edit`` shows the editor (route ``…/edit``), ``save`` saves it and lands on the view again
(``…/view``) with a "Saved successfully" toast and ``MarkAsClean``, ``cancel-edit`` goes back to
the view. A read-only view (``@read_only`` on the class, or :meth:`EditableView.read_only`
answering ``True``) draws no Edit button AND refuses ``edit`` / ``save`` / the ``…/edit`` route
(403), like Java's ``checkEditable``. Embedded as an island (a host field holding it, ``Inline()``
optional) the toggle happens in place: no ``PushStateToHistory`` leaks to the host.

Port idiom: Java's mediator re-renders from a state ``_route``; here each action answers the new
page in place (the same ServerSide component replaced), which is what the island machinery already
does for a view returning ``self``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Generic, TypeVar

V = TypeVar("V")
E = TypeVar("E")
T = TypeVar("T")


class EditableView(Generic[V, E]):
    """A read view (:meth:`view`) with an editor (:meth:`editor`) the Edit toolbar button opens.

    ``http_request`` is the request in flight (set by the handler before any method runs), the
    port's analogue of Java's ``HttpRequest`` parameter."""

    http_request = None

    def view(self) -> V:
        raise NotImplementedError("an EditableView implements view()")

    def editor(self) -> E:
        raise NotImplementedError("an EditableView implements editor()")

    def save(self, editor: E) -> None:
        """Persist what the user typed: ``editor`` is the :meth:`editor` object with the submitted
        form state bound onto it (Java's ``save(HttpRequest)`` reads that state itself)."""
        raise NotImplementedError("an EditableView implements save(editor)")

    def read_only(self) -> bool:
        """Whether the view can be edited at all (default: the class carries ``@read_only``).
        A read-only view shows no Edit button and refuses ``edit``/``save``/``…/edit`` (403)."""
        return bool(getattr(type(self), "__mateu_read_only__", False))


class AutoEditableView(EditableView[T, T], Generic[T]):
    """An :class:`EditableView` whose view and editor are the SAME object, loaded by :meth:`load`
    and saved by :meth:`persist` (Java's ``AutoEditableView<T>``). The submitted state is
    re-checked against the object's constraints on the server before :meth:`persist` runs."""

    def load(self) -> T:
        raise NotImplementedError("an AutoEditableView implements load()")

    def persist(self, entity: T) -> None:
        raise NotImplementedError("an AutoEditableView implements persist(entity)")

    def view(self) -> T:
        return self.load()

    def editor(self) -> T:
        return self.load()

    def save(self, editor: T) -> None:
        self.persist(editor)


@dataclass(frozen=True)
class DetailPart:
    """Marks a field of a :class:`MasterDetailView` as a DETAIL PART: shown in the detail pane only
    while its button is selected (Java's ``@DetailPart(label, key, order)``)."""

    label: str = ""
    key: str = ""
    order: int = 0


class NoSelection:
    """What a :class:`MasterDetailView` shows before a part is picked (Java's ``NoSelection``)."""

    FIRST = "FIRST"
    NONE = "NONE"


class MasterDetailView:
    """A master pane (the always-visible fields) and a button bar selecting one of several detail
    parts — fields marked :class:`DetailPart` — shown on demand without reloading the master (Java's
    ``MasterDetailView``). Populate the fields in :meth:`load`.

    The button bar dispatches ``__md_pick:<key>``; the selected part's button is primary, the others
    tertiary. Port idiom: the pick re-renders the page in place with the part selected (Java emits
    an event its own subscription turns into a route change), and the selection rides the state
    (``_mdPart``) and the route (``…/__md/<key>``)."""

    http_request = None

    def load(self) -> None:
        """Populate the section fields (master + parts). Called on every (re)render."""

    def no_selection(self) -> str:
        return NoSelection.FIRST

    def title(self) -> str | None:
        """Page title; None = the class ``@title`` / name."""
        return None

    def header(self) -> list:
        """Optional components rendered full-width above the panes (read after :meth:`load`)."""
        return []


__all__ = [
    "AutoEditableView",
    "DetailPart",
    "EditableView",
    "MasterDetailView",
    "NoSelection",
]
