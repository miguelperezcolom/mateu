"""The MCP authoring plane (phase B): the validator of YAML definitions, the agent-sized views of
the schema, the authoring resources and the spec writer — the Python twins of Java's
``io.mateu.core.application.authoring``. Normative: ``conformance/mcp/README.md``."""

from .resources import RESOURCES, Resource, by_uri, catalog, specs_schema, text
from .schemas import list_components, schema_of
from .validator import MAX_NODES, MAX_YAML_BYTES, UidlValidator, ValidationContext, quote, suggest

__all__ = [
    "MAX_NODES",
    "MAX_YAML_BYTES",
    "RESOURCES",
    "Resource",
    "UidlValidator",
    "ValidationContext",
    "by_uri",
    "catalog",
    "list_components",
    "quote",
    "schema_of",
    "specs_schema",
    "suggest",
    "text",
]
