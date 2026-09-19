"""Discovers ``@app`` and ``@ui`` view classes and resolves them by route or server-side type name.
Mirrors the C# MateuRegistry."""

from __future__ import annotations

import inspect
from types import ModuleType


def type_name(cls: type) -> str:
    """A stable, unique server-side type name (the analogue of C#'s ``Type.FullName``)."""
    return f"{cls.__module__}.{cls.__qualname__}"


def normalize(route: str | None) -> str:
    r = (route or "").strip("/")
    return "" if r in ("", "_empty", "_no_route", "_no_home_route") else r


class MateuRegistry:
    def __init__(self, *sources: ModuleType | type):
        self._by_route: dict[str, type] = {}
        self._by_name: dict[str, type] = {}
        self.app_type: type | None = None
        # Routes contributed IN CODE by RouteEntrySupplier subclasses found among the sources,
        # already flattened to absolute entries. Fed to the RouteRegistry as the code-authored half
        # (routes.yaml wins over them). Mirrors .NET's MateuRegistry.SuppliedRoutes.
        self.supplied_routes: list = []
        for src in sources:
            if isinstance(src, ModuleType):
                for _, cls in inspect.getmembers(src, inspect.isclass):
                    self._register(cls)
            elif isinstance(src, type):
                self._register(src)

    def _register(self, cls: type) -> None:
        if "__mateu_app__" in cls.__dict__:
            self.app_type = cls
            self._by_name[type_name(cls)] = cls
        # The route a class declares (coherence-plan #5): @app(route="/x") wins over @ui("/x") (the
        # single "declare an app" decorator); a route-less @app carries no route. Register by it.
        app_route = cls.__dict__.get("__mateu_app_route__")
        route = app_route if app_route else cls.__dict__.get("__mateu_ui__")
        if route is not None:
            self._by_route[normalize(route)] = cls
            self._by_name[type_name(cls)] = cls
        self._register_route_supplier(cls)

    def _register_route_supplier(self, cls: type) -> None:
        """A RouteEntrySupplier subclass contributes its routes to the code-authored half. A broken
        or non-instantiable supplier must not take route discovery down — it is skipped."""
        from .route_registry import RouteEntrySupplier, flatten

        if not (isinstance(cls, type) and issubclass(cls, RouteEntrySupplier)) or cls is RouteEntrySupplier:
            return
        try:
            entries = cls().routes()
            if entries:
                self.supplied_routes.extend(flatten(entries))
        except Exception:
            pass

    def resolve(self, server_side_type: str | None, route: str | None) -> type | None:
        if server_side_type and server_side_type in self._by_name:
            return self._by_name[server_side_type]
        norm = normalize(route)
        if norm in self._by_route:
            return self._by_route[norm]
        return self.app_type if norm == "" else None

    def type_by_name(self, full_name: str | None) -> type | None:
        """Resolve any class by full name (``module.QualName``) — used to instantiate a YAML page's
        declared ``modelView:`` logic class, which need not be a registered @ui view."""
        if not full_name:
            return None
        if full_name in self._by_name:
            return self._by_name[full_name]
        module_name, _, qual = full_name.rpartition(".")
        if not module_name:
            return None
        try:
            import importlib

            obj = importlib.import_module(module_name)
        except ImportError:
            return None
        for part in qual.split("."):
            obj = getattr(obj, part, None)
            if obj is None:
                return None
        return obj if isinstance(obj, type) else None

    def resolve_by_prefix(self, route: str | None) -> tuple[type, str] | None:
        """The registered view whose route is the longest prefix of ``route`` (for CRUD sub-routes)."""
        norm = normalize(route)
        parts = [] if norm == "" else norm.split("/")
        for n in range(len(parts), 0, -1):
            prefix = "/".join(parts[:n])
            if prefix in self._by_route:
                return self._by_route[prefix], prefix
        return None
