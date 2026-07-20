"""Public API for defining Mateu views in Python.

Class shape is expressed with plain type hints; field modifiers ride in ``Annotated[...]`` metadata;
class- and method-level features are decorators. Mirrors the C# ``Mateu.Uidl`` attributes.

Example::

    from typing import Annotated
    from mateu_uidl import ui, title, button, Section, Required, Message

    @ui("person")
    @title("Person")
    class Person:
        name: Annotated[str | None, Required(), Section("Identity")] = None
        age: int = 0

        @button()
        def save(self) -> Message: return Message(f"Saved {self.name}")
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import date
from enum import Enum
from typing import Callable, Generic, Iterable, TypeVar

T = TypeVar("T")


# ── User-facing data types ─────────────────────────────────────────────────────
class MessageVariant(Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CONTRAST = "contrast"


class Message:
    """Returned from an action method to show a toast. A message can carry an UNDO action
    (:meth:`undoable`): the toast renders an Undo button that dispatches ``undo_action_id``
    (with ``undo_parameters`` as action parameters) on the initiator component — the standard
    recoverability affordance after destructive or bulk actions. The undo method is a plain
    action of the same class (it must reverse the effect itself, e.g. restore a soft-deleted
    row). The Python analogue of ``io.mateu.uidl.data.Message``."""

    def __init__(
        self,
        text: str,
        variant: MessageVariant = MessageVariant.SUCCESS,
        title: str = "",
        duration: int = 5000,
        undo_label: str | None = None,
        undo_action_id: str | None = None,
        undo_parameters: dict | None = None,
    ):
        self.text = text
        self.variant = variant
        self.title = title
        self.duration = duration
        self.undo_label = undo_label
        self.undo_action_id = undo_action_id
        self.undo_parameters = undo_parameters

    @staticmethod
    def undoable(text: str, undo_action_id: str, undo_parameters: dict | None = None) -> "Message":
        """A toast with an Undo button dispatching the given action (10 s so there is time to
        react)."""
        return Message(
            text,
            variant=MessageVariant.CONTRAST,
            duration=10000,
            undo_label="Deshacer",
            undo_action_id=undo_action_id,
            undo_parameters=undo_parameters,
        )


class BannerTheme(Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    DANGER = "DANGER"


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


@dataclass(frozen=True)
class GroupBy:
    """Groups the listing rows by this column: the column becomes the implicit primary sort so
    rows of the same value are contiguous, and the grid renders a group subtotal row whenever
    the value changes — showing the group value, its row count over the WHOLE filtered set, and
    the per-group value of every ``Aggregate()`` column. One ``GroupBy()`` column per row class.
    The Python analogue of Java's ``@GroupBy``."""


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


@dataclass(frozen=True)
class Identity:
    """The caller's identity, as the framework adapter resolves it (e.g. from the JWT Bearer
    token): the dimensions EyesOnly/ReadOnlyUnless/DisabledUnless match against. The Python
    analogue of what Java's Authorizer reads."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class EyesOnly:
    """HIDES the field (form and listing columns) unless the caller is authorized. Matching is
    AND across declared dimensions, OR within each; nothing declared → unrestricted; no identity
    → unauthorized. The Python analogue of Java's ``@EyesOnly`` on fields."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class ReadOnlyUnless:
    """The field is READ-ONLY unless the caller is authorized. Composes with ``EyesOnly()`` for
    layered access. The Python analogue of Java's ``@ReadOnlyUnless``."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


@dataclass(frozen=True)
class DisabledUnless:
    """The field (or a ``@button`` method, via ``disabled_unless``) is DISABLED unless the
    caller is authorized. The Python analogue of Java's ``@DisabledUnless``."""

    roles: tuple[str, ...] = ()
    groups: tuple[str, ...] = ()
    scopes: tuple[str, ...] = ()
    permissions: tuple[str, ...] = ()


def disabled_unless(roles=(), groups=(), scopes=(), permissions=()):
    """Method decorator: the button is disabled unless the caller is authorized."""

    def deco(fn):
        fn.__mateu_disabled_unless__ = DisabledUnless(
            roles=tuple(roles), groups=tuple(groups), scopes=tuple(scopes),
            permissions=tuple(permissions),
        )
        return fn

    return deco


class Audience:
    """PERSONA PROJECTION: the field is shown only when the CURRENT AUDIENCE — the app-state
    value under the ``"audience"`` key, i.e. the ``@app_context`` selector named audience — is
    unset (no projection active → everything visible) or is one of the declared values
    (case-sensitive). NOT a security boundary (the data still travels to any client that clears
    the selector) — a UX projection aid; combine with ``EyesOnly()`` for real access control.
    The Python analogue of Java's ``@Audience``. On ``@button``/``@menu_item`` methods use the
    ``audience(...)`` decorator instead."""

    def __init__(self, *audiences: str):
        self.audiences = tuple(audiences)


def audience(*audiences: str):
    """Method decorator: the ``@button``/``@menu_item`` entry is shown only when the current
    audience is unset or one of ``audiences`` (the method-level form of ``Audience(...)``)."""

    def deco(fn):
        fn.__mateu_audience__ = Audience(*audiences)
        return fn

    return deco


