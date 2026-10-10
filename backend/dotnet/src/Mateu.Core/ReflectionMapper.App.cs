using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// The app shell: variant, menu, header actions and context selectors (Java: AppMapper, AppMenuBuilder, MenuEntryMapper).
public sealed partial class ReflectionMapper
{
    /// <summary>Builds the App shell (header + menu) from an [App] class's [MenuItem] methods.</summary>
    /// <summary>The navigation chrome (mirrors Java's AppMetadataExtractor.getVariant): an
    /// explicit [App(Variant = …)] always wins; a menu with folders → TILES when a folder nests
    /// another folder, HAMBURGUER_MENU past 7 top-level entries, else MENU_ON_TOP; a flat menu of
    /// leaf entries → TABS.</summary>
    private static string VariantOf(AppAttribute app, List<MenuItemDto> items)
    {
        if (app.Variant.Length > 0) return app.Variant;
        if (items.Any(i => i.Submenus.Count > 0))
        {
            if (items.Any(i => i.Submenus.Any(s => s.Submenus.Count > 0))) return "TILES";
            return items.Count > 7 ? "HAMBURGUER_MENU" : "MENU_ON_TOP";
        }
        return "TABS";
    }

    public ClientSideComponentDto MapApp(Type appType, string? requestBaseUrl = null)
    {
        var app = appType.GetCustomAttribute<AppAttribute>()!;
        // An app can compose its shell + menu IN CODE — a menu (or whole shell) computed at request
        // time, overriding the static attributes: IAppSupplier returns the shell (chrome + menu),
        // IMenuSupplier just the menu (mirrors Java's AppSupplier/MenuSupplier). Whatever the shell
        // leaves null falls back to the [App] attribute / the derived menu below.
        var shell = typeof(IAppSupplier).IsAssignableFrom(appType)
                    && Activator.CreateInstance(appType) is IAppSupplier appSupplier
            ? appSupplier.GetApp()
            : null;
        List<MenuItemDto> items;
        if (shell is not null)
        {
            items = shell.Menu?.ToList() ?? [];
        }
        else if (typeof(IMenuSupplier).IsAssignableFrom(appType)
                 && Activator.CreateInstance(appType) is IMenuSupplier menuSupplier)
        {
            items = (menuSupplier.Menu() ?? []).ToList();
        }
        else
        {
            // [MenuItem(Group = "…")] entries sharing a Group nest as that folder's submenu (the
            // folder appears where its first entry was declared); ungrouped entries stay leaves. A
            // "/" in the Group nests folders ("Bookings/Reservations" = the Reservations folder
            // inside Bookings) — how a card of a [MenuGroup(Display = "cards")] gets its actions.
            items = new List<MenuItemDto>();
            var folders = new Dictionary<string, List<MenuItemDto>>();
            var groupLooks = appType.GetCustomAttributes<MenuGroupAttribute>()
                .GroupBy(g => g.Group.Trim('/')).ToDictionary(g => g.Key, g => g.First());
            List<MenuItemDto> FolderOf(string path)
            {
                if (folders.TryGetValue(path, out var existing)) return existing;
                var slash = path.LastIndexOf('/');
                var parent = slash < 0 ? items : FolderOf(path[..slash]);
                var submenus = new List<MenuItemDto>();
                folders[path] = submenus;
                var look = groupLooks.GetValueOrDefault(path);
                parent.Add(Presented(new MenuItemDto(T(slash < 0 ? path : path[(slash + 1)..]), "", "")
                    { Submenus = submenus },
                    look?.Display, look?.Description, look?.Icon, look?.Image));
                return submenus;
            }
            foreach (var m in appType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                         .Where(m => m.Find<MenuItemAttribute>() != null && ForCurrentAudience(m)))
            {
                var attribute = m.Find<MenuItemAttribute>()!;
                var entry = Presented(MapMenuItem(m), null, attribute.Description, attribute.Icon, attribute.Image);
                var group = attribute.Group.Trim('/');
                if (group.Length == 0) items.Add(entry);
                else FolderOf(group).Add(entry);
            }
            // [RemoteMenu] entries: federated options — the frontend fetches the remote backend's
            // menu itself and mounts its views (no server-side proxying).
            items.AddRange(appType.GetCustomAttributes<RemoteMenuAttribute>()
                .Select(r => new MenuItemDto(T(r.Label), r.Route, "")
                {
                    Remote = true,
                    BaseUrl = r.BaseUrl,
                    Explode = r.Explode,
                    ConsumedRoute = "_empty",
                }));
        }
        var variant = !string.IsNullOrWhiteSpace(shell?.Variant) ? shell!.Variant! : VariantOf(app, items);

        // The mount base path — the app class's [UI] route. Java's route registry prefixes every
        // menu leaf with the mount (a leaf "/a" under mount "/conformance/app-in-code" resolves to
        // "/conformance/app-in-code/a"): the same app can be mounted twice and its "orders" screen
        // stays distinct (AppMenuDtoBuilder.buildMenu + prepend). We re-derive path/route/
        // consumedRoute/uriPrefix here so both the AppSupplier and the [MenuItem]/[RemoteMenu]
        // branches converge on the same wire shape.
        // An empty [UI] route means the app is mounted at the root — Java's appRoute is then "" (not
        // "/"), so a leaf "/things" stays "/things" and does not become "//things".
        var mount = appType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "";
        var appRoute = mount.Length == 0 ? "" : "/" + mount;
        items = PrefixMenu(items, appRoute, "");

        var home = items.FirstOrDefault();
        // homeRoute: an AppSupplier declares it on its shell (verbatim, mount-RELATIVE — Java keeps
        // "/a", only the menu leaves are mount-prefixed); a declaratively-mapped app has none, so
        // Java's HomeRouteResolver answers "_no_home_route". homeConsumedRoute/homeServerSideType/
        // rootRoute all resolve to the mount + the app class (AppHomeRouteResolver).
        var isAppSupplier = shell is not null;
        var homeRoute = !string.IsNullOrWhiteSpace(shell?.HomeRoute) ? shell!.HomeRoute!
            : isAppSupplier ? home?.Path ?? "" : "_no_home_route";
        var meta = new AppMetadataDto(T(shell?.Title ?? app.Title), variant, items)
        {
            Subtitle = shell?.Subtitle,
            HomeRoute = homeRoute,
            HomeConsumedRoute = appRoute,
            HomeBaseUrl = requestBaseUrl ?? "",
            HomeServerSideType = appType.FullName!,
            RootRoute = appRoute,
            // Only a declaratively-mapped app carries the mount as its `route` (ReflectionAppMapper
            // sets it); an AppSupplier leaves its shell route unset → the field stays absent.
            Route = isAppSupplier ? null : appRoute,
            TotalMenuOptions = TotalMenuOptions(items),
            ServerSideType = appType.FullName!,
            SseUrl = appType.Find<AIAttribute>()?.Sse,
            ContextSelectors = MapContextSelectors(appType),
            ContextActions = MapContextActions(appType),
            NotificationsEnabled = typeof(INotificationsSupplier).IsAssignableFrom(appType),
            // ⌘K palette entity search: the app class implements IGlobalSearchSupplier → the
            // palette also asks _globalsearch (mirrors AppMapper's globalSearchEnabled).
            GlobalSearchEnabled = typeof(IGlobalSearchSupplier).IsAssignableFrom(appType),
            // Command center (Ask-Oracle): the FAB + full-screen palette; chromeless implies it.
            CommandCenterEnabled = app.CommandCenter || app.Chromeless,
            Chromeless = app.Chromeless,
            // Keyboard access keys (hold Alt to see them): opt-in, mirrors AppDto.accessKeys.
            AccessKeys = app.AccessKeys,
            // The UI language: what the translator says (mirrors AppDto.locale).
            Locale = translator?.Locale,
        };
        return new ClientSideComponentDto(meta with { RequiredCapabilities = RequiredCapabilities(app, meta) }, "ux_main_app", [], null, null, null);
    }

