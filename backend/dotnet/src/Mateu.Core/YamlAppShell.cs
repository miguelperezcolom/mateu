using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>
/// An app shell declared as DATA — a <c>type: AppShell</c> definition bound to a mount's route
/// (typically its root) — mapped to the wire App, the data-driven counterpart of an <c>[App]</c>
/// class. Mirrors Java's YamlAppLoader (what is read) + AppMapper/AppMenuDtoBuilder (how it reaches
/// the wire); pinned by the Java goldens app-shell, app-shell-extras, app-shell-card-menus and app-shell-back-link
/// (YamlAppShellTests).
/// </summary>
/// <remarks>
/// <para>The menu is a list of RouteLink / Menu / RuleLink / RemoteMenu / MenuSeparator leaves,
/// <c>widgets:</c> components drawn in the header, <c>actions:</c> the shell's FLOWS (lowered to
/// commands, run client-side by a RuleLink naming them). The header switches (<c>themeToggle</c>,
/// <c>commandCenter</c>, <c>chromeless</c>, <c>accessKeys</c>, <c>mobileQr</c>) are off unless
/// declared — there is no class to fall back to. <c>access:</c> on menu items and actions is applied
/// per caller BEFORE this runs (YamlSpecLoader / YamlAccess), as for a page.</para>
/// <para><c>backLink: PARENT</c> replaces the breadcrumb trail with ONE "← Parent" link (resolved
/// by the sync handler, like an [App(BackLink)] class's); <c>pageTitle:</c> is the installed app's
/// name when the shell has no <c>title:</c> (the UI manifest, <see cref="MobileManifest"/>) — it is
/// not part of the shell's wire, as in Java. Not carried (as in Java): app-level FABs.</para>
/// </remarks>
internal static class YamlAppShell
{
    /// <summary>Whether a deserialised definition is an app shell.</summary>
    public static bool IsShell(object? root) =>
        root is IDictionary<object, object> map && Str(map, "type") == "AppShell";

    /// <summary>Whether the shell declares <c>backLink: PARENT</c> (Java's YamlAppLoader reads the
    /// BackLink enum by its exact name; anything else is the default, BREADCRUMBS).</summary>
    public static bool BackLinkParent(IDictionary<object, object> root) =>
        string.Equals(Str(root, "backLink")?.Trim(), "PARENT", StringComparison.Ordinal);

    /// <summary>The name the shell gives the installed app: its <c>title:</c>, else its
    /// <c>pageTitle:</c> (Java's MobileManifest.sourceOf(AppShell)); null for neither.</summary>
    public static string? NameOf(IDictionary<object, object> root) =>
        Blank(Str(root, "title")) ?? Blank(Str(root, "pageTitle"));

    /// <summary>The icon the shell gives the installed app: its logo, else its favicon.</summary>
    public static string? IconOf(IDictionary<object, object> root) =>
        Blank(Str(root, "logo")) ?? Blank(Str(root, "favicon"));

    /// <summary>The shell's accent colour (the installed app's theme colour).</summary>
    public static string? AccentOf(IDictionary<object, object> root) => Blank(Str(root, "accentColor"));

