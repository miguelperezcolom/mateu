"""Page-level inference — the Python port of Java's ``PageInference`` (fase 1 of
``design/page-level-inference-plan.md``; the Java class is the reference decision table).

Under the explicit ``@auto_page`` opt-in, a plain class whose structure spells an archetype is
COMPOSED as that archetype by the mapper instead of rendered as a reflected form. Rules are deterministic and structure-based; explicit always wins — archetype subclasses,
component-tree suppliers, cruds and listings are never rewritten. Only fully-derivable
archetypes compose: dashboard (MetricCard fields) and welcome (nothing but calls-to-action and
presentational components).
"""

from __future__ import annotations

from mateu_uidl import ComponentTreeSupplier, Crud, Listing
from mateu_uidl import components as fluent
from mateu_uidl.components import Button, MetricCard

from .reflection import view_fields


def enabled(cls) -> bool:
    """The ``@auto_page`` decorator decides when present (``@auto_page(False)`` opts out);
    default off. (Java additionally supports the ``mateu.layout.inference`` system property
    for a global default — not ported, same convention as ``layout_inference.enabled``.)"""
    flag = getattr(cls, "__mateu_auto_page__", None)
    return bool(flag) if flag is not None else False


def composes(cls) -> bool:
    """Whether ANY composition rule applies."""
    return composes_dashboard(cls) or composes_welcome(cls)


def composes_dashboard(cls) -> bool:
    """Dashboard rule: an enabled plain class declaring at least one MetricCard field composes
    the Dashboard archetype. Checked before the welcome rule — the stronger signal."""
    if not _composable(cls):
        return False
    return any(_is(f.type, MetricCard) for f in view_fields(cls))


def composes_welcome(cls) -> bool:
    """Welcome rule: an enabled plain class declaring at least one Button field and NOTHING but
    presentational fields (buttons, components) composes the Welcome landing — a page made only
    of calls-to-action is a landing; a single data field keeps the class a form."""
    if not _composable(cls):
        return False
    fields = view_fields(cls)
    return any(_is(f.type, Button) for f in fields) and all(
        _is(f.type, fluent.Component) for f in fields
    )


def _is(field_type, component_type) -> bool:
    return isinstance(field_type, type) and issubclass(field_type, component_type)


def _composable(cls) -> bool:
    if not isinstance(cls, type) or not enabled(cls):
        return False
    return not issubclass(cls, (ComponentTreeSupplier, Crud, Listing))
