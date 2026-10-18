"""The business-component catalogue: reusable BOUND compositions of existing components, declared
once and referenced by name (``ComponentRef("AgencySelector")``) — the twin of the REST source
catalogue one level up (a source names an endpoint, a business component names a composition).

Producers, merged into one table — **authored wins**: the derived half is ``@business_component``
on a method of an app class (static, or on a class instantiable with no arguments) plus whatever
``ComponentCatalogSupplier`` classes return; the authored half is ``specs/ui/components.yaml``
(``{components: [{name, component}]}``, the component a YAML layout node). Java's
``@BusinessComponent`` / ``ComponentCatalogSupplier`` / ``ComponentEntry``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


@dataclass(frozen=True)
class ComponentEntry:
    """One named composition of the catalogue."""

    name: str
    component: Any


class ComponentCatalogSupplier:
    """Implemented by a class of the app (instantiated with no arguments) that contributes
    business components at runtime — from configuration, a database…"""

    def business_components(self) -> list[ComponentEntry]:
        raise NotImplementedError


def business_component(name: str) -> Callable:
    """Marks a method (static, or of a class instantiable with no arguments) returning a fluent
    composition as the catalogue entry ``name``."""

    def deco(fn):
        target = fn.__func__ if isinstance(fn, (staticmethod, classmethod)) else fn
        target.__mateu_business_component__ = name.strip()
        return fn

    return deco


__all__ = ["ComponentCatalogSupplier", "ComponentEntry", "business_component"]
