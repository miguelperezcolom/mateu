using Mateu.Dtos;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// One entry of a mount's route registry: what a URL resolves to. (Mirrors Java's
/// <c>io.mateu.uidl.data.RouteEntry</c> and Python's <c>RouteEntry</c>.)
/// </summary>
/// <param name="Route">Path RELATIVE to the mount, with <c>:name</c> segments for path parameters.
/// "" is the mount's root view.</param>
/// <param name="Definition">The layout file. Null when the view model supplies its own tree.</param>
/// <param name="ViewModel">The server class. <b>Optional on purpose</b>: a statically deployed route
/// has no server behind it, so a definition with no view model is a valid, complete route.</param>
/// <param name="FixedParams">Pinned — NOT overridable by the request. Re-applied on the server
/// rather than trusted from the client, or "fixed" would be a suggestion and flipping one via the
/// query string would be a capability escalation.</param>
/// <param name="DefaultParams">Seeded — the request may override them.</param>
/// <param name="Parent">The ABSOLUTE route of the screen whose slot this route fills, or null for a
/// top-level route. A sub-route with a parent does not replace the page: the parent renders its
/// shell and this route's screen is nested into the parent's slot. Set when the authored
/// <c>children</c> tree is flattened. (Mirrors Java's RouteEntry.parent.)</param>
/// <param name="Children">Sub-routes nested under this one, authored RELATIVE to it. Each child
/// fills this screen's slot. This is the AUTHORING shape; the registry flattens it into absolute
/// entries carrying <c>Parent</c>, so a table entry read at runtime has an empty Children.</param>
/// <param name="State">Literal values that seed the route's component/route state on entry (the
/// componentState scope). They enter at the client-state/defaults precedence level, so a pinned
/// parameter still wins. (Mirrors Java's RouteEntry.state.)</param>
/// <param name="AppState">Literal values that seed the app state on entry (the app-scoped store
/// that [AppContext] also feeds, persisted across navigation). (Mirrors RouteEntry.appState.)</param>
/// <param name="Data">The route's component/route data, a reference to a named data source; there
/// is no literal data channel, data is always sourced. Resolved when the route loads.</param>
/// <param name="AppData">The route's app data, a reference to a named data source resolved once at
/// app scope (shared across routes).</param>
public sealed record RouteEntry(
    string Route,
    string? Definition,
    string? ViewModel,
    IReadOnlyDictionary<string, object?> FixedParams,
    IReadOnlyDictionary<string, object?> DefaultParams,
    string? Parent = null,
    IReadOnlyList<RouteEntry>? Children = null,
    IReadOnlyDictionary<string, object?>? State = null,
    IReadOnlyDictionary<string, object?>? AppState = null,
    RestDataSourceDto? Data = null,
    RestDataSourceDto? AppData = null)
{
    public static RouteEntry Of(string route, string? viewModel) =>
        new(route, null, viewModel, EmptyParams, EmptyParams);

    internal static readonly IReadOnlyDictionary<string, object?> EmptyParams =
        new Dictionary<string, object?>();

    /// <summary>Whether this route fills the slot of a parent screen rather than replacing the page.</summary>
    public bool HasParent() => !string.IsNullOrWhiteSpace(Parent);

    public IReadOnlyList<string> PathParams() =>
        Route.Split('/')
            .Where(s => s.StartsWith(':') && s.Length > 1)
            .Select(s => s[1..])
            .ToList();

    /// <summary>Defaults first (with <c>State</c> seeded at that same level), then whatever the
    /// request brought, then the fixed ones — which win over everything, which is the whole point of
    /// declaring them fixed.</summary>
    public Dictionary<string, object?> ResolveParams(IReadOnlyDictionary<string, object?>? fromRequest)
    {
        var resolved = new Dictionary<string, object?>(DefaultParams);
        // `State` seeds at the defaults level too (literal component state the route brings).
        if (State is not null)
            foreach (var kv in State) resolved.TryAdd(kv.Key, kv.Value);
        if (fromRequest is not null)
            foreach (var kv in fromRequest) resolved[kv.Key] = kv.Value;
        foreach (var kv in FixedParams) resolved[kv.Key] = kv.Value;
        return resolved;
    }
}

/// <summary>A matched route: the entry that answered, and the path parameters read off the URL.</summary>
public sealed record RouteMatch(RouteEntry Entry, IReadOnlyDictionary<string, object?> PathParams)
{
    public Dictionary<string, object?> Params(IReadOnlyDictionary<string, object?>? incoming)
    {
        var fromRequest = new Dictionary<string, object?>();
        if (incoming is not null)
            foreach (var kv in incoming) fromRequest[kv.Key] = kv.Value;
        foreach (var kv in PathParams) fromRequest[kv.Key] = kv.Value;
        return Entry.ResolveParams(fromRequest);
    }
}