class LookupLabelSupplier:
    """Resolves the display label of a reference field's PRE-EXISTING value: when a form loads
    with a ``Lookup()``/``Searchable()`` field already set, the framework asks the view (or the
    ``Searchable()`` selector) for the label so the raw id is never shown. The Python analogue of
    Java's ``LookupLabelSupplier``."""

    def label(self, field_name: str, id) -> str | None:
        raise NotImplementedError


@dataclass(frozen=True)
class InlineEditing:
    """On a grid (list-of-rows) field: cells edit in place (``ReadOnly()`` row fields stay
    display-only) and the committed rows accumulate in the form state, travelling with the next
    save. The field-level face of Java's ``@InlineEditing``."""


class RuleSupplier:
    """Implemented by a view to contribute programmatic client-side rules (the Python analogue of
    Java's ``RuleSupplier``); they complement the ``Hidden()``/``Disabled()`` marker-derived
    rules."""

    def rules(self) -> list[Rule]:
        raise NotImplementedError


@dataclass(frozen=True)
class AppHeaderAction:
    """An action button rendered on the app header, next to the ``@app_context`` selectors.
    ``action_id`` names the method of the app class to invoke (its camelCase wire id); ``icon``
    is an optional icon name. An action with ``children`` renders as a dropdown menu instead of a
    button: only the children dispatch. The Python analogue of Java's ``AppHeaderAction``."""

    action_id: str | None = None
    label: str = ""
    icon: str | None = None
    children: list["AppHeaderAction"] | None = None

    @staticmethod
    def menu(label: str, icon: str | None, children: list["AppHeaderAction"]) -> "AppHeaderAction":
        """A dropdown of actions under one header button."""
        return AppHeaderAction(action_id=None, label=label, icon=icon, children=children)


class AppActionsSupplier:
    """Implemented by an app shell to contribute action buttons to the app header, next to the
    ``@app_context`` selectors. Evaluated on every shell build, so actions can appear and
    disappear with server-side state. The Python analogue of Java's ``AppActionsSupplier``."""

    def app_actions(self) -> list[AppHeaderAction]:
        raise NotImplementedError


@dataclass
class AppNotification:
    """One entry of the app shell's notification inbox (the header bell): a title, an optional
    detail text, an optional route the entry navigates to when clicked, the unread flag driving
    the bell's counter, and a human "when" caption. Serialized to the wire as
    ``{id, title, text, route, unread, when}``. The Python analogue of
    ``io.mateu.uidl.data.AppNotification``."""

    id: str
    title: str
    text: str | None = None
    route: str | None = None
    unread: bool = True
    when: str | None = None


class NotificationsSupplier:
    """Implemented by the ``@app`` class to give the shell a NOTIFICATION INBOX: a bell on the
    header with the unread count, opening a panel that lists :class:`AppNotification` s. The list
    is fetched per request (the ``_notifications-list`` app-level action), so it can be per-user
    — resolve the user from the request. Clicking an entry navigates to its route and marks it
    read; the panel's "mark all read" calls :meth:`mark_notifications_read` with all the unread
    ids. The Python analogue of Java's ``NotificationsSupplier``."""

    def notifications(self, request) -> list[AppNotification]:
        raise NotImplementedError

    def mark_notifications_read(self, ids: list[str], request) -> None:
        raise NotImplementedError


@dataclass
class GlobalSearchResult:
    """One hit of the app-wide entity search (the command palette's data results): a label, an
    optional secondary line, the route to navigate to, and an optional category caption used to
    group the palette's results ("Clientes", "Reservas"…). The Python analogue of
    ``io.mateu.uidl.data.GlobalSearchResult``."""

    label: str
    description: str | None = None
    route: str | None = None
    category: str | None = None


class GlobalSearchSupplier:
    """Implemented by the ``@app`` class to make the command palette (⌘K) search DATA, not just
    the menu: while the user types, the palette also asks the server for matching entities
    through the app-level ``_globalsearch`` action and shows the hits (grouped by category)
    alongside the navigation results; picking one navigates to its route. Keep it fast — search
    indexes or top-N per category. The Python analogue of Java's ``GlobalSearchSupplier``."""

    def global_search(self, search_text: str) -> list[GlobalSearchResult]:
        raise NotImplementedError


@dataclass(frozen=True)
class Lookup:
    """A remote, search-as-you-type reference field: renders a combo box whose options come from
    the server page by page — the view (or crud) answers the field's ``search-<fieldId>`` action
    from its ``options(field_name)`` method, filtered by the typed text. Use it when the option
    set is too large to embed in the form. The Python analogue of Java's ``@Lookup``."""


@dataclass(frozen=True)
class Searchable:
    """A reference field picked through a full selector DIALOG instead of a combo: clicking the
    field fires ``codesearch-<fieldId>``, which opens the given selector — a :class:`Listing`
    with the :class:`Selector` mixin — in a modal; selecting a row writes its (id, label) back
    into the field and closes the dialog. The Python analogue of Java's ``@Searchable``."""

    selector: type


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


# ── Method-level feature descriptors (set by decorators) ───────────────────────
@dataclass(frozen=True)
class _Banner:
    theme: BannerTheme
    title: str | None


