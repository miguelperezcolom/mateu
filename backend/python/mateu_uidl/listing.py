"""Crud, listings and their capabilities, paging and typed filters (Java's Crud / Listing / Searchable / Filterable / Navigable / Editable / Creatable / Deletable)."""

from __future__ import annotations

from dataclasses import (
    dataclass,
    field as dataclass_field,
)
from datetime import date
from typing import (
    Generic,
    Iterable,
    TypeVar,
)

from .messages import T


# ── Base classes ───────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class SortSpec:
    """One sort criterion of a listing request."""

    field: str
    descending: bool = False


@dataclass(frozen=True)
class Pageable:
    """The page a listing request asks for (0-based page, page size, sort criteria)."""

    page: int = 0
    size: int = 10
    sort: tuple[SortSpec, ...] = ()


@dataclass(frozen=True)
class PageResult:
    """One page of results plus the total count — what a database-backed ``Crud.find`` returns
    (run the count + page queries inside)."""

    content: list
    total_elements: int


class Crud(Generic[T]):
    """Base for a CRUD view of ``T`` (the analogue of Java's AutoCrud / C#'s Crud<T>)."""

    #: Subclasses set the element type, or it is inferred from ``Crud[Foo]``.
    element_type: type | None = None

    def fetch(self, search: str | None) -> Iterable[T]:
        raise NotImplementedError

    def find(self, search_text: str | None, filters: dict, pageable: Pageable) -> PageResult | None:
        """Database pushdown: override to run the search+filter+sort+paginate as ONE query
        (count + page inside) and return the page with its real total — the framework then skips
        its in-memory pipeline entirely. Filters arrive as the raw component state (camelCase
        keys; range bounds as ``<field>_from``/``<field>_to``, multi-selects as value lists).
        Default ``None`` = keep the in-memory ``fetch`` pipeline. The Python analogue of Java's
        ``CrudRepository.find``."""
        return None

    def get(self, id: str) -> T | None:
        for e in self.fetch(None):
            if self.id_of(e) == id:
                return e
        return None

    def save(self, entity: T) -> None:  # noqa: D401 - override to store
        ...

    def delete(self, id: str) -> None:  # override to store
        ...

    def csv_exportable(self) -> bool:
        """Override to return True and the listing toolbar offers "Export CSV" (action
        ``export-csv``), which downloads the WHOLE filtered result set (search text + smart
        search bar filters) as a CSV file, one column per visible entity field. The analogue of
        Java's ``Listing.csvExportable`` on an AutoCrud (Excel/PDF have no exporter in this
        port)."""
        return False

    @staticmethod
    def id_of(entity) -> str | None:
        v = getattr(entity, "id", None)
        return None if v is None else str(v)


@dataclass(frozen=True)
class DateRange:
    """A from/to date interval for TYPED filter fields on declarative listings: declare a
    ``DateRange`` field in the Filters class and the smart search bar renders a from–to date
    widget; on search the ``<field>_from``/``<field>_to`` state keys are assembled back into a
    ``DateRange``, so ``search(...)`` receives it ready to apply. Either bound may be ``None``
    (open-ended). The Python analogue of ``io.mateu.uidl.data.DateRange``."""

    from_: "date | None" = None
    to: "date | None" = None

    @property
    def is_empty(self) -> bool:
        return self.from_ is None and self.to is None

    def contains(self, value) -> bool:
        """True when ``value`` falls inside the interval (``None`` bounds open)."""
        if value is None:
            return False
        return (self.from_ is None or value >= self.from_) and (self.to is None or value <= self.to)


@dataclass(frozen=True)
class NumberRange:
    """A min/max numeric interval for TYPED filter fields on declarative listings (the numeric
    counterpart of :class:`DateRange`)."""

    from_: "float | None" = None
    to: "float | None" = None

    @property
    def is_empty(self) -> bool:
        return self.from_ is None and self.to is None

    def contains(self, value) -> bool:
        if value is None:
            return False
        return (self.from_ is None or value >= self.from_) and (self.to is None or value <= self.to)


@dataclass(frozen=True)
class SelectedItem:
    """The item a :class:`Selector` reports as chosen: its id (stored as the field value) and
    its human label (shown next to it). The Python analogue of
    ``io.mateu.uidl.interfaces.SelectedItem``."""

    id: object
    label: str


class Selector:
    """Mixin for a :class:`Listing` that acts as a ``Searchable()`` field's selector dialog: the
    listing opens in a modal, every row shows a Select button, and ``selected`` maps the clicked
    row to the (id, label) pair written back into the field. The Python analogue of Java's
    ``Selector``."""

    def selected(self, row) -> SelectedItem:
        raise NotImplementedError


F = TypeVar("F")
R = TypeVar("R")
D = TypeVar("D")
E = TypeVar("E")
C = TypeVar("C")
I = TypeVar("I")  # noqa: E741 - the record id type, mirroring Java's <Id>


@dataclass(frozen=True)
class SearchRequest:
    """Everything a listing search receives, in one object: the free-text ``search_text``
    (populated when the listing is :class:`Searchable`), the hydrated ``filters`` object (when
    it is :class:`Filterable` — read it typed via ``Filterable.filters(request)``), the
    range/multi-select ``criteria`` the filters object cannot carry, and the :class:`Pageable`
    (page/size/sort). Adding a new search input in the future means adding a component here —
    the ``search(request, http)`` signature never changes. The Python analogue of
    ``io.mateu.uidl.data.SearchRequest``."""

    search_text: str = ""
    filters: object | None = None
    criteria: tuple = ()
    pageable: Pageable = dataclass_field(default_factory=Pageable)


