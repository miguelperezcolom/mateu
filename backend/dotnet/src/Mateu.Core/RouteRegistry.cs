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
public sealed record RouteEntry(
    string Route,
    string? Definition,
    string? ViewModel,
    IReadOnlyDictionary<string, object?> FixedParams,
    IReadOnlyDictionary<string, object?> DefaultParams)
{
    public static RouteEntry Of(string route, string? viewModel) =>
        new(route, null, viewModel, EmptyParams, EmptyParams);

    internal static readonly IReadOnlyDictionary<string, object?> EmptyParams =
        new Dictionary<string, object?>();

    public IReadOnlyList<string> PathParams() =>
        Route.Split('/')
            .Where(s => s.StartsWith(':') && s.Length > 1)
            .Select(s => s[1..])
            .ToList();

    /// <summary>Defaults first, then whatever the request brought, then the fixed ones — which win
    /// over everything, which is the whole point of declaring them fixed.</summary>
    public Dictionary<string, object?> ResolveParams(IReadOnlyDictionary<string, object?>? fromRequest)
    {
        var resolved = new Dictionary<string, object?>(DefaultParams);
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
            var entries = new List<RouteEntry>();
            foreach (var node in nodes)
            {
                if (node is not IDictionary<object, object> entry) continue;
                entries.Add(new RouteEntry(
                    Normalize(Str(entry, "route")),
                    Str(entry, "definition"),
                    Str(entry, "viewModel") ?? Str(entry, "view_model"),
                    Params(entry, "fixedParams", "fixed_params"),
                    Params(entry, "defaultParams", "default_params")));
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
