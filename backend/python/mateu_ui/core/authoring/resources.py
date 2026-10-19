"""The authoring contract a running app serves to agents — the generated schemas, the component
catalogue derived from them and the agent guide (Java's ``AuthoringResources``).

The files are COPIES of ``backend/shared/uidl/{uidl-schema.json, specs-schema.json,
uidl-catalog.json, authoring-guide.md}`` shipped inside the package (``resources/``), so the four
MCP implementations serve the same bytes; ``tests/test_authoring_resources.py`` pins each copy
byte-equal to its source when the repository is present.
"""

from __future__ import annotations

import json
import threading
from dataclasses import dataclass
from functools import lru_cache
from importlib import resources as _importlib_resources
from typing import Any

#: The package directory holding the files.
PACKAGE = "mateu_ui.core.authoring"
DIRECTORY = "resources"


@dataclass(frozen=True)
class Resource:
    """One MCP resource: its URI, the file behind it and how it is described."""

    uri: str
    file: str
    name: str
    description: str
    mime_type: str


#: The resources, in the order ``resources/list`` answers them (the same everywhere).
RESOURCES: tuple[Resource, ...] = (
    Resource(
        "mateu://guide",
        "authoring-guide.md",
        "Authoring guide",
        "How to write Mateu YAML definitions with these tools: the workflow, a sample page and"
        " the rules that keep a definition valid.",
        "text/markdown",
    ),
    Resource(
        "mateu://catalog",
        "uidl-catalog.json",
        "Component catalogue",
        "Every component type with a one-line description and its main attributes"
        " (generated from the schema).",
        "application/json",
    ),
    Resource(
        "mateu://schema/specs",
        "specs-schema.json",
        "specs/ui schema",
        "JSON Schema of every file under specs/ui: pages, app shells, mounts, routes, sources,"
        " actions, translations, environments, field types and the project descriptor.",
        "application/schema+json",
    ),
    Resource(
        "mateu://schema/uidl",
        "uidl-schema.json",
        "Component schema",
        "JSON Schema of the component catalogue (UIDL).",
        "application/schema+json",
    ),
)

_lock = threading.Lock()


def by_uri(uri: str | None) -> Resource | None:
    """The resource of ``uri``, or None."""
    return next((r for r in RESOURCES if r.uri == uri), None)


def data(file: str) -> bytes:
    """The bytes of a packaged file."""
    return (_importlib_resources.files(PACKAGE) / DIRECTORY / file).read_bytes()


@lru_cache(maxsize=None)
def text(file: str) -> str:
    """The text of a packaged file."""
    return data(file).decode("utf-8")


@lru_cache(maxsize=None)
def _parsed(file: str) -> Any:
    with _lock:
        return json.loads(text(file))


def specs_schema() -> dict:
    """The parsed ``specs-schema.json`` (shared; do not mutate)."""
    return _parsed("specs-schema.json")


def catalog() -> dict:
    """The parsed ``uidl-catalog.json`` (shared; do not mutate)."""
    return _parsed("uidl-catalog.json")