@dataclass(frozen=True)
class PageBanner:
    """An action-returned page banner (shown below the header). Return one, or a list, from an
    @action/@toolbar method."""
    theme: BannerTheme = BannerTheme.INFO
    title: str | None = None
    description: str | None = None
    closeable: bool = False
    timeout_seconds: int = 0


@dataclass(frozen=True)
class _Fab:
    icon: str
    label: str | None
    order: int


@dataclass(frozen=True)
class _ListToolbarButton:
    label: str | None
    confirmation_required: bool
    rows_selected_required: bool


# ── Class-level decorators ─────────────────────────────────────────────────────
def ui(route: str = "") -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_ui__ = route
        return cls

    return deco


def title(value: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_title__ = value
        return cls

    return deco


def wizard_progress(style: str) -> Callable[[type], type]:
    """Chooses how a Wizard visualizes its progress: "bar" (default) or "steps" — connected
    step bullets (the ProgressSteps component). (Python analogue of Java's @WizardProgress.)"""

    def deco(cls: type) -> type:
        cls.__mateu_wizard_progress__ = style
        return cls

    return deco


class PageWidth(Enum):
    """How a page's content column is sized within the viewport (the first parameter of the
    Oracle Redwood page templates): FIXED caps the column (1408px in Redwood) and centers it,
    FULL_WIDTH keeps the side margins but never caps, EDGE_TO_EDGE touches the viewport edges
    (full-bleed canvases such as gantt charts or planning boards). The member values are the
    wire names. The Python analogue of Java's PageWidthStyle."""

    FIXED = "fixed"
    FULL_WIDTH = "fullWidth"
    EDGE_TO_EDGE = "edgeToEdge"


def page_width(width: PageWidth) -> Callable[[type], type]:
    """Class-level: explicitly sets how the page's content column is sized within the viewport
    (the first parameter of the Oracle Redwood page templates). When absent the renderer infers
    the width from the page content (full-bleed canvases → edge-to-edge, dense inline-editing
    datagrids → full width, anything else → fixed). The Python analogue of Java's @PageWidth."""

    def deco(cls: type) -> type:
        cls.__mateu_page_width__ = width.value if isinstance(width, PageWidth) else width
        return cls

    return deco


class PageType(Enum):
    """The coarse page type — which family of Oracle Redwood page templates the view belongs
    to: LANDING (welcome / hero-search pages), COLLECTION (cruds, listings, smart searches, todo
    lists, calendars, collection details), DETAIL (foldouts, item/general overviews), FORM (a
    plain reflected form), PROCESS (guided wizards) or DASHBOARD. The member values are the
    wire names. The Python analogue of Java's PageType."""

    LANDING = "landing"
    COLLECTION = "collection"
    DETAIL = "detail"
    FORM = "form"
    PROCESS = "process"
    DASHBOARD = "dashboard"


def page_template(page_type: PageType) -> Callable[[type], type]:
    """Class-level: explicitly sets the view's coarse page type (the family of Oracle Redwood
    page templates the renderer picks from). When absent the backend infers the type from the
    view's shape (archetype base class, a MetricCard field, plain form). The explicit template
    always wins over the inference. The Python analogue of Java's @PageTemplate."""

    def deco(cls: type) -> type:
        cls.__mateu_page_type__ = (
            page_type.value if isinstance(page_type, PageType) else page_type
        )
        return cls

    return deco


def welcome_banner(title: str = "", subtitle: str = "", image: str = "") -> Callable[[type], type]:
    """Class-level: prepends the Redwood "Welcome Banner" element to the page content — a
    centered HeroSection (id "welcome-banner") with the given title (empty → the page title),
    subtitle and background image. The Python analogue of Java's ``@WelcomeBanner``."""

    def deco(cls: type) -> type:
        cls.__mateu_welcome_banner__ = (title, subtitle, image)
        return cls

    return deco


def subtitle(value: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_subtitle__ = value
        return cls

    return deco


def app(
    title_: str,
    variant: str = "",
    command_center: bool = False,
    chromeless: bool = False,
) -> Callable[[type], type]:
    """Application shell. ``variant`` = "" for auto (Java's @App(AUTO) decision table: grouped
    menu → MENU_ON_TOP, more than 7 top-level entries → HAMBURGUER_MENU, flat leaf menu → TABS),
    or an explicit TABS | MENU_ON_TOP | MENU_ON_LEFT | HAMBURGUER_MENU | TILES, which always
    wins.

    ``command_center=True`` shows the always-present command-center FAB (the Ask-Oracle pattern):
    a floating button opening a full-screen palette that unifies navigation, global entity search
    (when the app implements ``GlobalSearchSupplier``), recent screens and the AI assistant.
    ``chromeless=True`` additionally drops the nav chrome — the command center becomes the only
    navigation, so it implies ``command_center``."""

    def deco(cls: type) -> type:
        cls.__mateu_app__ = title_
        cls.__mateu_app_variant__ = variant
        cls.__mateu_app_command_center__ = command_center
        cls.__mateu_app_chromeless__ = chromeless
        return cls

    return deco


def remote_menu(label: str, base_url: str, route: str = "", explode: bool = False) -> Callable[[type], type]:
    """A FEDERATED menu entry on the ``@app`` class: the option points at another Mateu backend
    by base URL — the frontend fetches the remote app's menu itself and mounts its views, so
    several services compose into one shell at runtime. With ``explode=True`` the remote menu's
    entries are inlined at this level instead of nesting under ``label``. Repeatable. The Python
    analogue of Java's ``RemoteMenu``."""

    def deco(cls: type) -> type:
        entries = list(getattr(cls, "__mateu_remote_menus__", []))
        entries.append((label, base_url, route, explode))
        cls.__mateu_remote_menus__ = entries
        return cls

    return deco


def ai(sse: str) -> Callable[[type], type]:
    """AI chat on the app: a floating button opens a chat panel that streams its answers from the
    given Server-Sent-Events endpoint. The endpoint is yours to implement — the panel POSTs
    ``{message, sessionId, menuContext?}`` with ``Accept: text/event-stream`` and renders the
    ``data:`` chunks as the streamed reply. The Python analogue of Java's ``@AI``."""

    def deco(cls: type) -> type:
        cls.__mateu_ai_sse__ = sse
        return cls

    return deco


def app_context(label: str = "") -> Callable:
    """Application-level context selector on the app header (the active hotel, the company…).

    Put it on a zero-arg method of the app class returning the options (a list of
    ``Option(value=…, label=…)`` objects or ``(value, label)`` tuples), or annotate the method's
    return type as an Enum (its members become the options). The picked value is sent in the app
    state of every request under the method's name."""

    def deco(fn):
        fn.__mateu_app_context__ = label
        return fn

    return deco


def compact(cls: type) -> type:
    cls.__mateu_compact__ = True
    return cls


def auto_layout(arg=True):
    """Class-level: let Mateu infer the UX patterns (folded optionals, tabs, radio enums…) from
    the amount and structure of the declared information. Explicit layout markers always win —
    inference only fills the gaps the developer left open. ``@auto_layout(False)`` opts out.
    The Python analogue of Java's ``@AutoLayout``."""
    if isinstance(arg, type):  # used bare: @auto_layout
        arg.__mateu_auto_layout__ = True
        return arg

    def deco(cls: type) -> type:
        cls.__mateu_auto_layout__ = bool(arg)
        return cls

    return deco


def read_only(cls: type) -> type:
    """Class-level: render every field of the view as read-only (the analogue of Java's
    ``@ReadOnly``). Also enables the read-only-only layout inference (sections as tabs)."""
    cls.__mateu_read_only__ = True
    return cls


def confirm_on_navigation_if_dirty(cls: type) -> type:
    cls.__mateu_confirm_dirty__ = True
    return cls


def edit_in_drawer(cls: type) -> type:
    """Class-level, on a Crud view: New and row clicks open the create/edit form in a Drawer
    sliding over the listing (the Redwood "Create and Edit - Drawer" template) instead of
    navigating to the /new — /{id}/edit routes; saving persists, closes the drawer and re-runs
    the listing's search in place. The analogue of Java's ``Crud.editInDrawer()``."""
    cls.__mateu_edit_in_drawer__ = True
    return cls


def inline_editing(cls: type) -> type:
    """Class-level, on a Crud view: every data column of the table listing becomes an in-place
    editor (``ReadOnly()`` fields stay display-only); each committed cell persists its row
    immediately through the crud's update-row action. The analogue of Java's ``@InlineEditing``."""
    cls.__mateu_inline_editing__ = True
    return cls


def zones(*zone_list: tuple[str, str] | str):
    """Class-level multi-column form layout: declare the columns (order matters) and assign each
    ``Section(caption, zone=...)`` to one — the sections lay out side by side, each zone a
    vertical column of its section cards. Each zone is ``(name, width)`` (width like ``"64%"``
    fixes the column) or just ``name`` (shares the remaining space). The Python analogue of
    Java's ``@Zones``/``@Zone``."""

    normalized = [(z, "") if isinstance(z, str) else (z[0], z[1]) for z in zone_list]

    def deco(cls: type) -> type:
        cls.__mateu_zones__ = normalized
        return cls

    return deco


def folded_layout(cls: type) -> type:
    """Class-level: lays the form's section cards out side by side in one horizontal row (equal
    shares) instead of stacking them. ``@zones`` columns take precedence when both are declared.
    The Python analogue of Java's ``@FoldedLayout``."""
    cls.__mateu_folded_layout__ = True
    return cls


class LabelsAsideMode(Enum):
    """Where a form's field labels sit: ``AUTO`` lets Mateu infer it from the form's shape
    (labels aside only for dense single-column forms of short-labelled, single-line widgets),
    ``ASIDE``/``TOP`` force it. The Python analogue of Java's ``LabelsAsideMode``."""

    AUTO = "auto"
    ASIDE = "aside"
    TOP = "top"


def form_layout(columns: int = 2, labels_aside: LabelsAsideMode = LabelsAsideMode.AUTO):
    """Class-level form layout declaration: fixes the form's column count and where the field
    labels sit. The explicit ``labels_aside=ASIDE|TOP`` always wins over the inference; with the
    default ``AUTO`` Mateu infers it from the form's shape. The Python analogue of Java's
    ``@FormLayout``."""

    def deco(cls: type) -> type:
        cls.__mateu_form_layout_columns__ = columns
        cls.__mateu_labels_aside__ = labels_aside
        return cls

    return deco


def toc(arg=True):
    """Sticky right-hand index (table of contents) on long docs-style pages: lists every section
    title, click scroll-jumps, the active entry highlights on scroll. Tri-state like Java's
    ``@Toc``: absent → the renderer decides (auto), ``@toc`` / ``@toc(True)`` → force on,
    ``@toc(False)`` → suppress."""
    if isinstance(arg, type):  # bare @toc
        arg.__mateu_toc__ = True
        return arg

    def deco(cls: type) -> type:
        cls.__mateu_toc__ = bool(arg)
        return cls

    return deco


def plain_text(cls: type) -> type:
    """Class-level: render every field as read-only plain text."""
    cls.__mateu_plain_text__ = True
    return cls


def emits(name: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_emits__ = name
        return cls

    return deco


def subscribe_to(event: str, action: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        subs = list(getattr(cls, "__mateu_subscriptions__", ()))
        subs.append((event, action))
        cls.__mateu_subscriptions__ = subs
        return cls

    return deco


def secured(permission: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_secured__ = permission
        return cls

    return deco


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


def menu_item(arg=None, group: str = ""):
    """A menu entry. ``group`` nests the entry under that folder (entries sharing a group become
    its submenu); empty = a top-level leaf entry."""
    if group:
        label = arg if isinstance(arg, str) else None

        def deco(fn):
            fn.__mateu_menu_item__ = label or True
            fn.__mateu_menu_group__ = group
            return fn

        return deco
    return _maybe_bare(arg, "__mateu_menu_item__", lambda label: label or True)


def kpi(title_: str):
    def deco(fn):
        fn.__mateu_kpi__ = title_
        return fn

    return deco


def fab(icon: str, label: str | None = None, order: int = 0):
    def deco(fn):
        fn.__mateu_fab__ = _Fab(icon, label, order)
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


class Listing(Generic[F, R]):
    """A declarative read-only listing: a Filters class (its fields become the smart search bar,
    with ``DateRange``/``NumberRange``/``set[SomeEnum]`` fields rendering range and multi-select
    widgets) and a Row class (its fields become the columns). Implement ``search`` — it receives
    the hydrated typed filters; the framework sorts and paginates the returned rows. The Python
    analogue of Java's declarative ``Listing<Filters, Row>``."""

    def search(self, search_text: str | None, filters: F) -> Iterable[R]:
        """Rows matching the free-text search and the applied filters."""
        raise NotImplementedError

    def grid_layout(self) -> str:
        """The grid layout the renderer uses: ``"auto"`` (renderer decides), ``"table"``,
        ``"list"``, ``"cards"``, ``"masterDetail"`` or ``"tree"`` — tree shows hierarchical rows
        whose row type carries a self-referential children list, and is never auto-selected. The
        Python analogue of ``ListingBackend.gridLayout``."""
        return "auto"


class HeroSearch(Crud[T]):
    """A search-first page: a centered hero header (title, subtitle, background image) over the
    standard crud listing, results as cards. Starts empty — the user searches. The Python
    analogue of Java's HeroSearch archetype."""

    def hero_title(self) -> str | None:
        return None

    def hero_subtitle(self) -> str | None:
        return None

    def hero_image(self) -> str | None:
        """Background image URL, rendered with a dark overlay."""
        return None


class SmartSearchPage(Listing[F, R]):
    """Smart search page (the Oracle Redwood "Smart Search" template): a standalone, search-first
    page — an optional intro line under the page title, the smart search bar (typed filter facets
    and chips) and the results collection. Read-only and starts EMPTY (the user searches): no
    OnLoad→search preload trigger. The Python analogue of Java's SmartSearchPage archetype."""

    def page_subtitle(self) -> str | None:
        """Optional intro line rendered under the page title, above the smart search bar."""
        return None


class Wizard:
    """A multi-step form; fields carry ``Step(n)`` and ``complete()`` runs on the last step."""

    def complete(self) -> Message:
        raise NotImplementedError

    def on_next(self, from_step: int, to_step: int) -> None:
        """Runs when the user moves FORWARD from ``from_step`` to ``to_step`` (both 1-based),
        after the state has been bound and before the target step renders — the hook archetypes
        like the import wizard use to compute a step's content from the previous steps' answers.
        Default: no-op."""


class Translator:
    """Implement and register to translate titles, labels and menu entries."""

    def translate(self, key: str) -> str:
        raise NotImplementedError


class ComponentTreeSupplier:
    """A view that supplies its UI as a fluent component tree (see ``mateu_uidl.components``)
    instead of reflected form fields. The Python analogue of Java's ``ComponentTreeSupplier``."""

    def component(self):
        raise NotImplementedError


class LinkSupplier:
    """Implemented by a view to attach a navigation link icon to fields at runtime (an
    alternative to the static :class:`LinkTo` marker, over which this takes precedence).
    :meth:`link` returns the :class:`NavLink` for the field named ``member_name``, or ``None``
    for no link — a ``LinkTo`` on the field then applies if present. The Python analogue of
    Java's ``LinkSupplier``."""

    def link(self, member_name: str) -> NavLink | None:
        raise NotImplementedError


class Dashboard(ComponentTreeSupplier):
    """Declarative dashboard landing page. Declare type-hinted fields holding fluent components:

    - consecutive ``MetricCard`` fields group into a full-width ``Scoreboard`` KPI band;
    - component fields annotated ``Panel(title, subtitle, col_span, row_span)`` become titled
      tiles on a responsive grid;
    - any other component field lands on the grid as-is.

    Override :meth:`columns` to fix the column count (0 = auto-fit)."""

    def columns(self) -> int:
        return 0


class Foldout(ComponentTreeSupplier):
    """Declarative Redwood-style foldout page: the first component field without ``Panel`` is the
    always-visible overview; ``Panel(title, subtitle, icon, open)`` fields are lateral fold-out
    panels."""

    def header_title(self) -> str | None:
        """Big heading of the header band above the columns (RDS "overview title"). Defaults to
        the class ``@title``; override to compute it. Return ``None`` to hide the header band."""
        return getattr(type(self), "__mateu_title__", None)

    def header_badges(self) -> list[str]:
        """Label/Value chips shown under the header title. Empty by default."""
        return []

    def orientation(self) -> str:
        """Overview orientation: ``"vertical"`` (overview on the left, default) or ``"horizontal"``
        (overview across the top, panels in a row below)."""
        return "vertical"

    def navigation_header(self):
        """Navigation Header (prev/next + go-to-parent). Return a
        :class:`mateu_uidl.components.FoldoutNavigation`, or ``None`` (default) to hide the bar. Each
        non-blank ``*_action_id`` names a method Mateu runs when the control is clicked."""
        return None

    def overview_edit_action_id(self) -> str | None:
        """ActionId run by the overview's Edit affordance (RDS edit flow). ``None`` (default) hides
        the Edit button; the method typically returns a Dialog (vertical) or navigates (horizontal)."""
        return None


class ItemOverview(ComponentTreeSupplier):
    """Item overview page: the first component field without ``Panel`` is the key-info panel
    (left, sticky); ``Panel(title)`` fields become tabs on the right. Override
    :meth:`panel_width` to change the key-info panel width."""

    def panel_width(self) -> str:
        return "22rem"


class Welcome(ComponentTreeSupplier):
    """Welcome page: ``Button`` fields become call-to-action buttons inside a centered hero;
    ``Panel(title)`` component fields become highlight tiles on a grid below. Override
    :meth:`hero_title` / :meth:`hero_subtitle` / :meth:`hero_image` for the hero chrome."""

    def hero_title(self) -> str | None:
        return None

    def hero_subtitle(self) -> str | None:
        return None

    def hero_image(self) -> str | None:
        return None


__all__ = [
    "Message", "MessageVariant", "BannerTheme", "PageBanner", "PageWidth", "PageType",
    "Required", "Label", "Section", "Tab", "Stereotype", "Multiline", "Password",
    "Money", "PlainText", "ReadOnly", "Version", "Lookup", "Hidden", "Disabled", "OnRowSelected", "InlineEditing", "EyesOnly", "ReadOnlyUnless", "DisabledUnless", "Identity", "disabled_unless", "Audience", "audience", "LookupLabelSupplier", "Rule", "RuleSupplier", "AppHeaderAction", "AppActionsSupplier", "AppNotification", "NotificationsSupplier", "BulletedList", "SeparatorBefore", "Signature", "PhotoCapture", "FileUpload", "RangeFilter", "Aggregate", "AggregateFunction", "GroupBy", "TreeSelect", "UseRadioButtons", "HeaderBadge", "Step", "Panel",
    "ai", "remote_menu", "ui", "title", "subtitle", "app", "auto_layout", "read_only", "compact",
    "confirm_on_navigation_if_dirty", "inline_editing", "toc", "zones", "folded_layout", "form_layout", "LabelsAsideMode", "wizard_progress", "page_width", "page_template",
    "plain_text", "emits", "subscribe_to", "secured", "welcome_banner",
    "button", "menu_item", "kpi", "fab", "banner", "shortcut", "list_toolbar_button",
    "Crud", "HeroSearch", "Listing", "SmartSearchPage", "DateRange", "NumberRange", "Pageable", "PageResult", "SortSpec", "Searchable", "SelectedItem", "Selector", "Wizard", "Translator",
    "ComponentTreeSupplier", "Dashboard", "Foldout", "ItemOverview", "Welcome", "TodoList",
    "CalendarPage",
]


class CollectionDetail(ComponentTreeSupplier):
    """Collection-detail page (the Redwood "Collection Detail" template, the Python analogue of
    Java's CollectionDetail archetype): a searchable list of items on the left — clickable cards
    with title, caption and badges — and the selected item's detail on the right, re-rendered in
    place on every selection. Implement :meth:`rows`, :meth:`id_of`, :meth:`title_of` and
    :meth:`detail`."""

    search: str | None = None
    selected_id: str | None = None

    __mateu_refresh_action__ = "filterCollection"
    __mateu_refresh_debounce__ = 400

    def rows(self, search):
        raise NotImplementedError

    def id_of(self, row):
        raise NotImplementedError

    def title_of(self, row):
        raise NotImplementedError

    def detail(self, row):
        raise NotImplementedError

    def caption_of(self, row):
        return None

    def badges_of(self, row):
        return ()

    def list_label(self, count: int) -> str:
        return f"{count} items"

    def list_width(self) -> str:
        return "24rem"

    def empty_detail(self):
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="👈",
            title="Select an item",
            description="Pick an item from the list to see its detail.",
            style="flex: 1; margin-top: 3rem;",
        )

    def component(self):
        from mateu_uidl import components as fluent

        items = []
        selected = None
        for row in self.rows(self.search):
            row_id = self.id_of(row)
            is_selected = row_id is not None and row_id == self.selected_id
            if is_selected:
                selected = row
            items.append(
                fluent.QueueItem(
                    id=row_id,
                    title=self.title_of(row),
                    caption=self.caption_of(row),
                    badges=tuple(self.badges_of(row)),
                    selected=is_selected,
                )
            )
        width = self.list_width()
        queue = fluent.TaskQueue(
            action_id="selectCollectionItem",
            groups=(fluent.QueueGroup(label=self.list_label(len(items)), items=tuple(items)),),
            style=f"flex: 0 0 {width}; min-width: min({width}, 100%);",
        )
        detail = self.detail(selected) if selected is not None else self.empty_detail()
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.FormField(field_id="search", label="Search"),
                fluent.HorizontalLayout(
                    content=(queue, detail),
                    style="align-items: flex-start; gap: 1.5rem; width: 100%;",
                ),
            ),
        )


class GeneralOverview(ComponentTreeSupplier):
    """Record overview page (the Redwood "General Overview" template, the Python analogue of
    Java's GeneralOverview archetype): a record context switcher at the top jumps between records
    without leaving the page; the selected record renders below — typically an ``EntityHeader``
    over property cards. Implement :meth:`switcher_options`, :meth:`load` and :meth:`overview`."""

    record: str | None = None

    __mateu_refresh_action__ = "switchRecord"
    __mateu_refresh_debounce__ = 0

    def switcher_options(self):
        """``(value, label)`` pairs — value = record id, label = what the user reads."""
        raise NotImplementedError

    def load(self, record_id: str):
        raise NotImplementedError

    def overview(self, row):
        raise NotImplementedError

    def empty_overview(self):
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="🗂", title="Select a record", description="Pick a record in the switcher above."
        )

    def component(self):
        from mateu_uidl import components as fluent

        options = list(self.switcher_options())
        if not self.record and options:
            self.record = str(options[0][0])
        row = self.load(self.record) if self.record else None
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.FormField(field_id="record", label="", options=tuple(options)),
                self.overview(row) if row is not None else self.empty_overview(),
            ),
        )


