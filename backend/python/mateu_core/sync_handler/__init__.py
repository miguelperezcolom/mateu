"""Handles a single POST /mateu/v3/sync/{route} call -> a UIIncrement. Port of C#'s SyncHandler.
"""

from __future__ import annotations

from ._common import (  # noqa: F401 - the public import path of every helper
    Action,
    Aggregate,
    AggregateFunction,
    Any,
    AppSupplier,
    BannerDto,
    BaseModel,
    ButtonMetadata,
    CalendarPage,
    ClientSideComponent,
    ComponentTreeSupplier,
    ConfigDict,
    ContextVar,
    Creatable,
    CustomEventRecord,
    DataManagement,
    DateRange,
    Decimal,
    Deletable,
    DialogMetadata,
    DrawerMetadata,
    Editable,
    Enum,
    Field,
    Filterable,
    FlowStep,
    FormFieldMetadata,
    GanttPage,
    GlobalSearchSupplier,
    GroupBy,
    HorizontalLayoutMetadata,
    Label,
    ListingData,
    Lookup,
    LookupLabelSupplier,
    MateuForbiddenException,
    MateuRegistry,
    Message,
    MessageDto,
    Navigable,
    NotificationsSupplier,
    NumberRange,
    PageBanner,
    Pageable,
    ReflectionMapper,
    Required,
    RestAction,
    RestDataSource,
    RouteRegistry,
    RunActionRq,
    SAVED_IN_DRAWER_EVENT,
    SearchRequest,
    Searchable,
    Selector,
    ServerSideComponent,
    SortSpec,
    Step,
    TextMetadata,
    TodoList,
    Trigger,
    UICommand,
    UIFragment,
    UIIncrement,
    Version,
    VerticalLayoutMetadata,
    Wizard,
    YamlSpecLoader,
    _route_seed,
    _sort_key,
    action_guard,
    base64,
    camel_case,
    capabilities,
    capability_class,
    crud_element_type,
    date,
    datetime,
    enum_set_element_type,
    fluent,
    get_args,
    get_origin,
    hashlib,
    humanize,
    inspect,
    is_enum,
    json,
    listing_types,
    log,
    logging,
    normalize,
    os,
    re,
    set_current_audience,
    to_camel,
    type_name,
    urllib,
    version_field,
    view_fields,
)
from ..component_registry import ComponentRegistry
from ..action_registry import ActionRegistry
from ..rest_source_registry import RestSourceRegistry
from ..field_type_registry import FieldTypeRegistry
from ..export import Exporters
from .. import action_guard, islands
from ._base import MixinBase
from .dispatch import DispatchMixin
from .wizard import WizardHandlerMixin
from .listing import ListingHandlerMixin
from .crud import CrudHandlerMixin
from .search import SearchHandlerMixin
from .app import AppHandlerMixin
from .render import RenderHandlerMixin
from .proxy import ProxyHandlerMixin
from .contract import ContractHandlerMixin
from .actions import ActionHandlerMixin
from .helpers import ResponseHelpersMixin
from .grid_field import GridFieldHandlerMixin