/// <summary>A mount's route table.</summary>
public sealed record RouteTable(IReadOnlyList<RouteEntry> Routes)
{
    public static readonly RouteTable Empty = new(new List<RouteEntry>());

    /// <summary>Authored entries replace derived ones outright rather than being combined field by
    /// field: a half-overridden route would be far harder to reason about than a replaced one.</summary>
    public RouteTable MergedOver(RouteTable derived)
    {
        var byRoute = new Dictionary<string, RouteEntry>();
        foreach (var entry in derived.Routes) byRoute[entry.Route] = entry;
        foreach (var entry in Routes) byRoute[entry.Route] = entry;
        return new RouteTable(byRoute.Values.ToList());
    }

    /// <summary>The entry answering a concrete path. Static routes are tried before parameterised
    /// ones, so <c>orders/new</c> is never swallowed by <c>orders/:id</c>; among parameterised
    /// matches the most specific wins, so matching does not depend on declaration order.</summary>
    public RouteMatch? Match(string? path)
    {
        var target = RouteRegistry.Normalize(path);
        var targetSegments = target.Length == 0 ? Array.Empty<string>() : target.Split('/');
        RouteMatch? best = null;
        foreach (var entry in Routes)
        {
            var pattern = RouteRegistry.Normalize(entry.Route);
            var patternSegments = pattern.Length == 0 ? Array.Empty<string>() : pattern.Split('/');
            if (patternSegments.Length != targetSegments.Length) continue;
            var pathParams = new Dictionary<string, object?>();
            var matched = true;
            for (var i = 0; i < patternSegments.Length; i++)
            {
                var segment = patternSegments[i];
                if (segment.StartsWith(':') && segment.Length > 1)
                    pathParams[segment[1..]] = targetSegments[i];
                else if (segment != targetSegments[i]) { matched = false; break; }
            }
            if (!matched) continue;
            if (best is null || entry.PathParams().Count < best.Entry.PathParams().Count)
                best = new RouteMatch(entry, pathParams);
        }
        return best;
    }
}

/// <summary>
/// Reads a mount's <c>routes.yaml</c> from the specs directory, next to the definitions it routes to.
///
/// <para>Why a registry and not just attributes: an attribute says "this class lives at this path",
/// the one-to-one case. An entry binds a definition, a view model and parameters independently, so
/// the same screen can answer several routes with different parameters pinned, and a route can exist
/// with no server class behind it at all.</para>
/// </summary>
public sealed class RouteRegistry
{
    public const string FileName = "routes.yaml";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();
    private readonly string _dir;
    private RouteTable? _authored;

    public RouteRegistry(string? dir = null)
        => _dir = dir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
                      ?? Path.Combine("specs", "ui");

    public RouteTable Authored() => _authored ??= Load();

    public RouteMatch? Match(string? path) => Authored().Match(path);

    /// <summary>An app a deployment contributes: a mount root, with the class that backs it (null for
    /// a purely-DSL app) and the definition it renders (null for a class-based app). (Mirrors Java's
    /// RouteRegistry.AppRef and Python's AppRef.)</summary>
    public sealed record AppRef(string Route, string? ClassName, string? Definition)
    {
        public bool IsDsl() => string.IsNullOrWhiteSpace(ClassName);
    }

    /// <summary>
    /// Every app of the deployment, from TWO producers merged into ONE table — the same "authored
    /// wins" rule the routes and sources use:
    /// <list type="bullet">
    /// <item><b>derived</b>: the reflection-discovered <c>[Ui]</c> classes (each an app at its path),
    /// supplied by the caller (there is no compile-time index here as in Java);</item>
    /// <item><b>authored</b>: the <c>type: UI</c> mounts discovered in the specs directory — which
    /// need NO class, so a deployment can ship a purely-DSL app and announce it here like any
    /// other.</item>
    /// </list>
    /// A mount at the same base path as a class replaces it (authored wins). This is the enumeration a
    /// federated shell (or a bundle/tool) reads to announce apps uniformly, with or without a class
    /// behind them.
    /// </summary>
    public IReadOnlyList<AppRef> Apps(IEnumerable<AppRef>? derived = null)
    {
        var byRoute = new Dictionary<string, AppRef>();
        if (derived is not null)
            foreach (var d in derived)
                byRoute[Normalize(d.Route)] = d with { Route = Normalize(d.Route) };
        foreach (var mount in ScanMounts())
            byRoute[mount.BasePath] = new AppRef(mount.BasePath, null, DefinitionOf(mount));
        return byRoute.Values.ToList();
    }

