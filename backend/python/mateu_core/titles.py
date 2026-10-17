"""The title of a page built from an instance — a record page is named after the RECORD, as Java
names it (``PageMetadataExtractor.getTitle``, used by ``CrudFormComponentBuilder`` /
``EditableView`` / ``ReflectionPageMapper``).

Precedence: the declared ``@title`` wins; else a ``__str__`` (or, failing that, a ``__repr__``,
which is what ``str()`` falls back to) the DEVELOPER wrote names the record ("Booking 123"); a
fluent component, an inherited ``object`` one, a library's (pydantic's ``BaseModel.__str__`` is a
field dump) and a dataclass's generated ``Name(a=1, b=2)`` are field dumps, not names, and fall back
to the humanized class name. A record's text is DATA, not a template: its ``${`` is escaped.
"""

from __future__ import annotations

import dataclasses

from .naming import humanize

_LIBRARY_MODULES = ("builtins", "pydantic", "enum", "typing", "abc")


def record_title(cls: type, instance: object | None) -> str:
    """The untranslated title: the declared ``@title`` of the instance's class (else of ``cls``), a
    developer-written ``__str__``/``__repr__``, else the humanized class name."""
    actual = type(instance) if instance is not None else cls
    declared = getattr(actual, "__mateu_title__", None)
    if declared is not None:
        return str(declared)
    if instance is None or _is_component(instance):
        return humanize(actual.__name__)
    if not _names_itself(actual, instance):
        return humanize(actual.__name__)
    text = str(instance)
    if not text:
        return humanize(actual.__name__)
    return template_literal(text)


def template_literal(text: str) -> str:
    """Escapes a value so a label interpolator leaves it as written (Java's ``Templates.literal``)."""
    if "${" not in text:
        return text
    return text.replace("\\", "\\\\").replace("${", "\\${")


def _is_component(instance: object) -> bool:
    try:
        from mateu_uidl.components import Component
    except ImportError:  # pragma: no cover
        return False
    return isinstance(instance, Component)


def _declaring_class(cls: type, name: str) -> type | None:
    for base in cls.__mro__:
        if name in vars(base):
            return base
    return None


def _is_library(declaring: type | None) -> bool:
    return declaring is None or declaring is object or (declaring.__module__ or "").split(".")[0] in _LIBRARY_MODULES


def _names_itself(cls: type, instance: object) -> bool:
    """Whether ``str(instance)`` is a name the developer wrote rather than a type/field dump."""
    by_str = _declaring_class(cls, "__str__")
    if not _is_library(by_str):
        return True
    if by_str is not object and by_str is not None:
        return False  # a library's __str__ (pydantic's) — a field dump
    # object.__str__ delegates to __repr__
    by_repr = _declaring_class(cls, "__repr__")
    if _is_library(by_repr):
        return False
    if dataclasses.is_dataclass(cls) and _is_generated_dataclass_repr(cls, repr(instance)):
        return False
    return True


def _is_generated_dataclass_repr(cls: type, text: str) -> bool:
    """Whether ``text`` is the repr a dataclass generates: ``Name(first=1, …)`` (``Name()`` with no fields)."""
    prefix = cls.__qualname__ + "("
    if not text.startswith(prefix) or not text.endswith(")"):
        return False
    fields = dataclasses.fields(cls)  # type: ignore[arg-type]
    if not fields:
        return text == prefix + ")"
    return text.startswith(prefix + fields[0].name + "=")
