using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;
using YamlDotNet.Serialization;

namespace Mateu.Core.Bundle;

/// <summary>
/// Build-time exporter of a Mateu app into a STATIC BUNDLE — the .NET twin of Java's
/// <c>MateuBundleExporter</c> and of the <c>mateu-bundle:bundle</c> Maven goal. For each declared
/// route it renders the initial load (the same <c>actionId=""</c> increment the server returns)
/// through the port's OWN <see cref="SyncHandler"/>, in process — no HTTP server — and serializes it
/// to wire JSON in <c>manifest.json</c>.
///
/// Two loads per route under an app shell (#557): the FRESH load (a deep link, a reload — consumed
/// route <c>_empty</c>) answers the SHELL, and the shell then asks for its content slot with its own
/// consumed route — the route's own screen. Both are exported (<c>json</c> / <c>contentJson</c>).
/// </summary>
internal sealed class BundleExporter(SyncHandler handler, string? specsDir = null)
{
    /// <summary>A <c>:name</c> route segment (the param marker).</summary>
    private static readonly Regex ParamSegment = new(":([^/]+)", RegexOptions.Compiled);

    /// <summary>Substituted for each param when rendering a template's param-independent structure.</summary>
    public const string ParamPlaceholder = "__mateu_param__";

    /// <summary>The definition types the browser's expander turns into the wire — Java's
    /// <c>MateuBundleExporter.CLIENT_EXPANDABLE_TYPES</c>, a deliberate mirror.</summary>
    public static readonly IReadOnlySet<string> ClientExpandableTypes = new HashSet<string>
    {
        "AppShell", "Listing", "Crudl", "Crud", "Form", "VerticalLayout", "HorizontalLayout", "Div",
        "FlexLayout", "Card", "CustomComponent",
    };

    private static readonly ILogger Log = MateuLogging.For("Mateu.Bundle");

    private static readonly IDeserializer Yaml =
        new DeserializerBuilder().WithAttemptingUnquotedStringTypeDeserialization().Build();

    public string SpecsDir { get; } = specsDir ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
        ?? Path.Combine("specs", "ui");

    private MateuRegistry Registry => handler.BundleRegistry;

    // ── discovery ────────────────────────────────────────────────────────────────────────────────

    /// <summary>The route a registered class declares (<c>[App(Route)]</c> over <c>[UI]</c>), as written.</summary>
    private static string? DeclaredRouteOf(Type type)
    {
        var app = type.GetCustomAttribute<AppAttribute>();
        if (app is not null && !string.IsNullOrWhiteSpace(app.Route)) return app.Route;
        return type.GetCustomAttribute<UIAttribute>()?.Route;
    }

    /// <summary>The routes the registered classes declare; a route-less [App] is the root ("").</summary>
    public IReadOnlyList<string> DeclaredRoutes()
    {
        var out_ = new List<string>();
        if (Registry.AppType is { } app && DeclaredRouteOf(app) is null) out_.Add("");
        foreach (var type in Registry.RegisteredTypes)
            if (DeclaredRouteOf(type) is { } route && !out_.Contains(route))
                out_.Add(route);
        return out_;
    }

    /// <summary>Which class answers each route: the registered views, then the authored view models
    /// (authored wins).</summary>
    public IReadOnlyDictionary<string, Type> ClassesByRoute()
    {
        var out_ = new Dictionary<string, Type>();
        if (Registry.AppType is { } app && DeclaredRouteOf(app) is null) out_[""] = app;
        foreach (var type in Registry.RegisteredTypes)
            if (DeclaredRouteOf(type) is { } route)
                out_.TryAdd(MateuRegistry.Normalize(route), type);
        foreach (var entry in handler.BundleRoutes.Authored().Routes)
            if (!string.IsNullOrWhiteSpace(entry.ViewModel) && TypeByName(entry.ViewModel!) is { } t)
                out_[MateuRegistry.Normalize(entry.Route)] = t;
        return out_;
    }

    private Type? TypeByName(string name) =>
        Registry.Resolve(name, null) is { } t && t.FullName == name
            ? t
            : Registry.ScannedTypes.FirstOrDefault(t => t.FullName == name);

