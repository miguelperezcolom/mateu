"""The app's REST source catalogue — every endpoint its screens consume, declared once (the Python
port of Java's ``RestSourceRegistry`` / ``RestSourceCatalog`` / ``RestSourceCatalogMapper``).

Two producers, one catalogue: the DERIVED half is ``@rest_source`` on the classes the app registers
plus whatever ``RestSourceCatalogSupplier`` classes return (they go last, so a catalogue built from
configuration can override a compiled-in default); the AUTHORED half is ``specs/ui/sources.yaml``
(``MATEU_SPECS_DIR``), merged on top — authored wins, replacing an entry outright and keeping its
position. Names are global.

Never fails: a broken file or a failing supplier logs and yields fewer entries. A surface naming a
source the catalogue does not carry is left as declared.
"""

from __future__ import annotations

import logging
import os
import threading
from pathlib import Path
from typing import Any

import yaml

from . import sample_sources
from mateu_dtos import RestDataSource as RestDataSourceDto
from mateu_dtos import RestSourceEntryRecord
from mateu_uidl.rest_sources import (
    RestDataSource,
    RestSourceCatalogSupplier,
    RestSourceEntry,
    RestSourceProvenance,
)

log = logging.getLogger("mateu.rest_sources")

FILE = "sources.yaml"


class RestSourceRegistry:
    def __init__(
        self,
        directory: str | None = None,
        classes: list[type] | None = None,
        suppliers: list[type] | None = None,
        file: str | Path | None = None,
        environment: str | None = None,
    ) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        #: The deployment environment to overlay (``environments/<name>.yaml``); None → the
        #: ``MATEU_ENVIRONMENT`` variable; neither → the catalogue as authored.
        self._environment = environment
        self._file = Path(file) if file is not None else None
        self._classes = list(classes or [])
        self._suppliers = list(suppliers or [])
        self._catalog: list[RestSourceEntry] | None = None
        self._lock = threading.Lock()

    # ── the catalogue ─────────────────────────────────────────────────────────
    def catalog(self) -> list[RestSourceEntry]:
        """The merged catalogue (authored over derived), loaded once."""
        if self._catalog is None:
            with self._lock:
                if self._catalog is None:
                    # The active deployment environment re-points named sources on top of
                    # everything — so the wire and the proxy both see it (Java's Environments).
                    from .environments import active, overlay

                    self._catalog = overlay(
                        merged_over(self.authored(), self.derived()),
                        active(self._dir, self._environment),
                    )
        return self._catalog

    def get(self, name: str | None) -> RestSourceEntry | None:
        if not name:
            return None
        return next((e for e in self.catalog() if e.name == name.strip()), None)

    def derived(self) -> list[RestSourceEntry]:
        by_name: dict[str, RestSourceEntry] = {}
        for cls in self._classes:
            for entry in cls.__dict__.get("__mateu_rest_sources__", ()) or ():
                if entry.name:
                    by_name[entry.name] = entry
        for supplier in self._suppliers:
            try:
                contributed = supplier().rest_sources() or []
            except Exception as e:  # noqa: BLE001 - a failing supplier contributes nothing
                log.warning("REST source catalogue: %s failed (%s)", supplier.__name__, e)
                continue
            for entry in contributed:
                if isinstance(entry, RestSourceEntry) and entry.name:
                    by_name[entry.name] = entry
        return list(by_name.values())

    def authored(self) -> list[RestSourceEntry]:
        path = self._file or (self._dir / FILE)
        if not path.is_file():
            return []
        try:
            root = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001 - a broken file must not take the app down
            log.warning("Ignoring unreadable %s (%s)", path, e)
            return []
        nodes = root.get("sources") if isinstance(root, dict) else root
        if not isinstance(nodes, list):
            return []
        out = []
        for node in nodes:
            entry = entry_of(node, path, path.parent)
            if entry is not None:
                out.append(entry)
        return out

    # ── resolution ────────────────────────────────────────────────────────────
    def resolve(self, declared: RestDataSourceDto | None) -> RestDataSourceDto | None:
        """Fills a by-reference descriptor in from the catalogue (the values declared on the
        surface win, Java's ``RestDataSource.resolvedAgainst``). An inline descriptor, or a
        reference the catalogue does not carry, is returned as declared."""
        if declared is None or not (declared.ref or "").strip():
            return declared
        entry = self.get(declared.ref)
        if entry is None:
            return declared
        src = entry.source

        def pick(mine, theirs):
            return theirs if mine is None or (isinstance(mine, str) and not mine.strip()) else mine

        return RestDataSourceDto(
            ref=declared.ref,
            url=pick(declared.url, src.url),
            method=pick(declared.method, src.method),
            headers=declared.headers if declared.headers else (dict(src.headers) or None),
            body=pick(declared.body, src.body),
            items_path=pick(declared.items_path, src.items_path),
            value_path=pick(declared.value_path, src.value_path),
            label_path=pick(declared.label_path, src.label_path),
            proxy=bool(declared.proxy or src.proxy),
            # the surface's own sample > the entry's > the entry's source's
            sample=declared.sample if declared.sample is not None else entry.effective_sample(),
        )

    def wire(self, with_samples: bool | None = None) -> list[RestSourceEntryRecord]:
        """The catalogue as wire entries (AppMetadata.restSources). The samples travel only in
        sample mode: a production app does not ship design-time data it will never use."""
        if with_samples is None:
            with_samples = sample_sources.enabled()
        return [entry_record(e, with_samples) for e in self.catalog()]