    /// <summary>Prefixes a menu tree with the mount base path, matching Java's
    /// AppMenuDtoBuilder.buildMenu: each leaf's <c>Path</c> is the accumulated mount-relative route
    /// (a submenu child re-prepends the parent's raw path, so an "X" under "/g" declared "/g/x"
    /// becomes "/g/g/x"), and <c>Route</c> is the mount-prefixed absolute route. Every leaf carries
    /// <c>ConsumedRoute</c>/<c>UriPrefix</c> = the mount so the client can strip the prefix back off.
    /// A [RemoteMenu] entry keeps its own federated route/consumedRoute/serverSideType.</summary>
    private static List<MenuItemDto> PrefixMenu(IEnumerable<MenuItemDto> items, string appRoute, string prefix) =>
        items.Select(item =>
        {
            if (item.Remote) return item with { UriPrefix = item.Path };
            // A rule leaf (a menu entry that RUNS client-side rules instead of navigating) carries no
            // route — leave it alone so it stays route-less after prefixing.
            if (item.Rules.Count > 0) return item;
            var raw = item.Route ?? "";
            var path = Prepend(prefix, raw);
            return item with
            {
                Path = path,
                Route = appRoute + path,
                ConsumedRoute = appRoute,
                UriPrefix = appRoute,
                Submenus = PrefixMenu(item.Submenus, appRoute, prefix + raw),
            };
        }).ToList();

