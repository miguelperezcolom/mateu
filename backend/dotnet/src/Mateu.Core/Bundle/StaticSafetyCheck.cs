using System.Reflection;
using System.Text.Json.Nodes;
using Mateu.Uidl;

namespace Mateu.Core.Bundle;

/// <summary>
/// The STATIC-SAFETY report of a bundle: every way a route still needs a server — the .NET twin of
/// Java's <c>StaticSafetyCheck</c>, same rules, same messages (with the port's attribute names). A
/// pre-rendered increment is a SNAPSHOT: what a screen does after it is painted has to be declared
/// on the wire (a <c>restAction</c>, a <c>rowsSource</c>, a rule), because a method body cannot
/// travel to a CDN. With <c>--static</c> the export fails on a non-empty report.
///
/// The rules: a route that could not be bundled; <c>[EyesOnly]</c> and the YAML access keys; C#
/// action methods (<c>[Button]</c>, <c>[Toolbar]</c>, <c>[ListToolbarButton]</c>,
/// <c>[ViewToolbarButton]</c>, <c>[Fab]</c>, <c>[GroupAction]</c>) without <c>[RestAction]</c>;
/// rows from <c>IListing.Search</c> (no <c>[RestListing]</c>) or from a <c>Crud&lt;T&gt;</c>; a
/// proxied source, a DIRECT source carrying <c>${secret.…}</c>; a trigger running a server action;
/// in a definition, a component naming an action with no restAction / flow, and a shell header
/// action that is neither a route nor a client action.
/// </summary>
internal static class StaticSafetyCheck
{
    /// <summary>One way <paramref name="Route"/> needs a server.</summary>
    internal sealed record Violation(string Route, string Reason)
    {
        public override string ToString() => "/" + MateuRegistry.Normalize(Route) + " — " + Reason;
    }

    private static readonly Type[] ActionAttributes =
    [
        typeof(ButtonAttribute), typeof(ToolbarAttribute), typeof(ListToolbarButtonAttribute),
        typeof(ViewToolbarButtonAttribute), typeof(FabAttribute), typeof(GroupActionAttribute),
    ];

    public static List<Violation> Check(BundleManifest manifest, IReadOnlyDictionary<string, Type> classesByRoute)
    {
        var out_ = new List<Violation>();
        var catalog = manifest.Sources ?? new JsonArray();
        foreach (var entry in manifest.Entries)
        {
            if (!entry.Ok)
                out_.Add(new(entry.Route, "could not be bundled, so it would be served by a backend: " + entry.SkipReason));
            out_.AddRange(CheckClass(entry.Route, classesByRoute.GetValueOrDefault(MateuRegistry.Normalize(entry.Route))));
            foreach (var json in new[] { entry.Json, entry.ContentJson })
            {
                if (json is null) continue;
                try { out_.AddRange(CheckWire(entry.Route, JsonNode.Parse(json), catalog)); }
                catch (System.Text.Json.JsonException e)
                {
                    out_.Add(new(entry.Route, "its exported JSON could not be read: " + e.Message));
                }
            }
        }
        var catalogueIds = (manifest.Actions ?? new JsonArray()).OfType<JsonObject>()
            .Select(a => Str(a, "id")).Where(id => id.Length > 0).ToHashSet();
        foreach (var authored in (manifest.Routes ?? new JsonArray()).OfType<JsonObject>())
        {
            var definitionName = Str(authored, "definition");
            var definition = definitionName.Length > 0 ? manifest.Definitions?[definitionName] : null;
            var route = "/" + Str(authored, "route");
            if (authored["access"] is JsonObject access
                && new[] { "roles", "groups", "scopes", "permissions" }.Any(k => access[k] is JsonArray { Count: > 0 }))
                out_.Add(new(route, "declares access: — it depends on who asks, and a static bundle has no identity"));
            if (YamlTree.DeclaresAccess(definition))
                out_.Add(new(route, $"its definition '{definitionName}' declares access keys"
                                    + " (eyesOnly/readOnlyUnless/disabledUnless/access) — they depend on who asks, and a"
                                    + " static bundle has no identity"));
            if (definition is null) continue;
            out_.AddRange(CheckDefinition(route, definition, catalog, catalogueIds));
            out_.AddRange(CheckShellHeaderActions(route, definition, catalogueIds));
            foreach (var data in new[] { authored["data"], authored["appData"] })
                if (data is JsonObject source)
                    out_.AddRange(CheckSource(route, source, catalog, "the route's data"));
        }
        return out_.Distinct().ToList();
    }

