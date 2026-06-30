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
        if "__mateu_ui__" in cls.__dict__:
            self._by_route[normalize(cls.__dict__["__mateu_ui__"])] = cls
            self._by_name[type_name(cls)] = cls

    def resolve(self, server_side_type: str | None, route: str | None) -> type | None:
        if server_side_type and server_side_type in self._by_name:
            return self._by_name[server_side_type]
        norm = normalize(route)
        if norm in self._by_route:
            return self._by_route[norm]
        return self.app_type if norm == "" else None

    def resolve_by_prefix(self, route: str | None) -> tuple[type, str] | None:
        """The registered view whose route is the longest prefix of ``route`` (for CRUD sub-routes)."""
        norm = normalize(route)
        parts = [] if norm == "" else norm.split("/")
        for n in range(len(parts), 0, -1):
            prefix = "/".join(parts[:n])
            if prefix in self._by_route:
                return self._by_route[prefix], prefix
        return None
