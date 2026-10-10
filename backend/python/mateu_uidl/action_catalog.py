"""The action catalogue's authoring types (the Python mirror of Java's ``ActionCatalog`` /
``ActionCatalogSupplier`` and the fluent ``Action`` as the catalogue uses it).

A catalogue entry is a named, CLIENT-RUNNABLE action: a flow (``steps``, the existing
:mod:`mateu_uidl.flow` verbs) or a REST call (``rest_action``). Run by id from the shell menu or any
page; an owner's own action of the same id always wins.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .flow import FlowStep
from .rest_sources import RestDataSource


@dataclass(frozen=True)
class CatalogRestAction:
    """A client-side REST call an action makes instead of a server dispatch."""

    source: RestDataSource
    success_message: str | None = None
    result_path: str | None = None


@dataclass(frozen=True)
class CatalogAction:
    """One named action of the catalogue."""

    id: str
    description: str = ""
    steps: tuple[FlowStep, ...] = ()
    rest_action: CatalogRestAction | None = None

    def __post_init__(self):
        object.__setattr__(self, "steps", tuple(self.steps or ()))

    def client_runnable(self) -> bool:
        """True when it runs in the browser: a non-empty flow or a REST call."""
        return bool(self.steps) or self.rest_action is not None


class ActionCatalogSupplier:
    """Implemented by a class of the app (instantiated with no arguments) that contributes actions
    to the catalogue at runtime. Only client-runnable entries are kept; the authored file wins."""

    def action_catalog(self) -> list[CatalogAction]:
        raise NotImplementedError


__all__ = ["CatalogAction", "CatalogRestAction", "ActionCatalogSupplier"]