    // ── export ───────────────────────────────────────────────────────────────────────────────────

    /// <summary>Render every declared route (Java's <c>exportAll</c>).</summary>
    public BundleManifest ExportAll(string baseUrl = "", bool staticOnly = true, bool includeParamRoutes = false,
        bool specsOnly = false, bool mock = false, string? environment = null)
    {
        var onlyStatic = staticOnly && !includeParamRoutes;
        var routes = new List<string>();
        void Add(string route)
        {
            if ((!onlyStatic || IsStatic(route)) && !routes.Contains(route)) routes.Add(route);
        }
        foreach (var r in DeclaredRoutes()) Add(r);
        var authored = handler.BundleRoutes.Authored();
        foreach (var entry in authored.Routes) Add("/" + entry.Route);
        var classes = ClassesByRoute();
        var definitions = CollectDefinitions(authored);
        StampMountHomes(authored, definitions);
        var expandedInBrowser = new HashSet<string>();
        if (specsOnly)
            foreach (var entry in authored.Routes)
                if (entry.Definition is { } d && string.IsNullOrWhiteSpace(entry.ViewModel)
                    && IsClientExpandable(definitions.GetValueOrDefault(d) as JsonObject)
                    && YamlAccessRestriction("/" + entry.Route, authored, definitions) is null)
                    expandedInBrowser.Add(MateuRegistry.Normalize(entry.Route));

        var entries = new List<BundleEntry>();
        var previousMock = System.Environment.GetEnvironmentVariable(SampleSources.Env);
        if (mock) System.Environment.SetEnvironmentVariable(SampleSources.Env, "true");
        try
        {
            foreach (var route in routes)
            {
                if (expandedInBrowser.Contains(MateuRegistry.Normalize(route)))
                {
                    Log.LogInformation("bundle: {Route} ships as its raw definition (expanded in the browser)", route);
                    continue;
                }
                var restriction = IdentityRestriction(classes.GetValueOrDefault(MateuRegistry.Normalize(route)))
                                  ?? YamlAccessRestriction(route, authored, definitions);
                if (restriction is not null)
                {
                    entries.Add(new BundleEntry(route, ToSyncPath(route), null, false, restriction));
                    continue;
                }
                entries.Add(IsStatic(route) ? ExportRoute(baseUrl, route) : ExportTemplate(baseUrl, route));
            }
        }
        finally
        {
            if (mock) System.Environment.SetEnvironmentVariable(SampleSources.Env, previousMock);
        }
        return new BundleManifest(
            baseUrl,
            Now(),
            onlyStatic,
            entries,
            new JsonArray(authored.Routes.Select(e => (JsonNode?)RouteEntryWire(e)).ToArray()),
            SourceCatalogue(mock),
            AggregateCapabilities(entries),
            WithoutGuardedDefinitions(definitions, authored),
            JsonSerializer.SerializeToNode(ActionRegistry.MapCatalogue(handler.BundleActionCatalog.Catalog),
                BundleJson.Wire) as JsonArray,
            handler.BundleTranslations.Catalogue,
            string.IsNullOrWhiteSpace(environment) ? Environments.ActiveName() : environment.Trim(),
            mock ? true : null);
    }

    /// <summary>Render exactly <paramref name="routes"/> (the explicit allow-list).</summary>
    public BundleManifest Export(string baseUrl, IEnumerable<string> routes)
    {
        var entries = routes.Select(r => ExportRoute(baseUrl, r)).ToList();
        return new BundleManifest(baseUrl, Now(), true, entries, RequiredCapabilities: AggregateCapabilities(entries));
    }

    private static string Now() => DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ");

