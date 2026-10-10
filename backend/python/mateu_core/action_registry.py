"""The app's ACTION catalogue — named, client-runnable actions (flows and REST calls) declared once
and run by id from the shell menu or any page (the Python port of Java's ``ActionRegistry`` /
``ActionCatalogMapper``).

Two producers, one table: the DERIVED half is whatever ``ActionCatalogSupplier`` classes return; the
AUTHORED half is ``specs/ui/actions.yaml`` plus any other YAML under the specs directory declaring
``type: Actions`` (``MATEU_SPECS_DIR``), merged on top — authored wins, replacing outright. Ids are
global. Only client-runnable entries are kept (steps or a rest action); anything else is server
logic, which stays a view method — dropped with a warning naming it.

Never fails: a broken file or supplier logs and yields fewer entries.
"""

from __future__ import annotations

import logging
import os
import threading
from collections.abc import Iterable
from pathlib import Path
from typing import Any

import yaml

from mateu_dtos import Action, RestAction, UICommand
from mateu_uidl.action_catalog import ActionCatalogSupplier, CatalogAction, CatalogRestAction
from mateu_uidl.flow import CloseOverlay, Emit, FlowStep, MarkClean, MarkDirty, Navigate, RunAction

from .rest_source_registry import entry_of, source_dto

log = logging.getLogger("mateu.actions")

FILE = "actions.yaml"
TYPE = "Actions"


class ActionRegistry:
    def __init__(self, directory: str | None = None, suppliers: list[type] | None = None) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._suppliers = list(suppliers or [])
        self._catalog: list[CatalogAction] | None = None
        #: id → ``access:`` of an AUTHORED entry (Java's ``accessById``). Enforced like a page's
        #: declared action: not shipped to a caller who does not satisfy it (it runs in the
        #: browser, so not shipping it IS the enforcement), buttons naming it disabled, and a call
        #: that reaches the server anyway refused with 403.
        self._access_by_id: dict[str, Any] = {}
        self._lock = threading.Lock()

    def catalog(self) -> list[CatalogAction]:
        """The merged catalogue (authored over derived), loaded once."""
        if self._catalog is None:
            with self._lock:
                if self._catalog is None:
                    self._catalog = merged_over(self.authored(), self.derived())
        return self._catalog

    def get(self, action_id: str | None) -> CatalogAction | None:
        if not action_id:
            return None
        return next((a for a in self.catalog() if a.id == action_id.strip()), None)

    def derived(self) -> list[CatalogAction]:
        out: list[CatalogAction] = []
        for supplier in self._suppliers:
            try:
                contributed = supplier().action_catalog() or []
            except Exception as e:  # noqa: BLE001 - a failing supplier contributes nothing
                log.warning("Action catalogue: %s failed (%s)", supplier.__name__, e)
                continue
            out.extend(a for a in contributed if isinstance(a, CatalogAction) and a.id)
        return merged_over(client_runnable_only(out, "a supplier"), [])

    def authored(self) -> list[CatalogAction]:
        if not self._dir.is_dir():
            return []
        conventional = self._dir / FILE
        files = [conventional] if conventional.is_file() else []
        for path in sorted(p for p in self._dir.rglob("*") if p.suffix in (".yaml", ".yml")):
            if path.resolve() == conventional.resolve():
                continue
            root = _load(path)
            if isinstance(root, dict) and root.get("type") == TYPE:
                files.append(path)
        by_id: dict[str, CatalogAction] = {}
        access_by_id: dict[str, Any] = {}
        for path in files:
            for action in _read(path, access_by_id):
                by_id[action.id] = action
        self._access_by_id = {k: v for k, v in access_by_id.items() if k in by_id}
        return list(by_id.values())

    # ── access (``access:`` on an entry) ──────────────────────────────────────
    def access_of(self, action_id: str | None):
        """The restriction of catalogue action ``action_id``, or None."""
        self.catalog()
        return self._access_by_id.get(action_id) if action_id else None

    def grants(self, action_id: str | None, authorized) -> bool:
        """Whether the caller (``authorized``: the mapper's gate check) may run ``action_id``."""
        access = self.access_of(action_id)
        return access is None or bool(authorized(access))

    def refused_for(self, authorized) -> set[str]:
        """The ids of the restricted catalogue actions the caller may NOT run."""
        self.catalog()
        if authorized is None:
            return set()
        return {i for i, access in self._access_by_id.items() if not authorized(access)}

    def restricted_ids(self) -> set[str]:
        self.catalog()
        return set(self._access_by_id)

    def restricts_any(self) -> bool:
        self.catalog()
        return bool(self._access_by_id)

    def catalog_for(self, authorized) -> list[CatalogAction]:
        """The catalogue without the entries the caller may not run."""
        all_ = self.catalog()
        if not self._access_by_id or authorized is None:
            return all_
        refused = self.refused_for(authorized)
        return [a for a in all_ if a.id not in refused]

    def wire(self, authorized=None) -> list[Action]:
        """The catalogue on the wire (AppMetadata.actionCatalogue), flows lowered to commands —
        without the entries the caller (``authorized``) may not run."""
        return [to_dto(a) for a in self.catalog_for(authorized)]

    def referenced_by(
        self, referenced: Iterable[str], owned: Iterable[str], authorized=None
    ) -> list[CatalogAction]:
        """The catalogue entries an owner needs to carry: each referenced id it does NOT own, closed
        transitively over RunAction steps. OWNER FIRST: an owned id is never replaced. With
        ``authorized``, the entries the caller may not run are left out (nor followed)."""
        known = set(owned)
        if authorized is not None and self.restricts_any():
            known |= self.refused_for(authorized)  # treated as owned: never added, never followed
        found: list[CatalogAction] = []
        pending = list(referenced)
        while pending:
            action_id = pending.pop(0)
            entry = self.get(action_id) if action_id not in known else None
            if entry is None:
                continue
            known.add(action_id)
            found.append(entry)
            pending.extend(s.action_id for s in entry.steps if isinstance(s, RunAction))
        return found


