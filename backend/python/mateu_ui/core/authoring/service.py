"""The validator over THIS app (Java's ``UidlValidationService``): the semantic checks resolve
against its source, action, component and field type catalogues and its partials, and a definition
the structural pass finds no error in is also handed to the real YAML loader — so "valid" never
means "and then the page answers Not found". Behind the reserved ``__validate__`` action, which the
MCP endpoint and the sidecar both call."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from . import resources
from .validator import Predicate, UidlValidator, ValidationContext

#: Kinds the YAML loader turns into a component tree (the ones a load failure can hit).
LOADED_KINDS = frozenset({"component", "envelope"})


def validate_uidl(handler: Any, text: str) -> dict:
    """The validation report of ``text`` ({valid, kind, errors, warnings}) for ``handler``'s app."""
    from mateu_ui.core.yaml_preview import parse_text_reporting

    report = UidlValidator(resources.specs_schema()).validate(text, context_of(handler))
    if report["valid"] and report["kind"] in LOADED_KINDS:
        _, problem = parse_text_reporting(text, field_types=getattr(handler, "field_types", None))
        if problem is not None:
            report["errors"].append(
                {"code": "load_failed", "message": f"The definition could not be loaded: {problem}", "path": "$"}
            )
            report["valid"] = False
    return report


def context_of(handler: Any) -> ValidationContext:
    """The names ``handler``'s catalogues resolve; a catalogue it lacks is "unknown here"."""
    from mateu_ui.core.yaml_preview import default_partials

    def lookup(registry: Any, get: Callable[[Any, str], Any]) -> Predicate | None:
        if registry is None:
            return None
        return lambda name: _safe(lambda: get(registry, name))

    partials = default_partials()
    return ValidationContext(
        source=lookup(getattr(handler, "rest_sources", None), lambda r, n: r.get(n) is not None),
        partial=lambda name: _safe(lambda: bool(partials.resolve(name))),
        component=lookup(getattr(handler, "components", None), lambda r, n: r.get(n) is not None),
        action=lookup(getattr(handler, "action_catalog", None), lambda r, n: r.get(n) is not None),
        field_type=lookup(getattr(handler, "field_types", None), lambda r, n: r.get(n) is not None),
    )


def _safe(check: Callable[[], bool]) -> bool:
    try:
        return bool(check())
    except Exception:  # noqa: BLE001 — a catalogue that cannot be read is not the author's mistake
        return True
