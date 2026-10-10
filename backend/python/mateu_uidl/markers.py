"""Field markers used inside ``Annotated[...]`` (the Python analogue of Java's field annotations)."""

from __future__ import annotations

from dataclasses import dataclass
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


@dataclass(frozen=True)
class Tab:
    name: str
    # When true this tab is the one selected when its strip first renders (instead of the default
    # first tab). If several tabs in the same strip set it, the first one wins.
    open: bool = False


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
    ``mateu_uidl.components.Text``, which is a component you compose, not a field marker."""

    container: str = "p"
    size: str = "m"
    no_margins: bool = False


@dataclass(frozen=True)
class Inline:
    """On a field holding a routed VIEW (an embedded island): the island renders without its own
    page chrome — its title drops to a sub-heading, no badges/KPIs — so it blends into the host
    section or tab (Java's ``@Inline`` on an embedded orchestrator field)."""


@dataclass(frozen=True)
class Colspan:
    """How many form columns the field spans (Java's ``@Colspan``). Without it a field spans one
    column, except the intrinsically wide ones — grids, textareas, rich text, html and markdown —
    which span the whole row of a multi-column form."""

    value: int


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
    min_height_when_detail_visible: str = "16rem;"


@dataclass(frozen=True)
class SeparatorBefore:
    """Paints a horizontal divider line (``<hr>``) above the field, occupying the full form
    width — for separating groups of contents inside a section or form without starting a new
    section. The fluent counterpart is ``mateu_uidl.components.Separator``."""


@dataclass(frozen=True)
class BulletedList:
    """Renders a collection field (typically ``list[str]``) as a plain read-only bulleted list
    (``<ul>``). Shorthand for the "bulletedList" stereotype; the fluent counterpart is
    ``mateu_uidl.components.BulletedList``."""


@dataclass(frozen=True)
class Signature:
    """Signature capture on a str field: a drawing canvas whose accepted strokes land in the
    value as a PNG data URI (same self-contained contract as the uploadable image)."""


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
    (Python analogue of Java's @FileUpload.)"""

    accept: str = ""


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


class Aggregate:
    """Aggregates a listing column over the WHOLE filtered result set (not just the visible
    page): the listing shows a totals footer with the computed value, and when combined with
    ``GroupBy`` each group's subtotal row shows the per-group value too. The Python analogue of
    Java's ``@Aggregate``."""

    def __init__(self, function: AggregateFunction = AggregateFunction.sum):
        self.function = function


class Tooltip:
    """On a listing row's field: hovering the field's CELL shows the text of another field of the
    same row — e.g. ``rate: Annotated[float, Tooltip("rate_breakdown")]`` shows the per-night
    breakdown on the rate cell. Line breaks in that text are kept. The Python analogue of Java's
    ``@Tooltip`` (the column's wire ``tooltip_path``, camelCased like every column id)."""

    def __init__(self, value: str):
        self.value = value


class PrimaryColumn:
    """Marks a listing/CRUD row field as the rich "primary" column (coherence-plan #6): its value is
    the cell title, with an optional secondary caption line (``caption`` — another field's name) and
    an optional leading avatar/icon (``leading``). Sets the column's stereotype to "primary" and its
    caption_path/leading_path. The Python analogue of Java's ``@PrimaryColumn``."""

    def __init__(self, caption: str | None = None, leading: str | None = None):
        self.caption = caption
        self.leading = leading


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


class TreeSelect:
    """Renders the field's dropdown as a TREE: the options carry children (supply them from the
    view's ``options(field_name)`` method). With ``leaves_only=True`` only leaves select."""

    def __init__(self, leaves_only: bool = False):
        self.leaves_only = leaves_only


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