    /// <summary>A single route's loads; a skip (exception / no fragments) yields <c>ok=false</c>.</summary>
    public BundleEntry ExportRoute(string baseUrl, string route)
    {
        var syncPath = ToSyncPath(route);
        string json;
        try
        {
            json = Render(baseUrl, route, "_empty");
        }
        catch (SkipException skip)
        {
            return new BundleEntry(route, syncPath, null, false, skip.Message);
        }
        catch (Exception e)
        {
            var error = e is TargetInvocationException { InnerException: { } inner } ? inner : e;
            Log.LogWarning("skipping route {Route} (export failed): {Error}", route, error.Message);
            return new BundleEntry(route, syncPath, null, false, error.GetType().Name + ": " + error.Message);
        }
        string? content = null;
        if (AppShellConsumedRoute(json) is { } consumed && MateuRegistry.Normalize(route).Length > 0)
        {
            try
            {
                content = Render(baseUrl, route, consumed);
            }
            catch (Exception e)
            {
                // the shell still bundles; the content slot falls through to a backend, if there is one
                Log.LogWarning("route {Route}: its content load could not be exported: {Error}", route, e.Message);
            }
        }
        return new BundleEntry(route, syncPath, json, true, ContentJson: content);
    }

    /// <summary>A <c>:param</c> route as a TEMPLATE, rendered once with a placeholder per param.</summary>
    public BundleEntry ExportTemplate(string baseUrl, string templateRoute)
    {
        var names = ParamSegment.Matches(templateRoute).Select(m => m.Groups[1].Value).ToList();
        var rendered = ExportRoute(baseUrl, ParamSegment.Replace(templateRoute, ParamPlaceholder));
        var syncPath = ToSyncPath(templateRoute);
        var pattern = "^" + ParamSegment.Replace(syncPath, "([^/]+)") + "$";
        return rendered with { Route = templateRoute, SyncPath = syncPath, RoutePattern = pattern, ParamNames = names };
    }

    private sealed class SkipException(string reason) : Exception(reason);

    /// <summary>One <c>actionId=""</c> load of <paramref name="route"/> as wire JSON.</summary>
    private string Render(string baseUrl, string route, string consumedRoute)
    {
        var rq = new RunActionRqDto { Route = route, ConsumedRoute = consumedRoute, ActionId = "" };
        UIIncrementDto increment;
        // ${i18n.…} stays as written: the bundle serves every visitor, the browser resolves it
        using (TranslationRegistry.RawExpressions())
            increment = handler.Handle(rq, baseUrl);
        if (increment.Fragments is null || increment.Fragments.Count == 0)
            throw new SkipException(increment.Messages is { Count: > 0 } m && !string.IsNullOrEmpty(m[0].Text)
                ? m[0].Text
                : "no fragments");
        var wire = JsonSerializer.SerializeToNode(increment, BundleJson.Wire)!.AsObject();
        // A load renders for no initiator: the port aims what it answers at its "ux_main"
        // placeholder, which no browser component carries — the bundle leaves it untargeted (as
        // Java's export does) and the browser re-targets it at whoever asked.
        foreach (var key in new[] { "fragments", "commands" })
            if (wire[key] is JsonArray items)
                foreach (var item in items.OfType<JsonObject>())
                    if (item["targetComponentId"]?.GetValue<string>() == "ux_main")
                        item["targetComponentId"] = null;
        return wire.ToJsonString(BundleJson.Wire);
    }

    /// <summary>The consumed route an app shell sends for its content slot, or null when the
    /// increment is not an app shell.</summary>
    public static string? AppShellConsumedRoute(string json)
    {
        try
        {
            var metadata = JsonNode.Parse(json)?["fragments"]?[0]?["component"]?["metadata"];
            if (metadata?["type"]?.GetValue<string>() != "App") return null;
            return metadata["homeConsumedRoute"] is JsonValue v && v.TryGetValue<string>(out var s) ? s : "";
        }
        catch (Exception)
        {
            return null;
        }
    }

    // ── catalogues ───────────────────────────────────────────────────────────────────────────────

    /// <summary>The REST source catalogue as Java's <c>RestSourceCatalog</c> ships it: the AUTHORED
    /// provenance (not the inferred one), samples only with the mock flag, a proxied source's
    /// headers/body never.</summary>
    private JsonArray SourceCatalogue(bool withSamples)
    {
        var catalog = handler.BundleRestSources.Catalog;
        var wire = MateuCatalogs.MapCatalogue(catalog, withSamples);
        var out_ = new JsonArray();
        for (var i = 0; i < wire.Count; i++)
        {
            var dto = wire[i] with { Provenance = catalog.Sources[i].Provenance.ToString().ToLowerInvariant() };
            out_.Add(JsonSerializer.SerializeToNode(dto, BundleJson.Wire));
        }
        return out_;
    }

