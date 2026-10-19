using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core.Authoring;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.Mcp;

/// <summary>
/// The native (in-process) host of the agent-operability plane: turns MCP tool calls into
/// <see cref="SyncHandler"/> requests and projects the resulting wire with the same
/// <see cref="McpProjection"/> the sidecar uses. RBAC is enforced by the handler (an [EyesOnly]
/// member a caller may not see never reaches the projection). C# mirror of the Java McpService.
/// </summary>
internal sealed class McpService
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

    /// <summary>The live UI sessions of the host when live UI push is on (phase C); null = off: the
    /// push tools are neither listed nor callable.</summary>
    public AgentPush.AgentSessions? Push { get; init; }

    /// <summary>Who is calling, for the push tools.</summary>
    public AgentPush.AgentCaller Caller { get; init; } = AgentPush.AgentCaller.Anonymous;

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
        UIIncrementDto increment;
        try
        {
            // an MCP tool call: the reserved __validate__ is served to these (SyncHandler.ValidationServed)
            var outer = SyncHandler.InMcpCall.Value;
            SyncHandler.InMcpCall.Value = true;
            try
            {
                increment = _run is not null ? _run(rq) : _handler.Handle(rq, _requestBaseUrl);
            }
            finally
            {
                SyncHandler.InMcpCall.Value = outer;
            }
        }
        catch (Exception e) when (IsForbidden(e))
        {
            // A refused request is the tool error "Forbidden" — never the guard's own wording, which
            // names roles and annotations.
            throw new UserFacingException("Forbidden");
        }
        catch (Exception e)
        {
            // The sync endpoint's error boundary, applied here too: an action that FAILS answers the
            // generic message + reference as a screen message — never the raw exception text, which
            // may carry SQL, paths or other users' data.
            var cause = MateuErrors.Unwrap(e);
            var (message, reference) = ErrorBoundary.Describe(cause);
            if (reference is not null)
                MateuLogging.For("Mateu.Mcp").LogError(cause,
                    "Unhandled error in action {ActionId} on {Route} [{Reference}]", rq.ActionId, rq.Route, reference);
            increment = UIIncrementDto.Of(messages: [message]);
        }
        return JsonSerializer.SerializeToNode(increment, _json);
    }

    static bool IsForbidden(Exception? e)
    {
        for (; e is not null; e = e.InnerException)
        {
            if (e is MateuForbiddenException) return true;
            if (e is AggregateException aggregate && aggregate.InnerExceptions.Any(IsForbidden)) return true;
        }
        return false;
    }

    // ── authoring (phase B): validate, preview, save ──────────────────────────────────────────

    /// <summary><c>mateu_validate_uidl</c>: the app's <c>__validate__</c> answer for <paramref name="yaml"/>.</summary>
    public JsonObject Validate(string yaml) => Validation("", yaml);

    /// <summary><c>mateu_preview_uidl</c>: validate, then — when the definition is a page with no
    /// error — render it through <c>__preview__</c> (layout only: no view model, nothing saved) and
    /// project the answer: <c>{rendered, validation, screen | reason}</c>.</summary>
    public JsonObject Preview(string yaml, string? route)
    {
        route ??= "";
        var validation = Validation(route, yaml);
        var kind = validation["kind"] is JsonValue k && k.TryGetValue<string>(out var ks) ? ks : "";
        var out_ = new JsonObject();
        if (validation["valid"]?.GetValue<bool>() != true)
        {
            out_["rendered"] = false;
            out_["reason"] = "The definition has errors; fix them first.";
        }
        else if (kind != "component" && kind != "envelope")
        {
            out_["rendered"] = false;
            out_["reason"] = "Only a page (a component, or a layout: envelope) can be previewed.";
        }
        else
        {
            var increment = Sync(Rq(route, "__preview__", null, new JsonObject { [SyncHandler.YamlParameter] = yaml }));
            out_["rendered"] = true;
            out_["screen"] = McpProjection.Project(increment);
        }
        out_["validation"] = validation;
        return out_;
    }

    /// <summary><c>mateu_save_spec</c> (development mode only): validate and, with no error, write
    /// the file into <paramref name="specsDir"/> — the dev-mode watcher then reloads the browsers.</summary>
    public JsonObject SaveSpec(string path, string yaml, string specsDir)
    {
        if (!SpecWriter.IsAcceptable(path)) throw new UserFacingException(SpecWriter.Refusal(path));
        if (SpecWriter.IsCatalogueFile(path)) throw new UserFacingException(SpecWriter.CatalogueRefusal(path));
        var validation = Validation("", yaml);
        var out_ = new JsonObject();
        var refusal = SpecWriter.AgentRefusal(
            validation["kind"] is JsonValue k && k.TryGetValue<string>(out var kind) ? kind : null, yaml);
        if (refusal is not null)
        {
            // never written, and said loudly: an agent tried to author what decides a request
            MateuLogging.For("Mateu.Mcp").LogWarning("mateu_save_spec refused {Path}: {Reason}",
                MateuLogging.Safe(path), refusal);
            out_["saved"] = false;
            out_["reason"] = refusal;
        }
        else if (validation["valid"]?.GetValue<bool>() != true)
        {
            out_["saved"] = false;
            out_["reason"] = "The definition has errors; nothing was written.";
        }
        else
        {
            var bytes = SpecWriter.Write(specsDir, path, yaml);
            out_["saved"] = true;
            out_["path"] = path;
            out_["bytes"] = bytes;
        }
        out_["validation"] = validation;
        return out_;
    }

    JsonObject Validation(string route, string? yaml)
    {
        var increment = Sync(Rq(route, SyncHandler.ValidateAction, null,
            new JsonObject { [SyncHandler.YamlParameter] = yaml ?? "" }));
        if (increment?["appData"]?[SyncHandler.ValidationKey] is JsonObject report)
            return (JsonObject)report.DeepClone();
        // refused, or failed: the increment's message says why
        var text = increment?["messages"]?[0]?["text"] is JsonValue t && t.TryGetValue<string>(out var s) ? s : "validation failed";
        throw new UserFacingException(text);
    }
}
