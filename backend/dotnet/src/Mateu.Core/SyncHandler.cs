using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Handles a single POST /mateu/v3/sync/{route} call → a UIIncrement.</summary>
internal sealed partial class SyncHandler(MateuRegistry registry, ITranslator? translator = null, Func<Identity?>? identity = null,
    Func<string, string?>? secrets = null, HttpClient? http = null,
    RestSourceRegistry? restSources = null, ComponentRegistry? components = null,
    Func<string?>? locale = null, TranslationRegistry? translations = null, string? specsDir = null,
    ActionRegistry? actionCatalog = null, FieldTypeRegistry? fieldTypes = null)
{
    /// <summary>The request's own locale (the adapter reads the first Accept-Language tag) — the
    /// fallback of the UI language when the app's ITranslator does not name one (Java's
    /// DefaultTranslator.locale). AsyncLocal because the handler is a singleton.</summary>
    private static readonly AsyncLocal<string?> RequestLocale = new();

    /// <summary>The translation catalogue (type: Translations files over ITranslationsSupplier).</summary>
    private readonly TranslationRegistry _translations = translations ??= new TranslationRegistry(registry, specsDir);

    /// <summary>The app's translator (if any) backed by the catalogue — what the mapper translates
    /// with and where the UI language of a request comes from.</summary>
    private readonly CatalogueTranslator _i18n = new(translator, translations!, () => RequestLocale.Value);

    /// <summary>The action catalogue (actions.yaml + type: Actions files over IActionCatalogSupplier).</summary>
    private readonly ActionRegistry _actionCatalog = actionCatalog ?? new ActionRegistry(registry, specsDir);

    /// <summary>The REST source catalogue (sources.yaml over [RestSource] + suppliers) and the
    /// business-component catalogue (components.yaml over [BusinessComponent] + suppliers).</summary>
    private readonly RestSourceRegistry _restSources = restSources ?? new RestSourceRegistry(registry, specsDir);
    private readonly ComponentRegistry _components = components ?? new ComponentRegistry(registry, specsDir);

    /// <summary>The field type catalogue (types.yaml over IFieldTypeCatalogSupplier implementers): a
    /// definition's <c>fieldType:</c> references, and a row property's [FieldType], resolve against it.</summary>
    private readonly FieldTypeRegistry _fieldTypes = fieldTypes ??= new FieldTypeRegistry(registry, specsDir);

    /// <summary>SAMPLE mode: REST sources carrying sample data answer with it instead of being
    /// called (the proxied leg here; the app metadata's MockSources tells the browser to do the same
    /// on the direct one). Null (the default) reads the environment (<c>MATEU_SOURCES_MOCK=true</c>);
    /// never on silently in production.</summary>
    public bool? MockSources { get; init; }

    private bool SampleMode => MockSources ?? SampleSources.EnabledByEnvironment();

    // AllowAutoRedirect off: the origin rules cover only the first hop of a proxied call
    private static readonly HttpClient DefaultHttp =
        new(new SocketsHttpHandler { AllowAutoRedirect = false }) { Timeout = TimeSpan.FromSeconds(60) };

    /// <summary>The client proxied REST fetches go through (injectable: a host-configured client,
    /// or a fake in tests).</summary>
    private readonly HttpClient _http = http ?? DefaultHttp;

    private readonly ReflectionMapper _mapper =
        new(new CatalogueTranslator(translator, translations!, () => RequestLocale.Value), identity, registry);
    /// <summary>The mount's authored route registry: specs/ui/routes.yaml merged OVER the routes
    /// contributed in code by IRouteEntrySupplier implementers (discovered by the MateuRegistry).</summary>
    private readonly RouteRegistry _routes = new(specsDir, supplied: registry.SuppliedRoutes);

    /// <summary>The loader builds its OWN registry: a field initialiser cannot reference another
    /// instance field, and routes.yaml is a small file each side parses once and caches, so sharing
    /// the instance is not worth a constructor just for it.</summary>
    private readonly YamlSpecLoader _yaml = new(specsDir, translations: translations, fieldTypes: fieldTypes);

    private const string AppSourceAction = "_appsource";

    /// <summary>Handles a sync call asynchronously — the entry point of the HTTP endpoint. The only
    /// step that does I/O of its own, the proxied REST fetch (<c>__restfetch__</c>), is awaited end
    /// to end instead of blocking a request thread on the remote API.</summary>
    public async Task<UIIncrementDto> HandleAsync(
        RunActionRqDto rq, string? requestBaseUrl = null, CancellationToken cancellationToken = default)
    {
        rq = LoadActionNormalised(rq);
        Observability.RequestObservation.Describe(new(rq.Route, rq.ActionId, rq.ServerSideType));
        if (rq.ActionId is "__restfetch__" or AppSourceAction)
        {
            EstablishRequestContext(rq);
            rq = GuardYamlAccess(rq);
            return rq.ActionId == AppSourceAction
                ? await AppSourceResponseAsync(rq, cancellationToken).ConfigureAwait(false)
                : await RestFetchResponseAsync(rq, cancellationToken).ConfigureAwait(false);
        }
        var pending = MicroFrontends.MicroFrontendPending.Begin();
        var increment = WithStreamsDrained(() => HandleUnresolved(rq, requestBaseUrl));
        // the inbox messages of the answer are kept for the caller (IInboxStore)
        increment = StoreInbox(increment, Principal?.Invoke());
        // the micro frontends this server resolves (Resolve.Server, content slots), awaited end to
        // end: a response without any costs nothing (the mapper marks the ones that carry some)
        // — and an EMBEDDED micro frontend's answer never names the window (EmbeddedWindowCommands)
        return EmbeddedWindowCommands.Strip(pending.Value
            ? await ResolveMicroFrontendsAsync(increment, cancellationToken).ConfigureAwait(false)
            : increment, rq);
    }

    /// <summary>Handles a sync call synchronously. In-process callers (tests, the MCP projection)
    /// use it; a proxied REST fetch on this path blocks — the HTTP endpoint goes through
    /// <see cref="HandleAsync"/>.</summary>
    /// <summary>"__load__" is the documented load action (Java treats it as the route load; the
    /// Redwood renderer boots with it): answered "Action not found" here, Redwood rendered nothing.
    /// </summary>
    private static RunActionRqDto LoadActionNormalised(RunActionRqDto rq) =>
        rq.ActionId == "__load__" ? rq with { ActionId = "" } : rq;

    public UIIncrementDto Handle(RunActionRqDto rq, string? requestBaseUrl = null)
    {
        Observability.RequestObservation.Describe(new(rq.Route, rq.ActionId, rq.ServerSideType));
        var pending = MicroFrontends.MicroFrontendPending.Begin();
        var increment = StoreInbox(WithStreamsDrained(() => HandleUnresolved(rq, requestBaseUrl)), Principal?.Invoke());
        return EmbeddedWindowCommands.Strip(pending.Value
            ? ResolveMicroFrontendsAsync(increment, CancellationToken.None).GetAwaiter().GetResult()
            : increment, rq);
    }

    private UIIncrementDto HandleUnresolved(RunActionRqDto rq, string? requestBaseUrl)
    {
        // the request route + the deployment's flags, for the routed tabs deep in the mapping
        using var routed = RoutedTabs.Begin(rq.Route, registry.FeatureFlags, _routes, registry);
        return StampFragmentCache(WithBackLinkBreadcrumbs(WithReferencedRestSources(HandleCore(rq, requestBaseUrl)), rq),
            LoadActionNormalised(rq));
    }

    private UIIncrementDto HandleCore(RunActionRqDto rq, string? requestBaseUrl)
    {
        rq = LoadActionNormalised(rq);
        // a Document parked by this request is fetched from this mount (DocumentCommands)
        RequestBaseUrl.Value = requestBaseUrl;
        EstablishRequestContext(rq);
        rq = FoldRouteMarkers(rq);
        rq = GuardYamlAccess(rq);

        // 0a. The user cancels a running task (the renderer's Cancel on a LongTask): no instance
        // to resolve, and only the caller's own task can be stopped (mirrors Java's ProgressTasks).
        if (rq.ActionId == ProgressTasks.CancelAction) return CancelTask(rq);
        // 0a'. A reloaded client asks which of its tasks still run (or just ended); over the sync
        // endpoint a resume answers the same snapshot for its one task (the stream is the SSE leg's)
        if (rq.ActionId == ProgressTasks.TasksAction) return TasksSnapshot(rq);
        if (rq.ActionId == ProgressTasks.ResumeAction)
            return ProgressTasks.Snapshot([StateString(GetState(rq.Parameters, "taskId")) ?? ""], Owner());

        // 0b. Visual-builder contract: return the ModelView's bindable fields + actions instead of
        // rendering — the tooling POSTs a sync request with the ModelView as serverSideType and this
        // action (mirrors Java's __contract__ reserved action).
        if (rq.ActionId == "__contract__" && !string.IsNullOrEmpty(rq.ServerSideType)
            && registry.Resolve(rq.ServerSideType, rq.Route) is { } contractType)
        {
            ActionGuard.EnsureViewVisible(contractType);
            return ContractResponse(contractType, rq);
        }

        // 0c. Visual-builder live preview: render arbitrary YAML page text (the plugin's preview pane
        // POSTs the editor buffer under _yaml). No ModelView binding — layout only (mirrors Java's
        // __preview__ reserved action / YamlUidlLoader.parseText).
        // The AI chat's built-in render target posts it too (render-screen with no subscriber on
        // screen): with no YAML it answers the same "Invalid or empty YAML" notice as Java.
        if (rq.ActionId == "__preview__")
        {
            var previewYaml = rq.Parameters.TryGetValue("_yaml", out var yamlParam) ? StateString(yamlParam) ?? "" : "";
            if (System.Text.Encoding.UTF8.GetByteCount(previewYaml) > Authoring.UidlValidator.MaxYamlBytes)
                return FragmentResponse("Preview", ComponentMapper.Map(new Text("The YAML is too large to preview") { Style = "color: red;" }), rq);
            // Say WHY a definition cannot be read: "invalid" alone sent the author hunting through the file.
            (IComponent? previewTree, string? problem) = string.IsNullOrWhiteSpace(previewYaml)
                ? (null, null)
                : YamlComponentBuilder.ParseReporting(previewYaml, types: _fieldTypes);
            previewTree ??= new Text(problem is not null ? "Invalid YAML — " + problem : "Invalid or empty YAML") { Style = "color: red;" };
            var preview = FragmentResponse("Preview", ComponentMapper.Map(previewTree), rq);
            // an agent's definition (render-screen, a live push): nothing in it may run script in the tab
            return UntrustedDefinition.Requested(rq.Parameters) ? UntrustedDefinition.Neutralize(preview) : preview;
        }

        // 0c'. Authoring: validate arbitrary YAML definition text (the MCP tool mateu_validate_uidl)
        // and answer the report on appData._validation; renders nothing (mirrors Java's __validate__).
        if (rq.ActionId == ValidateAction)
            return ValidateResponse(rq);

        // 0c-slots. The application's content slot descriptor, for the content service to register
        // the slots: off unless ContentSlotsDescriptorEnabled, it describes the application's screens
        // (mirrors Java's __content_slots__ reserved action).
        if (rq.ActionId == MicroFrontends.ContentSlotDescriptors.Action)
            return ContentSlotsResponse();

        // 0c''. Live UI push: the UI session's pairing actions — app-level, independent of the view
        // (mirrors Java's agentpush runners; the channel itself is streamed by the SSE endpoint).
        if (IsAgentAction(rq.ActionId))
            return AgentAction(rq);

        // 0c'''. Remote push: the phone registers / forgets its push token — app-level, independent
        // of the view (mirrors Java's PushActionRunner).
        if (IsPushAction(rq.ActionId))
            return PushAction(rq);

        // 0d. Proxy-mode external fetch: a proxy source's renderer POSTs __restfetch__ with
        // _sourceKind/_sourceId + component state; resolve the DECLARED source (never a client url),
        // inject ${secret.X} and fetch server-side, returning the raw JSON on appData._restfetch
        // (mirrors Java's __restfetch__ reserved action).
        if (rq.ActionId == "__restfetch__")
            return RestFetchResponseAsync(rq, CancellationToken.None).GetAwaiter().GetResult();
        // 0d+. A data-authored shell's PROXIED sources (its pickers, inbox, palette search): the
        // browser names the ROLE, never a url (Java's RestProxyCalls.appSourceCall).
        if (rq.ActionId == AppSourceAction)
            return AppSourceResponseAsync(rq, CancellationToken.None).GetAwaiter().GetResult();

        // 0e. A FRESH deep link (consumedRoute "_empty", no type yet) to one of the root app's menu
        // routes — or a route under one, a CRUD sub-route — renders the APP SHELL opening on that
        // route, so a bookmarked /products shows the header and the menu around the screen (Java
        // parity: there the root app answers a deep link and the shell loads the route inside).
        if (string.IsNullOrEmpty(rq.ActionId) && string.IsNullOrEmpty(rq.ServerSideType)
            && rq.ConsumedRoute == "_empty"
            && registry.AppType is { } rootApp && rootApp.GetCustomAttribute<AppAttribute>() is { } rootAttr
            && MenuLeafClaiming(rootApp, rq.Route, requestBaseUrl) is { } claimed)
        {
            ActionGuard.EnsureViewVisible(rootApp);
            return RenderApp(rootApp, rootAttr.Title, rq, requestBaseUrl, rq.Route, claimed.ServerSideType);
        }

        // 0f'. A load naming no type (a fresh deep link, a reload) of a TAB of a record master that
        // is not on screen yet: the master renders it in its slot (Java's
        // RouteChains.pendingAppAncestor).
        if (string.IsNullOrEmpty(rq.ActionId) && string.IsNullOrEmpty(rq.ServerSideType)
            && RoutedTabs.PendingAppAncestor(_routes, registry, rq.Route, rq.ConsumedRoute) is { } pendingMaster
            && pendingMaster.GetCustomAttribute<AppAttribute>() is { } pendingApp)
        {
            ActionGuard.EnsureViewVisible(pendingMaster);
            return RenderApp(pendingMaster, pendingApp.Title, rq, requestBaseUrl);
        }

        // 0f. Routed tabs: an APP the client names by type that the AUTHORED route table binds under
        // the request route (a record master, a deep link to one of its tabs) renders ITSELF — its
        // tabs, the rest of the path as its home (Java's ActionInstanceCreator: the known type's
        // mount, the app not on screen yet).
        if (string.IsNullOrEmpty(rq.ActionId) && !string.IsNullOrEmpty(rq.ServerSideType)
            && RoutedTabs.MountOf(_routes, rq.Route, rq.ServerSideType) is not null
            && registry.TypeByName(rq.ServerSideType) is { } master
            && master.GetCustomAttribute<AppAttribute>() is { } masterApp)
        {
            ActionGuard.EnsureViewVisible(master);
            return RenderApp(master, masterApp.Title, rq, requestBaseUrl);
        }

        // 1. App shell at the root route. NOT for the shell's content slot loading the home of an
        // app that declares none ("_no_home_route" / "_page"): Java renders the app class as a plain
        // page there (ActionInstanceCreator.isTerminalRoute) — answering the shell again nested it
        // inside its own content area, which reloaded it forever.
        if (string.IsNullOrEmpty(rq.ActionId)
            && !IsTerminalRoute(rq.Route)
            && registry.Resolve(rq.ServerSideType, rq.Route) is { } t0
            && t0.GetCustomAttribute<AppAttribute>() is { } app)
        {
            ActionGuard.EnsureViewVisible(t0);
            return RenderApp(t0, app.Title, rq, requestBaseUrl);
        }

        // 2. A Crud (resolved by serverSideType or by route prefix) — list / detail / new / edit + actions.
        if (ResolveCrud(rq) is { } c)
            return HandleCrud(c.Type, c.Element, c.BaseRoute, rq);

        // 2a. A capability listing (IListing + whatever capabilities it declares) — the page
        // serves ONLY the routes/buttons of the declared capabilities (the capability crud
        // bridge; mirrors Java's CapabilityCrud). Declarative Listing<TFilters,TRow> subclasses
        // without interaction capabilities fall through to their own path below.
        if (ResolveCapability(rq) is { } cap)
            return HandleCapabilityListing(cap.Profile, cap.BaseRoute, rq);

        // 2a'. An editable view (EditableView / AutoEditableView: view ⇄ /edit) or a master-detail
        // view (button bar of detail parts) — Java's MultiView orchestrators of the same names.
        if (ResolveOrchestratedView(rq) is { } orchestrated)
            return HandleOrchestratedView(orchestrated.Type, orchestrated.BaseRoute, rq);

        // The AUTHORED registry answers before the attribute-declared views — explicit beats
        // derived, the same precedence the layout and page inference already use. Its parameters are
        // folded into the component state here, at the single point every downstream step reads:
        //
        //   fixed > client state > path > query > defaults
        //
        // The fixed ones are re-applied on the SERVER rather than trusted from the client, because
        // route resolution also runs in the browser (a statically deployed mount has no server to
        // ask) and a parameter pinned only there would be a suggestion, not a constraint.
        // Route seeding: State/DefaultParams/FixedParams fold into componentState (client wins,
        // fixed wins over all — done in RouteMatch.Params); AppState is merged UNDER the client's
        // app state; Data injects the __restdata__ action + OnLoad (the @RestData load path);
        // AppData rides on the app metadata. State/params are folded here; the app-scope seeds
        // (AppState/Data) decorate the resolved increment (mirrors Java's RouteSegmentUtils +
        // ReflectionUiIncrementMapper.mapToAppState).
        RouteEntry? routeEntry = null;
        Type? type = null;
        var clientState = rq.ComponentState;
        var routeSeeds = false;
        var routeMatch = _routes.Match(rq.Route);
        // the type the client names is resolved where it is MOUNTED in the route — the shortest
        // prefix the authored table binds to it (Java's ActionInstanceCreator.mountOf): a page with
        // routed in-page tabs on /vcn/7/gateways is the page answering /vcn/7
        if (!string.IsNullOrEmpty(rq.ServerSideType)
            && RoutedTabs.MountOf(_routes, rq.Route, rq.ServerSideType) is { } knownMount)
            routeMatch = _routes.Match(knownMount);
        if (routeMatch is not null)
        {
            var query = RequestQuery?.Invoke();
            // What makes a definition-only page's route SEED it (Java's seedBareLayout): a path
            // parameter alone does not — the browser resolves ${state.x} from the route itself.
            var e = routeMatch.Entry;
            routeSeeds = e.Data is not null || e.AppData is not null || e.AppState is { Count: > 0 }
                         || e.State is { Count: > 0 } || e.DefaultParams.Count > 0 || e.FixedParams.Count > 0
                         || query is { Count: > 0 };
            rq = rq with { ComponentState = routeMatch.Params(rq.ComponentState, query) };
            routeEntry = routeMatch.Entry;
            if (!string.IsNullOrWhiteSpace(routeMatch.Entry.ViewModel))
                type = registry.TypeByName(routeMatch.Entry.ViewModel);
        }
        return SeedRouteScopes(ResolveRoute(rq, type, routeEntry, clientState, routeSeeds), rq, routeEntry);
    }

    /// <summary>The per-request context every step reads: the caller's identity (the gates
    /// [EyesOnly]/[ReadOnlyUnless]/[DisabledUnless] are matched against it at INVOCATION and when
    /// binding wire state) and the [Audience] projection.</summary>
    private void EstablishRequestContext(RunActionRqDto rq)
    {
        ActionGuard.SetIdentity(identity);
        FileUploads.SetCurrent(Uploads);
        RequestLocale.Value = locale?.Invoke();
        MateuCatalogs.Set(_restSources.Catalog, _components.Catalog, _fieldTypes.Catalog);
        // the catalogue entries whose access: the caller does not satisfy are never shipped, buttons
        // naming them are disabled and a call to them answers 403 (like a page's own declared action)
        MateuCatalogs.SetActions(_actionCatalog.Catalog, _actionCatalog.RefusedFor(ActionGuard.Authorized));

        // Audience PROJECTION, not security: the value is client-controlled app state (the
        // [AppContext] selector named audience), so it only filters [Audience]-marked members out of
        // what is rendered. Access control is [EyesOnly]/[DisabledUnless] against the identity.
        ReflectionMapper.SetCurrentRegistry(registry);
        ReflectionMapper.SetCurrentAudience(
            rq.AppState.TryGetValue("audience", out var audience) ? StateString(audience) : null);
    }

    /// <summary>The server-side half of the YAML access keys (mirrors Java's YamlUidlLoader.guard):
    /// a route whose <c>access:</c> (or an ancestor's) the caller does not satisfy is refused (403);
    /// a declared action the caller may not run is refused when it reaches the server anyway
    /// (dispatched, or proxied through <c>__restfetch__</c> by its source id); and the values of the
    /// fields hidden or made read-only for the caller are dropped from the incoming state.</summary>
    private RunActionRqDto GuardYamlAccess(RunActionRqDto rq)
    {
        if (_routes.RefusingEntry(rq.Route, ActionGuard.Authorized) is { } refusing)
            ActionGuard.Deny($"route '{refusing.Route}' denied by access:");
        if (_yaml.LoadSpec(rq.Route) is not { } spec) return rq;
        // the business components (components.yaml) lock fields too: they are resolved while the
        // tree is mapped, after the view model is bound. STRICT, like a code view: every restricted
        // component of the app is checked, not only the ones this layout names
        var byPieces = MateuCatalogs.AppWideLockedBy();
        if (!spec.DependsOnRequest) return WithoutLockedByPieces(rq, byPieces);
        if (_yaml.LoadSpec(rq.Route, ActionGuard.Authorized, _i18n.Locale) is not { } personal)
            return WithoutLockedByPieces(rq, byPieces);
        if (rq.ActionId is { } actionId && personal.RefusedActions.Contains(actionId))
            ActionGuard.Deny($"action '{actionId}' denied by access:");
        if (rq.ActionId == "__restfetch__" && StateString(GetState(rq.Parameters, "_sourceId")) is { } sourceId
            && personal.RefusedActions.Contains(sourceId))
            ActionGuard.Deny($"action '{sourceId}' denied by access:");
        // a business component the layout draws only under a section the caller may not see
        // locks every field it holds, even with no access keys of its own (fail closed)
        var hidden = AuthoredSources.RefsInTree(spec.Layout);
        hidden.ExceptWith(AuthoredSources.RefsInTree(personal.Layout));
        if (hidden.Count > 0)
        {
            var merged = new Dictionary<string, string>(MateuCatalogs.AllFieldsOf(hidden));
            foreach (var (key, component) in byPieces) merged.TryAdd(key, component);
            byPieces = merged;
        }
        return WithoutLockedByPieces(WithoutLocked(rq, personal.LockedFields.ToHashSet()), byPieces);
    }

    /// <summary><paramref name="rq"/> without the posted state the business components lock for the caller.</summary>
    private static RunActionRqDto WithoutLockedByPieces(RunActionRqDto rq, IReadOnlyDictionary<string, string> lockedBy)
    {
        var state = rq.ComponentState;
        var narrowed = MateuCatalogs.WithoutLocked(rq.Route ?? "", state, lockedBy);
        return ReferenceEquals(narrowed, state) ? rq : rq with { ComponentState = new Dictionary<string, object?>(narrowed) };
    }

    /// <summary><paramref name="rq"/> without the posted state of the fields <paramref name="locked"/> names.</summary>
    private static RunActionRqDto WithoutLocked(RunActionRqDto rq, IReadOnlySet<string> locked)
    {
        if (locked.Count == 0 || !locked.Any(rq.ComponentState.ContainsKey)) return rq;
        var narrowed = new Dictionary<string, object?>(rq.ComponentState);
        foreach (var id in locked) narrowed.Remove(id);
        return rq with { ComponentState = narrowed };
    }

    /// <summary>The YAML spec of a route as the current caller sees it (access keys, i18n).</summary>
    private YamlSpecLoader.Spec? PersonalSpec(string? route) =>
        _yaml.LoadSpec(route, ActionGuard.Authorized, _i18n.Locale);

    /// <summary>The route-resolution tail of <see cref="Handle"/>: a view/listing/wizard resolved
    /// either from the authored registry or from attributes. Split out so route-scope seeding can
    /// decorate its result once, at every exit. When <paramref name="routeEntry"/> declares Data the
    /// resolved view gets a __restdata__ action + OnLoad trigger injected (the @RestData load path).</summary>
    private UIIncrementDto ResolveRoute(RunActionRqDto rq, Type? type, RouteEntry? routeEntry,
        IReadOnlyDictionary<string, object?> clientState, bool routeSeeds)
    {
        type ??= registry.Resolve(rq.ServerSideType, rq.Route);
        // the view the request resolved to, for its activity and the audit trail
        if (type is not null && Observability.RequestObservation.Current is { } observed) observed.View = type.FullName;
        var yamlSpec = PersonalSpec(rq.Route);
        // a fresh deep link under a YAML app shell: the shell answers, aimed at the route
        if (YamlShellDeepLink(rq) is { } deepLink) return deepLink;
        if (type is null && yamlSpec is not null)
        {
            // A route with no view class → a YAML page. A bare layout renders as a static, unbound
            // page; a page that declares viewModel: instantiates that logic class (state + actions)
            // and renders the YAML layout bound to it (mirrors Java's ActionInstanceCreator.loadYaml).
            // a `type: AppShell` definition bound to the route: the mount's app (YamlAppShell)
            if (yamlSpec.Shell is { } shell) return YamlShellResponse(shell, rq);
            if (string.IsNullOrEmpty(yamlSpec.ModelView))
            {
                if (yamlSpec.Layout is not { } bare) return Error($"Route not found: {rq.Route}");
                // a field hidden from the caller (eyesOnly:/access:) never gets a value from the
                // route either: a state:/defaultParams:/fixedParams: seed of it would otherwise travel
                // to that caller (a read-only field keeps its seed: it is drawn, with its value). So
                // does one a business component the layout names hides: compositions are resolved
                // while the page is mapped, after this seeding
                var hiddenFields = new HashSet<string>(yamlSpec.HiddenFields);
                hiddenFields.UnionWith(MateuCatalogs.HiddenBy(AuthoredSources.RefsInTree(bare)));
                if (hiddenFields.Count > 0)
                {
                    rq = WithoutLocked(rq, hiddenFields);
                    clientState = clientState.Where(kv => !hiddenFields.Contains(kv.Key))
                        .ToDictionary(kv => kv.Key, kv => kv.Value);
                }
                // the route's seeds (state:, fixed/default params, a query string, already folded
                // into the component state) are the page's state: a seeded bare page is wrapped so
                // it carries them, as Java's SeededYamlPage does (they were dropped: ${state.x}
                // blank). A path parameter ALONE is no seed: that page answers its bare layout, as
                // Java's seedBareLayout does. Wrapped, the state carries every parameter (path ones
                // too); with no route entry, the client's own state (Java's componentState).
                var mapped = WithDeclaredPageType(ComponentMapper.Map(bare), yamlSpec.PageType, rq,
                    routeEntry is not null ? rq.ComponentState : clientState, yamlSpec.TemplatePageType, yamlSpec,
                    bare, routeSeeds);
                // the route's PATTERN names the window, never the concrete path's id
                return FragmentResponse(DefinitionWindowTitle(bare,
                    mapped is ServerSideComponentDto ? rq.ComponentState : clientState,
                    routeEntry?.Route ?? rq.Route), mapped, rq);
            }
            type = registry.TypeByName(yamlSpec.ModelView);
        }
        if (type is null) return Error($"Route not found: {rq.Route}");
        ActionGuard.EnsureViewVisible(type);
        // A YAML page bound to this modelView re-applies its layout on every render (first load AND
        // any in-place re-render) so the layout stays authoritative (mirrors Java's
        // ReflectionObjectToComponentMapper.layoutForRoute).
        var layoutOverride = yamlSpec?.ModelView == type.FullName ? yamlSpec!.Layout : null;

        // 2b. A declarative Listing — a read-only searchable listing with typed filters.
        if (ReflectionMapper.ListingTypes(type) is { } listing)
        {
            var view = Activator.CreateInstance(type)!;
            if (ExportKind(view, rq.ActionId) is { } listingExport)
            {
                var all = new SearchRequest(SearchText(rq), AssembleFilters(listing.Filters, rq.ComponentState),
                    null, new Pageable(0, int.MaxValue, PageableOf(rq).Sort)) with { FilterState = rq.ComponentState };
                return ExportRows(listingExport,
                    type.GetMethod("Search", [typeof(SearchRequest)])!.Invoke(view, [all]), listing.Row, type, rq);
            }
            return rq.ActionId switch
            {
                "search" => ListingSearch(view, listing.Filters, listing.Row, rq),
                // A selector dialog's row pick: write (id, label) back into the host field.
                "action-on-row-select" => SelectorRowSelected(view, listing.Row, rq),
                // A [GroupAction] button on a group header row (the group value in _groupValue).
                { } groupAction when groupAction.StartsWith("action-on-row-") =>
                    GroupActionResult(type, view, groupAction["action-on-row-".Length..], rq),
                _ => Render(type, view, rq),
            };
        }

        // 2c. A domain type rendered by a registered IComponentAdapter.
        if (registry.AdapterFor(type) is { } adapter) return HandleAdapted(adapter, rq);

        // 3. A wizard.
        if (typeof(Wizard).IsAssignableFrom(type)) return HandleWizard(type, rq);

        // 4. A plain view.
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        // A nested data object's method (nested-form-action-<field>-<method>).
        if (rq.ActionId?.StartsWith(ReflectionMapper.NestedFormActionPrefix, StringComparison.Ordinal) == true)
            return RunNestedFormAction(type, instance, rq, layoutOverride);
        // The row editing actions of a list property (grid "+", Edit, Save, Remove, move…).
        if (FieldCrudTarget(type, rq.ActionId) is { } fieldCrud)
            return HandleFieldCrud(fieldCrud.Property, fieldCrud.FieldId, fieldCrud.Suffix, rq);
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(instance, rq);
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(type, rq);
        // The notification inbox's app-level actions — dispatched with the app's serverSideType,
        // like the app header actions (mirrors Java's NotificationsActionRunner).
        if (rq.ActionId?.StartsWith("_notifications-") == true) return Notifications(instance, rq);
        // The idle warning's keep-alive and the live-updates stream (its snapshot, on the sync
        // endpoint) are app-level too (mirrors Java's KeepAlive/LiveUpdates action runners).
        if (rq.ActionId == ReflectionMapper.KeepAliveActionId) return KeepAlive(instance);
        if (rq.ActionId == ReflectionMapper.LiveUpdatesActionId) return LiveUpdatesSnapshot();
        // Record presence: a page reports itself, the app answers who else is there (mirrors
        // Java's PresenceActionRunner).
        if (rq.ActionId == Presence.ActionId) return PresenceAction(type, rq);
        // The command palette's entity search — same app-level rail (mirrors Java's
        // GlobalSearchActionRunner).
        if (rq.ActionId == "_globalsearch") return GlobalSearch(instance, rq);
        // The [AppContext] header pickers' search — same rail (mirrors Java's
        // AppContextSearchActionRunner).
        if (rq.ActionId?.StartsWith(AppContextSearchPrefix) == true) return AppContextSearch(type, rq);
        // The header record switcher's pick: runs SwitchTo with the picked value; null (or the
        // view itself / another routed view) re-renders in place, anything else maps as a regular
        // action result (mirrors Java's RecordSwitcherActionRunner).
        if (rq.ActionId == IRecordSwitcherSupplier.ActionId && instance is IRecordSwitcherSupplier switcher)
        {
            var switched = switcher.SwitchTo(
                StateString(GetState(rq.Parameters, IRecordSwitcherSupplier.ValueParameter)));
            return switched is null ? Render(type, instance, rq, layoutOverride)
                : IsRoutedViewResult(switched) ? Render(switched.GetType(), switched, rq)
                : MapResult(switched, rq);
        }
        // 4b. Archetype in-place actions (CollectionDetail / GeneralOverview): selection, search
        // filtering and record switching mutate the bound state and re-render the tree — no
        // navigation, no method dispatch.
        if (instance is IComponentTreeSupplier)
        {
            if (rq.ActionId == "selectCollectionItem")
            {
                type.GetProperty("SelectedId")?.SetValue(instance,
                    StateString(GetState(rq.Parameters, "_item")));
                return Render(type, instance, rq);
            }
            if (rq.ActionId is "filterCollection" or "switchRecord")
                return Render(type, instance, rq);
            // A TodoList row click ACTS on the row instead of selecting it: the archetype finds
            // the row by id and its ActionOn result maps as a regular action result (a route
            // string → NavigateTo); an unknown row (or a null result) just re-renders the list
            // (mirrors Java's TodoList.openTodoItem returning `this`).
            if (rq.ActionId == "openTodoItem" && instance is ITodoList todoList)
                return todoList.OpenTodoItem(StateString(GetState(rq.Parameters, "_item"))) is { } result
                    ? MapResult(result, rq)
                    : Render(type, instance, rq);
            // A CalendarPage's built-in actions: the toolbar chevrons/Today move the displayed
            // period (a month, week or day by the view) and the view buttons switch the view
            // (parameters._view), both re-rendering; a date cell click (parameters._date) runs
            // ActionOnDay; an event click ACTS on
            // the event — the frontend sends it as parameters._clickedEvent = {id, title, date,
            // color} and the archetype finds it back by id, its ActionOn result mapping as a
            // regular action result (a route string → NavigateTo); "+ Create" runs CreateAction.
            // Unknown events / null results just re-render the page (mirrors Java's CalendarPage
            // actions returning `this`).
            if (instance is ICalendarPage calendarPage)
                switch (rq.ActionId)
                {
                    case "openCalendarEvent":
                        return calendarPage.OpenCalendarEvent(ClickedEventId(rq)) is { } opened
                            ? MapResult(opened, rq)
                            : Render(type, instance, rq);
                    case "previousCalendarMonth":
                        calendarPage.PreviousMonth();
                        return Render(type, instance, rq);
                    case "nextCalendarMonth":
                        calendarPage.NextMonth();
                        return Render(type, instance, rq);
                    case "goCalendarToday":
                        calendarPage.GoToday();
                        return Render(type, instance, rq);
                    case "goCalendarToDate":
                        calendarPage.GoToDate(StateString(GetState(rq.Parameters, "_date")));
                        return Render(type, instance, rq);
                    case "switchCalendarView":
                        calendarPage.SwitchView(StateString(GetState(rq.Parameters, "_view")));
                        return Render(type, instance, rq);
                    case "openCalendarDay":
                        return calendarPage.OpenCalendarDay(StateString(GetState(rq.Parameters, "_date"))) is { } day
                            ? MapResult(day, rq)
                            : Render(type, instance, rq);
                    case "createCalendarEvent":
                        return calendarPage.CreateCalendarEvent() is { } created
                            ? MapResult(created, rq)
                            : Render(type, instance, rq);
                }
            // A GanttPage bar click ACTS on the task: the frontend sends its id as
            // parameters._clickedTaskId and the archetype opens it in a side Drawer (mirrors Java's
            // GanttPage.selectGanttTask). Unknown task / null just re-renders the canvas.
            if (rq.ActionId == "selectGanttTask" && instance is IGanttPage ganttPage)
                return ganttPage.SelectGanttTask(StateString(GetState(rq.Parameters, "_clickedTaskId"))) is { } drawer
                    ? MapResult(drawer, rq)
                    : Render(type, instance, rq);
            // A DataManagement toolbar switch flips the active view and re-renders in place.
            if (instance is IDataManagement dataManagement && rq.ActionId is "switchToGrid" or "switchToGantt")
            {
                dataManagement.View = rq.ActionId == "switchToGantt" ? "gantt" : "grid";
                return Render(type, instance, rq);
            }
            // A DataManagement docked-panel toggle (toolbar or the panel's ✕) flips it in place.
            if (instance is DataManagement docked && rq.ActionId is "toggleEndPanel" or "toggleBottomPanel")
            {
                if (rq.ActionId == "toggleEndPanel") docked.ToggleEndPanel();
                else docked.ToggleBottomPanel();
                return Render(type, instance, rq);
            }
        }
        return string.IsNullOrEmpty(rq.ActionId)
            ? Render(type, instance, rq, layoutOverride)
            : RunAction(type, instance, rq, layoutOverride);
    }

    /// <summary>The event the EditInDrawer drawer emits on save: the listing refreshes by
    /// re-running its search (mirrors Java's Crud.SAVED_IN_DRAWER_EVENT).</summary>
    public const string SavedInDrawerEvent = "mateu-crud:saved-in-drawer";

    /// <summary>None-safe, type-stable comparer: nulls first, numbers numerically, otherwise by
    /// case-insensitive string, so mixed columns never throw.</summary>
    private sealed class SortKeyComparer : IComparer<object?>
    {
        public static readonly SortKeyComparer Instance = new();
        public int Compare(object? a, object? b)
        {
            if (a is null && b is null) return 0;
            if (a is null) return -1;
            if (b is null) return 1;
            if (IsNumeric(a) && IsNumeric(b))
                return Convert.ToDouble(a).CompareTo(Convert.ToDouble(b));
            return string.Compare(a.ToString(), b.ToString(), StringComparison.OrdinalIgnoreCase);
        }
        private static bool IsNumeric(object o) => o is byte or sbyte or short or ushort or int or uint or long or ulong or float or double or decimal;
    }

    /// <summary>The root app's menu leaf whose route is <paramref name="route"/>, or a prefix of it
    /// (a CRUD sub-route such as products/P-001); null when no local entry claims it.</summary>
    private MenuItemDto? MenuLeafClaiming(Type appType, string? route, string? requestBaseUrl)
    {
        var norm = (route ?? "").Split('?')[0].Trim('/');
        if (norm.Length == 0) return null;
        if (_mapper.MapApp(appType, requestBaseUrl) is not { Metadata: AppMetadataDto meta }) return null;
        MenuItemDto? Find(IEnumerable<MenuItemDto> items)
        {
            foreach (var item in items)
            {
                if (item.Remote || item.Rules.Count > 0) continue;
                var leaf = (item.Route ?? "").Trim('/');
                if (item.Submenus.Count == 0 && leaf.Length > 0
                    && (norm == leaf || norm.StartsWith(leaf + "/", StringComparison.Ordinal)))
                    return item;
                if (Find(item.Submenus) is { } nested) return nested;
            }
            return null;
        }
        return Find(meta.Menu);
    }

    /// <summary>A content load of a sentinel route — an app with no home answers
    /// <c>_no_home_route</c> (Java's <c>ActionInstanceCreator.isTerminalRoute</c>).</summary>
    private static bool IsTerminalRoute(string? route)
    {
        var r = (route ?? "").Split('?', 2)[0];
        return r.EndsWith("_no_home_route", StringComparison.Ordinal) || r.EndsWith("_page", StringComparison.Ordinal);
    }

    // ── Plain views ─────────────────────────────────────────────────────────────
    private UIIncrementDto RenderApp(Type appType, string title, RunActionRqDto rq, string? requestBaseUrl,
        string? homeRouteOverride = null, string? homeTypeOverride = null)
    {
        var app = _mapper.MapApp(appType, requestBaseUrl);
        // A fresh deep link to one of the app's menu routes: the shell opens ON that route, typed
        // with the menu entry's screen (Java's AppMenuResolver answers the app with the deep-linked
        // route as its home).
        if (homeRouteOverride is not null && app is { Metadata: AppMetadataDto deepLinked })
            app = app with
            {
                Metadata = deepLinked with
                {
                    HomeRoute = homeRouteOverride,
                    HomeServerSideType = homeTypeOverride ?? deepLinked.HomeServerSideType,
                },
            };
        app = WithCatalogues(app);
        app = WithBackLink(app, ReflectionMapper.BackLinkParent(appType));
        // remote push is on when the app opts in to OS notifications AND something sends pushes
        if (app is { Metadata: AppMetadataDto pushMeta } && pushMeta.OsNotifications && PushSender is not null)
            app = app with { Metadata = pushMeta with { PushNotifications = true } };
        // a record master the authored table binds under the request route (its tabs, its home)
        var routedMount = string.IsNullOrEmpty(rq.ActionId)
            ? RoutedTabs.MountOf(_routes, rq.Route, appType.FullName)
            : null;
        if (routedMount is not null && app is { Metadata: AppMetadataDto routedMeta })
            app = app with { Metadata = AsRoutedMaster(routedMeta, appType, routedMount, rq) };
        // AppData: a route entry's app-scope data source rides on the app metadata — the shell
        // fetches it once into the app-data store, shared across routes. Java attaches it only from
        // a route ON THIS APP'S MOUNT (AppDto.appDataSource); the .NET port has no route↔mount
        // linkage, so we scope by the mount base path — an authored route whose absolute route
        // falls under this app's [UI] mount. (The .NET shell has no source catalogue, so a ref-only
        // source travels on the wire but is not resolved server-side here.)
        var mount = appType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "";
        // a routed master is mounted where the authored table binds it (its route PATTERN)
        if (routedMount is not null && _routes.Match(routedMount) is { } masterMatch)
            mount = masterMatch.Entry.Route.Trim('/');
        var appMount = mount.Length == 0 ? "" : "/" + mount;
        if (app is { Metadata: AppMetadataDto meta }
            && _routes.Authored().Routes
                // A root-mounted app (empty mount) owns every route; a mounted app owns only the
                // routes under its base path — so a different mount's appData does not leak in.
                .Where(r => appMount.Length == 0
                            || ("/" + r.Route.TrimStart('/')).StartsWith(appMount + "/", StringComparison.Ordinal)
                            || "/" + r.Route.TrimStart('/') == appMount)
                .Select(r => r.AppData).FirstOrDefault(d => d is not null) is { } appData)
        {
            // app-data is derived from AppDataSource, pinned only here — add the token and keep the
            // list sorted + deduped (mirrors AppMapper's TreeSet derivation).
            var caps = new SortedSet<string>(meta.RequiredCapabilities, StringComparer.Ordinal)
            {
                Capabilities.AppData,
            };
            app = app with { Metadata = meta with { AppDataSource = appData, RequiredCapabilities = caps.ToList() } };
        }
        // R2 (App ≠ its Home Screen, coherence-plan #5): type the home fragment with the home
        // SCREEN's class when the home route resolves to a DIFFERENT registered type than the app —
        // a multi-screen app whose home is a distinct route. A single-screen app, a home with no
        // backing Screen (a bare menu link / sentinel route), or an unresolvable home keeps the
        // app's own type. Mirrors Java's AppHomeRouteResolver.getHomeServerSideType. Only the
        // conflated TYPE is fixed; the home-fragment mechanism is untouched.
        if (routedMount is not null && app is { Metadata: AppMetadataDto routedHome })
        {
            // the routed master's home is its TAB's screen (Java's RouteChains.screenFor)
            if (RoutedTabs.ChainLinks(_routes, routedHome.HomeRoute) is { Count: > 0 } chain
                && chain[^1].Entry.ViewModel is { Length: > 0 } tabType)
                app = app with { Metadata = routedHome with { HomeServerSideType = tabType } };
        }
        else if (app is { Metadata: AppMetadataDto homeMeta }
            && !string.IsNullOrWhiteSpace(homeMeta.HomeRoute)
            && !homeMeta.HomeRoute!.EndsWith("_page", StringComparison.Ordinal)
            && !homeMeta.HomeRoute.EndsWith("_no_home_route", StringComparison.Ordinal)
            && registry.Resolve(null, homeMeta.HomeRoute) is { } homeType
            && homeType.FullName is { } homeName
            && homeName != appType.FullName)
        {
            app = app with { Metadata = homeMeta with { HomeServerSideType = homeName } };
        }
        // SetWindowTitle rides for a DECLARATIVE app (the @UI-annotated app class is a page —
        // ViewTypeClassifier.isPage) but NOT for an AppSupplier: there the root load resolves to
        // the AppShell fluent object, which is not a page, so Java emits no title command.
        var isAppSupplier = typeof(IAppSupplier).IsAssignableFrom(appType);
        return UIIncrementDto.Of(
            commands: isAppSupplier ? [] : [new UICommandDto(Target(rq), "SetWindowTitle", title)],
            fragments: [new UIFragmentDto(Target(rq), app, null, null, "Replace", null)]);
    }

    /// <summary>An app the authored route table binds at <paramref name="mount"/> with CHILDREN (a
    /// record master): an app with no menu of its own offers its visible children as its tabs
    /// (label = the child's [Title], else its segment), its route is the mount, and its home is the
    /// rest of the request path — or, reached on its own, its default tab (Java's
    /// AppMenuBuilder.childRouteTabs + HomeRouteResolver.getHomeRoute).</summary>
    private AppMetadataDto AsRoutedMaster(AppMetadataDto meta, Type appType, string mount, RunActionRqDto rq)
    {
        var requested = "/" + RouteRegistry.Normalize((rq.Route ?? "").Split('?')[0]);
        var children = RoutedTabs.VisibleChildrenOf(_routes, mount);
        if (meta.Menu.Count == 0 && children.Count > 0)
        {
            var menu = children.Select(child =>
                new MenuItemDto(RoutedTabs.TabLabel(registry, child.Entry, child.Relative), child.Path, appType.FullName!)
                {
                    ConsumedRoute = mount,
                    Path = child.Relative,
                    UriPrefix = mount,
                    Selected = child.Path == requested,
                }).ToList();
            meta = meta with { Menu = menu, TotalMenuOptions = menu.Count };
        }
        var home = requested.Length > mount.Length
            ? requested
            : RoutedTabs.DefaultChildPath(_routes, mount) ?? meta.HomeRoute;
        return meta with { Route = mount, RootRoute = mount, HomeRoute = home, HomeConsumedRoute = mount };
    }

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq, IComponent? layoutOverride = null)
    {
        // Java's DefaultMateuService: no consumed route is "_empty"; an EMPTY one stays ""
        var route = rq.ConsumedRoute ?? "_empty";
        // A ComponentTreeSupplier view (an archetype, or an [AutoPage]-inferred dashboard/welcome) is
        // NOT a page: Java's ViewTypeClassifier.isPage returns false for it, so no SetWindowTitle
        // command rides the increment. A YAML-bound modelView (layoutOverride) stays a page.
        var isPage = layoutOverride is not null
                     || (instance is not IComponentTreeSupplier
                         && !PageInference.ComposesDashboard(type)
                         && !PageInference.ComposesWelcome(type));
        var (embedded, inline) = IslandFlags(rq);
        var view = _mapper.MapView(type, instance, route, layoutOverride, embedded, inline);
        // A `layoutDelta:` is re-applied to the FRESHLY inferred page on every render — that is the
        // whole difference from a `layout:` snapshot, which stops the screen from re-deriving. Only
        // for a page, and only when the route's definition is bound to THIS view model (mirrors
        // Java's ReflectionObjectToComponentMapper + YamlUidlLoader.deltaForRoute).
        if (isPage) view = LayoutDeltaApplier.Apply(view, DeltaFor(rq.Route, type));
        // A `pageType:` the route's definition declares wins over the inferred one, as its layout
        // does (mirrors Java's ReflectionObjectToComponentMapper.pageTypeOf).
        if (isPage && view is ServerSideComponentDto page && DeclaredPageTypeFor(rq.Route, type) is { } declared)
            view = page with { PageType = declared };
        // A composed page still names the window when it DECLARES a title ([Title]): without it the
        // tab kept the previous page's title and screen readers heard no navigation (Java's
        // CommandMapper does the same for a ComponentTreeSupplier / [AutoPage] bridge).
        var namesWindow = isPage || type.Find<TitleAttribute>() is not null;
        return FragmentResponse(_mapper.TitleOf(type, instance), view, rq,
            LookupLabels(type, instance, instance), emitWindowTitle: namesWindow && !embedded);
    }

    /// <summary>What a definition-only page names the window with (Java's
    /// ActionInstanceCreator.nameTheWindow): the root component's own <c>Title</c>, interpolated
    /// against the page state — unless an expression in it has no value yet —, else the route's
    /// last literal segment humanized (<c>orders/:id/edit-notes</c> → "Edit notes"). It used to be
    /// the RAW route ("/about").</summary>
    internal static string DefinitionWindowTitle(
        IComponent layout, IReadOnlyDictionary<string, object?>? state, string? route)
    {
        if (layout.GetType().GetProperty("Title") is { PropertyType: var t } property && t == typeof(string)
            && property.GetValue(layout) is string title && !string.IsNullOrWhiteSpace(title))
        {
            var placeholder = new System.Text.RegularExpressions.Regex(@"\$\{([^}]+)}");
            string? ValueOf(string expression)
            {
                var key = expression.Trim();
                if (key.StartsWith("state.")) key = key["state.".Length..];
                return state is not null && state.TryGetValue(key, out var v) && v is not null
                       && !string.IsNullOrWhiteSpace(v.ToString()) ? v.ToString() : null;
            }
            if (placeholder.Matches(title).All(m => ValueOf(m.Groups[1].Value) is not null))
                return placeholder.Replace(title, m => ValueOf(m.Groups[1].Value) ?? "");
        }
        var segments = (route ?? "").Split('?')[0].Split('/');
        for (var i = segments.Length - 1; i >= 0; i--)
        {
            var segment = segments[i];
            // a concrete path's id ("6") never names the window
            if (!string.IsNullOrWhiteSpace(segment) && !segment.StartsWith(':') && !segment.StartsWith('{')
                && !segment.All(char.IsAsciiDigit))
                return Naming.HumanizeConstant(segment);
        }
        return route ?? "";
    }

    /// <summary>The <c>pageType:</c> of the route's definition when it is bound to
    /// <paramref name="type"/>, else null (inferred).</summary>
    private string? DeclaredPageTypeFor(string? route, Type type) =>
        PersonalSpec(route) is { } spec && spec.ModelView == type.FullName ? spec.PageType : null;

    /// <summary>A definition-only page that declares a <c>pageType:</c>, that its route SEEDS, that
    /// declares <c>actions:</c> or whose layout names catalogue actions: the bare layout carries none
    /// of that, so it is wrapped in a server-side page that does (mirrors Java's
    /// ActionInstanceCreator.seedBareLayout → SeededYamlPage). Neither → unchanged.
    /// <para>The wrapper advertises the DECLARED actions only — never the <c>*</c> wildcard a class
    /// view advertises, which would claim every id for a server with no behaviour behind it — plus the
    /// catalogue entries the layout names (OWNER FIRST) and <c>__restfetch__</c> when a declared call
    /// is proxied; and, like Java's, the client validations of its required fields and the Form's
    /// <c>confirmOnNavigationIfDirty</c>.</para></summary>
    private static ComponentDto WithDeclaredPageType(
        ComponentDto layout, string? pageType, RunActionRqDto rq, IReadOnlyDictionary<string, object?>? state = null,
        string? templatePageType = null, YamlSpecLoader.Spec? spec = null, IComponent? bare = null,
        bool? routeSeeds = null)
    {
        var actions = (spec?.Actions ?? []).Select(a => a.Dto).ToList();
        if (bare is not null)
        {
            // the catalogue entries the layout (or the page's own flows) names but does not declare
            var named = ActionGuard.TreeActionIds(bare)
                .Concat(actions.SelectMany(a => a.Commands ?? [])
                    .Where(c => c.Type == "RunAction" && c.Data is IDictionary<string, object> d && d.ContainsKey("actionId"))
                    .Select(c => ((IDictionary<string, object>)c.Data!)["actionId"].ToString()!));
            actions.AddRange(ActionRegistry.ReferencedBy(MateuCatalogs.Actions, named,
                    actions.Select(a => a.Id).Concat(MateuCatalogs.RefusedActions).Concat(spec?.RefusedActions ?? new HashSet<string>()))
                .Select(ActionRegistry.ToDto));
        }
        // a proxied call — a declared action's, or a listing's rows / a select's options read off a
        // keyed catalogue entry — is the server's to make through __restfetch__, which only a
        // server-side page answers (Java's SeededYamlPage as a RestSourceSupplier)
        var proxied = spec is not null
                      && YamlDeclaredActions.SourcesOf(spec.Actions, bare).Any(s => s.Source.Proxy);
        var triggers = spec?.Triggers ?? [];
        var seeds = routeSeeds ?? state is { Count: > 0 };
        if (pageType is null && !seeds && actions.Count == 0 && triggers.Count == 0 && !proxied)
            return layout;
        if (proxied) actions.Add(new ActionDto("__restfetch__", ValidationRequired: false));
        // wrapped for its seeds: a page that fills a template is the template's kind of page, a
        // listing is a collection, anything else a form (Java's PageTypeResolver default)
        pageType ??= templatePageType ?? (bare is ListingComponent ? "collection" : "form");
        var route = (rq.Route ?? "").Split('?')[0].Trim('/');
        return new ServerSideComponentDto(
            "page_" + System.Text.RegularExpressions.Regex.Replace(route == "" ? "root" : route, "[^A-Za-z0-9_-]", "_"),
            "", string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!, [layout],
            new Dictionary<string, object?>(state ?? new Dictionary<string, object?>()), actions, triggers.ToList(),
            // ComponentTreeSupplier.style()'s default: the page's reading measure
            "max-width:900px;margin: auto;", null, null)
        {
            PageType = pageType,
            Validations = YamlDeclaredActions.Validations(bare),
            ConfirmOnNavigationIfDirty = spec?.ConfirmOnNavigationIfDirty ?? false,
        };
    }

    /// <summary>The <c>layoutDelta:</c> of the route's definition when it is bound to
    /// <paramref name="type"/>, else empty — so the caller can apply it unconditionally.</summary>
    private LayoutDelta DeltaFor(string? route, Type type) =>
        PersonalSpec(route) is { } spec && spec.ModelView == type.FullName ? spec.Delta : LayoutDelta.Empty;

    /// <summary>Runs a view action. The actionId comes from the wire, so it only reaches a method
    /// DECLARED as an action (see <see cref="ActionGuard.ResolveAction"/>) and only when the caller
    /// passes its access gates; anything else is "Action not found" / 403.</summary>
    private UIIncrementDto RunAction(Type type, object instance, RunActionRqDto rq, IComponent? layoutOverride)
    {
        var method = ActionGuard.ResolveAction(type, instance, rq.ActionId!, layoutOverride);
        if (method is null) throw ActionGuard.NoSuchAction($"{rq.ActionId}");
        ActionGuard.EnsureMayInvoke(type, method, rq.ActionId!);
        // A [Button] / [Toolbar] is advertised validationRequired: the client checks the form's constraints
        // first, and the server does not take its word for it (Java's ServerConstraintCheck).
        if ((method.Find<ButtonAttribute>() != null || method.Find<ToolbarAttribute>() != null)
            && _mapper.Violations(type, instance) is { Count: > 0 } broken)
            throw new UserFacingException(ReflectionMapper.ValidationTitle, string.Join("\n", broken));
        var result = method.Invoke(instance, BuildArguments(method, rq));
        return ActionResult(result, rq);
    }

    /// <summary>Runs <c>nested-form-action-&lt;field&gt;-&lt;method&gt;</c>: the method of the nested
    /// data object the view's <c>field</c> holds (hydrated from the state, or a fresh one), with the
    /// same guard as any action — a field that is no nested form, a method that is no declared
    /// action or a malformed id is refused (Java's RunMethodActionRunner nested-form branch).
    /// Returning the nested object (or the view) re-renders the view.</summary>
    private UIIncrementDto RunNestedFormAction(Type type, object instance, RunActionRqDto rq, IComponent? layoutOverride)
    {
        var actionId = rq.ActionId!;
        var rest = actionId[ReflectionMapper.NestedFormActionPrefix.Length..];
        var dash = rest.IndexOf('-');
        if (dash <= 0 || dash == rest.Length - 1) throw ActionGuard.NoSuchAction(actionId);
        var fieldName = rest[..dash];
        var methodId = rest[(dash + 1)..];
        var property = ReflectionMapper.EditableProperties(type)
            .FirstOrDefault(p => Naming.CamelCase(p.Name) == fieldName && _mapper.IsNestedFormProperty(p));
        if (property is null || !ActionGuard.Authorized(property.Find<EyesOnlyAttribute>()))
            throw ActionGuard.NoSuchAction(actionId);
        var nested = property.GetValue(instance) ?? Activator.CreateInstance(property.PropertyType)!;
        if (property.CanWrite) property.SetValue(instance, nested);
        var nestedType = nested.GetType();
        var method = ActionGuard.ResolveAction(nestedType, nested, methodId, null);
        if (method is null) throw ActionGuard.NoSuchAction(actionId);
        ActionGuard.EnsureMayInvoke(nestedType, method, actionId);
        // advertised validationRequired (a [Button]/[Toolbar] with no [Action]): the server checks too
        if (method.Find<ActionAttribute>() is null
            && (method.Find<ButtonAttribute>() != null || method.Find<ToolbarAttribute>() != null)
            && _mapper.Violations(type, instance) is { Count: > 0 } broken)
            throw new UserFacingException(ReflectionMapper.ValidationTitle, string.Join("\n", broken));
        var result = method.Invoke(nested, BuildArguments(method, rq));
        if (ReferenceEquals(result, nested) || ReferenceEquals(result, instance))
            return Render(type, instance, rq, layoutOverride);
        return ActionResult(result, rq);
    }

    /// <summary>What an action's result answers (shared by view and nested-object actions).</summary>
    private UIIncrementDto ActionResult(object? result, RunActionRqDto rq)
    {
        // An action returning a routed view (itself, or the model of the view's next state)
        // re-renders it in place — how a multi-state island switches between its states.
        if (IsRoutedViewResult(result)) return Render(result!.GetType(), result, rq);
        // The new state AND something else in one answer — `[this, PageBanners.Append(...)]`,
        // `[this, Message]` (Java's FragmentListMapper over a returned Collection): the view
        // re-renders and the rest maps as usual, merged in order.
        if (result is IEnumerable<object> many && many.FirstOrDefault(IsRoutedViewResult) is { } view)
            return Merge([
                Render(view.GetType(), view, rq),
                MapResult(many.Where(r => !ReferenceEquals(r, view)).ToList(), rq),
            ]);
        return MapResult(result, rq);
    }

    /// <summary>Fills a method's parameters from the action request: a row-click's _clickedRow
    /// parameter is rebuilt into the parameter's type ([OnRowSelected] methods take the clicked
    /// row); anything unfillable is null (mirrors Java's RunMethodActionRunner.createParameters).
    /// Without _clickedRow, the row is read from the action's loose parameters — what the
    /// renderers send when a row is OPENED — taking only those named like a property of the
    /// parameter's type (mirrors Java's HttpRequest.getClickedRow).</summary>
    private static object?[] BuildArguments(MethodInfo method, RunActionRqDto rq)
    {
        var parameters = method.GetParameters();
        if (parameters.Length == 0) return [];
        var clickedRow = rq.Parameters.TryGetValue("_clickedRow", out var raw)
                         && raw is JsonElement { ValueKind: JsonValueKind.Object } el
            ? el
            : (JsonElement?)null;
        return parameters.Select(p =>
        {
            // The action request itself can be injected (the ports' analogue of Java's
            // HttpRequest injection) — e.g. an undoable toast's undo action reads its
            // undoParameters from rq.Parameters.
            if (p.ParameterType == typeof(RunActionRqDto)) return rq;
            if (clickedRow is { } row && p.ParameterType is { IsClass: true } t && t != typeof(string))
            {
                var entity = Activator.CreateInstance(t)!;
                BindState(entity, row.EnumerateObject().ToDictionary(x => x.Name, x => (object?)x.Value));
                return (object?)entity;
            }
            if (clickedRow is null && !rq.Parameters.ContainsKey("_clickedRow")
                && p.ParameterType is { IsClass: true } looseType && looseType != typeof(string)
                && LooseRow(rq.Parameters, looseType) is { Count: > 0 } loose)
            {
                var entity = Activator.CreateInstance(looseType)!;
                BindState(entity, loose);
                return (object?)entity;
            }
            return null;
        }).ToArray();
    }

    /// <summary>The action's parameters that are columns of <paramref name="rowType"/> (never the
    /// internal ones: a leading underscore, initiatorState).</summary>
    private static Dictionary<string, object?> LooseRow(Dictionary<string, object?> parameters, Type rowType)
    {
        var columns = ReflectionMapper.EditableProperties(rowType)
            .Select(p => Naming.CamelCase(p.Name))
            .ToHashSet();
        return parameters
            .Where(kv => !kv.Key.StartsWith('_') && kv.Key != "initiatorState" && columns.Contains(kv.Key))
            .ToDictionary(kv => kv.Key, kv => kv.Value);
    }

    /// <summary>The base URL the current request came in through (scheme://host/prefix), or null.</summary>
    private static readonly AsyncLocal<string?> RequestBaseUrl = new();

    private static UIIncrementDto MapResult(object? result, RunActionRqDto? rq = null) => result switch
    {
        null => UIIncrementDto.Of(),
        // A LongTask: streamed by the SSE endpoint, run to the end on the sync leg (ProgressTasks).
        LongTaskRun run => ParkStream(run, rq),
        // A Document is shown or downloaded: a DownloadFile command, the bytes inline when small,
        // a single-use URL when large or lazy (mirrors Java's CommandMapper).
        Document doc => UIIncrementDto.Of(commands:
            [new UICommandDto(rq is null ? "ux_main" : Target(rq), "DownloadFile",
                DocumentCommands.ToFileDownload(doc, RequestBaseUrl.Value))]),
        Message msg => UIIncrementDto.Of(messages: [MessageOf(msg)]),
        // Action-returned page banner(s) → UIIncrement.banners. A PageBanners carries the mode too
        // (append accumulates over what earlier actions showed; replace, the default, swaps them).
        PageBanners pbs => UIIncrementDto.Of(banners: pbs.Banners.Select(BannerOf).Cast<object>().ToList(),
            appendBanners: pbs.Appending),
        PageBanner b => UIIncrementDto.Of(banners: [BannerOf(b)]),
        IEnumerable<PageBanner> bs => UIIncrementDto.Of(banners: bs.Select(BannerOf).Cast<object>().ToList()),
        // An overlay (drawer/dialog) → an ADD fragment on the initiator, so it stacks on top of
        // the page instead of replacing it (mirrors Java's FragmentDataSerializer.isOverlay).
        Drawer or Dialog => UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq?.InitiatorComponentId ?? "ux_main",
                ComponentMapper.Map((IComponent)result), null, null, "Add", null)]),
        // A route string → navigate; a UICommand → pass through (dispatchEvent / closeModal),
        // retargeting the "ux_main" placeholder at the initiator (the frontend drops commands
        // whose target matches no component id).
        string route when route.StartsWith('/') =>
            UIIncrementDto.Of(commands: [new UICommandDto(rq is null ? "ux_main" : Target(rq), "NavigateTo", route)]),
        // A Uri navigates, alone or inside a list (mirrors Java's returned URI; issue #1167).
        Uri uri => UIIncrementDto.Of(commands:
            [new UICommandDto(rq is null ? "ux_main" : Target(rq), "NavigateTo", uri.OriginalString)]),
        // Any other text is a message (mirrors Java): it leaves the screen as it was.
        string text => MapResult(new Message(text), rq),
        UICommandDto cmd => UIIncrementDto.Of(commands:
            [cmd.TargetComponentId == "ux_main" && rq is not null ? cmd with { TargetComponentId = Target(rq) } : cmd]),
        // A flow Step (coherence-plan #3) is behavior: lower it to its wire command. v0 verbs are
        // 1:1 with a UICommand, so a returned Step (or a list of them) becomes commands.
        FlowStep step => UIIncrementDto.Of(commands: [Retarget(StepToCommand(step), rq)]),
        IEnumerable<FlowStep> steps => UIIncrementDto.Of(commands:
            steps.Select(s => Retarget(StepToCommand(s), rq)).ToList()),
        // A list of results (a message + commands, e.g. [Message, UICommandDto.Announce(...)])
        // answers all of them, in order (mirrors Java mapping a returned Collection).
        IEnumerable<object> many => Merge(many.Select(r => MapResult(r, rq))),
        _ => UIIncrementDto.Of(),
    };

    /// <summary>A returned <see cref="Message"/> on the wire: persistence as declared (else an error is
    /// sticky, anything else a toast), the declared actions plus the legacy undo as one of them
    /// (style undo) when it is not already listed, the dedup key (mirrors Java's MessageMapper).</summary>
    private static MessageDto MessageOf(Message msg)
    {
        var variant = msg.Variant.ToString().ToLowerInvariant();
        var actions = msg.Actions.Select(LongTask.ToDto).ToList();
        if (msg.UndoActionId is not null && msg.Actions.All(a => a.ActionId != msg.UndoActionId))
            actions.Add(new MessageActionDto(msg.UndoLabel, msg.UndoActionId, msg.UndoParameters, null, Message.StyleUndo));
        var dto = new MessageDto(variant, msg.Position, msg.Title, msg.Text, msg.Duration,
            msg.UndoLabel, msg.UndoActionId, msg.UndoParameters)
        {
            Actions = actions,
            Key = msg.Key,
        };
        return msg.Persistence is { } persistence
            ? dto with { Persistence = persistence.ToString().ToLowerInvariant() }
            : dto;
    }

    /// <summary>Concatenates the commands, messages, fragments and banners of several increments.</summary>
    private static UIIncrementDto Merge(IEnumerable<UIIncrementDto> increments)
    {
        var all = increments.ToList();
        return UIIncrementDto.Of(
            commands: all.SelectMany(i => i.Commands),
            messages: all.SelectMany(i => i.Messages),
            fragments: all.SelectMany(i => i.Fragments),
            banners: all.SelectMany(i => i.Banners),
            // a PageBanners.Append inside a list (the new state AND appended banners, in one
            // answer) keeps its flag — it used to be dropped there (mirrors Java's MessageMapper)
            appendBanners: all.Any(i => i.AppendBanners));
    }

    /// <summary>Lowers a v0 flow Step to the wire command it produces (mirrors Java Step.toCommand).</summary>
    private static UICommandDto StepToCommand(FlowStep step) => step switch
    {
        Navigate n => new UICommandDto("ux_main", "NavigateTo", n.Route),
        Emit e => UICommandDto.DispatchEvent(e.Event, e.Payload),
        CloseOverlay c => c.Event is null ? UICommandDto.CloseModal() : UICommandDto.CloseModal(c.Event),
        RunAction r => new UICommandDto("ux_main", "RunAction", new Dictionary<string, object?> { ["actionId"] = r.ActionId }),
        MarkClean => new UICommandDto("ux_main", "MarkAsClean", null),
        MarkDirty => new UICommandDto("ux_main", "MarkAsDirty", null),
        Announce a => a.Assertive ? UICommandDto.AnnounceAssertive(a.Text) : UICommandDto.Announce(a.Text),
        _ => throw new InvalidOperationException($"Unknown flow step {step.GetType().Name}"),
    };

    private static UICommandDto Retarget(UICommandDto cmd, RunActionRqDto? rq) =>
        cmd.TargetComponentId == "ux_main" && rq is not null ? cmd with { TargetComponentId = Target(rq) } : cmd;

    internal static BannerDto BannerOf(PageBanner b) =>
        new(b.Theme.ToString().ToUpperInvariant(), b.Title, b.Description)
        {
            HasCloseButton = b.Closeable,
            TimeoutSeconds = b.TimeoutSeconds,
        };

    // ── Helpers ──────────────────────────────────────────────────────────────────
    private static string Title(Type type) =>
        type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

    private static UIIncrementDto FragmentResponse(
        string title, ComponentDto component, RunActionRqDto rq, object? data = null, bool emitWindowTitle = true) =>
        UIIncrementDto.Of(
            // SetWindowTitle rides only for a PAGE (a reflected @UI form). A ComponentTreeSupplier
            // view is not the window — Java omits the command (ViewTypeClassifier.isPage → false).
            commands: emitWindowTitle ? [new UICommandDto(Target(rq), "SetWindowTitle", title)] : [],
            // The fragment's state mirrors the component's initialData (a view's seeded field values):
            // Java emits both, identical (mirrors ReflectionUiIncrementMapper). A grid/list value and
            // a scalar all ride here, so the client round-trips them through componentState.
            fragments: [new UIFragmentDto(Target(rq), StampOrStripStructure(component, rq), StateOf(component), data, "Replace", null)]);

    private static object? StateOf(ComponentDto component) =>
        component is ServerSideComponentDto { InitialData: IReadOnlyDictionary<string, object?> data and { Count: > 0 } }
            // a nested data object rides nested AND flattened under its prefixed ids (Java's
            // FormViewSerializer) — the nested fields bind to the flattened keys
            ? NestedFormState.Flatten(data)
            : null;

    /// <summary>Decorates a resolved route's increment with the route entry's APP-SCOPE seeds. State
    /// and params were already folded into componentState (RouteMatch.Params). Here:
    /// <list type="bullet">
    /// <item>AppState is merged UNDER the client's request app state (so route seeds are defaults
    /// and the persisted [AppContext] still wins) and emitted on the increment.</item>
    /// <item>Data injects a __restdata__ action + OnLoad trigger into the rendered view's fragment —
    /// the same client-side load path a [RestData] class uses (mirrors Java's RouteSegmentUtils
    /// stashing _routeData + the action/trigger mappers).</item>
    /// </list>
    /// AppData rides on the app metadata (see MapApp), not here. (Mirrors Java's
    /// ReflectionUiIncrementMapper.mapToAppState + the _routeData wiring.)</summary>
    private static UIIncrementDto SeedRouteScopes(UIIncrementDto increment, RunActionRqDto rq, RouteEntry? entry)
    {
        if (entry is null) return increment;

        // Data: inject __restdata__ + OnLoad into the resolved view's ServerSideComponentDto so the
        // client fetches it and merges it into the state on load.
        if (entry.Data is { } data)
        {
            var fragments = increment.Fragments.Select(f =>
                f.Component is ServerSideComponentDto ssc
                    ? f with { Component = WithRestData(ssc, data) }
                    : f).ToList();
            increment = increment with { Fragments = fragments };
        }

        // AppState: merge the route's seeds UNDER the client's request app state.
        if (entry.AppState is { Count: > 0 } seeds)
        {
            var merged = new Dictionary<string, object?>();
            foreach (var kv in seeds) merged[kv.Key] = kv.Value;
            if (rq.AppState is not null)
                foreach (var kv in rq.AppState) merged[kv.Key] = kv.Value;
            increment = increment with { AppState = merged };
        }

        return increment;
    }

    /// <summary>The view with a __restdata__ action + OnLoad trigger added (deduplicated), so a
    /// route-declared data source is fetched client-side on load exactly like a [RestData] class.</summary>
    private static ServerSideComponentDto WithRestData(ServerSideComponentDto ssc, RestDataSourceDto source)
    {
        if (ssc.Actions.Any(a => a.Id == "__restdata__")) return ssc;
        var actions = ssc.Actions.Append(
            new ActionDto("__restdata__", ValidationRequired: false)
            {
                RestAction = new RestActionDto(source, null, ""),
            }).ToList();
        var triggers = ssc.Triggers.Append(new TriggerDto("OnLoad", "__restdata__")).ToList();
        return ssc with { Actions = actions, Triggers = triggers };
    }

    /// <summary>Fragments and commands address the component that initiated the request (the
    /// web frontend's top ux id is "_ux" — Java echoes the initiator the same way).</summary>
    private static string Target(RunActionRqDto rq) =>
        string.IsNullOrEmpty(rq.InitiatorComponentId) ? "ux_main" : rq.InitiatorComponentId!;

    /// <summary>Display labels for reference fields whose value is already set when the form
    /// renders: [Searchable] fields ask their selector, [Lookup] fields the view's
    /// ILookupLabelSupplier (falling back to a match among its IOptionsSupplier options). They
    /// ride as &lt;fieldId&gt;-label entries in the fragment data — where the renderer's combo
    /// looks before showing the raw id (mirrors Java's LookupLabelSupplier).</summary>
    internal static Dictionary<string, object?>? LookupLabels(Type type, object instance, object supplierHost)
    {
        Dictionary<string, object?>? data = null;
        foreach (var p in ReflectionMapper.EditableProperties(type))
        {
            if (p.GetValue(instance)?.ToString() is not { Length: > 0 } id) continue;
            var fieldId = Naming.CamelCase(p.Name);
            string? label = null;
            if (p.Find<SearchableAttribute>() is { } searchable)
            {
                label = (Activator.CreateInstance(searchable.Selector) as ILookupLabelSupplier)
                    ?.Label(fieldId, id);
            }
            else if (p.Find<LookupAttribute>() is not null)
            {
                label = (supplierHost as ILookupLabelSupplier)?.Label(fieldId, id)
                        ?? (supplierHost as IOptionsSupplier)?.Options(fieldId)
                            .FirstOrDefault(o => o.Value == id)?.Label;
                if (label is not null)
                {
                    // The combo's pre-set selection: a one-option page under the field id, so the
                    // renderer shows the label without a search round trip (Java's
                    // LookupFieldDataWriter — searchSignature is the label).
                    (data ??= new Dictionary<string, object?>())[fieldId] = new
                    {
                        searchSignature = label, pageSize = 1, pageNumber = 0, totalElements = 1,
                        content = new[] { new OptionDto(id, label) },
                    };
                }
            }
            if (label is not null) (data ??= new Dictionary<string, object?>())[fieldId + "-label"] = label;
        }
        return data;
    }

    private static UIIncrementDto Navigate(string route, string? successText, RunActionRqDto rq) =>
        UIIncrementDto.Of(
            // A server-driven navigation LEAVES the form on purpose (after a save, a cancel): clear
            // its unsaved-changes flag first, as Java's crud does — without it Save itself asked
            // "you have unsaved changes, leave?" and a cancelled edit kept the whole app dirty.
            commands: [new UICommandDto(Target(rq), "MarkAsClean", null), new UICommandDto(Target(rq), "NavigateTo", route)],
            messages: successText is null ? [] : [new MessageDto("success", "middle", "", successText, 3000)]);

    /// <summary>The navigation a successful CREATE answers with: its "Saved" toast offers "Add
    /// another" (dispatching the crud's "new") — the create flow is where it belongs, not the view
    /// of an existing record (mirrors Java's PersistActionHandler.offersAddAnother).</summary>
    private static UIIncrementDto NavigateAfterCreate(string route, RunActionRqDto rq) =>
        Navigate(route, "Saved", rq) with
        {
            Messages = [new MessageDto("success", "middle", "", "Saved", 10000,
                UndoLabel: "Add another", UndoActionId: "new", UndoParameters: new Dictionary<string, object?>())],
        };

    private static UIIncrementDto Error(string text) =>
        UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", text, 5000)]);

    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);
}