    /// <summary>The wire App of the shell bound to <paramref name="shellRoute"/> (the mount root it
    /// serves: its routes are prefixed with it). <paramref name="mountHome"/> is the mount
    /// descriptor's <c>home:</c> — the shell lands there when it declares no <c>homeRoute:</c>.</summary>
    public static ClientSideComponentDto Map(IDictionary<object, object> root, string shellRoute, string? mountHome,
        string? requestBaseUrl, FieldTypeRegistry? types = null, string? aimedAt = null)
    {
        var trimmed = shellRoute.Trim('/');
        var appRoute = trimmed.Length == 0 ? "" : "/" + trimmed;
        var menu = BuildMenu(Maps(root, "menu"), appRoute, "");
        var ai = root.TryGetValue("ai", out var a) ? a as IDictionary<object, object> : null;
        var chromeless = Bool(root, "chromeless");
        var notifications = root.TryGetValue("notifications", out var n) ? n as IDictionary<object, object> : null;
        var search = root.TryGetValue("globalSearch", out var g) ? g as IDictionary<object, object> : null;
        var actions = ActionRegistry.ParseNodes(Seq(root, "actions"), "the app shell")
            .Select(ActionRegistry.ToDto).ToList();
        var meta = new AppMetadataDto(Str(root, "title") ?? "", VariantOf(Str(root, "variant"), menu), menu)
        {
            Subtitle = Str(root, "subtitle"),
            Layout = Str(root, "layout")?.Trim() is "SPLIT" ? "SPLIT" : "SINGLE_SLOT",
            // a fresh deep link aims the shell at the requested route (Java's wrapsInAppShell)
            HomeRoute = aimedAt ?? HomeRouteOf(root, mountHome),
            HomeConsumedRoute = appRoute,
            HomeBaseUrl = requestBaseUrl ?? "",
            RootRoute = appRoute,
            Route = Str(root, "route"),
            TotalMenuOptions = Total(menu),
            Logo = Str(root, "logo"),
            Favicon = Str(root, "favicon"),
            Style = Str(root, "style"),
            CssClasses = Str(root, "cssClasses"),
            DrawerClosed = Bool(root, "drawerClosed"),
            AccentColor = Blank(Str(root, "accentColor")),
            SseUrl = ai is null ? null : Blank(Str(ai, "sse")),
            McpUrl = ai is null ? null : Blank(Str(ai, "mcp")),
            UploadUrl = ai is null ? null : Blank(Str(ai, "upload")),
            FollowLabel = ai is null ? null : Blank(Str(ai, "followLabel")),
            FollowingLabel = ai is null ? null : Blank(Str(ai, "followingLabel")),
            ThemeToggle = Bool(root, "themeToggle"),
            CommandCenterEnabled = Bool(root, "commandCenter") || chromeless,
            Chromeless = chromeless,
            AccessKeys = Bool(root, "accessKeys"),
            MobileQr = Bool(root, "mobileQr"),
            LiveUpdates = Bool(root, "liveUpdates"),
            Shortcuts = Maps(root, "shortcuts").Select(s => Shortcut(s, appRoute)).OfType<AppShortcutDto>().ToList(),
            HeaderValues = Maps(root, "headerValues").Where(v => Blank(Str(v, "id")) is not null)
                .Select(v => new HeaderValueDto(Str(v, "id")!.Trim(), Blank(Str(v, "label")), Str(v, "value"))).ToList(),
            IdleSession = IdleSessionOf(root, appRoute),
            ContextSelectors = Maps(root, "contextSelectors").Select(ContextSelector).ToList(),
            ContextActions = Maps(root, "headerActions").Select(h => HeaderAction(h, appRoute)).ToList(),
            NotificationsEnabled = notifications is not null,
            NotificationsSource = notifications is null ? null : RawSource(notifications, "source"),
            NotificationsReadSource = notifications is null ? null : RawSource(notifications, "markRead"),
            GlobalSearchEnabled = search is not null,
            GlobalSearchSource = search is null ? null : RawSource(search, "source"),
            Actions = actions.Count == 0 ? null : actions,
        };
        meta = meta with { RequiredCapabilities = RequiredCapabilities(meta) };
        var widgets = Seq(root, "widgets")
            .Select(w => YamlComponentBuilder.FromNode(w, types))
            .OfType<IComponent>()
            .Select(c => (ComponentDto)(ComponentMapper.Map(c) with { Slot = "widgets" }))
            .ToList();
        return new ClientSideComponentDto(meta, "ux_main_app", widgets, null, null, null);
    }

    /// <summary>The declared <c>homeRoute:</c>, else the mount's <c>home:</c>, else the first
    /// navigable menu item as written (Java's YamlAppLoader.firstNavigableRoute) — without one the
    /// shell would load its own root again.</summary>
    private static string HomeRouteOf(IDictionary<object, object> root, string? mountHome)
    {
        if (Str(root, "homeRoute") is { } declared) return declared;
        if (!string.IsNullOrWhiteSpace(mountHome)) return mountHome;
        foreach (var item in Maps(root, "menu"))
        {
            if (Str(item, "type") == "RouteLink")
            {
                var route = Blank(Str(item, "route")) ?? Blank(Str(item, "path"));
                if (route is not null) return route;
            }
            else if (Blank(Str(item, "path")) is { } path) return path;
        }
        return "_no_home_route";
    }

    // ── the menu (Java's AppMenuDtoBuilder.buildMenu over the YAML Actionables) ──────────────