class TodoList(ComponentTreeSupplier):
    """To-do list page (the Redwood "To-do list" template, the Python analogue of Java's
    TodoList archetype): the user's pending work as a ``TaskQueue`` of grouped, clickable cards —
    buckets such as Today / This week / Later, each labelled with its counter — where clicking a
    card ACTS on it (typically navigating to the task) instead of selecting it for a side detail
    pane. Implement :meth:`rows`, :meth:`id_of`, :meth:`title_of`, :meth:`group_of` and
    :meth:`action_on`."""

    #: The inbound request of the current render/action (the port's analogue of Java's
    #: HttpRequest injection) — set by the sync handler on every request.
    http_request = None

    def rows(self, http_request):
        """The pending rows to list, in display order within each bucket."""
        raise NotImplementedError

    def id_of(self, row):
        """Stable id of a row (used to find it back on click)."""
        raise NotImplementedError

    def title_of(self, row):
        """Main line of the row's card."""
        raise NotImplementedError

    def group_of(self, row):
        """Bucket key of a row (e.g. "Today"); buckets render in first-appearance order unless
        :meth:`group_order` says otherwise."""
        raise NotImplementedError

    def action_on(self, row, http_request):
        """What clicking the row's card does — typically a URI string to navigate to the task,
        or any other Mateu action result (a ``Message``, a dialog component, ...)."""
        raise NotImplementedError

    def caption_of(self, row):
        """Secondary line of the row's card. None for none."""
        return None

    def badges_of(self, row):
        """Badges of the row's card (due date, priority, ...) — ``ChipItem``s."""
        return ()

    def group_label(self, group, count: int) -> str:
        """Label of a bucket. Default: ``"name (count)"``."""
        return f"{group} ({count})"

    def group_order(self):
        """Explicit bucket order (buckets not listed go last, in first-appearance order).
        Default: first appearance."""
        return ()

    def empty_state(self):
        """What the page shows when there is nothing pending."""
        from mateu_uidl import components as fluent

        return fluent.EmptyState(
            icon="🎉",
            title="All caught up!",
            description="There is nothing pending on your plate.",
        )

    def open_todo_item(self, request):
        """The card click: the queue dispatches ``openTodoItem`` with ``{"_item": id}``; the
        matching row's :meth:`action_on` result becomes the response (a URI → NavigateTo)."""
        raw = (request.parameters or {}).get("_item")
        item_id = None if raw is None else str(raw)
        for row in self.rows(request):
            if self.id_of(row) == item_id:
                return self.action_on(row, request)
        return None

    def component(self):
        from mateu_uidl import components as fluent

        rows = list(self.rows(self.http_request))
        if not rows:
            return self.empty_state()
        buckets: dict = {}
        for row in rows:
            buckets.setdefault(self.group_of(row), []).append(
                fluent.QueueItem(
                    id=self.id_of(row),
                    title=self.title_of(row),
                    caption=self.caption_of(row),
                    badges=tuple(self.badges_of(row)),
                )
            )
        keys = list(buckets.keys())
        explicit = list(self.group_order())
        if explicit:
            # stable sort: unlisted buckets keep first-appearance order after the listed ones
            keys.sort(key=lambda k: explicit.index(k) if k in explicit else len(explicit))
        return fluent.TaskQueue(
            action_id="openTodoItem",
            groups=tuple(
                fluent.QueueGroup(
                    label=self.group_label(key, len(buckets[key])),
                    items=tuple(buckets[key]),
                )
                for key in keys
            ),
        )