def merged_over(authored: list[RestSourceEntry], derived: list[RestSourceEntry]) -> list[RestSourceEntry]:
    """Authored over derived: an authored entry replaces the derived one of the same name, in
    place; new names append (Java's ``RestSourceCatalog.mergedOver``)."""
    by_name: dict[str, RestSourceEntry] = {e.name: e for e in derived}
    for e in authored:
        by_name[e.name] = e
    return list(by_name.values())


def _text(node: dict, key: str, default: str = "") -> str:
    value = node.get(key)
    return default if value is None else str(value)


def _map(node: dict, key: str) -> dict[str, str]:
    value = node.get(key)
    return {str(k): str(v) for k, v in value.items()} if isinstance(value, dict) else {}


def entry_of(node: Any, where: Any = FILE, specs_dir: Path | None = None) -> RestSourceEntry | None:
    """One authored YAML entry: the keys ARE the record's (``name``, ``source``, ``provenance``,
    ``fields``, ``totalPath``, ``description``), the request nested under ``source:``."""
    if not isinstance(node, dict):
        return None
    name = _text(node, "name").strip()
    if not name:
        log.warning("Ignoring a REST source with no name in %s", where)
        return None
    raw = node.get("source")
    raw = raw if isinstance(raw, dict) else {}
    source = RestDataSource(
        ref=_text(raw, "ref"),
        url=_text(raw, "url"),
        method=_text(raw, "method", "GET") or "GET",
        headers=_map(raw, "headers"),
        body=_text(raw, "body"),
        items_path=_text(raw, "itemsPath") or _text(raw, "items_path"),
        value_path=_text(raw, "valuePath") or _text(raw, "value_path") or "value",
        label_path=_text(raw, "labelPath") or _text(raw, "label_path") or "label",
        proxy=bool(raw.get("proxy", False)),
        sample=raw.get("sample"),
    )
    sample_file = _text(node, "sampleFile") or _text(node, "sample_file")
    sample = node.get("sample")
    if sample is None and sample_file.strip():
        sample = sample_from_file(name, sample_file, specs_dir)
    declared = _text(node, "provenance").strip()
    try:
        provenance = RestSourceProvenance(declared) if declared else RestSourceProvenance.auto
    except ValueError:
        log.warning("Unknown provenance '%s' in %s — inferring it from the url instead", declared, where)
        provenance = RestSourceProvenance.auto
    return RestSourceEntry(
        name=name,
        source=source,
        provenance=provenance,
        fields=_map(node, "fields"),
        total_path=_text(node, "totalPath") or _text(node, "total_path"),
        description=_text(node, "description"),
        sample=sample,
        sample_file=sample_file,
    )


def sample_from_file(source_name: str, sample_file: str, specs_dir: Path | None) -> Any:
    """A ``sampleFile:`` (JSON or YAML — YAML is a superset of JSON, one reader for both),
    relative to specs/ui, as plain data; None (WARNed) when it cannot be read — a missing sample
    never takes the catalogue down."""
    base = specs_dir or Path(os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
    relative = sample_file.strip().lstrip("/")
    if relative.startswith("specs/ui/"):
        relative = relative[len("specs/ui/"):]
    path = base / relative
    if not path.is_file():
        log.warning("REST source '%s': sampleFile %s not found", source_name, path)
        return None
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        log.warning("REST source '%s': could not read sampleFile %s: %s", source_name, path, e)
        return None


def source_dto(src: RestDataSource) -> RestDataSourceDto:
    """The uidl descriptor as the wire one (blank strings travel as absent)."""
    return RestDataSourceDto(
        ref=src.ref or None,
        url=src.url or None,
        method=src.method or None,
        headers=dict(src.headers) or None,
        body=src.body or None,
        items_path=src.items_path or None,
        value_path=src.value_path or None,
        label_path=src.label_path or None,
        proxy=src.proxy,
        sample=src.sample,
    )


def entry_record(entry: RestSourceEntry, with_samples: bool = False) -> RestSourceEntryRecord:
    source = source_dto(entry.source)
    if not with_samples:
        source = source.model_copy(update={"sample": None})
    return RestSourceEntryRecord(
        name=entry.name,
        source=source,
        fields=dict(entry.fields),
        total_path=entry.total_path or None,
        provenance=entry.effective_provenance().value,
        description=entry.description or None,
        sample=entry.sample if with_samples else None,
    )


__all__ = [
    "RestSourceRegistry",
    "RestSourceCatalogSupplier",
    "entry_of",
    "entry_record",
    "merged_over",
    "source_dto",
]
