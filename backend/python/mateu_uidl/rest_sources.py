"""The REST source catalogue: named endpoints declared ONCE and referenced by name from any surface
(``RestOptions(source="countries")`` instead of repeating the url and the mapping paths), plus the
programmatic declarations of a view assembled at runtime (``RestSourceSupplier``).

Two producers feed one catalogue, exactly like the route registry: the *derived* half is
``@rest_source`` on any class of the app plus whatever ``RestSourceCatalogSupplier`` classes return;
the *authored* half is ``specs/ui/sources.yaml``, merged on top — **authored wins**. Names are
GLOBAL (a source is an endpoint, not a screen). Mirrors Java's ``@RestSource`` /
``RestSourceEntry`` / ``RestSourceCatalogSupplier`` / ``RestSourceSupplier``.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable


class RestSourceProvenance(Enum):
    """Whether somebody already serves an endpoint or this project still owes it."""

    #: infer it from the url: relative / same-origin → generate, another origin → existing
    auto = "auto"
    #: the endpoint does not exist yet: derive its contract AND generate a server for it
    generate = "generate"
    #: the endpoint already exists: document it, never generate it
    existing = "existing"

    @staticmethod
    def resolve(declared: "RestSourceProvenance | None", url: str | None) -> "RestSourceProvenance":
        """The effective provenance, never ``auto`` (Java's ``RestSourceProvenance.resolve``)."""
        if declared is not None and declared is not RestSourceProvenance.auto:
            return declared
        trimmed = (url or "").strip()
        absolute = trimmed.startswith("//") or re.match(r"^[a-zA-Z][a-zA-Z0-9+.\-]*://", trimmed)
        return RestSourceProvenance.existing if absolute else RestSourceProvenance.generate


class RestSourceKind(Enum):
    """The surface a REST source feeds; its value is the ``_sourceKind`` the renderer sends."""

    OPTIONS = "options"
    ROWS = "rows"
    ACTION = "action"
    DATA = "data"

    @staticmethod
    def from_wire(name: str | None) -> "RestSourceKind | None":
        for kind in RestSourceKind:
            if kind.value == name:
                return kind
        return None


@dataclass(frozen=True)
class RestDataSource:
    """How to reach an endpoint (the uidl twin of the wire ``RestDataSource``): either by
    reference — ``ref`` names a catalogue entry — or inline with ``url`` and the mapping paths.
    Values declared here win over the entry's when a reference is resolved."""

    ref: str = ""
    url: str = ""
    method: str = "GET"
    headers: dict[str, str] = field(default_factory=dict)
    body: str = ""
    items_path: str = ""
    value_path: str = "value"
    label_path: str = "label"
    proxy: bool = False

    def has_ref(self) -> bool:
        return bool(self.ref and self.ref.strip())


@dataclass(frozen=True)
class RestSourceEntry:
    """One named entry of the catalogue. ``fields`` maps a flat name to the dot path it is read
    from in each item (``customerName → customer.name``); ``total_path`` is the server-paged
    total; ``provenance`` decides what the derived contract does with it."""

    name: str
    source: RestDataSource
    provenance: RestSourceProvenance = RestSourceProvenance.auto
    fields: dict[str, str] = field(default_factory=dict)
    total_path: str = ""
    description: str = ""

    def effective_provenance(self) -> RestSourceProvenance:
        return RestSourceProvenance.resolve(self.provenance, self.source.url if self.source else None)

    def path_of(self, field_name: str) -> str:
        """The dot path a consumer reading ``field_name`` follows (an unmapped name IS its path)."""
        mapped = self.fields.get(field_name)
        return mapped if mapped else field_name


@dataclass(frozen=True)
class DeclaredRestSource:
    """A REST source a view declares programmatically: the surface ``kind``, the surface ``id``
    (the field id for OPTIONS, the action id for ACTION; unused for ROWS/DATA) and the source."""

    kind: RestSourceKind
    source: RestDataSource
    id: str = ""


class RestSourceSupplier:
    """Implemented by a VIEW that builds its REST sources at runtime (a form built from a stored
    definition…) so that they too can be fetched in proxy mode — the proxy only ever fetches what
    the server says the view declared, never a url from the request.

    **Build the declarations from what the server holds — a stored definition, configuration —
    never from the request or the component state**, or the proxy becomes an open relay."""

    def declared_rest_sources(self) -> list[DeclaredRestSource]:
        raise NotImplementedError


class RestSourceCatalogSupplier:
    """Implemented by a class of the app (instantiated with no arguments) that contributes entries
    to the shared catalogue at runtime — from configuration, a database, per environment. Same
    invariant as :class:`RestSourceSupplier`: never from the request."""

    def rest_sources(self) -> list[RestSourceEntry]:
        raise NotImplementedError


def _pairs(items, sep: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for item in items or ():
        key, found, value = str(item).partition(sep)
        if found and key.strip():
            out[key.strip()] = value.strip()
    return out


def rest_source(
    name: str,
    url: str,
    method: str = "GET",
    headers: tuple[str, ...] = (),
    body: str = "",
    items_path: str = "",
    value_path: str = "value",
    label_path: str = "label",
    fields: tuple[str, ...] = (),
    total_path: str = "",
    provenance: RestSourceProvenance = RestSourceProvenance.auto,
    description: str = "",
    proxy: bool = False,
) -> Callable[[type], type]:
    """Class-level, repeatable: declares one named catalogue entry (Java's ``@RestSource``).
    ``headers`` are ``"Name: Value"`` strings and ``fields`` ``"name=dot.path"`` strings."""

    entry = RestSourceEntry(
        name=name.strip(),
        source=RestDataSource(
            url=url,
            method=method,
            headers=_pairs(headers, ":"),
            body=body,
            items_path=items_path,
            value_path=value_path,
            label_path=label_path,
            proxy=proxy,
        ),
        provenance=provenance,
        fields=_pairs(fields, "="),
        total_path=total_path,
        description=description,
    )

    def deco(cls: type) -> type:
        existing = list(cls.__dict__.get("__mateu_rest_sources__", ()))
        # decorators apply bottom-up: prepend so the declaration order is kept
        cls.__mateu_rest_sources__ = [entry, *existing]  # type: ignore[attr-defined]
        return cls

    return deco


__all__ = [
    "DeclaredRestSource",
    "RestDataSource",
    "RestSourceCatalogSupplier",
    "RestSourceEntry",
    "RestSourceKind",
    "RestSourceProvenance",
    "RestSourceSupplier",
    "rest_source",
]