class CalendarPage(ComponentTreeSupplier):
    """Calendar page (the Redwood "Calendar" template, the Python analogue of Java's
    CalendarPage archetype): a full month-grid ``Calendar`` under the page's calendar toolbar —
    previous/next month chevrons, a *Today* button and an optional primary *+ Create* button —
    where clicking an event ACTS on it (typically navigating to its detail). Month navigation
    re-runs :meth:`events` with the newly displayed month, so events can be fetched per month
    from the backend. Implement :meth:`events` and :meth:`action_on`; :meth:`initial_month`
    defaults to the current month, :meth:`show_create`/:meth:`create_action` enable the create
    flow."""

    #: The displayed month (any day of it, ISO-8601; bound from componentState).
    month: str | None = None
    #: The last clicked event's id (bound from componentState; set by the event click).
    event_id: str | None = None

    #: The inbound request of the current render/action (the port's analogue of Java's
    #: HttpRequest injection) — set by the sync handler on every request.
    http_request = None

    def events(self, month: date, http_request):
        """The events of the displayed month (any day of it, for the grid to place them)."""
        raise NotImplementedError

    def action_on(self, event, http_request):
        """What clicking an event does — typically a URI string to navigate to its detail, or
        any other Mateu action result (a ``Message``, a dialog component, ...)."""
        raise NotImplementedError

    def initial_month(self) -> date:
        """The initially displayed month. Default: the current month."""
        return date.today()

    def show_create(self) -> bool:
        """Whether the primary "+ Create" button shows in the toolbar. Default: False."""
        return False

    def create_action(self, http_request):
        """What the "+ Create" button does (required when :meth:`show_create` is true)."""
        return None

    # ── Wiring ────────────────────────────────────────────────────────────────

    def current_month(self) -> date:
        """The displayed month: the bound ``month`` state when it parses, else
        :meth:`initial_month`."""
        if self.month:
            try:
                return date.fromisoformat(self.month)
            except ValueError:
                pass  # a stale/unparseable state falls back to the initial month
        return self.initial_month()

    def previous_calendar_month(self):
        """``previousCalendarMonth``: moves the displayed month one month back (re-render)."""
        self.month = self._shift_month(self.current_month(), -1).isoformat()

    def next_calendar_month(self):
        """``nextCalendarMonth``: moves the displayed month one month forward (re-render)."""
        self.month = self._shift_month(self.current_month(), 1).isoformat()

    def go_calendar_today(self):
        """``goCalendarToday``: moves the displayed month back to the current one (re-render)."""
        self.month = date.today().isoformat()

    def open_calendar_event(self, event_id):
        """``openCalendarEvent``: finds the clicked event by id among the displayed month's and
        returns its :meth:`action_on` result; None (unknown event) re-renders the page (the
        analogue of Java returning ``this``)."""
        self.event_id = event_id
        for event in self.events(self.current_month(), self.http_request):
            if event.id == event_id:
                return self.action_on(event, self.http_request)
        return None

    def create_calendar_event(self):
        """``createCalendarEvent``: runs :meth:`create_action`; a None result re-renders the
        page (the analogue of Java returning ``this``)."""
        return self.create_action(self.http_request)

    @staticmethod
    def _shift_month(month: date, delta: int) -> date:
        """The first day of the month ``delta`` months away from ``month`` (any day of a month
        identifies it for the grid)."""
        m = month.month - 1 + delta
        return date(month.year + m // 12, m % 12 + 1, 1)

    def component(self):
        from mateu_uidl import components as fluent

        month = self.current_month()
        # Every event chip dispatches the same uniform actionId; the clicked event travels in
        # the action's parameters (_clickedEvent) and the archetype finds it back by id.
        events = tuple(
            replace(e, action_id="openCalendarEvent")
            for e in self.events(month, self.http_request)
        )
        buttons = [
            fluent.Button(label="‹", action_id="previousCalendarMonth"),
            fluent.Button(label="Today", action_id="goCalendarToday"),
            fluent.Button(label="›", action_id="nextCalendarMonth"),
        ]
        if self.show_create():
            buttons.append(
                fluent.Button(label="+ Create", action_id="createCalendarEvent",
                              button_style="primary")
            )
        return fluent.VerticalLayout(
            spacing=True,
            content=(
                fluent.HorizontalLayout(
                    spacing=True, style="align-items: center;", content=tuple(buttons)
                ),
                fluent.Calendar(month=month, events=events),
            ),
        )
