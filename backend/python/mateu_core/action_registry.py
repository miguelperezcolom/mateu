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
        for path in files:
            for action in _read(path):
                by_id[action.id] = action
        return list(by_id.values())

    def wire(self) -> list[Action]:
        """The catalogue on the wire (AppMetadata.actionCatalogue), flows lowered to commands."""
        return [to_dto(a) for a in self.catalog()]

    def referenced_by(self, referenced: Iterable[str], owned: Iterable[str]) -> list[CatalogAction]:
        """The catalogue entries an owner needs to carry: each referenced id it does NOT own, closed
        transitively over RunAction steps. OWNER FIRST: an owned id is never replaced."""
        known = set(owned)
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


def _read(path: Path) -> list[CatalogAction]:
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


__all__ = ["ActionRegistry", "ActionCatalogSupplier", "merged_over", "to_dto", "lower"]