class SyncHandler(
    DispatchMixin,
    WizardHandlerMixin,
    ListingHandlerMixin,
    CrudHandlerMixin,
    SearchHandlerMixin,
    AppHandlerMixin,
    RenderHandlerMixin,
    ProxyHandlerMixin,
    ContractHandlerMixin,
    ActionHandlerMixin,
    ResponseHelpersMixin,
    GridFieldHandlerMixin,
    MixinBase,
):
    def __init__(
        self,
        registry: MateuRegistry,
        translator=None,
        identity_provider=None,
        secrets_provider=None,
        proxy_timeout_seconds: float = 30.0,
        rest_sources: RestSourceRegistry | None = None,
        components: ComponentRegistry | None = None,
        environment: str | None = None,
        translations=None,
        action_catalog: ActionRegistry | None = None,
        field_types: FieldTypeRegistry | None = None,
    ):
        self.registry = registry
        #: Upper bound for a proxied (__restfetch__) upstream call.
        self.proxy_timeout_seconds = proxy_timeout_seconds
        #: The REST source catalogue: @rest_source on the registered classes + the
        #: RestSourceCatalogSupplier classes (derived), specs/ui/sources.yaml on top (authored).
        self.rest_sources = rest_sources or RestSourceRegistry(
            classes=getattr(registry, "classes", []),
            suppliers=getattr(registry, "catalog_suppliers", []),
            environment=environment,
        )
        #: The business-component catalogue: @business_component methods + ComponentCatalogSupplier
        #: classes (derived), specs/ui/components.yaml on top (authored).
        self.components = components or ComponentRegistry(
            classes=getattr(registry, "classes", []),
            suppliers=getattr(registry, "component_suppliers", []),
        )
        #: The action catalogue: ActionCatalogSupplier classes (derived), specs/ui/actions.yaml and
        #: any `type: Actions` file on top (authored).
        self.action_catalog = action_catalog or ActionRegistry(
            suppliers=getattr(registry, "action_suppliers", []),
        )
        self.mapper = ReflectionMapper(translator, identity_provider, self.rest_sources, self.components)
        self.mapper.action_catalog = self.action_catalog
        self.mapper.adapters = getattr(registry, "adapters", {})
        #: The listing exporters (the app's ListingExporter subclasses + the built-in CSV writer).
        self.mapper.exporters = Exporters(getattr(registry, "exporters", []))
        #: The translation catalogue: TranslationsSupplier classes (code) under the
        #: `type: Translations` files of the specs directory (authored wins). ${i18n.key} in YAML
        #: definitions and in any translated text is resolved per request locale.
        from ..translations import TranslationRegistry

        self.translations = translations or TranslationRegistry(
            suppliers=getattr(registry, "translations_suppliers", [])
        )
        self.mapper.translations = self.translations
        #: The field type catalogue: FieldTypeCatalogSupplier classes (code) with
        #: specs/ui/types.yaml on top (authored wins). Resolves `fieldType:` in YAML definitions
        #: and FieldType() markers on listing columns.
        self.field_types = field_types or FieldTypeRegistry(
            suppliers=getattr(registry, "field_type_suppliers", []),
        )
        self.mapper.field_types = self.field_types
        #: resolves ${secret.X} for proxy mode; None → same-named env var fallback.
        self._secrets = secrets_provider
        #: The mount's authored route registry: specs/ui/routes.yaml merged OVER the routes
        #: contributed in code by RouteEntrySupplier subclasses (discovered by the MateuRegistry).
        #: Shared with the spec loader so both see one table.
        self.routes = RouteRegistry(supplied=getattr(registry, "supplied_routes", None))
        self.yaml_specs = YamlSpecLoader(
            registry=self.routes, translations=self.translations, field_types=self.field_types
        )
        self.yaml_specs.action_catalog = self.action_catalog

    def handle(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        # A route (routes.yaml) may seed state/appState/data/appData. `state` folds into the
        # component state at resolution (see below), but the other three are applied on the
        # RESPONSE side, so the matched entry is stashed for this request and read back when the
        # increment is built (mirrors Java's HttpRequest.setAttribute("_routeAppState"/…)).
        # An embedded island's route carries its markers in a query string: strip them before
        # resolving, and remember them for the request (islands.island_flags).
        path, markers = islands.split_route(rq.route)
        state = rq.component_state or {}
        if state.get(islands.INLINE_MARKER) in (True, "true"):
            markers = markers | {islands.INLINE_MARKER}
        if path != rq.route:
            rq = rq.model_copy(update={"route": path})
        # A class-level @eyes_only view is for the authorized only, whichever way the request names
        # it — its server-side type, its route, or a sub-route of it (a crud's /new, /{id}).
        for named in (
            self.registry.resolve(rq.server_side_type, None) if rq.server_side_type else None,
            self.registry.resolve(None, rq.route) if rq.route is not None else None,
            (self.registry.resolve_by_prefix(rq.route) or (None,))[0] if rq.route else None,
        ):
            action_guard.ensure_class_access(self.mapper, named)
        # The YAML access keys (the data twin of @eyes_only & co.): a refused route / declared
        # action answers 403, and fields locked for the caller lose their client-sent values.
        rq = self._guard_yaml_access(rq)
        flags_token = islands.set_flags(markers)
        try:
            return self._handle_routed(rq, request_base_url)
        finally:
            islands.reset_flags(flags_token)

    def _guard_yaml_access(self, rq: RunActionRq) -> RunActionRq:
        """Java's ``YamlUidlLoader.guard``: route ``access:`` (the entry and its ancestors) → 403;
        a declared action whose ``access:`` the caller does not satisfy → 403 (dispatched, or
        proxied through ``__restfetch__`` by source id); locked fields dropped from the state."""
        if rq.route is None:
            return rq
        refusing = self.routes.refusing_entry(rq.route, self.mapper.authorized)
        if refusing is not None:
            action_guard.deny(f"route '{refusing.route}' declares access: not satisfied")
        spec = self.yaml_specs.load_spec(rq.route)
        if spec is None or not spec.depends_on_request():
            return rq
        from ..translations import locale_of

        personal = self.yaml_specs.load_spec_for(rq.route, self.mapper.authorized, locale_of(self.mapper))
        if personal is None:
            return rq
        if rq.action_id and rq.action_id in personal.refused_actions:
            action_guard.deny(f"action '{rq.action_id}' declares access: not satisfied")
        if rq.action_id == "__restfetch__":
            source_id = (rq.parameters or {}).get("_sourceId")
            if source_id is not None and str(source_id) in personal.refused_actions:
                action_guard.deny(f"action '{source_id}' declares access: not satisfied")
        state = rq.component_state or {}
        if personal.locked_fields and any(k in state for k in personal.locked_fields):
            narrowed = {k: v for k, v in state.items() if k not in personal.locked_fields}
            rq = rq.model_copy(update={"component_state": narrowed})
        return rq

    def _handle_routed(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        token = _route_seed.set(self.routes.match(rq.route))
        try:
            return self._seed_increment(self._handle_inner(rq, request_base_url), rq)
        finally:
            _route_seed.reset(token)
