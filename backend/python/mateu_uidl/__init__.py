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

from dataclasses import dataclass
from enum import Enum
from typing import Callable, Generic, Iterable, TypeVar

T = TypeVar("T")


# ── User-facing data types ─────────────────────────────────────────────────────
class MessageVariant(Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class Message:
    """Returned from an action method to show a toast."""

    def __init__(
        self,
        text: str,
        variant: MessageVariant = MessageVariant.SUCCESS,
        title: str = "",
        duration: int = 5000,
    ):
        self.text = text
        self.variant = variant
        self.title = title
        self.duration = duration


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
class Signature:
    """Signature capture on a str field: a drawing canvas whose accepted strokes land in the
    value as a PNG data URI (same self-contained contract as the uploadable image)."""


class PhotoCapture:
    """Photo capture on a str field: the device camera, storing the shot in the value as a JPEG
    data URI (file-input fallback opens the native camera on phones)."""


@dataclass(frozen=True)
class RangeFilter:
    """On a numeric field of a Crud entity: the listing filter becomes a min-max RANGE widget
    (the bounds travel as <field>_from/<field>_to state keys) instead of an equality input.
    Temporal fields are ranges by default; numerics opt in with this."""


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
class UseRadioButtons:
    """Renders an enum field as radio buttons instead of the default dropdown, regardless of how
    many members the enum has. The Python analogue of Java's ``@UseRadioButtons``."""


@dataclass(frozen=True)
class Lookup:
    """A remote, search-as-you-type reference field: renders a combo box whose options come from
    the server page by page — the view (or crud) answers the field's ``search-<fieldId>`` action
    from its ``options(field_name)`` method, filtered by the typed text. Use it when the option
    set is too large to embed in the form. The Python analogue of Java's ``@Lookup``."""


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


def subtitle(value: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_subtitle__ = value
        return cls

    return deco


def app(title_: str) -> Callable[[type], type]:
    def deco(cls: type) -> type:
        cls.__mateu_app__ = title_
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


def inline_editing(cls: type) -> type:
    """Class-level, on a Crud view: every data column of the table listing becomes an in-place
    editor (``ReadOnly()`` fields stay display-only); each committed cell persists its row
    immediately through the crud's update-row action. The analogue of Java's ``@InlineEditing``."""
    cls.__mateu_inline_editing__ = True
    return cls


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


def menu_item(arg=None):
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


# ── Base classes ───────────────────────────────────────────────────────────────
class Crud(Generic[T]):
    """Base for a CRUD view of ``T`` (the analogue of Java's AutoCrud / C#'s Crud<T>)."""

    #: Subclasses set the element type, or it is inferred from ``Crud[Foo]``.
    element_type: type | None = None

    def fetch(self, search: str | None) -> Iterable[T]:
        raise NotImplementedError

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


class Wizard:
    """A multi-step form; fields carry ``Step(n)`` and ``complete()`` runs on the last step."""

    def complete(self) -> Message:
        raise NotImplementedError


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
    "Message", "MessageVariant", "BannerTheme", "PageBanner",
    "Required", "Label", "Section", "Tab", "Stereotype", "Multiline", "Password",
    "Money", "PlainText", "ReadOnly", "Lookup", "Signature", "PhotoCapture", "RangeFilter", "TreeSelect", "UseRadioButtons", "HeaderBadge", "Step", "Panel",
    "ui", "title", "subtitle", "app", "auto_layout", "read_only", "compact",
    "confirm_on_navigation_if_dirty", "inline_editing", "toc",
    "plain_text", "emits", "subscribe_to", "secured",
    "button", "menu_item", "kpi", "fab", "banner", "shortcut",
    "Crud", "HeroSearch", "Wizard", "Translator",
    "ComponentTreeSupplier", "Dashboard", "Foldout", "ItemOverview", "Welcome",
]
