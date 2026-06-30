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
class HeaderBadge:
    color: str = "normal"


@dataclass(frozen=True)
class Step:
    step: int


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


__all__ = [
    "Message", "MessageVariant", "BannerTheme",
    "Required", "Label", "Section", "Tab", "Stereotype", "Multiline", "Password",
    "Money", "PlainText", "HeaderBadge", "Step",
    "ui", "title", "subtitle", "app", "compact", "confirm_on_navigation_if_dirty",
    "plain_text", "emits", "subscribe_to", "secured",
    "button", "menu_item", "kpi", "fab", "banner", "shortcut",
    "Crud", "Wizard", "Translator",
]