    // ── classes ──────────────────────────────────────────────────────────────────────────────────

    public static List<Violation> CheckClass(string route, Type? type)
    {
        var out_ = new List<Violation>();
        if (type is null) return out_;
        var simple = type.Name;
        if (type.Find<EyesOnlyAttribute>() is not null)
            out_.Add(new(route, simple + " declares [EyesOnly]: it depends on who asks"));
        var isListing = type.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IListing<>));
        if (isListing && type.Find<RestListingAttribute>() is null)
            out_.Add(new(route, simple + " is a Listing with no [RestListing]: its rows come from Search(), a C# method"));
        if (IsCrud(type))
            out_.Add(new(route, simple + " reads and writes through a Crud's C# methods"));
        foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance))
        {
            if (method.DeclaringType == typeof(object)) continue;
            if (ActionAttributes.Any(a => method.IsDefined(a, true)) && method.Find<RestActionAttribute>() is null)
                out_.Add(new(route, $"{simple}.{method.Name}() is a C# action method (add [RestAction] to run it in the browser)"));
        }
        return out_;
    }

    private static bool IsCrud(Type type)
    {
        for (var t = type; t is not null; t = t.BaseType)
            if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Crud<>)) return true;
        return false;
    }

    // ── wire and definitions ─────────────────────────────────────────────────────────────────────

    private static string Str(JsonNode? node, string key) =>
        node?[key] is JsonValue v && v.TryGetValue<string>(out var s) ? s : "";

    private static void Walk(JsonNode? node, Func<string?, JsonObject, bool> visit, string? key = null)
    {
        switch (node)
        {
            case JsonObject obj:
                if (!visit(key, obj)) return;
                foreach (var (k, v) in obj.ToList()) Walk(v, visit, k);
                break;
            case JsonArray arr:
                foreach (var child in arr.ToList()) Walk(child, visit, key);
                break;
        }
    }

    private static bool LooksLikeSource(JsonObject node) =>
        node.ContainsKey("url") || node.ContainsKey("ref") || node.ContainsKey("proxy");

    private static bool IsTrue(JsonNode? node) => node is JsonValue v && v.TryGetValue<bool>(out var b) && b;

    public static bool IsClientFlow(JsonObject action) =>
        action["steps"] is JsonArray { Count: > 0 } steps
        && !steps.OfType<JsonObject>().Any(s => Str(s, "type") == "RunAction");

    public static List<Violation> CheckWire(string route, JsonNode? wire, JsonArray catalog)
    {
        var out_ = new List<Violation>();
        Walk(wire, (key, node) =>
        {
            if (key == "restSources") return false;
            if (LooksLikeSource(node)) out_.AddRange(CheckSource(route, node, catalog, "a source"));
            out_.AddRange(CheckTriggers(route, node));
            return true;
        });
        return out_;
    }

    private static List<Violation> CheckTriggers(string route, JsonObject component)
    {
        var out_ = new List<Violation>();
        if (component["triggers"] is not JsonArray { Count: > 0 } triggers) return out_;
        var client = (component["actions"] as JsonArray ?? []).OfType<JsonObject>()
            .Where(a => a["restAction"] is not null || IsClientFlow(a)).Select(a => Str(a, "id")).ToHashSet();
        foreach (var trigger in triggers.OfType<JsonObject>())
        {
            var actionId = Str(trigger, "actionId");
            if (!string.IsNullOrWhiteSpace(actionId) && !client.Contains(actionId))
            {
                var type = Str(trigger, "type");
                out_.Add(new(route, $"its {(type.Length > 0 ? type : "trigger")} trigger runs action '{actionId}' on the server"));
            }
        }
        return out_;
    }

    public static List<Violation> CheckDefinition(string route, JsonNode definition, JsonArray catalog,
        IReadOnlySet<string>? catalogueActions = null)
    {
        var out_ = new List<Violation>();
        var client = new HashSet<string>(catalogueActions ?? new HashSet<string>());
        foreach (var action in (definition["actions"] as JsonArray ?? []).OfType<JsonObject>())
            if (action.ContainsKey("restAction") || IsClientFlow(action))
                client.Add(Str(action, "id"));
        Walk(definition, (key, node) =>
        {
            if (LooksLikeSource(node)) out_.AddRange(CheckSource(route, node, catalog, "a source"));
            var type = Str(node, "type");
            if (type == "Button" && node["actionId"] is not null && !node.ContainsKey("actionable")
                && node["route"] is null && !client.Contains(Str(node, "actionId")))
                out_.Add(new(route, $"button '{Str(node, "actionId")}' has neither a route nor a restAction in"
                                    + " `actions:`, so it would be dispatched to a server"));
            if (!string.IsNullOrWhiteSpace(type) && type != "Button" && key != "triggers")
                foreach (var (name, value) in node)
                {
                    var id = value is JsonValue v && v.TryGetValue<string>(out var s) ? s : "";
                    if ((name == "actionId" || name.EndsWith("ActionId", StringComparison.Ordinal))
                        && !string.IsNullOrWhiteSpace(id) && !client.Contains(id))
                        out_.Add(new(route, $"{type} runs action '{id}' ({name}) with no restAction in `actions:`,"
                                            + " so it would be dispatched to a server"));
                }
            return true;
        });
        return out_;
    }

    public static List<Violation> CheckShellHeaderActions(string route, JsonNode? definition,
        IReadOnlySet<string>? catalogueActions = null)
    {
        var out_ = new List<Violation>();
        if (definition is not JsonObject shell || Str(shell, "type") != "AppShell") return out_;
        var actions = new HashSet<string>(catalogueActions ?? new HashSet<string>());
        foreach (var action in (shell["actions"] as JsonArray ?? []).OfType<JsonObject>()) actions.Add(Str(action, "id"));
        var pending = new Stack<JsonObject>((shell["headerActions"] as JsonArray ?? []).OfType<JsonObject>());
        while (pending.Count > 0)
        {
            var action = pending.Pop();
            foreach (var child in (action["children"] as JsonArray ?? []).OfType<JsonObject>()) pending.Push(child);
            var actionId = Str(action, "actionId");
            if (!string.IsNullOrWhiteSpace(actionId) && string.IsNullOrWhiteSpace(Str(action, "route"))
                && !actions.Contains(actionId))
                out_.Add(new(route, $"header action '{actionId}' is neither a route nor an action of the shell or"
                                    + " the action catalogue, so it would be dispatched to a server"));
        }
        return out_;
    }

    public static List<Violation> CheckSource(string route, JsonObject source, JsonArray catalog, string what)
    {
        var out_ = new List<Violation>();
        var reference = Str(source, "ref");
        if (!string.IsNullOrWhiteSpace(reference)
            && catalog.OfType<JsonObject>().FirstOrDefault(e => Str(e, "name") == reference) is { } entry
            && entry["source"] is JsonObject resolved)
            out_.AddRange(Verdict(route, $"source '{reference}'", IsTrue(resolved["proxy"]) || IsTrue(source["proxy"]),
                Str(resolved, "url"), resolved["headers"]?.ToJsonString(), Str(resolved, "body")));
        var url = Str(source, "url");
        if (!string.IsNullOrWhiteSpace(url))
            out_.AddRange(Verdict(route, $"{what} ({url})", IsTrue(source["proxy"]), url,
                source["headers"]?.ToJsonString(), Str(source, "body")));
        else if (string.IsNullOrWhiteSpace(reference) && IsTrue(source["proxy"]))
            out_.Add(new(route, what + " is fetched through the server proxy (proxy: true)"));
        return out_;
    }

    private static IEnumerable<Violation> Verdict(string route, string what, bool proxy, string? url, string? headers, string? body)
    {
        if (proxy)
            return [new(route, what + " is fetched through the server proxy (proxy: true) — there is none")];
        var text = (url ?? "") + " " + (headers ?? "") + " " + (body ?? "");
        return text.Contains("${secret.", StringComparison.Ordinal)
            ? [new(route, what + " is DIRECT but uses ${secret.…}: the browser has no secret scope, and a secret"
                          + " in a static file is not a secret")]
            : [];
    }
}
