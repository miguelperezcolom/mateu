using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Dtos;

namespace Mateu.Core.Mcp;

/// <summary>
/// The native (in-process) host of the agent-operability plane: turns MCP tool calls into
/// <see cref="SyncHandler"/> requests and projects the resulting wire with the same
/// <see cref="McpProjection"/> the sidecar uses. RBAC is enforced by the handler (an [EyesOnly]
/// member a caller may not see never reaches the projection). C# mirror of the Java McpService.
/// </summary>
public sealed class McpService
{
    readonly SyncHandler _handler;
    readonly JsonSerializerOptions _json;
    readonly string? _requestBaseUrl;
    readonly Func<RunActionRqDto, UIIncrementDto>? _run;

    public McpService(SyncHandler handler, JsonSerializerOptions json, string? requestBaseUrl = null)
        : this(handler, json, requestBaseUrl, null)
    {
    }

    /// <param name="handler">The handler tool calls run against.</param>
    /// <param name="json">The wire's JSON options.</param>
    /// <param name="requestBaseUrl">The base url of the request in flight.</param>
    /// <param name="run">How a tool call runs a request; null → the handler directly. The ASP.NET
    /// endpoint passes the same error boundary the sync endpoint applies, so a failing action answers
    /// the generic message + reference instead of its raw exception text.</param>
    public McpService(SyncHandler handler, JsonSerializerOptions json, string? requestBaseUrl,
        Func<RunActionRqDto, UIIncrementDto>? run)
    {
        _handler = handler;
        _json = json;
        _requestBaseUrl = requestBaseUrl;
        _run = run;
    }

    /// <summary>Load a screen (route) → flat projection. The load is dispatched as actionId "".</summary>
    public JsonObject DescribeScreen(string route) =>
        McpProjection.Project(Sync(Rq(route, "", null, null)));

    /// <summary>Run an action on a screen → resulting projection.</summary>
    public JsonObject RunAction(string route, string actionId, JsonObject? componentState) =>
        McpProjection.Project(Sync(Rq(route, actionId, componentState, null)));

    /// <summary>Run the standard <c>search</c> action of a listing.</summary>
    public JsonObject Search(string route, string? searchText, JsonObject? filters)
    {
        // The listing reads its search text from the COMPONENT STATE (where the search box writes
        // it), not from the parameters: sent only as a parameter, the agent's search came back
        // unfiltered.
        var state = filters?.DeepClone() as JsonObject ?? new JsonObject();
        JsonObject? parameters = null;
        if (!string.IsNullOrEmpty(searchText))
        {
            state["searchText"] = searchText;
            parameters = new JsonObject { ["searchText"] = searchText };
        }
        return McpProjection.Project(Sync(Rq(route, "search", state, parameters)));
    }

    /// <summary>Navigable routes from the app menu on the root response → [{route, caption}].</summary>
    public JsonArray ListRoutes()
    {
        var increment = Sync(Rq("", "", null, null));
        var routes = new List<KeyValuePair<string, string>>();
        var seen = new HashSet<string>();
        void Add(string r, string caption) { if (seen.Add(r)) routes.Add(new(r, caption)); }
        Collect(increment?["fragments"] as JsonArray, Add);
        if (!seen.Contains("")) routes.Add(new("", "Home"));
        var arr = new JsonArray();
        foreach (var kv in routes) arr.Add(new JsonObject { ["route"] = kv.Key, ["caption"] = kv.Value });
        return arr;
    }

    static void Collect(JsonNode? node, Action<string, string> add)
    {
        if (node is JsonObject obj)
        {
            if (obj["metadata"] is JsonObject md && AsString(md["type"]) == "App")
                WalkMenu(md["menu"], add);
            if (!IsFolder(obj) && obj["route"] is JsonValue rv && rv.TryGetValue<string>(out var route) && route.Length > 0)
            {
                var r = McpProjection.NormalizeRoute(route);
                add(r, AsString(obj["caption"]) ?? AsString(obj["label"]) ?? (r.Length == 0 ? "Home" : r));
            }
            foreach (var kv in obj) Collect(kv.Value, add);
        }
        else if (node is JsonArray arr)
        {
            foreach (var item in arr) Collect(item, add);
        }
    }

    static void WalkMenu(JsonNode? menu, Action<string, string> add)
    {
        if (menu is not JsonArray items) return;
        foreach (var itemEl in items)
        {
            if (itemEl is not JsonObject item) continue;
            var raw = AsString(item["route"]) ?? AsString(item["path"]);
            if (!IsFolder(item) && !string.IsNullOrEmpty(raw))
            {
                var r = McpProjection.NormalizeRoute(raw);
                add(r, AsString(item["caption"]) ?? AsString(item["label"]) ?? (r.Length == 0 ? "Home" : r));
            }
            WalkMenu(item["submenus"], add);
            WalkMenu(item["menu"], add);
        }
    }

    // A folder (a menu entry holding submenus) is not a place to navigate to: its "/" path would
    // otherwise be reported as the home, under the folder's caption.
    static bool IsFolder(JsonObject item) => item["submenus"] is JsonArray { Count: > 0 };

    static string? AsString(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    RunActionRqDto Rq(string route, string actionId, JsonObject? componentState, JsonObject? parameters)
    {
        // SyncHandler resolves a mount route in leading-slash form ("/mcp-demo"); root stays "".
        var normalized = McpProjection.NormalizeRoute(route);
        return new RunActionRqDto
        {
            Route = normalized.Length == 0 ? "" : "/" + normalized,
            ActionId = actionId ?? "",
            ComponentState = ToDict(componentState),
            Parameters = ToDict(parameters),
        };
    }

    // Convert a JsonObject to the Dictionary<string,object?> shape SyncHandler expects — values as
    // JsonElement, exactly as the HTTP sync endpoint deserializes componentState.
    Dictionary<string, object?> ToDict(JsonObject? obj)
    {
        if (obj is null) return new();
        return JsonSerializer.Deserialize<Dictionary<string, object?>>(obj.ToJsonString(), _json) ?? new();
    }

    JsonNode? Sync(RunActionRqDto rq)
    {
        var increment = _run is not null ? _run(rq) : _handler.Handle(rq, _requestBaseUrl);
        return JsonSerializer.SerializeToNode(increment, _json);
    }
}