    /// <summary>Joins a prefix and a path with a single slash (Java's AppMenuDtoBuilder.prepend).</summary>
    private static string Prepend(string prefix, string path)
    {
        var p = prefix.EndsWith('/') ? prefix[..^1] : prefix;
        var s = path.StartsWith('/') ? path[1..] : path;
        return p + "/" + s;
    }

    /// <summary>Total number of menu options, submenus counted recursively (Java's
    /// AppMappingUtils.totalMenuOptions).</summary>
    private static int TotalMenuOptions(IReadOnlyList<MenuItemDto> menu) =>
        menu.Sum(option => 1 + TotalMenuOptions(option.Submenus));

    /// <summary>The capability tokens this app requires from its host renderer: the app-scoped
    /// features it actually declares (DERIVED from the metadata just built, so the developer never
    /// re-states what the model already says) plus whatever [App(Requires = new[]{...})] adds. The
    /// host compares these against what it PROVIDES and reports the difference — compatibility by
    /// capability, not by version. Sorted + deduped so the wire is stable. (C# mirror of
    /// AppMapper.getRequiredCapabilities.) NOTE: app-data derives from AppMetadataDto.AppDataSource,
    /// which the SyncHandler pins AFTER this mapping — so the SyncHandler re-derives the full list
    /// once it is known (see RenderApp).</summary>
    internal static IReadOnlyList<string> RequiredCapabilities(AppAttribute app, AppMetadataDto meta)
    {
        var caps = new SortedSet<string>(StringComparer.Ordinal);
        if (!string.IsNullOrEmpty(meta.SseUrl)) caps.Add(Capabilities.Sse);
        if (meta.AppDataSource is not null) caps.Add(Capabilities.AppData);
        // No REST source catalogue in this port — rest-sources is never derived (like Java when
        // the catalogue is empty).
        if (meta.CommandCenterEnabled) caps.Add(Capabilities.CommandCenter);
        if (meta.GlobalSearchEnabled) caps.Add(Capabilities.GlobalSearch);
        if (meta.NotificationsEnabled) caps.Add(Capabilities.Notifications);
        if (meta.ContextSelectors.Count > 0) caps.Add(Capabilities.ContextSelectors);
        if (meta.ContextActions.Count > 0) caps.Add(Capabilities.HeaderActions);
        foreach (var token in app.Requires)
            if (!string.IsNullOrWhiteSpace(token)) caps.Add(token.Trim());
        return caps.ToList();
    }

    /// <summary>Header action buttons next to the context selectors: the app class implements
    /// IAppActionsSupplier and decides on every shell build which actions exist (visibility
    /// follows server-side state). Each ActionId dispatches against the app class: the method
    /// with that name runs.</summary>
    private static IReadOnlyList<AppHeaderActionDto> MapContextActions(Type appType)
    {
        if (!typeof(IAppActionsSupplier).IsAssignableFrom(appType)
            || Activator.CreateInstance(appType) is not IAppActionsSupplier supplier)
            return [];
        var actions = supplier.AppActions();
        return actions is null ? [] : actions.Select(MapHeaderAction).ToList();
    }

    private static AppHeaderActionDto MapHeaderAction(AppHeaderAction action) =>
        new(action.ActionId, action.Label, action.Icon,
            action.Children?.Select(MapHeaderAction).ToList());