def merged_over(authored: list[CatalogAction], derived: list[CatalogAction]) -> list[CatalogAction]:
    """Authored over derived, keyed by id: an authored entry replaces the derived one in place."""
    by_id: dict[str, CatalogAction] = {a.id: a for a in derived}
    for a in authored:
        by_id[a.id] = a
    return list(by_id.values())


def client_runnable_only(actions: Iterable[CatalogAction], origin: Any) -> list[CatalogAction]:
    accepted = []
    for action in actions:
        if action.client_runnable():
            accepted.append(action)
        else:
            log.warning(
                "Action catalogue: '%s' in %s is not client-runnable (it has neither steps nor a"
                " restAction) and is ignored — server logic stays a view method",
                action.id,
                origin,
            )
    return accepted


def _load(path: Path) -> Any:
    try:
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return None


def collect_ids(node: Any, out: set[str] | None = None) -> set[str]:
    """Every ``actionId`` / ``*ActionId`` string a raw YAML tree names (Java's
    ``ActionRegistry.collectIds``)."""
    out = set() if out is None else out
    if isinstance(node, dict):
        for name, value in node.items():
            if isinstance(value, str) and (name == "actionId" or name.endswith("ActionId")):
                if value.strip():
                    out.add(value)
            else:
                collect_ids(value, out)
    elif isinstance(node, list):
        for child in node:
            collect_ids(child, out)
    return out


def catalogue_ids_named_by(tree: Any) -> set[str]:
    """The action ids ``tree`` names that its own ``actions:`` do not declare — OWNER FIRST: an id
    the page declares is the page's, never the catalogue's (Java's ``catalogueIdsNamedBy``)."""
    ids = collect_ids(tree)
    own = tree.get("actions") if isinstance(tree, dict) else None
    if isinstance(own, list):
        for action in own:
            if isinstance(action, dict):
                ids.discard(str(action.get("id")))
    return ids


def _read(path: Path, access_by_id: dict[str, Any] | None = None) -> list[CatalogAction]:
    from .yaml_access import access_of

    root = _load(path)
    nodes = root.get("actions") if isinstance(root, dict) else root
    if not isinstance(nodes, list):
        return []
    parsed = []
    for node in nodes:
        if not isinstance(node, dict):
            continue
        action_id = str(node.get("id") or "").strip()
        if not action_id:
            log.warning("Ignoring an action with no id in %s", path)
            continue
        if access_by_id is not None:
            access = access_of(node.get("access"))
            if access is not None:
                access_by_id[action_id] = access
            else:
                access_by_id.pop(action_id, None)  # a later file redeclaring it without access
        parsed.append(
            CatalogAction(
                id=action_id,
                description=str(node.get("description") or ""),
                steps=tuple(s for s in (_step(n) for n in node.get("steps") or []) if s is not None),
                rest_action=_rest_action(node.get("restAction")),
            )
        )
    return client_runnable_only(parsed, path)


def _step(node: Any) -> FlowStep | None:
    if not isinstance(node, dict):
        return None
    kind = node.get("type")
    if kind == "Navigate":
        return Navigate(str(node.get("route") or ""))
    if kind == "Emit":
        return Emit(str(node.get("event") or ""), node.get("payload"))
    if kind == "CloseOverlay":
        return CloseOverlay(node.get("event"))
    if kind == "RunAction":
        return RunAction(str(node.get("actionId") or ""))
    if kind == "MarkClean":
        return MarkClean()
    if kind == "MarkDirty":
        return MarkDirty()
    log.warning("Ignoring a flow step of unknown type '%s'", kind)
    return None


def _rest_action(node: Any) -> CatalogRestAction | None:
    if not isinstance(node, dict):
        return None
    # reuse the source reader of the REST catalogue (an entry nests its request under `source:`)
    entry = entry_of({"name": "_", "source": node.get("source")})
    return CatalogRestAction(
        source=entry.source,
        success_message=node.get("successMessage"),
        result_path=node.get("resultPath"),
    )


def lower(step: FlowStep) -> UICommand:
    """A step as the one wire command it is, with no target (Java's ActionDtoMapper: the client
    applies it on the component that fired the action)."""
    return step.to_command().model_copy(update={"target_component_id": None})


def to_dto(action: CatalogAction) -> Action:
    """One catalogue entry on the wire (Java's ActionDtoMapper.mapAction)."""
    rest = action.rest_action
    return Action(
        id=action.id,
        validation_required=False,
        rest_action=(
            RestAction(
                source=source_dto(rest.source),
                success_message=rest.success_message,
                result_path=rest.result_path,
            )
            if rest is not None
            else None
        ),
        commands=[lower(s) for s in action.steps] or None,
    )


__all__ = [
    "ActionRegistry",
    "ActionCatalogSupplier",
    "catalogue_ids_named_by",
    "collect_ids",
    "merged_over",
    "to_dto",
    "lower",
]
