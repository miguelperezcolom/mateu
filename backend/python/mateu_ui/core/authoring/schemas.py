"""The agent-sized views of the schema behind ``mateu_list_components`` and
``mateu_get_component_schema`` (Java's ``ComponentSchemas``) — normative like the validator, pinned
by ``conformance/mcp/authoring.json``."""

from __future__ import annotations

from collections import deque
from typing import Any

from mateu_ui.uidl import UserFacingException

from . import resources
from .validator import quote, suggest

_REF_PREFIX = "#/$defs/"


def list_components(query: str | None) -> dict:
    """The catalogue's components whose type or description contains ``query`` (ignoring case; all
    of them for a blank one): ``{components: [{type, description, attributes: [name…]}], count}``."""
    needle = (query or "").strip().lower()
    components = []
    for c in resources.catalog().get("components") or []:
        type_ = str(c.get("type") or "")
        description = str(c.get("description") or "")
        if needle and needle not in type_.lower() and needle not in description.lower():
            continue
        components.append(
            {
                "type": type_,
                "description": description,
                "attributes": [str(a.get("name") or "") for a in c.get("attributes") or []],
            }
        )
    return {"components": components, "count": len(components)}


def schema_of(type_: str) -> dict:
    """The ``$def`` of ``type_`` with every definition it references, transitively — a polymorphic
    family (a def with ``oneOf``) is included but not walked into: ``{type, schema, definitions}``,
    the definitions sorted by name. Raises :class:`UserFacingException` when there is no such def."""
    defs: dict = resources.specs_schema().get("$defs") or {}
    definition = defs.get(type_)
    if definition is None:
        suggestion = suggest(type_, list(defs))
        raise UserFacingException(
            f"Unknown type {quote(type_)}."
            + (f" Did you mean {quote(suggestion)}?" if suggestion is not None else "")
            + " See mateu_list_components."
        )
    included: set[str] = set()
    pending: deque[str] = deque()
    if "oneOf" not in definition:
        _refs(definition, pending)
    while pending:
        name = pending.popleft()
        if name == type_ or name in included:
            continue
        included.add(name)
        referenced = defs.get(name) or {}
        if "oneOf" not in referenced:
            _refs(referenced, pending)
    return {
        "type": type_,
        "schema": definition,
        "definitions": {name: defs.get(name) for name in sorted(included)},
    }


def _refs(node: Any, into: deque[str]) -> None:
    if isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str) and ref.startswith(_REF_PREFIX):
            into.append(ref[len(_REF_PREFIX):])
        for child in node.values():
            _refs(child, into)
    elif isinstance(node, list):
        for child in node:
            _refs(child, into)