    private static List<MenuItemDto> BuildMenu(IEnumerable<IDictionary<object, object>> items, string appRoute, string prefix) =>
        items.Select(option =>
        {
            var type = Str(option, "type");
            var presentation = option.TryGetValue("presentation", out var p) ? p as IDictionary<object, object> : null;
            var path = PathOf(appRoute, prefix, option, type);
            var remote = type == "RemoteMenu";
            var declaredPath = Blank(Str(option, "path"));
            var shellLabel = remote && Blank(Str(option, "label")) is not null;
            var item = new MenuItemDto(
                remote ? (shellLabel ? Str(option, "label")! : LastSegment(declaredPath ?? path)) : Str(option, "label") ?? "",
                remote ? Str(option, "route") ?? "" : appRoute + path,
                Str(option, "serverSideType") ?? "")
            {
                Path = path,
                ConsumedRoute = remote ? Str(option, "consumedRoute") ?? "" : appRoute,
                UriPrefix = appRoute,
                Visible = !Bool(option, "hidden"),
                Separator = type == "MenuSeparator",
                Remote = remote,
                BaseUrl = remote ? Str(option, "baseUrl") : null,
                Explode = remote && Bool(option, "explode"),
                // a remote section: where its screens live (its OWN path, not its group's) and
                // whether the shell named it (Java's AppMenuDtoBuilder.remoteRoutePrefix / shellLabel)
                RoutePrefix = remote ? ReflectionMapper.RemoteRoutePrefix(declaredPath ?? path) : null,
                ShellLabel = shellLabel,
                Icon = Str(option, "icon") ?? (presentation is null ? null : Str(presentation, "icon")),
                Display = presentation is not null && string.Equals(Str(presentation, "display"), "cards", StringComparison.OrdinalIgnoreCase)
                    ? "cards" : null,
                Image = presentation is null ? null : Str(presentation, "image"),
                Description = Str(option, "description"),
                Rules = type == "RuleLink" ? Maps(option, "rules").Select(Rule).ToList() : [],
                // a group authored as data has no path of its own: its entries' routes are
                // mount-relative as written (the group's label-derived path is not their prefix)
                Submenus = type == "Menu"
                    ? BuildMenu(Maps(option, "submenu"), appRoute, declaredPath is not null ? Relative(appRoute, prefix, declaredPath) : prefix)
                    : [],
            };
            return item;
        }).ToList();

    private static string PathOf(string appRoute, string prefix, IDictionary<object, object> option, string? type)
    {
        var path = Blank(Str(option, "path"));
        if (path is null)
        {
            // a RouteLink with a route: and no path: goes WHERE IT SAYS (not to its label)
            if (type == "RouteLink" && Blank(Str(option, "route")) is { } route) return Relative(appRoute, prefix, route);
            return Prepend(prefix, YamlComponentBuilder.Camelcasize(Str(option, "label")));
        }
        if (type == "RemoteMenu") return path.StartsWith(prefix, StringComparison.Ordinal) ? path : Prepend(prefix, path);
        return Relative(appRoute, prefix, path);
    }

    private static RuleDto Rule(IDictionary<object, object> r) => new(
        Str(r, "filter")!, Str(r, "action") ?? "", Str(r, "fieldName"), Str(r, "fieldAttribute"),
        r.TryGetValue("value", out var v) ? v : null, Str(r, "expression"), Str(r, "result")!, Str(r, "actionId"));

    private static int Total(IReadOnlyList<MenuItemDto> menu) => menu.Sum(o => 1 + Total(o.Submenus));

    /// <summary>The variant a shell declares, else Java's AUTO heuristic (AppVariants.resolve): a
    /// group nesting a group → TILES, groups and more than 7 entries → HAMBURGER_MENU, groups → MENU_ON_TOP,
    /// only leaves → TABS.</summary>
    private static string VariantOf(string? declared, List<MenuItemDto> items)
    {
        if (!string.IsNullOrWhiteSpace(declared) && !string.Equals(declared.Trim(), "AUTO", StringComparison.OrdinalIgnoreCase))
            return AppVariant.ToWire(declared.Trim());
        if (items.Any(i => i.Submenus.Count > 0))
        {
            if (items.Any(i => i.Submenus.Any(s => s.Submenus.Count > 0))) return "TILES";
            return AppVariant.ToWire(items.Count > 7 ? AppVariant.HamburgerMenu : AppVariant.MenuOnTop);
        }
        return "TABS";
    }

    // ── the header extras ───────────────────────────────────────────────────────────────────

    private static AppContextSelectorDto ContextSelector(IDictionary<object, object> s) =>
        new(Str(s, "fieldName") ?? "", Str(s, "label") ?? Naming.Humanize(Str(s, "fieldName") ?? ""),
            Maps(s, "options").Select(o => new OptionDto(Str(o, "value") ?? "", Str(o, "label") ?? Str(o, "value") ?? "")).ToList())
        {
            OptionsSource = RawSource(s, "optionsSource"),
        };

    private static AppHeaderActionDto HeaderAction(IDictionary<object, object> h, string appRoute)
    {
        var children = Maps(h, "children").Select(c => HeaderAction(c, appRoute)).ToList();
        return new AppHeaderActionDto(Str(h, "actionId"), Str(h, "label") ?? "", Str(h, "icon"),
            children.Count == 0 ? null : children)
        {
            Route = Blank(Str(h, "route")) is { } route ? Absolute(appRoute, route) : null,
        };
    }