    /// <summary>A DSL mount discovered by content: a base path and the route files that make it up.</summary>
    private sealed record MountDescriptor(string BasePath, IReadOnlyList<string> RouteFiles);

    /// <summary>Scans the specs directory for <c>type: UI</c> files (by content, not by filename), so
    /// several DSL apps can coexist. (Mirrors Java's MountRegistry.mounts.)</summary>
    private IReadOnlyList<MountDescriptor> ScanMounts()
    {
        var mounts = new List<MountDescriptor>();
        if (!Directory.Exists(_dir)) return mounts;
        foreach (var file in Directory.EnumerateFiles(_dir, "*.*", SearchOption.AllDirectories)
                     .Where(f => f.EndsWith(".yaml") || f.EndsWith(".yml")))
        {
            try
            {
                if (Yaml.Deserialize<object?>(File.ReadAllText(file)) is not IDictionary<object, object> root)
                    continue;
                if (Str(root, "type") != "UI") continue;
                var basePath = Normalize(Str(root, "basePath") ?? Str(root, "base_path"));
                var routeFiles = new List<string>();
                if (root.TryGetValue("routes", out var routes))
                {
                    if (routes is IEnumerable<object> list)
                        routeFiles.AddRange(list.Select(n => n?.ToString()).Where(s => s is not null)!);
                    else if (routes is string one)
                        routeFiles.Add(one);
                }
                mounts.Add(new MountDescriptor(basePath, routeFiles));
            }
            catch
            {
                // a broken descriptor must not take app enumeration down — skip it.
            }
        }
        return mounts;
    }

    /// <summary>The definition bound to a DSL mount's ROOT route: load its route files (relative
    /// entries prefixed with the mount base path), match the base path, read the definition. That
    /// root entry is where a DSL app's shell lives — a route with a definition and no class.</summary>
    private string? DefinitionOf(MountDescriptor mount)
    {
        foreach (var routeFile in mount.RouteFiles)
        {
            var path = Path.Combine(_dir, routeFile);
            if (!File.Exists(path)) continue;
            try
            {
                if (Yaml.Deserialize<object?>(File.ReadAllText(path)) is not { } root) continue;
                var nodes = root switch
                {
                    IDictionary<object, object> map when map.TryGetValue("routes", out var r) => r as IEnumerable<object>,
                    IEnumerable<object> list => list,
                    _ => null,
                };
                if (nodes is null) continue;
                var entries = new List<RouteEntry>();
                foreach (var node in nodes)
                    if (node is IDictionary<object, object> entry)
                        FlattenNode(entry, parentRoute: null, prefix: "", basePath: mount.BasePath, entries);
                var definition = new RouteTable(entries).Match(mount.BasePath)?.Entry.Definition;
                if (!string.IsNullOrWhiteSpace(definition)) return definition;
            }
            catch
            {
                // ignore a broken route file — try the next one.
            }
        }
        return null;
    }

    private RouteTable Load()
    {
        var path = Path.Combine(_dir, FileName);
        if (!File.Exists(path)) return RouteTable.Empty;
        try
        {
            var root = Yaml.Deserialize<object?>(File.ReadAllText(path));
            // Both shapes are accepted: a bare list of entries, or a `routes:` envelope.
            var nodes = root switch
            {
                IDictionary<object, object> map when map.TryGetValue("routes", out var r) => r as IEnumerable<object>,
                IEnumerable<object> list => list,
                _ => null,
            };
            if (nodes is null) return RouteTable.Empty;
            // A standalone `type: Routes` file may tag itself with a `basePath` header (group/prefix),
            // so a class-declared mount authors its inner routes with no separate descriptor. Routes
            // are still relative here; the base path is applied when flattening. (Mirrors Java's
            // MountRegistry.routeFileMounts / RouteRegistry basePath prefixing.)
            var basePath = root is IDictionary<object, object> rootMap
                ? Normalize(Str(rootMap, "basePath") ?? Str(rootMap, "base_path"))
                : "";
            var entries = new List<RouteEntry>();
            foreach (var node in nodes)
            {
                if (node is not IDictionary<object, object> entry) continue;
                // Flatten this node and its nested `children` into flat entries, composing each
                // child's route relative to its parent and prefixing the base path.
                FlattenNode(entry, parentRoute: null, prefix: "", basePath: basePath, entries);
            }
            return new RouteTable(entries);
        }
        catch
        {
            // A broken routes.yaml must not take the app down: the attribute-declared routes still
            // work. Losing every route because of a syntax error in an optional file would be worse
            // than the problem the file solves.
            return RouteTable.Empty;
        }
    }

