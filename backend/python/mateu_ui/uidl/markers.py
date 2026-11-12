"""Field markers used inside ``Annotated[...]`` (the Python analogue of Java's field annotations)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import ClassVar
from enum import Enum


# ── Field markers (used inside Annotated[...]) ─────────────────────────────────
@dataclass(frozen=True)
class Required:
    """Marks a field as required (validated server-side on save)."""


@dataclass(frozen=True)
class Label:
    value: str


@dataclass(frozen=True)
class Section:
    caption: str
    #: Assigns the section to a @zones column (zones lay sections out side by side);
    #: unrecognised zones fall into a trailing flexible column.
    zone: str = ""
    #: When true the section renders as a property list: every data field becomes a read-only
    #: row (plain-text value, label left / value right, divider between rows) stacked in a
    #: single column. (Python analogue of Java's @Section(propertyList=true).)
    property_list: bool = False
    #: When true the section is not framed: no card wrapper and no padding — its content sits
    #: bare on the page. For bands whose content brings its own chrome. (Python analogue of
    #: Java's @Section(frameless=true).)
    frameless: bool = False
    #: Section affordances (the Redwood section edit / add / view-more actions): the NAME of an
    #: action method of the form. ``edit_action`` / ``add_action`` render as small tertiary "Edit"
    #: / "Add" buttons on the section's title row, ``view_more_action`` as "View more" under its
    #: content. Empty = none. (Python analogue of Java's @Section(editAction, addAction,
    #: viewMoreAction).)
    edit_action: str = ""
    add_action: str = ""
    view_more_action: str = ""
    #: Pins the section's card (``position: sticky``) while the rest of the form scrolls; several
    #: sticky sections stack under the page header (Java's @Section(sticky=true)).
    sticky: bool = False
    #: The section's own column count; 0 = the form's (declared or inferred). ``columns=1``
    #: stacks this section's fields on a form whose other sections keep two columns (Java's
    #: @Section(columns)).
    columns: int = 0
    #: Extra CSS for the section's content (Java's @Section(style)).
    style: str = ""


@dataclass(frozen=True)
class Tab:
    name: str
    # When true this tab is the one selected when its strip first renders (instead of the default
    # first tab). If several tabs in the same strip set it, the first one wins.
    open: bool = False
    #: The tab's URL key: the page's route followed by it opens this tab (``/vcn/7/gateways``
    #: opens Gateways) — Java's @Tab(key); it travels as the tab's ``routeKey``.
    key: str | None = None
    #: A feature flag (optionally negated with ``!``): the tab is offered only while it is on
    #: (a :class:`~mateu_ui.uidl.FeatureFlags` answers it) — Java's @Tab(show).
    show: str | None = None
    #: The key combination that selects the tab (``"alt+1"``) — in place, no round trip. Same
    #: syntax as an action shortcut (Java's @Tab(shortcut)).
    shortcut: str = ""


@dataclass(frozen=True)
class Subresource:
    """A field whose type is a listing or crud rendered as one of the record's SUB-RESOURCES: an
    embedded listing with its own title, help line, filters, paging and actions, inside one of the
    page's tabs — several stacked in the same tab when they name it (Java's @Subresource).

    ``tab`` is matched against the page's ``Tab``s by key or label; none matching opens a new tab
    (labelled with it, its key kebab-cased); empty = a tab of its own named after the field.
    ``order`` places it among the sub-resources of the same tab, ``help`` is a line under its
    title, ``load`` is ``"ON_OPEN"`` (fetched when its tab opens, the default) or ``"EAGER"``
    (fetched with the page, its row count on the tab), ``show`` a feature flag, ``show_title``
    whether it draws its title (dropped anyway when it only repeats the tab or the page), and
    ``context`` explicit bindings ``"listingField=hostField"``. The listing gets the parent as
    CONTEXT, not as filters the user can remove: the route's path parameters, the host's simple
    fields its listing also has, and the bindings."""

    tab: str = ""
    order: int = 0
    help: str = ""
    load: str = "ON_OPEN"
    show: str | None = None
    show_title: bool = True
    context: tuple[str, ...] = ()


@dataclass(frozen=True)
class Stereotype:
    value: str


@dataclass(frozen=True)
class Multiline:
    """Renders the field as a multi-line text area."""


@dataclass(frozen=True)
class Password:
    """Renders the field as a password input."""


@dataclass(frozen=True)
class Money:
    """Tags a numeric field as a formatted currency amount."""


@dataclass(frozen=True)
class Text:
    """Renders the field's VALUE as a sized text instead of an input — a heading-like caption
    driven by the state (the Python analogue of Java's ``@Text`` field annotation). It travels as a
    ``Text`` component whose text is ``${state.<field>}``, so it follows the value client-side.
    ``container`` is the HTML element (``p``, ``h1``…``h6``, ``div``…), ``size`` one of
    ``xl``/``l``/``m``/``s``/``xs``. Not to be confused with the FLUENT
    ``mateu_ui.uidl.components.Text``, which is a component you compose, not a field marker."""

    container: str = "p"
    size: str = "m"
    no_margins: bool = False


@dataclass(frozen=True)
class Inline:
    """Java's ``@Inline``, with two meanings decided by the field's TYPE.

    On a field holding a plain DATA object (a nested form): its fields expand straight into the
    section, with ids prefixed ``<field>-`` (``supplier-name``); in a multi-section form the nested
    class's ``@toolbar`` methods sit on the section's title row and its ``@button`` methods below
    the content, dispatched as ``nested-form-action-<field>-<method>`` and run on the nested object.
    Without ``Inline()`` such a field renders as a sub-form in an outlined card.

    On a field holding a routed VIEW (an embedded island): the island renders without its own
    page chrome — its title drops to a sub-heading, no badges/KPIs — so it blends into the host
    section or tab (Java's ``@Inline`` on an embedded orchestrator field)."""


@dataclass(frozen=True)
class Colspan:
    """How many form columns the field spans (Java's ``@Colspan``). Without it a field spans one
    column, except the intrinsically wide ones — grids, textareas, rich text, html and markdown —
    which span the whole row of a multi-column form."""

    value: int


@dataclass(frozen=True)
class Help:
    """The field's help text (Java's ``@Help``): shown with the control and read as its
    accessible description. Travels as the field's ``description``."""

    value: str


@dataclass(frozen=True)
class Autocomplete:
    """The purpose of a field about the user (Java's ``@Autocomplete``; WCAG 1.3.5): an HTML
    autocomplete token such as ``"email"``, ``"given-name"``, ``"tel"``, ``"postal-code"`` or
    ``"new-password"``, or ``"off"``. An email field gets ``"email"`` without it. Travels as the
    field's ``autocomplete``."""

    value: str


@dataclass(frozen=True)
class SliderMin:
    """Lower bound of a slider field (Java's ``@SliderMin``; 0 by default)."""

    value: int


@dataclass(frozen=True)
class SliderMax:
    """Upper bound of a slider field (Java's ``@SliderMax``; 100 by default)."""

    value: int


@dataclass(frozen=True)
class Details:
    """On a field of a grid's ROW type: the row's detail — what opens under the row, behind a
    button, instead of a column of its own. The grid carries the field's camelCase name as its
    ``detailPath`` and sets ``useButtonForDetail`` (Java's ``@Details`` on a row field)."""


@dataclass(frozen=True)
class DetailForm:
    """Customises a grid field's row editor (Java's ``@DetailFormCustomisation`` +
    ``@MasterDetail``): where it opens (``right``/``left``/``top``/``bottom``/``modal``), its column
    count (0 = the row type's own), CSS and theme, and the min height the grid keeps while the
    editor shows."""

    position: str = "right"
    columns: int = 0
    style: str | None = None
    theme: str | None = None
    min_height_when_detail_visible: str = "16rem"


@dataclass(frozen=True)
class SeparatorBefore:
    """Paints a horizontal divider line (``<hr>``) above the field, occupying the full form
    width — for separating groups of contents inside a section or form without starting a new
    section. The fluent counterpart is ``mateu_ui.uidl.components.Separator``."""


@dataclass(frozen=True)
class BulletedList:
    """Renders a collection field (typically ``list[str]``) as a plain read-only bulleted list
    (``<ul>``). Shorthand for the "bulletedList" stereotype; the fluent counterpart is
    ``mateu_ui.uidl.components.BulletedList``."""


@dataclass(frozen=True)
class Signature:
    """Signature capture on a str field: a drawing canvas whose accepted strokes land in the
    value as a PNG data URI (same self-contained contract as the uploadable image)."""


@dataclass(frozen=True)
class PhotoCapture:
    """Photo capture on a str field: the device camera, storing the shot in the value as a JPEG
    data URI (file-input fallback opens the native camera on phones)."""


@dataclass(frozen=True)
class FileUpload:
    """Renders a str field as a generic file upload: a pick-file action showing the chosen file's
    name plus a remove action (the generic sibling of the uploadable image). The picked file is
    read client-side into a data URI (base64) stored as the field value, so the file travels in
    the string itself and no upload endpoint is required. Shorthand for the "fileUpload"
    stereotype. ``accept`` (e.g. ".csv") travels in the field's generic attributes list.
    (Python analogue of Java's @FileUpload.)

    With a ``FileStorage`` registered (EXPERIMENTAL) the file is streamed to the store instead and
    the value is a ``mateu-file:`` reference (``StoredFile.parse``). ``max_bytes`` = the most ONE
    file may weigh (0 = the server default, 100 MB with a store, 10 MB as a data URI);
    ``multiple`` = several files, the value is a list (inferred for a ``list[str]`` field);
    ``storage`` = the ``FileStorage.name`` to use (blank = the default store);
    ``FileUpload.INLINE`` (``"inline"``, reserved) = never through a store: the field keeps the
    data-URI value even when stores are registered (for code that reads the bytes from the value)."""

    #: the reserved storage name of a field that always keeps its file inline, as a data URI
    INLINE: ClassVar[str] = "inline"

    accept: str = ""
    max_bytes: int = 0
    multiple: bool = False
    storage: str = ""


@dataclass(frozen=True)
class RestOptions:
    """Fills a field's select options from an arbitrary (non-Mateu) REST endpoint, fetched
    CLIENT-SIDE: the renderer calls ``url`` directly (no Mateu server mediating), navigates
    ``items_path`` to the array in the JSON response and maps each item via
    ``value_path``/``label_path``. The field renders as a select. ``url``/``headers``/``body``
    support ``${state.x}`` interpolation. Python analogue of Java's @RestOptions."""

    url: str = ""
    method: str = "GET"
    headers: tuple[str, ...] = ()  #: "Name: Value" strings (values interpolated)
    body: str = ""
    items_path: str = ""  #: dot path to the response array; blank means the root IS the array
    value_path: str = "value"
    label_path: str = "label"
    proxy: bool = False  #: fetch through the Mateu server (no CORS, ${secret.X} injected server-side)
    #: the name of a catalogue entry (@rest_source / sources.yaml) to take the endpoint from; the
    #: values declared here still win over the entry's (Java's @RestOptions(source=…))
    source: str = ""


@dataclass(frozen=True)
class RangeFilter:
    """On a numeric field of a Crud entity: the listing filter becomes a min-max RANGE widget
    (the bounds travel as <field>_from/<field>_to state keys) instead of an equality input.
    Temporal fields are ranges by default; numerics opt in with this."""


class AggregateFunction(Enum):
    """Aggregate computed over a listing column (see ``Aggregate``). The member names are the
    wire values (mirrors ``io.mateu.uidl.data.AggregateFunction``)."""

    sum = "sum"
    avg = "avg"
    min = "min"
    max = "max"
    count = "count"


@dataclass(frozen=True)
class Aggregate:
    """Aggregates a listing column over the WHOLE filtered result set (not just the visible
    page): the listing shows a totals footer with the computed value, and when combined with
    ``GroupBy`` each group's subtotal row shows the per-group value too. The Python analogue of
    Java's ``@Aggregate``."""

    function: AggregateFunction = AggregateFunction.sum

    def __post_init__(self) -> None:
        if not isinstance(self.function, AggregateFunction):
            try:
                object.__setattr__(self, "function", AggregateFunction(self.function))
            except ValueError:
                raise ValueError(
                    f"Aggregate(function={self.function!r}) is not one of: "
                    + ", ".join(repr(f.value) for f in AggregateFunction)
                ) from None


@dataclass(frozen=True)
class Tooltip:
    """On a listing row's field: hovering the field's CELL shows the text of another field of the
    same row — e.g. ``rate: Annotated[float, Tooltip("rate_breakdown")]`` shows the per-night
    breakdown on the rate cell. Line breaks in that text are kept. The Python analogue of Java's
    ``@Tooltip`` (the column's wire ``tooltip_path``, camelCased like every column id)."""

    value: str


@dataclass(frozen=True)
class PrimaryColumn:
    """Marks a listing/CRUD row field as the rich "primary" column (coherence-plan #6): its value is
    the cell title, with an optional secondary caption line (``caption`` — another field's name) and
    an optional leading avatar/icon (``leading``). Sets the column's stereotype to "primary" and its
    caption_path/leading_path. The Python analogue of Java's ``@PrimaryColumn``."""

    caption: str | None = None
    leading: str | None = None


@dataclass(frozen=True)
class GroupBy:
    """Groups the listing rows by this column: the column becomes the implicit primary sort so
    rows of the same value are contiguous, and the grid renders a group subtotal row whenever
    the value changes — showing the group value, its row count over the WHOLE filtered set, and
    the per-group value of every ``Aggregate()`` column. One ``GroupBy()`` column per row class.
    The Python analogue of Java's ``@GroupBy``."""


@dataclass(frozen=True)
class RowStatus:
    """Marks the field of a listing ROW whose value tones the whole row — a reservation due out,
    a room out of order, a charge in dispute. The value names the tone: ``success``,
    ``warning``, ``danger`` (also ``error``), ``info`` or ``neutral``; for an enum its member
    name (lower-cased) is used, so an enum whose members are those tones works as is. Any other
    value leaves the row untoned. One per row class — first declared wins. Travels as
    ``CrudMetadata.row_status_field``. The Python analogue of Java's ``@RowStatus``."""


@dataclass(frozen=True)
class TreeSelect:
    """Renders the field's dropdown as a TREE: the options carry children (supply them from the
    view's ``options(field_name)`` method). With ``leaves_only=True`` only leaves select."""

    leaves_only: bool = False


@dataclass(frozen=True)
class PlainText:
    """Renders the field as read-only plain text."""


@dataclass(frozen=True)
class ReadOnly:
    """On a field of an ``@inline_editing`` Crud entity: keeps that column display-only while the
    rest edit in place. The field-level analogue of Java's ``@ReadOnly``."""


@dataclass(frozen=True)
class Version:
    """Optimistic locking on an int field of a Crud entity: a save whose version is older than
    the stored one (someone else saved in between) is rejected with a reload/overwrite conflict
    dialog instead of persisting, and every successful save bumps the version by one. The
    dialog's overwrite button re-dispatches the save with ``_forceOverwrite``, adopting the
    stored version before the bump so a stale number is never resurrected. No-op for entities
    without a ``Version()`` field. The Python analogue of Java's ``@Version``."""


@dataclass(frozen=True)
class UseRadioButtons:
    """Renders an enum field as radio buttons instead of the default dropdown, regardless of how
    many members the enum has. The Python analogue of Java's ``@UseRadioButtons``."""


@dataclass(frozen=True)
class Hidden:
    """Hides the field while the client-side ``value`` expression is truthy, re-evaluated on
    every state change without a server round-trip — e.g. ``Hidden("!state.special")`` shows the
    field only when ``special`` is set. The Python analogue of Java's ``@Hidden``."""

    value: str = ""


@dataclass(frozen=True)
class Disabled:
    """Renders the field permanently disabled (visible but not editable). The Python analogue of
    Java's ``@Disabled``."""


@dataclass(frozen=True)
class OnRowSelected:
    """On a grid (list-of-rows) field: runs the named method when the user selects (clicks) a
    row — the clicked row is injected into a method parameter annotated with the row class.
    Works on read-only grids, so it is the way to build master/detail. Optional ``shortcut``
    (e.g. ``"ctrl+shift"``) lets the base combo plus a digit select the row by position. The
    Python analogue of Java's ``@OnRowSelected``."""

    value: str
    shortcut: str = ""


@dataclass(frozen=True)
class Rule:
    """A client-side rule (the uidl mirror of ``io.mateu.uidl.data.Rule``): while ``filter`` is
    truthy the renderer applies ``action`` — most commonly SetDataValue of a field attribute
    (hidden, disabled, required…) to the value of ``expression``, both evaluated against the live
    state."""

    filter: str
    action: str
    field_name: str | None = None
    field_attribute: str | None = None
    value: object | None = None
    expression: str | None = None
    result: str = "Continue"
    action_id: str | None = None

    @staticmethod
    def hide(field_name: str, expression: str) -> "Rule":
        """Hide ``field_name`` while ``expression`` is truthy."""
        return Rule("true", "SetDataValue", field_name, "hidden", None, expression)

    @staticmethod
    def disable(field_name: str, expression: str = "true") -> "Rule":
        """Disable ``field_name`` while ``expression`` is truthy."""
        return Rule("true", "SetDataValue", field_name, "disabled", None, expression)


@dataclass(frozen=True)
class ContentSlot:
    """A hole for managed content (help texts, notices, editorial blocks) filled by the content
    service (EXPERIMENTAL): the field — whose value is irrelevant — renders as a micro frontend the
    HOST resolves while it builds the view, against the registered content remote, at the route
    the key names; the developer never writes the url. It never blocks the screen: an empty slot or
    a content service that is down, slow or failing paints ``fallback`` (nothing when blank), and,
    unlike a plain micro frontend, it does not degrade to the renderer asking unless
    ``degrade_to_client``. ``key`` is ``application.screen.name`` (lower case letters, digits and
    dashes, dot-separated, at least three segments), unique in the application — checked when the
    view is registered. The Python analogue of Java's ``@ContentSlot``; the fluent twin is
    ``mateu_ui.uidl.components.ContentSlot``."""

    key: str
    fallback: str = ""
    #: How long the host waits for the content; 0 = the content remote's default.
    timeout_ms: int = 0
    #: Optional description for the content editors (the backoffice).
    description: str = ""
    degrade_to_client: bool = False


# -- Listing / CRUD visibility markers (Java's @MainFilter, @HiddenInList/View/Editor/Create) --


@dataclass(frozen=True)
class MainFilter:
    """On a field of a listing's filters class (or a Crud entity): the filter the smart search bar
    shows first, prominently (Java's ``@MainFilter``)."""


@dataclass(frozen=True)
class HiddenInList:
    """On a Crud entity field: no column for it in the listing (nor in its exports). Java's
    ``@HiddenInList``."""


@dataclass(frozen=True)
class HiddenInView:
    """On a Crud entity field: not shown on the record's read-only view. Java's ``@HiddenInView``."""


@dataclass(frozen=True)
class HiddenInEditor:
    """On a Crud entity field: no input for it on the EDIT form. Java's ``@HiddenInEditor``."""


@dataclass(frozen=True)
class HiddenInCreate:
    """On a Crud entity field: no input for it on the CREATE form (an id the store assigns, ...).
    Java's ``@HiddenInCreate``."""


# ── Page blocks: the page's avatar, header and footer (Java @Avatar / @Header / @Footer) ──────
@dataclass(frozen=True)
class Avatar:
    """On a COMPONENT field (e.g. a ``components.Avatar``): the page's avatar block
    (``PageMetadata.avatar``), never drawn in the form body. The first one wins. Java's
    ``@Avatar``; an :class:`~mateu_ui.uidl.AvatarSupplier` wins over it."""


@dataclass(frozen=True)
class Header:
    """On a COMPONENT field: one of the page's header blocks (``PageMetadata.header``), never drawn
    in the form body. Java's ``@Header``; a :class:`~mateu_ui.uidl.HeaderSupplier` wins over it."""


@dataclass(frozen=True)
class Footer:
    """On a COMPONENT field: one of the page's footer blocks (``PageMetadata.footer``), never drawn
    in the form body. Java's ``@Footer``; a :class:`~mateu_ui.uidl.FooterSupplier` wins over it."""


# ── Listing column options (Java @ColumnWidth / @Priority / @Line / @Style) ───────────────────
@dataclass(frozen=True)
class ColumnWidth:
    """On a listing row's field: a FIXED column width (``"9rem"``) — the column keeps it instead
    of growing with its longest cell, and its cells show their own text on hover (Java's
    ``@ColumnWidth``)."""

    value: str


@dataclass(frozen=True)
class Priority:
    """On a listing row's field: the column's priority (lower = more important; renderers drop
    the least important first when space runs out); ``identifier=True`` marks the column that
    names the row (Java's ``@Priority``)."""

    value: int
    identifier: bool = False


@dataclass(frozen=True)
class Line:
    """On a listing row's field: the line of a multi-line list item the column goes on (Java's
    ``@Line``)."""

    value: int


@dataclass(frozen=True)
class Style:
    """Inline CSS of the field: on a form field, the field and its wrapper; on a listing row's
    field, the column (Java's field ``@Style``). The class-level twin is ``@style``."""

    value: str


@dataclass(frozen=True)
class DivStyle:
    """Inline CSS of the div AROUND a form field (its ``attributes`` entry ``divStyle``; Java's
    ``@DivStyle``)."""

    value: str


@dataclass(frozen=True)
class OptionsLayout:
    """How many columns a field's options (radio buttons, checkboxes) are laid out in (Java's
    ``@OptionsLayout``)."""

    columns: int = 1


@dataclass(frozen=True)
class Notice:
    """On a ``str`` field: renders the field's VALUE as an inline notice (a compact themed strip,
    the fluent ``Notice``) — its text is ``${state.<field>}``, so a blank value hides it (Java's
    ``@Notice`` field marker). ``theme``: info | success | warning | danger."""

    theme: str = "info"
    icon: str = ""
    slim: bool = False
    full_width: bool = False
    action_label: str = ""
    action_id: str = ""


# ── Mapped row values (Java @Status(mappings) / @MappedValue) ──────────────────────────────────
@dataclass(frozen=True)
class Status:
    """On a listing row's field: the value becomes a status chip — ``mappings`` maps a raw value
    to a status type (NONE | INFO | SUCCESS | WARNING | DANGER), ``default`` for any other; the
    chip's text is the value humanised (Java's ``@Status(mappings, defaultStatus)``)."""

    mappings: dict
    default: str = "NONE"

    def __hash__(self):  # dict is unhashable: hash by its items
        return hash((tuple(sorted(self.mappings.items())), self.default))


@dataclass(frozen=True)
class MappedValue:
    """On a listing row's field: the value is shown MAPPED — ``mappings`` maps a raw value to the
    text shown, ``default`` for any other (Java's ``@MappedValue``)."""

    mappings: dict
    default: str = ""

    def __hash__(self):
        return hash((tuple(sorted(self.mappings.items())), self.default))


# ── Server-owned values (Java @GeneratedValue / @EditableOnlyWhenCreating) ────────────────────
@dataclass(frozen=True)
class GeneratedValue:
    """The server generates the field's value: read-only, and a CREATION form starts with what
    ``generator`` produces — a class with a ``generate()`` method (Java's ``ValueGenerator``,
    instantiated per form), or any callable. On a save the client's copy is kept on a create (the
    server handed it out) and the stored one on an edit (Java's ``@GeneratedValue``)."""

    generator: object

    def generate(self):
        g = self.generator
        if isinstance(g, type):
            g = g()
        if hasattr(g, "generate"):
            return g.generate()
        return g()


@dataclass(frozen=True)
class EditableOnlyWhenCreating:
    """Editable on a creation form only: read-only on an edit, and a save of an edit keeps the
    stored value whatever the client sends (Java's ``@EditableOnlyWhenCreating``)."""
