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
class PlainText:
    """Renders the field as read-only plain text."""


@dataclass(frozen=True)
class UseRadioButtons:
    """Renders an enum field as radio buttons instead of the default dropdown, regardless of how
    many members the enum has. The Python analogue of Java's ``@UseRadioButtons``."""


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
    "Message", "MessageVariant", "BannerTheme",
    "Required", "Label", "Section", "Tab", "Stereotype", "Multiline", "Password",
    "Money", "PlainText", "UseRadioButtons", "HeaderBadge", "Step", "Panel",
    "ui", "title", "subtitle", "app", "auto_layout", "read_only", "compact",
    "confirm_on_navigation_if_dirty",
    "plain_text", "emits", "subscribe_to", "secured",
    "button", "menu_item", "kpi", "fab", "banner", "shortcut",
    "Crud", "Wizard", "Translator",
    "ComponentTreeSupplier", "Dashboard", "Foldout", "ItemOverview", "Welcome",
]
