"""Discovers ``@app`` and ``@ui`` view classes and resolves them by route or server-side type name.
Mirrors the C# MateuRegistry."""

from __future__ import annotations

import logging
import inspect
from typing import Any
from types import ModuleType

_log = logging.getLogger("mateu.registry")


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
        #: The mounts of the registered apps (an app's own @ui/@app route): a route that arrives
        #: WITH its mount (a notification / global-search hit, a deep link: "/shell/probe") resolves
        #: like the mount-relative one ("probe"), as on Java, where the mount is stripped.
        self._mounts: list[str] = []
        self.app_type: type | None = None
        # Routes contributed IN CODE by RouteEntrySupplier subclasses found among the sources,
        # already flattened to absolute entries. Fed to the RouteRegistry as the code-authored half
        # (routes.yaml wins over them). Mirrors .NET's MateuRegistry.SuppliedRoutes.
        self.supplied_routes: list = []
        #: Every class found among the sources (they may carry @rest_source / @business_component
        #: declarations, which belong to the app whatever class they sit on).
        self.classes: list[type] = []
        #: RestSourceCatalogSupplier subclasses found among the sources (the code-authored half of
        #: the REST source catalogue; instantiated with no arguments, the port's idiom).
        self.catalog_suppliers: list[type] = []
        #: ComponentCatalogSupplier subclasses (the code half of the business-component catalogue).
        self.component_suppliers: list[type] = []
        #: ActionCatalogSupplier subclasses (the code half of the action catalogue).
        self.action_suppliers: list[type] = []
        #: FieldTypeCatalogSupplier subclasses (the code half of the field type catalogue;
        #: specs/ui/types.yaml wins over them).
        self.field_type_suppliers: list[type] = []
        #: model type → its ComponentAdapter instance (the ComponentAdapter SPI).
        self.adapters: dict[type, object] = {}
        #: TranslationsSupplier subclasses (the code half of the translation catalogue; the
        #: `type: Translations` files win over them key by key).
        self.translations_suppliers: list[type] = []
        #: The application's ListingExporter instances (one per format; Mateu ships no Excel / PDF
        #: engine — the built-in CSV writer fills in when none writes CSV).
        self.exporters: list = []
        #: Server-side micro frontend resolution (EXPERIMENTAL): the RemoteCatalogSupplier /
        #: RemoteIdentityStrategy / MicroFrontendResolutionListener subclasses found among the
        #: sources (instantiated with no arguments), and a RemoteRegistry / FragmentCacheStore /
        #: CorrelationIdProvider subclass replacing Mateu's own.
        self.remote_suppliers: list = []
        self.identity_strategies: list = []
        self.resolution_listeners: list = []
        self.remote_registry = None
        self.fragment_cache_store = None
        self.correlation_id_provider = None
        #: The ContentSlot fields of the registered classes, by key (a malformed or repeated key
        #: fails the registration — the port's twin of Java's compile error).
        self.content_slots: dict = {}
        for src in sources:
            if isinstance(src, ModuleType):
                for _, cls in inspect.getmembers(src, inspect.isclass):
                    self._register(cls)
            elif isinstance(src, type):
                self._register(src)

    @property
    def registered_types(self) -> list[type]:
        """Every class a route or a serverSideType resolves to (the registered UI types)."""
        return list(dict.fromkeys(self._by_name.values()))

    def _register(self, cls: type) -> None:
        if cls not in self.classes:
            self.classes.append(cls)
        self._register_catalog_supplier(cls)
        self._register_microfrontend_parts(cls)
        self._register_content_slots(cls)
        if "__mateu_app__" in cls.__dict__:
            self.app_type = cls
            self._by_name[type_name(cls)] = cls
            mount = normalize(cls.__dict__.get("__mateu_app_route__") or cls.__dict__.get("__mateu_ui__") or "")
            if mount and mount not in self._mounts:
                self._mounts.append(mount)
        # The route a class declares (coherence-plan #5): @app(route="/x") wins over @ui("/x") (the
        # single "declare an app" decorator); a route-less @app carries no route. Register by it.
        app_route = cls.__dict__.get("__mateu_app_route__")
        route = app_route if app_route else cls.__dict__.get("__mateu_ui__")
        if route is not None:
            self._by_route[normalize(route)] = cls
            self._by_name[type_name(cls)] = cls
        self._register_route_supplier(cls)

    def _register_microfrontend_parts(self, cls: type) -> None:
        from mateu_ui.uidl import remote

        def concrete(base) -> bool:
            return (
                isinstance(cls, type)
                and issubclass(cls, base)
                and cls is not base
                and not inspect.isabstract(cls)
                and not cls.__module__.startswith("mateu_ui.")
            )

        def instance():
            try:
                return cls()
            except Exception as e:  # noqa: BLE001 - a broken part is skipped, logged
                _log.warning("%s could not be instantiated (%s)", cls.__name__, e)
                return None

        base: type
        for base, bucket in (
            (remote.RemoteCatalogSupplier, self.remote_suppliers),
            (remote.RemoteIdentityStrategy, self.identity_strategies),
            (remote.MicroFrontendResolutionListener, self.resolution_listeners),
        ):
            if concrete(base) and not any(type(each) is cls for each in bucket):
                made = instance()
                if made is not None:
                    bucket.append(made)
        for base, attribute in (
            (remote.RemoteRegistry, "remote_registry"),
            (remote.FragmentCacheStore, "fragment_cache_store"),
            (remote.CorrelationIdProvider, "correlation_id_provider"),
        ):
            if concrete(base) and type(getattr(self, attribute)) is not cls:
                made = instance()
                if made is not None:
                    setattr(self, attribute, made)

    def _register_content_slots(self, cls: type) -> None:
        """Records the ContentSlot fields ``cls`` (and its bases) declare; a malformed key or one
        already used by another field raises ``ContentSlotKeyError``."""
        from .microfrontends import ContentSlotKeyError, content_slots_of

        if not isinstance(cls, type):
            return
        for klass in cls.__mro__:
            if klass is object or klass.__module__ in ("builtins", "typing", "abc"):
                continue
            for slot in content_slots_of(klass):
                previous = self.content_slots.get(slot.key)
                if previous is not None and (previous.declared_in, previous.field) != (slot.declared_in, slot.field):
                    raise ContentSlotKeyError(
                        f"ContentSlot key '{slot.key}' of {slot.declared_in}.{slot.field} is already used by "
                        f"{previous.declared_in}.{previous.field}: a key names one slot of the application"
                    )
                self.content_slots[slot.key] = slot

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
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            _log.warning("_register_route_supplier failed, falling back (%s)", e)

    def _register_catalog_supplier(self, cls: type) -> None:
        from mateu_ui.uidl.rest_sources import RestSourceCatalogSupplier

        from mateu_ui.uidl.adapters import ComponentAdapter

        from .component_registry import is_catalog_supplier

        if isinstance(cls, type) and issubclass(cls, ComponentAdapter) and cls is not ComponentAdapter:
            try:
                adapter = cls()
                model = adapter.type()
            except Exception as e:  # noqa: BLE001 - a broken adapter adapts nothing
                _log.warning("Component adapter %s could not be registered (%s)", cls.__name__, e)
            else:
                if isinstance(model, type):
                    self.adapters[model] = adapter
                    # the island / routed model is addressed by its type name on the wire
                    self._by_name[type_name(model)] = model

        from mateu_ui.uidl.export import ListingExporter

        if (
            isinstance(cls, type)
            and issubclass(cls, ListingExporter)
            and cls is not ListingExporter
            and not cls.__module__.startswith("mateu_ui.core.")
            and not any(type(e) is cls for e in self.exporters)
        ):
            try:
                self.exporters.append(cls())
            except Exception as e:  # noqa: BLE001 - a broken exporter exports nothing
                _log.warning("Listing exporter %s could not be registered (%s)", cls.__name__, e)

        from mateu_ui.uidl.i18n import TranslationsSupplier

        if (
            isinstance(cls, type)
            and issubclass(cls, TranslationsSupplier)
            and cls is not TranslationsSupplier
            and cls not in self.translations_suppliers
        ):
            self.translations_suppliers.append(cls)

        from mateu_ui.uidl.action_catalog import ActionCatalogSupplier

        if (
            isinstance(cls, type)
            and issubclass(cls, ActionCatalogSupplier)
            and cls is not ActionCatalogSupplier
            and cls not in self.action_suppliers
        ):
            self.action_suppliers.append(cls)

        from mateu_ui.uidl.field_types import FieldTypeCatalogSupplier

        if (
            isinstance(cls, type)
            and issubclass(cls, FieldTypeCatalogSupplier)
            and cls is not FieldTypeCatalogSupplier
            and cls not in self.field_type_suppliers
        ):
            self.field_type_suppliers.append(cls)
        if is_catalog_supplier(cls) and cls not in self.component_suppliers:
            self.component_suppliers.append(cls)
        if (
            isinstance(cls, type)
            and issubclass(cls, RestSourceCatalogSupplier)
            and cls is not RestSourceCatalogSupplier
            and cls not in self.catalog_suppliers
        ):
            self.catalog_suppliers.append(cls)

    def adapter_for(self, cls) -> object | None:
        """The ComponentAdapter registered for ``cls`` (or one of its bases), or None."""
        if not isinstance(cls, type):
            return None
        for klass in cls.__mro__:
            if klass in self.adapters:
                return self.adapters[klass]
        return None

    def resolve(self, server_side_type: str | None, route: str | None) -> type | None:
        if server_side_type and server_side_type in self._by_name:
            return self._by_name[server_side_type]
        norm = normalize(route)
        if norm in self._by_route:
            return self._by_route[norm]
        relative = self.under_mount(norm)
        if relative is not None and relative in self._by_route:
            return self._by_route[relative]
        return self.app_type if norm == "" else None

    def under_mount(self, norm: str) -> str | None:
        """``norm`` (a normalized route) without the mount of a registered app it starts with, or
        None when it starts with none — or names a registered route as it is (that one wins)."""
        if norm in self._by_route:
            return None
        for mount in self._mounts:
            if norm.startswith(mount + "/"):
                return norm[len(mount) + 1:]
        return None

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

            obj: Any = importlib.import_module(module_name)
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
        relative = self.under_mount(norm)
        if relative is not None and self.resolve_by_prefix(relative) is not None:
            return self.resolve_by_prefix(relative)
        parts = [] if norm == "" else norm.split("/")
        for n in range(len(parts), 0, -1):
            prefix = "/".join(parts[:n])
            if prefix in self._by_route:
                return self._by_route[prefix], prefix
        return None
