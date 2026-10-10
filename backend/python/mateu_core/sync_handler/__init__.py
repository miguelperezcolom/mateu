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
from ..rest_source_registry import RestSourceRegistry
from .. import action_guard
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
    ):
        self.registry = registry
        #: Upper bound for a proxied (__restfetch__) upstream call.
        self.proxy_timeout_seconds = proxy_timeout_seconds
        #: The REST source catalogue: @rest_source on the registered classes + the
        #: RestSourceCatalogSupplier classes (derived), specs/ui/sources.yaml on top (authored).
        self.rest_sources = rest_sources or RestSourceRegistry(
            classes=getattr(registry, "classes", []),
            suppliers=getattr(registry, "catalog_suppliers", []),
        )
        #: The business-component catalogue: @business_component methods + ComponentCatalogSupplier
        #: classes (derived), specs/ui/components.yaml on top (authored).
        self.components = components or ComponentRegistry(
            classes=getattr(registry, "classes", []),
            suppliers=getattr(registry, "component_suppliers", []),
        )
        self.mapper = ReflectionMapper(translator, identity_provider, self.rest_sources, self.components)
        self.mapper.adapters = getattr(registry, "adapters", {})
        #: resolves ${secret.X} for proxy mode; None → same-named env var fallback.
        self._secrets = secrets_provider
        #: The mount's authored route registry: specs/ui/routes.yaml merged OVER the routes
        #: contributed in code by RouteEntrySupplier subclasses (discovered by the MateuRegistry).
        #: Shared with the spec loader so both see one table.
        self.routes = RouteRegistry(supplied=getattr(registry, "supplied_routes", None))
        self.yaml_specs = YamlSpecLoader(registry=self.routes)

    def handle(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        # A route (routes.yaml) may seed state/appState/data/appData. `state` folds into the
        # component state at resolution (see below), but the other three are applied on the
        # RESPONSE side, so the matched entry is stashed for this request and read back when the
        # increment is built (mirrors Java's HttpRequest.setAttribute("_routeAppState"/…)).
        # A class-level @eyes_only view is for the authorized only, whichever way the request names
        # it — its server-side type, its route, or a sub-route of it (a crud's /new, /{id}).
        for named in (
            self.registry.resolve(rq.server_side_type, None) if rq.server_side_type else None,
            self.registry.resolve(None, rq.route) if rq.route is not None else None,
            (self.registry.resolve_by_prefix(rq.route) or (None,))[0] if rq.route else None,
        ):
            action_guard.ensure_class_access(self.mapper, named)
        token = _route_seed.set(self.routes.match(rq.route))
        try:
            return self._seed_increment(self._handle_inner(rq, request_base_url), rq)
        finally:
            _route_seed.reset(token)