    private static JsonObject RouteEntryWire(RouteEntry e) => new()
    {
        ["route"] = e.Route,
        ["definition"] = e.Definition,
        ["viewModel"] = e.ViewModel,
        ["fixedParams"] = JsonSerializer.SerializeToNode(e.FixedParams, BundleJson.Wire),
        ["defaultParams"] = JsonSerializer.SerializeToNode(e.DefaultParams, BundleJson.Wire),
        ["parent"] = e.Parent,
        ["children"] = new JsonArray(),
        ["state"] = JsonSerializer.SerializeToNode(e.State ?? new Dictionary<string, object?>(), BundleJson.Wire),
        ["appState"] = JsonSerializer.SerializeToNode(e.AppState ?? new Dictionary<string, object?>(), BundleJson.Wire),
        ["data"] = e.Data is null ? null : JsonSerializer.SerializeToNode(e.Data, BundleJson.Wire),
        ["appData"] = e.AppData is null ? null : JsonSerializer.SerializeToNode(e.AppData, BundleJson.Wire),
        ["defaultChild"] = null,
        ["show"] = null,
        ["access"] = e.Access is null ? null : JsonSerializer.SerializeToNode(e.Access, BundleJson.Wire),
    };

    // ── definitions ──────────────────────────────────────────────────────────────────────────────

    /// <summary>The raw definitions of the definition-only routes, partials and business components
    /// inlined and field types resolved (the browser has none of those catalogues).</summary>
    private Dictionary<string, JsonNode?> CollectDefinitions(RouteTable authored)
    {
        var inliner = new DefinitionInliner(SpecsDir);
        var out_ = new Dictionary<string, JsonNode?>();
        foreach (var entry in authored.Routes)
        {
            var d = entry.Definition;
            if (string.IsNullOrWhiteSpace(d) || !string.IsNullOrWhiteSpace(entry.ViewModel) || out_.ContainsKey(d))
                continue;
            var path = Path.Combine(SpecsDir, d.TrimStart('/'));
            if (!File.Exists(path))
            {
                Log.LogWarning("bundle: definition {Definition} not found at {Path} — omitted", d, path);
                continue;
            }
            try
            {
                var tree = Yaml.Read<object?>(File.ReadAllText(path));
                out_[d] = YamlTree.ToJson(ResolveFieldTypes(inliner.Inline(tree)));
            }
            catch (Exception e)
            {
                Log.LogWarning("bundle: could not read definition {Definition}: {Error}", d, e.Message);
            }
        }
        return out_;
    }

    private object? ResolveFieldTypes(object? node) => node switch
    {
        IDictionary<object, object> map => handler.BundleFieldTypes.Resolve(
            map.ToDictionary(kv => kv.Key, kv => ResolveFieldTypes(kv.Value)!)),
        string s => s,
        IEnumerable<object> list => list.Select(ResolveFieldTypes).ToList<object?>(),
        _ => node,
    };

    /// <summary>A mount's <c>home:</c> travels INTO its shell: an AppShell bound to the mount root
    /// that declares no <c>homeRoute:</c> ships with the mount's home (Java's <c>stampMountHomes</c>).</summary>
    private void StampMountHomes(RouteTable authored, Dictionary<string, JsonNode?> definitions)
    {
        foreach (var entry in authored.Routes)
        {
            if (handler.BundleRoutes.MountHomeOf(entry.Route) is not { } home || entry.Definition is null) continue;
            if (definitions.GetValueOrDefault(entry.Definition) is JsonObject shell
                && shell["type"]?.GetValue<string>() == "AppShell" && shell["homeRoute"] is null)
                shell["homeRoute"] = home;
        }
    }