    /// <summary>Flattens one authored node and its nested <c>children</c> into flat entries. A
    /// child's route is composed RELATIVE to its parent (<c>orders</c> under <c>use-cases/rra</c>
    /// becomes <c>use-cases/rra/orders</c>) and carries the parent's route as <c>Parent</c>, so the
    /// sub-route renders into the parent screen's slot instead of replacing the page. The base path
    /// is prefixed onto every absolute route. (Mirrors Java's RouteRegistry.flattenNode + prefix.)</summary>
    private static void FlattenNode(
        IDictionary<object, object> node,
        string? parentRoute,
        string prefix,
        string basePath,
        List<RouteEntry> entries)
    {
        var relative = Normalize(Str(node, "route"));
        var full = prefix.Length == 0 ? relative
            : relative.Length == 0 ? prefix
            : prefix + "/" + relative;
        entries.Add(new RouteEntry(
            Prefix(basePath, full),
            Str(node, "definition"),
            Str(node, "viewModel") ?? Str(node, "view_model"),
            Params(node, "fixedParams", "fixed_params"),
            Params(node, "defaultParams", "default_params"),
            parentRoute is null ? null : Prefix(basePath, parentRoute),
            null,
            Params(node, "state", "state"),
            Params(node, "appState", "app_state"),
            DataSourceOf(node, "data"),
            DataSourceOf(node, "appData", "app_data")));
        if (node.TryGetValue("children", out var raw) && raw is IEnumerable<object> children)
            foreach (var child in children)
                if (child is IDictionary<object, object> childNode)
                    FlattenNode(childNode, full, full, basePath, entries);
    }

    /// <summary>Prefix a relative route with the mount base path:
    /// <c>(back-office, orders) → back-office/orders</c>.</summary>
    private static string Prefix(string basePath, string route)
    {
        if (string.IsNullOrEmpty(basePath)) return route;
        return string.IsNullOrEmpty(route) ? basePath : basePath + "/" + route;
    }

    /// <summary>Parses a <c>data</c>/<c>appData</c> node into a RestDataSourceDto. A bare string is
    /// the <c>data: countries</c> shorthand (a reference by name); an object may also carry inline
    /// endpoint fields. (Mirrors Java's RouteRegistry.dataSourceOf.)</summary>
    private static RestDataSourceDto? DataSourceOf(IDictionary<object, object> node, string key, string? altKey = null)
    {
        if (!node.TryGetValue(key, out var raw) && altKey is not null) node.TryGetValue(altKey, out raw);
        switch (raw)
        {
            case null:
                return null;
            case string s:
                return string.IsNullOrWhiteSpace(s) ? null : RestDataSourceDto.FromRef(s.Trim());
            case IDictionary<object, object> map:
                var refName = Str(map, "ref");
                return new RestDataSourceDto(Str(map, "url") ?? "")
                {
                    Ref = string.IsNullOrWhiteSpace(refName) ? null : refName,
                    Method = Str(map, "method"),
                    Body = Str(map, "body"),
                    ItemsPath = Str(map, "itemsPath") ?? Str(map, "items_path"),
                    ValuePath = Str(map, "valuePath") ?? Str(map, "value_path"),
                    LabelPath = Str(map, "labelPath") ?? Str(map, "label_path"),
                    Proxy = map.TryGetValue("proxy", out var p) && p is not null
                            && bool.TryParse(p.ToString(), out var b) && b,
                };
            default:
                return null;
        }
    }

    private static string? Str(IDictionary<object, object> node, string key) =>
        node.TryGetValue(key, out var v) && v is not null ? v.ToString() : null;

    private static IReadOnlyDictionary<string, object?> Params(
        IDictionary<object, object> node, string key, string altKey)
    {
        if (!node.TryGetValue(key, out var raw)) node.TryGetValue(altKey, out raw);
        if (raw is not IDictionary<object, object> map) return RouteEntry.EmptyParams;
        var values = new Dictionary<string, object?>();
        foreach (var kv in map)
        {
            var name = kv.Key?.ToString();
            if (name is not null) values[name] = kv.Value;
        }
        return values;
    }

    /// <summary>Routes are relative to the mount, so a leading or trailing slash carries no meaning.</summary>
    internal static string Normalize(string? route)
    {
        var r = route ?? "";
        var q = r.IndexOf('?');
        if (q >= 0) r = r[..q];
        r = r.Trim('/');
        return r is "_empty" or "_no_route" or "_no_home_route" ? "" : r;
    }
}