@dataclass(frozen=True)
class ListingData:
    """What a listing search returns: the ``Row`` objects plus an optional real total. With
    ``total_elements`` set the framework treats ``rows`` as the already-paged window (database
    pushdown); left ``None`` the framework sorts and paginates ``rows`` in memory. The Python
    analogue of ``io.mateu.uidl.data.ListingData``."""

    rows: list
    total_elements: int | None = None

    @staticmethod
    def of(rows: Iterable) -> "ListingData":
        return ListingData(rows=list(rows))


class Listing(Generic[R]):
    """A listing: rows shown as a searchable, sortable, paginated grid. Implement
    ``search(request, http)`` to return the ``Row`` objects (a :class:`ListingData`, or any
    iterable) — that alone gives you the listing with column sorting and pagination; the Row
    type's fields become the columns.

    Every further feature is an optional capability, activated by DECLARING it as an extra
    base class:

    - :class:`Searchable` — free-text search box (``request.search_text``)
    - :class:`Filterable` ``[F]`` — filter bar built reflectively from ``F``
      (``self.filters(request)``)
    - :class:`Navigable` ``[Detail, Id]`` — rows open a read-only detail (``/:id``)
    - :class:`Editable` ``[Editor, Id]`` — records can be edited; WITHOUT :class:`Navigable`
      the editor opens in a drawer over the listing (the "editable listing" idiom)
    - :class:`Creatable` ``[Form, Id]`` — the New button + create form (``/new``)
    - :class:`Deletable` ``[Id]`` — row selection + the Delete button

    A listing with none of them is just the table. :class:`Crud` is simply a listing with all
    the capabilities; the Python analogue of Java's ``Listing<Row>`` + capability interfaces."""

    def search(self, request: SearchRequest, http=None) -> "ListingData | Iterable[R]":
        """The rows matching the request (``http`` — the inbound action request — is optional
        in overrides: implement ``search(self, request)`` if you don't need it)."""
        raise NotImplementedError

    def grid_layout(self) -> str:
        """The grid layout the renderer uses: ``"auto"`` (renderer decides), ``"table"``,
        ``"list"``, ``"cards"``, ``"masterDetail"`` or ``"tree"`` — tree shows hierarchical rows
        whose row type carries a self-referential children list, and is never auto-selected. The
        Python analogue of ``ListingBackend.gridLayout``."""
        return "auto"


class Filterable(Generic[F]):
    """Input capability: declaring it on a :class:`Listing` shows the filter bar, built
    reflectively from the ``F`` filters type — each field becomes a filter widget
    (``DateRange``/``NumberRange``/``set[SomeEnum]`` fields render range and multi-select
    widgets). The hydrated filters object travels inside the :class:`SearchRequest`; read it
    typed via :meth:`filters`. A listing that does not declare ``Filterable`` shows no filter
    bar and receives ``None`` filters. The filters type comes from the generic argument, or
    from the ``filters_class`` class attribute."""

    #: Explicit filters type; overrides the ``Filterable[F]`` generic argument when set.
    filters_class = None

    def filters(self, request: SearchRequest):
        """The hydrated filters object carried by the request, typed."""
        return request.filters


class Navigable(Generic[D, I]):
    """Interaction capability: declaring it on a :class:`Listing` makes rows clickable —
    clicking opens the read-only detail page (``/:id``) rendered from the object :meth:`view`
    returns."""

    def view(self, id, http=None) -> D:
        raise NotImplementedError


class Editable(Generic[E, I]):
    """Interaction capability: declaring it on a :class:`Listing` makes records editable — the
    detail gains an Edit button opening the form :meth:`edit` returns (``/:id/edit``), and
    submitting it calls :meth:`save` with the form state hydrated into an ``Editor`` instance.
    WITHOUT :class:`Navigable`, the editor opens in a DRAWER over the listing instead of
    navigating (the "editable listing" idiom, like ``@edit_in_drawer`` cruds)."""

    def edit(self, id, http=None) -> E:
        raise NotImplementedError

    def save(self, editor: E, http=None):
        """Persists the submitted edit-form state and returns the record id."""
        raise NotImplementedError


class Creatable(Generic[C, I]):
    """Interaction capability: declaring it on a :class:`Listing` adds the New button — it
    opens the blank (or pre-populated) form :meth:`creation_form` returns (``/new``), and
    submitting it calls :meth:`create` with the form state hydrated into a ``Form`` instance."""

    def creation_form(self, http=None) -> C:
        raise NotImplementedError

    def create(self, form: C, http=None):
        """Persists the submitted creation-form state and returns the new record's id."""
        raise NotImplementedError


class Deletable(Generic[I]):
    """Interaction capability: declaring it on a :class:`Listing` enables row selection and the
    Delete button — deleting calls :meth:`delete_all_by_id` with the selected ids."""

    def delete_all_by_id(self, selected_ids: list, http=None) -> None:
        raise NotImplementedError