    private static AppShortcutDto? Shortcut(IDictionary<object, object> s, string appRoute)
    {
        var key = Blank(Str(s, "key"));
        var code = Blank(Str(s, "code"));
        var route = Blank(Str(s, "route"));
        var actionId = Blank(Str(s, "actionId"));
        if ((key is null && code is null) || (route is null && actionId is null)) return null;
        var label = Blank(Str(s, "label"))
                    ?? (route is not null ? Naming.Humanize(route.Trim('/').Split('/')[^1]) : Naming.HumanizeConstant(actionId!));
        return new AppShortcutDto(key?.ToLowerInvariant(), label,
            route is null ? null : ReflectionMapper.AbsoluteRoute(appRoute, route), actionId, code);
    }

    private static IdleSessionDto? IdleSessionOf(IDictionary<object, object> root, string appRoute)
    {
        if (!int.TryParse(Str(root, "idleTimeoutMinutes"), out var minutes) || minutes <= 0) return null;
        var timeout = minutes * 60;
        var declaredWarning = int.TryParse(Str(root, "idleWarningSeconds"), out var w) ? w : 60;
        var warning = Math.Max(5, Math.Min(declaredWarning, timeout));
        var signOut = Blank(Str(root, "idleSignOutUrl")) ?? (appRoute.Length > 0 ? appRoute : "/");
        return new IdleSessionDto(timeout, warning, signOut, ReflectionMapper.KeepAliveActionId);
    }

    /// <summary>The capabilities the shell needs from a renderer (Java's AppMapper derivation; the
    /// REST source catalogue and app data add theirs where they are attached).</summary>
    private static IReadOnlyList<string> RequiredCapabilities(AppMetadataDto meta)
    {
        var caps = new SortedSet<string>(StringComparer.Ordinal);
        if (!string.IsNullOrEmpty(meta.SseUrl)) caps.Add(Capabilities.Sse);
        if (meta.CommandCenterEnabled) caps.Add(Capabilities.CommandCenter);
        if (meta.GlobalSearchEnabled) caps.Add(Capabilities.GlobalSearch);
        if (meta.NotificationsEnabled) caps.Add(Capabilities.Notifications);
        if (meta.ContextSelectors.Count > 0) caps.Add(Capabilities.ContextSelectors);
        if (meta.ContextActions.Count > 0) caps.Add(Capabilities.HeaderActions);
        return caps.ToList();
    }

    /// <summary>A REST source AS DECLARED (only the keys written; a bare string is a catalogue ref) —
    /// the wire carries what the shell says, the renderer resolves the rest.</summary>
    private static RestDataSourceDto? RawSource(IDictionary<object, object> map, string key)
    {
        if (!map.TryGetValue(key, out var raw)) return null;
        if (raw is string name && !string.IsNullOrWhiteSpace(name)) return new RestDataSourceDto("") { Ref = name.Trim() };
        if (raw is not IDictionary<object, object> s) return null;
        return new RestDataSourceDto(Str(s, "url") ?? "")
        {
            Ref = Blank(Str(s, "ref")),
            Method = Str(s, "method"),
            Body = Str(s, "body"),
            ItemsPath = Str(s, "itemsPath"),
            ValuePath = Str(s, "valuePath"),
            LabelPath = Str(s, "labelPath"),
            Proxy = Bool(s, "proxy"),
            Headers = s.TryGetValue("headers", out var h) && h is IDictionary<object, object> headers
                ? headers.ToDictionary(kv => kv.Key.ToString()!, kv => kv.Value?.ToString() ?? "")
                : null,
        };
    }

    // ── helpers ─────────────────────────────────────────────────────────────────────────────

    private static string Absolute(string appRoute, string route) =>
        ReflectionMapper.AbsoluteRoute(appRoute, route.StartsWith('/') ? route : "/" + route);

    /// <summary>Java's AppMenuDtoBuilder.relative (shared with the class-declared menu).</summary>
    private static string Relative(string appRoute, string prefix, string path) =>
        ReflectionMapper.Relative(appRoute, prefix, path);

    private static string Prepend(string prefix, string path)
    {
        var p = prefix.EndsWith('/') ? prefix[..^1] : prefix;
        var s = path.StartsWith('/') ? path[1..] : path;
        return p + "/" + s;
    }

    /// <summary>A remote section's label when the shell names none: its path's last segment,
    /// humanized (Java's AppMenuDtoBuilder.remoteLabel → Humanizer.toUpperCaseFirst).</summary>
    private static string LastSegment(string path)
    {
        var segment = path[(path.LastIndexOf('/') + 1)..];
        return segment.Length == 0 ? "" : Naming.HumanizeConstant(segment);
    }

    private static IEnumerable<object> Seq(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) && v is IEnumerable<object> seq ? seq : [];

    private static IEnumerable<IDictionary<object, object>> Maps(IDictionary<object, object> map, string key) =>
        Seq(map, key).OfType<IDictionary<object, object>>();

    private static string? Str(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static bool Bool(IDictionary<object, object> map, string key) =>
        string.Equals(Str(map, key), "true", StringComparison.OrdinalIgnoreCase);
}