    public static bool IsClientExpandable(JsonObject? definition)
    {
        if (definition is null) return false;
        var root = definition.ContainsKey("layout") ? definition["layout"] as JsonObject : definition;
        return root?["type"] is JsonValue v && v.TryGetValue<string>(out var t) && ClientExpandableTypes.Contains(t);
    }

    private static string? YamlAccessRestriction(string route, RouteTable authored, IReadOnlyDictionary<string, JsonNode?> definitions)
    {
        if (authored.Match(MateuRegistry.Normalize(route)) is not { } match) return null;
        var entry = match.Entry;
        if (entry.RestrictsAccess()) return "identity-dependent: the route declares access: — kept backend-served";
        var definition = entry.Definition is null ? null : definitions.GetValueOrDefault(entry.Definition);
        return YamlTree.DeclaresAccess(definition)
            ? $"identity-dependent: definition '{entry.Definition}' declares access keys — kept backend-served"
            : null;
    }

    /// <summary>Why a class's route must NOT be pre-rendered (a screen depending on WHO asks), or
    /// null — Java's <c>identityRestriction</c>: <c>[EyesOnly]</c> on the class, a property or a method.</summary>
    public static string? IdentityRestriction(Type? type)
    {
        if (type is null) return null;
        if (type.Find<EyesOnlyAttribute>() is not null)
            return "identity-dependent: the class declares [EyesOnly] — kept backend-served";
        const BindingFlags Declared = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance
                                      | BindingFlags.Static | BindingFlags.DeclaredOnly;
        foreach (var p in type.GetProperties(Declared))
            if (p.Find<EyesOnlyAttribute>() is not null)
                return $"identity-dependent: property '{p.Name}' declares [EyesOnly] — kept backend-served";
        foreach (var m in type.GetMethods(Declared))
            if (m.Find<EyesOnlyAttribute>() is not null)
                return $"identity-dependent: method '{m.Name}' declares [EyesOnly] — kept backend-served";
        return null;
    }

    private static JsonObject WithoutGuardedDefinitions(Dictionary<string, JsonNode?> definitions, RouteTable authored)
    {
        var publicUse = authored.Routes.Where(e => e.Definition is not null && !e.RestrictsAccess())
            .Select(e => e.Definition!).ToHashSet();
        var out_ = new JsonObject();
        foreach (var (name, node) in definitions)
        {
            if (YamlTree.DeclaresAccess(node))
                Log.LogInformation("bundle: definition {Name} declares access keys — not shipped raw", name);
            else if (!publicUse.Contains(name))
                Log.LogInformation("bundle: definition {Name} serves only access-restricted routes — not shipped", name);
            else
                out_[name] = node?.DeepClone();
        }
        return out_;
    }

    /// <summary>The union of every entry's <c>requiredCapabilities</c>, walked for the KEY.</summary>
    public static IReadOnlyList<string> AggregateCapabilities(IEnumerable<BundleEntry> entries)
    {
        var caps = new SortedSet<string>(StringComparer.Ordinal);
        void Walk(JsonNode? node)
        {
            if (node is JsonObject obj)
            {
                if (obj["requiredCapabilities"] is JsonArray rc)
                    foreach (var c in rc)
                        if (c is JsonValue v && v.TryGetValue<string>(out var s) && !string.IsNullOrWhiteSpace(s))
                            caps.Add(s);
                foreach (var (_, child) in obj) Walk(child);
            }
            else if (node is JsonArray arr)
                foreach (var child in arr) Walk(child);
        }
        foreach (var e in entries)
            if (e.Ok && !string.IsNullOrEmpty(e.Json))
                try { Walk(JsonNode.Parse(e.Json)); }
                catch (JsonException) { /* a malformed entry is simply not counted */ }
        return caps.ToList();
    }

    /// <summary>The <c>/mateu/v3/sync/&lt;seg&gt;</c> segment of a route, as the browser computes it.</summary>
    public static string ToSyncPath(string? route)
    {
        var r = route ?? "";
        if (r.StartsWith('/')) r = r[1..];
        return r.Length == 0 ? "_no_route" : r;
    }

    public static bool IsStatic(string route) => !route.Contains(':');
}
