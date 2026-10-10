using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Handles a single POST /mateu/v3/sync/{route} call → a UIIncrement.</summary>
public sealed partial class SyncHandler(MateuRegistry registry, ITranslator? translator = null, Func<Identity?>? identity = null,
    Func<string, string?>? secrets = null)
{
    private static readonly HttpClient RestHttp = new() { Timeout = TimeSpan.FromSeconds(60) };

    private readonly ReflectionMapper _mapper = new(translator, identity);
    /// <summary>The mount's authored route registry: specs/ui/routes.yaml merged OVER the routes
    /// contributed in code by IRouteEntrySupplier implementers (discovered by the MateuRegistry).</summary>
    private readonly RouteRegistry _routes = new(supplied: registry.SuppliedRoutes);

    /// <summary>The loader builds its OWN registry: a field initialiser cannot reference another
    /// instance field, and routes.yaml is a small file each side parses once and caches, so sharing
    /// the instance is not worth a constructor just for it.</summary>
    private readonly YamlSpecLoader _yaml = new();

    public UIIncrementDto Handle(RunActionRqDto rq, string? requestBaseUrl = null)
    {
        // Security context of this request: the identity the gates ([EyesOnly]/[ReadOnlyUnless]/
        // [DisabledUnless]) are matched against at INVOCATION and when binding wire state.
        ActionGuard.SetIdentity(identity);

        // 0. Audience projection: the appState value under "audience" (the [AppContext] selector
        // named audience) filters [Audience]-marked members for the whole request.
        ReflectionMapper.SetCurrentAudience(
            rq.AppState.TryGetValue("audience", out var audience) ? StateString(audience) : null);

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
        if (rq.ActionId == "__preview__" && rq.Parameters.TryGetValue("_yaml", out var yamlParam))
        {
            var previewTree = YamlComponentBuilder.Parse(StateString(yamlParam) ?? "")
                              ?? new Text("Invalid YAML");
            return FragmentResponse("Preview", ComponentMapper.Map(previewTree), rq);
        }

        // 0d. Proxy-mode external fetch: a proxy source's renderer POSTs __restfetch__ with
        // _sourceKind/_sourceId + component state; resolve the DECLARED source (never a client url),
        // inject ${secret.X} and fetch server-side, returning the raw JSON on appData._restfetch
        // (mirrors Java's __restfetch__ reserved action).
        if (rq.ActionId == "__restfetch__")
            return RestFetchResponse(rq);

        // 1. App shell at the root route.
        if (string.IsNullOrEmpty(rq.ActionId)
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

        // The AUTHORED registry answers before the attribute-declared views — explicit beats
        // derived, the same precedence the layout and page inference already use. Its parameters are
        // folded into the component state here, at the single point every downstream step reads:
        //
        //   fixed > client state > path > defaults
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
        if (_routes.Match(rq.Route) is { } routeMatch)
        {
            rq = rq with { ComponentState = routeMatch.Params(rq.ComponentState) };
            routeEntry = routeMatch.Entry;
            if (!string.IsNullOrWhiteSpace(routeMatch.Entry.ViewModel))
                type = registry.TypeByName(routeMatch.Entry.ViewModel);
        }
        return SeedRouteScopes(ResolveRoute(rq, type, routeEntry), rq, routeEntry);
    }

    /// <summary>The route-resolution tail of <see cref="Handle"/>: a view/listing/wizard resolved
    /// either from the authored registry or from attributes. Split out so route-scope seeding can
    /// decorate its result once, at every exit. When <paramref name="routeEntry"/> declares Data the
    /// resolved view gets a __restdata__ action + OnLoad trigger injected (the @RestData load path).</summary>
    private UIIncrementDto ResolveRoute(RunActionRqDto rq, Type? type, RouteEntry? routeEntry)
    {
        type ??= registry.Resolve(rq.ServerSideType, rq.Route);
        var yamlSpec = _yaml.LoadSpec(rq.Route);
        if (type is null && yamlSpec is not null)
        {
            // A route with no view class → a YAML page. A bare layout renders as a static, unbound
            // page; a page that declares modelView: instantiates that logic class (state + actions)
            // and renders the YAML layout bound to it (mirrors Java's ActionInstanceCreator.loadYaml).
            if (string.IsNullOrEmpty(yamlSpec.ModelView))
                return yamlSpec.Layout is { } bare
                    ? FragmentResponse(rq.Route ?? "", ComponentMapper.Map(bare), rq)
                    : Error($"Route not found: {rq.Route}");
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
            return rq.ActionId switch
            {
                "search" => ListingSearch(view, listing.Filters, listing.Row, rq),
                // A selector dialog's row pick: write (id, label) back into the host field.
                "action-on-row-select" => SelectorRowSelected(view, listing.Row, rq),
                _ => Render(type, view, rq),
            };
        }

        // 3. A wizard.
        if (typeof(Wizard).IsAssignableFrom(type)) return HandleWizard(type, rq);

        // 4. A plain view.
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(instance, rq);
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(type, rq);
        // The notification inbox's app-level actions — dispatched with the app's serverSideType,
        // like the app header actions (mirrors Java's NotificationsActionRunner).
        if (rq.ActionId?.StartsWith("_notifications-") == true) return Notifications(instance, rq);
        // The command palette's entity search — same app-level rail (mirrors Java's
        // GlobalSearchActionRunner).
        if (rq.ActionId == "_globalsearch") return GlobalSearch(instance, rq);
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

    // ── Plain views ─────────────────────────────────────────────────────────────
    private UIIncrementDto RenderApp(Type appType, string title, RunActionRqDto rq, string? requestBaseUrl)
    {
        var app = _mapper.MapApp(appType, requestBaseUrl);
        // AppData: a route entry's app-scope data source rides on the app metadata — the shell
        // fetches it once into the app-data store, shared across routes. Java attaches it only from
        // a route ON THIS APP'S MOUNT (AppDto.appDataSource); the .NET port has no route↔mount
        // linkage, so we scope by the mount base path — an authored route whose absolute route
        // falls under this app's [UI] mount. (The .NET shell has no source catalogue, so a ref-only
        // source travels on the wire but is not resolved server-side here.)
        var mount = appType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "";
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
        if (app is { Metadata: AppMetadataDto homeMeta }
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

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq, IComponent? layoutOverride = null)
    {
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        // A ComponentTreeSupplier view (an archetype, or an [AutoPage]-inferred dashboard/welcome) is
        // NOT a page: Java's ViewTypeClassifier.isPage returns false for it, so no SetWindowTitle
        // command rides the increment. A YAML-bound modelView (layoutOverride) stays a page.
        var isPage = layoutOverride is not null
                     || (instance is not IComponentTreeSupplier
                         && !PageInference.ComposesDashboard(type)
                         && !PageInference.ComposesWelcome(type));
        return FragmentResponse(Title(type), _mapper.MapView(type, instance, route, layoutOverride), rq,
            LookupLabels(type, instance, instance), emitWindowTitle: isPage);
    }

    /// <summary>Runs a view action. The actionId comes from the wire, so it only reaches a method
    /// DECLARED as an action (see <see cref="ActionGuard.ResolveAction"/>) and only when the caller
    /// passes its access gates; anything else is "Action not found" / 403.</summary>
    private static UIIncrementDto RunAction(Type type, object instance, RunActionRqDto rq, IComponent? layoutOverride)
    {
        var method = ActionGuard.ResolveAction(type, instance, rq.ActionId!, layoutOverride);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        ActionGuard.EnsureMayInvoke(type, method, rq.ActionId!);
        return MapResult(method.Invoke(instance, BuildArguments(method, rq)), rq);
    }

    /// <summary>Fills a method's parameters from the action request: a row-click's _clickedRow
    /// parameter is rebuilt into the parameter's type ([OnRowSelected] methods take the clicked
    /// row); anything unfillable is null (mirrors Java's RunMethodActionRunner.createParameters).</summary>
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
            return null;
        }).ToArray();
    }

    private static UIIncrementDto MapResult(object? result, RunActionRqDto? rq = null) => result switch
    {
        null => UIIncrementDto.Of(),
        Message msg => UIIncrementDto.Of(messages:
            [new MessageDto(msg.Variant.ToString().ToLowerInvariant(), "middle", msg.Title, msg.Text, msg.Duration,
                msg.UndoLabel, msg.UndoActionId, msg.UndoParameters)]),
        // Action-returned page banner(s) → UIIncrement.banners.
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
        // Any other text is a message (mirrors Java): it leaves the screen as it was.
        string text => MapResult(new Message(text), rq),
        UICommandDto cmd => UIIncrementDto.Of(commands:
            [cmd.TargetComponentId == "ux_main" && rq is not null ? cmd with { TargetComponentId = Target(rq) } : cmd]),
        // A flow Step (coherence-plan #3) is behavior: lower it to its wire command. v0 verbs are
        // 1:1 with a UICommand, so a returned Step (or a list of them) becomes commands.
        FlowStep step => UIIncrementDto.Of(commands: [Retarget(StepToCommand(step), rq)]),
        IEnumerable<FlowStep> steps => UIIncrementDto.Of(commands:
            steps.Select(s => Retarget(StepToCommand(s), rq)).ToList()),
        _ => UIIncrementDto.Of(),
    };

    /// <summary>Lowers a v0 flow Step to the wire command it produces (mirrors Java Step.toCommand).</summary>
    private static UICommandDto StepToCommand(FlowStep step) => step switch
    {
        Navigate n => new UICommandDto("ux_main", "NavigateTo", n.Route),
        Emit e => UICommandDto.DispatchEvent(e.Event, e.Payload),
        CloseOverlay c => c.Event is null ? UICommandDto.CloseModal() : UICommandDto.CloseModal(c.Event),
        RunAction r => new UICommandDto("ux_main", "RunAction", new Dictionary<string, object?> { ["actionId"] = r.ActionId }),
        MarkClean => new UICommandDto("ux_main", "MarkAsClean", null),
        MarkDirty => new UICommandDto("ux_main", "MarkAsDirty", null),
        _ => throw new InvalidOperationException($"Unknown flow step {step.GetType().Name}"),
    };

    private static UICommandDto Retarget(UICommandDto cmd, RunActionRqDto? rq) =>
        cmd.TargetComponentId == "ux_main" && rq is not null ? cmd with { TargetComponentId = Target(rq) } : cmd;

    private static BannerDto BannerOf(PageBanner b) =>
        new(b.Theme.ToString().ToUpperInvariant(), b.Title, b.Description);

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
            ? data
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
    private static Dictionary<string, object?>? LookupLabels(Type type, object instance, object supplierHost)
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
            }
            if (label is not null) (data ??= new Dictionary<string, object?>())[fieldId + "-label"] = label;
        }
        return data;
    }

    private static UIIncrementDto Navigate(string route, string? successText, RunActionRqDto rq) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto(Target(rq), "NavigateTo", route)],
            messages: successText is null ? [] : [new MessageDto("success", "middle", "", successText, 3000)]);

    private static UIIncrementDto Error(string text) =>
        UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", text, 5000)]);

    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);
}
