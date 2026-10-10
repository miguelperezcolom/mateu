"""Lookups, selector markers, links and page-placement markers (header badge, timestamp, aside, wizard step, panel)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Lookup:
    """A remote, search-as-you-type reference field: renders a combo box whose options come from
    the server page by page — the view (or crud) answers the field's ``search-<fieldId>`` action
    from its ``options(field_name)`` method, filtered by the typed text. Use it when the option
    set is too large to embed in the form. The Python analogue of Java's ``@Lookup``."""


class Searchable:
    """Two roles, mirroring the two ``Searchable`` of Java (interface + annotation):

    1. **Listing capability (base class)** — declaring it on a :class:`Listing` shows the
       free-text search box, and the typed text arrives as ``SearchRequest.search_text``. A
       listing that does not declare it shows no search box and always receives an empty
       ``search_text``. The Python analogue of ``io.mateu.uidl.interfaces.Searchable``.

    2. **Field marker (``Annotated`` instance)** — a reference field picked through a full
       selector DIALOG instead of a combo: clicking the field fires ``codesearch-<fieldId>``,
       which opens the given ``selector`` — a :class:`Listing` with the :class:`Selector`
       mixin — in a modal; selecting a row writes its (id, label) back into the field and
       closes the dialog. The Python analogue of Java's ``@Searchable`` annotation."""

    def __init__(self, selector: type | None = None):
        self.selector = selector


@dataclass(frozen=True)
class LinkTo:
    """Renders a navigation icon at the right side of the field that takes the user to the given
    URL or route. ``href``/``title`` travel verbatim and support ``${...}`` state expressions
    interpolated client-side, so the link follows the value as the user edits the form. For a
    programmatic alternative implement :class:`LinkSupplier` on the view class (it takes
    precedence over this marker). The Python analogue of Java's ``@LinkTo``."""

    href: str
    icon: str = ""
    title: str = ""
    target: str = ""


@dataclass(frozen=True)
class NavLink:
    """Navigation link rendered as an icon at the right side of a form field (see :class:`LinkTo`
    and :class:`LinkSupplier`). ``href``/``title`` may carry ``${...}`` expressions, interpolated
    client-side against the live component state. The Python analogue of Java's ``NavLink``."""

    href: str
    icon: str | None = None
    title: str | None = None
    target: str | None = None


@dataclass(frozen=True)
class HeaderBadge:
    color: str = "normal"


@dataclass(frozen=True)
class Timestamp:
    """Marks the field whose value is shown as the page's "last updated" timestamp in the header
    (the Oracle Redwood timestamp header element). The value is rendered as text; a ``None`` value
    hides it, and the field is excluded from the form body. The Python analogue of Java's
    ``@Timestamp``."""

    label: str = ""


@dataclass(frozen=True)
class Aside:
    """Marks a component-holder field as the contextual ASIDE of the page: it is pulled out of the
    form body and placed beside the rest of the form in a ContentLayout — the form becomes the main
    region, the ``Aside()`` field the aside region. The minimal way to compose the Redwood
    content-page grammar from a plain form. The Python analogue of Java's ``@Aside``."""

    #: Which side the aside sits on: "start" or "end".
    position: str = "end"
    #: CSS width of the aside column; None/blank = renderer default.
    width: str | None = None
    #: Whether the aside is pinned while the main region scrolls.
    sticky: bool = True


@dataclass(frozen=True)
class Step:
    step: int


@dataclass(frozen=True)
class Panel:
    """Marks a component-holding field of a ``Dashboard`` / ``Foldout`` / ``ItemOverview`` /
    ``Welcome`` archetype as a titled panel (the Python analogue of Java's ``@Panel``)."""

    title: str = ""
    subtitle: str = ""
    col_span: int = 1
    row_span: int = 1
    #: Icon shown on the panel strip (foldout pages).
    icon: str = ""
    #: Whether the panel starts folded out (foldout pages).
    open: bool = True