    /// <summary>[AppContext] members of the app class become header context selectors: an enum
    /// property contributes its constants, a method its returned (value, label) pairs.</summary>
    private IReadOnlyList<AppContextSelectorDto> MapContextSelectors(Type appType)
    {
        var selectors = new List<AppContextSelectorDto>();
        foreach (var property in appType.GetProperties())
        {
            var attribute = property.Find<AppContextAttribute>();
            if (attribute is null || !property.PropertyType.IsEnum) continue;
            var options = Enum.GetNames(property.PropertyType)
                .Select(name => new OptionDto(name, EnumLabel(property.PropertyType, name)))
                .ToList();
            selectors.Add(new AppContextSelectorDto(
                Naming.CamelCase(property.Name),
                attribute.Label != "" ? T(attribute.Label) : Naming.Humanize(property.Name),
                options));
        }
        foreach (var method in appType.GetMethods())
        {
            var attribute = method.Find<AppContextAttribute>();
            if (attribute is null) continue;
            var options = new List<OptionDto>();
            if (method.GetParameters().Length == 0
                && Activator.CreateInstance(appType) is { } instance
                && method.Invoke(instance, null) is System.Collections.IEnumerable values)
            {
                foreach (var value in values)
                {
                    if (value is OptionDto option) options.Add(option);
                }
            }
            selectors.Add(new AppContextSelectorDto(
                Naming.CamelCase(method.Name),
                attribute.Label != "" ? T(attribute.Label) : Naming.Humanize(method.Name),
                options));
        }
        return selectors;
    }

    /// <summary>The card look of a menu entry: Display "cards" on a group, description/icon/image on
    /// an entry. Blank values stay null, so a plain menu travels exactly as before. (Mirrors Java's
    /// MenuEntryMapper.presented + AppMenuDtoBuilder.)</summary>
    private MenuItemDto Presented(MenuItemDto entry, string? display, string? description, string? icon, string? image) =>
        entry with
        {
            Display = string.Equals(display, MenuDisplay.Cards, StringComparison.OrdinalIgnoreCase) ? MenuDisplay.Cards : null,
            Description = string.IsNullOrWhiteSpace(description) ? null : T(description),
            Icon = string.IsNullOrWhiteSpace(icon) ? null : icon,
            Image = string.IsNullOrWhiteSpace(image) ? null : image,
        };

    private MenuItemDto MapMenuItem(MethodInfo m)
    {
        var viewType = m.ReturnType;
        var label = m.Find<MenuItemAttribute>()?.Label
                    ?? viewType.Find<TitleAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        // A menu leaf that RUNS client-side rules instead of navigating: a [MenuItem] method typed
        // Rule or IReadOnlyList<Rule>. The other leaf primitive (a route) is every branch around
        // this one. (Mirrors Java's MenuEntryMapper Rule/List<Rule> → RuleLink → MenuOptionDto.rules.)
        if (MenuRules(m) is { } rules)
            return new MenuItemDto(T(label), "", "") { Rules = rules };
        // A [MenuItem] method that RETURNS a view carries that view's [UI] route; a void one (the
        // analogue of Java's `@Menu String home` field / a nav-only method) derives its route from
        // the MEMBER NAME — Java's MenuEntryMapper uses "/" + method.getName(). The mount prefix is
        // applied later in PrefixMenu, so this is the mount-relative path.
        var uiRoute = viewType.GetCustomAttribute<UIAttribute>()?.Route.Trim('/');
        var route = string.IsNullOrEmpty(uiRoute) ? "/" + Naming.CamelCase(m.Name) : "/" + uiRoute;
        return new MenuItemDto(T(label), route, viewType.FullName!) { ConsumedRoute = route };
    }

    /// <summary>The client-side rules of a [MenuItem] method whose return type is Rule or a list of
    /// Rule (a rule leaf), or null when it returns a view (a navigating entry). The method is
    /// invoked on a fresh app instance to read the declared rules.</summary>
    private static IReadOnlyList<RuleDto>? MenuRules(MethodInfo m)
    {
        var rt = m.ReturnType;
        var isRule = rt == typeof(Rule);
        var isRuleList = typeof(System.Collections.IEnumerable).IsAssignableFrom(rt)
                         && rt.IsGenericType && rt.GetGenericArguments() is [var arg] && arg == typeof(Rule);
        if (!isRule && !isRuleList) return null;
        var value = m.DeclaringType is { } dt && Activator.CreateInstance(dt) is { } inst
            ? m.Invoke(inst, null) : null;
        var rules = value switch
        {
            Rule single => [single],
            IEnumerable<Rule> list => list.ToList(),
            _ => new List<Rule>(),
        };
        return rules.Select(r => new RuleDto(
            r.Filter, r.Action, r.FieldName, r.FieldAttribute, r.Value, r.Expression, r.Result, r.ActionId)).ToList();
    }
}
