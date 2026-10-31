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
from ..agent_push import (
    DEFAULT_MAX_SESSIONS,
    DEFAULT_MAX_ANONYMOUS_SESSIONS_PER_ADDRESS,
    DEFAULT_MAX_SESSIONS_PER_OWNER,
    DEFAULT_RATE_PER_MINUTE,
    AgentSessions,
)
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



def referenced_rest_source_names(increment) -> tuple[set[str], bool]:
    """The source names a response's components reference by ``ref``, and whether it already
    carries the app's catalogue (an App metadata with ``rest_sources``)."""
    from pydantic import BaseModel
    from mateu_ui.dtos import AppMetadata, RestDataSource

    refs: set[str] = set()
    carries = False
    seen: set[int] = set()
    stack: list[object] = [increment]
    while stack:
        node = stack.pop()
        if node is None or isinstance(node, (str, bytes, int, float, bool)):
            continue
        if id(node) in seen:
            continue
        seen.add(id(node))
        if isinstance(node, dict):
            stack.extend(node.values())
        elif isinstance(node, (list, tuple, set)):
            stack.extend(node)
        elif isinstance(node, BaseModel):
            if isinstance(node, AppMetadata) and node.rest_sources:
                carries = True
            if isinstance(node, RestDataSource) and node.ref and node.ref.strip():
                refs.add(node.ref.strip())
            stack.extend(getattr(node, name, None) for name in type(node).model_fields)
    return refs, carries

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
        #: Whether the app exposes its authoring plane (the MCP endpoint is on): the reserved
        #: __validate__ action is then served on the plain sync endpoint too (the sidecar calls it
        #: there); otherwise only to an MCP tool call or in dev mode (mateu_ui.core.authoring_gate).
        self.authoring_open = False
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
        #: The live UI sessions an MCP caller may push UI to; None = live UI push is off.
        self.agent_push: AgentSessions | None = None
        #: Whether the reserved __content_slots__ action answers the content slot descriptor.
        self.content_slots_descriptor_enabled = False
        #: Resolves the micro frontends declared resolve=SERVER and the content slots.
        self.microfrontends: Any = None
        self.configure_microfrontends()

    def configure_microfrontends(
        self,
        remotes=None,
        default_timeout_ms: int | None = None,
        max_budget_ms: int | None = None,
        content_remote_id: str | None = None,
        content_route: str | None = None,
        self_base_url: str | None = None,
        content_slots_descriptor_enabled: bool | None = None,
        remote_registry=None,
        identity_strategies=None,
        fragment_cache_store=None,
        correlation_id_provider=None,
        resolution_listeners=None,
        http_client=None,
    ):
        """(Re)builds the server-side micro frontend resolver (``add_mateu`` calls it with its
        options): what is passed wins over what the registry discovered among the sources, which
        wins over Mateu's defaults (EXPERIMENTAL)."""
        from .. import microfrontends as mfe

        registry = self.registry
        settings = mfe.MicroFrontendSettings.from_env(
            default_timeout_ms=default_timeout_ms,
            max_budget_ms=max_budget_ms,
            content_remote_id=content_remote_id,
            content_route=content_route,
            self_base_url=self_base_url,
        )
        if content_slots_descriptor_enabled is None:
            content_slots_descriptor_enabled = os.environ.get(
                "MATEU_CONTENT_SLOTS_DESCRIPTOR_ENABLED", ""
            ).strip().lower() in ("1", "true", "yes", "on")
        self.content_slots_descriptor_enabled = bool(content_slots_descriptor_enabled)
        mapper = self.mapper
        self.microfrontends = mfe.MicroFrontendServerResolver(
            registry=remote_registry
            or getattr(registry, "remote_registry", None)
            or mfe.DefaultRemoteRegistry(getattr(registry, "remote_suppliers", []), remotes or ()),
            http=http_client,
            cache=fragment_cache_store or getattr(registry, "fragment_cache_store", None),
            identities=mfe.RemoteIdentityStrategies(
                [*getattr(registry, "identity_strategies", []), *(identity_strategies or ())]
            ),
            correlation=correlation_id_provider or getattr(registry, "correlation_id_provider", None),
            listeners=[*getattr(registry, "resolution_listeners", []), *(resolution_listeners or ())],
            settings=settings,
            callers=lambda request: mapper.identity_provider() if mapper.identity_provider else None,
        )
        return self.microfrontends

    def enable_agent_push(
        self,
        rate_per_minute: int = DEFAULT_RATE_PER_MINUTE,
        max_sessions: int = DEFAULT_MAX_SESSIONS,
        max_sessions_per_owner: int = DEFAULT_MAX_SESSIONS_PER_OWNER,
        max_anonymous_sessions_per_address: int = DEFAULT_MAX_ANONYMOUS_SESSIONS_PER_ADDRESS,
    ) -> AgentSessions:
        """Switch live UI push on (``add_mateu(..., mcp=True, mcp_push=True)`` calls it): the app
        metadata says ``agentPush: true``, the ``_agent-*`` actions answer and the MCP push tools
        reach the sessions registered here."""
        self.agent_push = AgentSessions(
            rate_per_minute=rate_per_minute,
            max_sessions=max_sessions,
            max_sessions_per_owner=max_sessions_per_owner,
            max_anonymous_sessions_per_address=max_anonymous_sessions_per_address,
        )
        self.mapper.agent_push_enabled = True
        return self.agent_push

    def handle(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        from .. import microfrontends as mfe
        from ..request_context import current_request

        if rq.action_id == mfe.CONTENT_SLOTS_ACTION:
            return self._content_slots_response()
        pending, token = mfe.begin_pending()
        try:
            increment = self._with_referenced_rest_sources(self._handle_core(rq, request_base_url))
        finally:
            mfe.end_pending(token)
        request = current_request()
        # the REMOTE side: a view other hosts embed declares on its loads whether they may cache it
        if rq.action_id in (None, "", "__load__"):
            increment = mfe.stamp_fragment_cache(
                increment, rq.action_id, request, *self._fragment_cache_candidates(rq)
            )
        # the HOST side: the micro frontends this server resolves (resolve=SERVER, content slots)
        if pending[0] and self.microfrontends is not None:
            increment = self.microfrontends.resolve_sync(increment, request)
        return increment

    def _fragment_cache_candidates(self, rq: RunActionRq) -> list:
        """The routed view declaring a fragment cache policy, if any: its class for
        ``@cacheable_fragment``, a fresh instance for a ``fragment_cache_policy`` method."""
        cls = self.registry.resolve(rq.server_side_type, rq.route)
        if cls is None:
            return []
        if callable(getattr(cls, "fragment_cache_policy", None)):
            try:
                return [cls()]
            except Exception:  # noqa: BLE001 - a view that needs arguments: only its decorator
                return [cls]
        return [cls] if getattr(cls, "__mateu_cacheable_fragment__", None) is not None else []

    def _content_slots_response(self) -> UIIncrement:
        """The reserved ``__content_slots__`` action: every content slot of the application (what
        the content service lists in its backoffice), served only when enabled."""
        from .. import microfrontends as mfe

        if not self.content_slots_descriptor_enabled:
            raise MateuForbiddenException(
                f"{mfe.CONTENT_SLOTS_ACTION} is served only with "
                "add_mateu(content_slots_descriptor_enabled=True)"
            )
        slots = getattr(self.registry, "content_slots", {}).values()
        return UIIncrement(app_data={mfe.CONTENT_SLOTS_KEY: mfe.content_slot_descriptor(slots)})

    def _with_referenced_rest_sources(self, increment: UIIncrement) -> UIIncrement:
        """The response with the catalogue entries its components name by ``ref``: a page served
        with NO app shell never receives the app's catalogue (it rides ``AppMetadata.rest_sources``),
        so a by-ref call could not be resolved in the browser. Nothing is added when the response
        already carries the app catalogue or names no source (mirrors Java's ReferencedRestSources)."""
        refs, carries = referenced_rest_source_names(increment)
        if carries or not refs or increment is None or self.rest_sources is None:
            return increment
        entries = [e for e in self.rest_sources.wire() if e.name in refs]
        return increment.model_copy(update={"rest_sources": entries}) if entries else increment

    def _handle_core(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        # "__load__" is the documented load action (Java treats it as the route load; the Redwood
        # renderer boots with it): answered "Action not found" here, Redwood rendered nothing.
        if rq.action_id == "__load__":
            rq = rq.model_copy(update={"action_id": ""})
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
