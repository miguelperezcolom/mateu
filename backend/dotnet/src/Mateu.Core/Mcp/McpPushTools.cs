using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Mateu.Core.AgentPush;
using Mateu.Core.Authoring;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.Mcp;

/// <summary>
/// The MCP tools of live UI push (phase C): list / pair the caller's live UI sessions and send them a
/// screen, a navigation or a named event. Names, descriptions, schemas, error texts and the order of
/// the checks are pinned by <c>conformance/mcp/push.json</c>, shared with Java, Python and the sidecar.
/// </summary>
internal static partial class McpPushTools
{
    public static readonly IReadOnlyList<string> Names =
        ["mateu_list_sessions", "mateu_pair_session", "mateu_push_ui", "mateu_navigate", "mateu_dispatch_event",
            "mateu_get_session_screen", "mateu_set_session_fields", "mateu_run_session_action"];

    /// <summary>The tools that wait for the tab's answer (<see cref="DispatchAsync"/>).</summary>
    public static readonly IReadOnlySet<string> ScreenTools = new HashSet<string>(StringComparer.Ordinal)
        { "mateu_get_session_screen", "mateu_set_session_fields", "mateu_run_session_action" };

    static readonly string[] Targets = ["content", "drawer", "dialog"];

    [GeneratedRegex("^[A-Za-z][A-Za-z0-9_.:-]{0,63}$")]
    private static partial Regex EventName();

    /// <summary>Run one push tool; null when <paramref name="name"/> is not one of them.</summary>
    public static JsonNode? Dispatch(McpService svc, AgentSessions sessions, string name, JsonObject args) => name switch
    {
        "mateu_list_sessions" => sessions.List(svc.Caller),
        "mateu_pair_session" => sessions.Pair(svc.Caller, Argument(args, "code"), svc.ClientAddress),
        "mateu_push_ui" => PushUi(svc, sessions, args),
        "mateu_navigate" => Navigate(svc, sessions, args),
        "mateu_dispatch_event" => DispatchEvent(svc, sessions, args),
        // a synchronous caller blocks on the wait; the HTTP endpoint goes through DispatchAsync
        _ when ScreenTools.Contains(name) => DispatchAsync(svc, sessions, name, args).GetAwaiter().GetResult(),
        _ => null,
    };

    /// <summary>Run one of the <see cref="ScreenTools"/>: the argument checks, then the query message,
    /// then the wait for the tab's answer — awaited, never blocking a thread.</summary>
    public static async Task<JsonNode> DispatchAsync(McpService svc, AgentSessions sessions, string name, JsonObject args)
    {
        var handle = Argument(args, "session");
        JsonObject detail;
        string @event;
        string what;
        switch (name)
        {
            case "mateu_get_session_screen":
                detail = new JsonObject();
                @event = AgentSessions.DescribeScreenEvent;
                what = "";
                break;
            case "mateu_set_session_fields":
                if (args["values"] is not JsonObject values)
                    throw new UserFacingException("Missing argument \"values\".");
                detail = new JsonObject { ["values"] = values.DeepClone() };
                if (Encoding.UTF8.GetByteCount(detail.ToJsonString()) > AgentSessions.MaxDetailBytes)
                    throw new UserFacingException(AgentSessions.DetailTooLarge);
                @event = AgentSessions.SetFieldsEvent;
                what = "fields=" + values.Count;
                break;
            default:
            {
                var actionId = Argument(args, "actionId");
                detail = new JsonObject { ["actionId"] = actionId };
                if (args["parameters"] is JsonObject parameters) detail["parameters"] = parameters.DeepClone();
                if (args["row"] is { } row)
                {
                    if (!IsIndex(row, out var index))
                        throw new UserFacingException(AgentSessions.InvalidRow);
                    detail["row"] = (int)index;
                }
                if (AsString(args["listing"]) is { } listing) detail["listing"] = listing;
                if (Encoding.UTF8.GetByteCount(detail.ToJsonString()) > AgentSessions.MaxDetailBytes)
                    throw new UserFacingException(AgentSessions.DetailTooLarge);
                @event = AgentSessions.RunActionEvent;
                what = "action=" + actionId;
                break;
            }
        }
        var session = sessions.Reachable(svc.Caller, handle);
        var bytes = Encoding.UTF8.GetByteCount(detail.ToJsonString());
        var (requestId, answer) = sessions.Ask(session, @event, detail);
        MateuLogging.For("Mateu.Mcp").LogInformation(
            "Mateu agent push: caller={Caller} session={Session} kind=query event={Event}{What} bytes={Bytes}",
            svc.Caller.LogLabel, AgentSessions.Fingerprint(session.Handle), @event,
            what.Length == 0 ? "" : " " + AgentSessions.LogSafe(what), bytes);
        AgentAnswer got;
        try
        {
            got = await answer.WaitAsync(TimeSpan.FromMilliseconds(Math.Max(1, sessions.AnswerTimeoutMs)))
                .ConfigureAwait(false);
        }
        catch (TimeoutException)
        {
            throw new UserFacingException(AgentSessions.NoAnswer(handle));
        }
        finally
        {
            sessions.Forget(session, requestId);
        }
        if (got.WasRefused) throw new UserFacingException(AgentSessions.Refusal(got.ErrorCode, got.ErrorId));
        return new JsonObject { ["session"] = handle, ["screen"] = got.Screen?.DeepClone() };
    }

    /// <summary>An integer literal 0…int.MaxValue — not a string, nor a number written with a fraction or
    /// an exponent (1.0, 1e2), as in Java (<c>isIntegralNumber</c>).</summary>
    static bool IsIndex(JsonNode row, out long index)
    {
        index = -1;
        return row is JsonValue v && v.GetValueKind() == System.Text.Json.JsonValueKind.Number
            && long.TryParse(v.ToJsonString(), System.Globalization.NumberStyles.AllowLeadingSign,
                System.Globalization.CultureInfo.InvariantCulture, out index)
            && index >= 0 && index <= int.MaxValue;
    }

    static JsonObject PushUi(McpService svc, AgentSessions sessions, JsonObject args)
    {
        var handle = Argument(args, "session");
        var yaml = Argument(args, "yaml");
        var target = AsString(args["target"]) ?? "content";
        if (!Targets.Contains(target)) throw new UserFacingException(AgentSessions.InvalidTarget(target));
        var title = AsString(args["title"]);
        var session = sessions.Reachable(svc.Caller, handle);
        // validated AS THE CALLER, through the app's own __validate__ (its size limit included)
        var validation = svc.Validate(yaml);
        var kind = AsString(validation["kind"]) ?? "";
        if (validation["valid"]?.GetValue<bool>() != true)
            return NotDelivered(AgentSessions.HasErrors, validation);
        if (kind != "component" && kind != "envelope")
            return NotDelivered(AgentSessions.NotAPage, validation);
        var detail = new JsonObject { ["yaml"] = yaml, ["target"] = target };
        if (title is not null) detail["title"] = title;
        Send(svc, sessions, session, "render", AgentSessions.RenderEvent, detail, "target=" + target);
        return new JsonObject
        {
            ["delivered"] = true,
            ["session"] = handle,
            ["target"] = target,
            ["validation"] = validation,
        };
    }

    static JsonObject Navigate(McpService svc, AgentSessions sessions, JsonObject args)
    {
        var handle = Argument(args, "session");
        var route = Argument(args, "route");
        var session = sessions.Reachable(svc.Caller, handle);
        var detail = new JsonObject { ["route"] = route, ["consumedRoute"] = AsString(args["consumedRoute"]) ?? "" };
        foreach (var optional in new[] { "actionId", "baseUrl", "serverSideType", "uriPrefix" })
            if (AsString(args[optional]) is { } value) detail[optional] = value;
        Send(svc, sessions, session, "navigate", AgentSessions.NavigateEvent, detail, "route=" + route);
        return Delivered(handle);
    }

    static JsonObject DispatchEvent(McpService svc, AgentSessions sessions, JsonObject args)
    {
        var handle = Argument(args, "session");
        var name = Argument(args, "event");
        if (!EventName().IsMatch(name)) throw new UserFacingException(AgentSessions.InvalidEvent(name));
        if (AgentSessions.ReservedEvents.Contains(name)) throw new UserFacingException(AgentSessions.ReservedEvent(name));
        if (AgentSessions.IsFrameworkEvent(name)) throw new UserFacingException(AgentSessions.FrameworkEvent(name));
        var detail = args["detail"]?.DeepClone() ?? new JsonObject();
        if (Encoding.UTF8.GetByteCount(detail.ToJsonString()) > AgentSessions.MaxDetailBytes)
            throw new UserFacingException(AgentSessions.DetailTooLarge);
        var session = sessions.Reachable(svc.Caller, handle);
        Send(svc, sessions, session, "event", name, detail, "event=" + name);
        return Delivered(handle);
    }

    static void Send(McpService svc, AgentSessions sessions, AgentSession session, string kind, string @event,
        JsonNode detail, string what)
    {
        sessions.Send(session, kind, @event, detail);
        MateuLogging.For("Mateu.Mcp").LogInformation(
            "Mateu agent push: caller={Caller} session={Session} kind={Kind} {What} bytes={Bytes}",
            svc.Caller.LogLabel, AgentSessions.Fingerprint(session.Handle), kind, AgentSessions.LogSafe(what), Encoding.UTF8.GetByteCount(
                new JsonObject { ["kind"] = kind, ["event"] = @event, ["detail"] = detail.DeepClone() }.ToJsonString()));
    }

    static JsonObject Delivered(string handle) => new() { ["delivered"] = true, ["session"] = handle };

    static JsonObject NotDelivered(string reason, JsonObject validation) => new()
    {
        ["delivered"] = false,
        ["reason"] = reason,
        ["validation"] = validation,
    };

    static string Argument(JsonObject args, string name) =>
        AsString(args[name]) ?? throw new UserFacingException("Missing argument " + UidlValidator.Quote(name) + ".");

    static string? AsString(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    /// <summary>The five tool definitions, pinned byte for byte by <c>push.json</c> "pushTools".</summary>
    public static IEnumerable<JsonObject> Tools()
    {
        const string sessionDescription = "a session from mateu_list_sessions or mateu_pair_session";
        yield return Tool("mateu_list_sessions",
            "List the live UI sessions (browser tabs, app windows) this caller may send UI to: its own"
            + " (same signed-in user) and the ones paired to it with mateu_pair_session. Returns {sessions:"
            + " [{session, user, route, renderer, connectedAt, connected, paired}]}.",
            Schema(null));
        yield return Tool("mateu_pair_session",
            "Pair a live UI session with this caller, using the one-time code the user sees after clicking"
            + " \"Connect AI\" in the app. Returns the session; it can then be addressed by mateu_push_ui,"
            + " mateu_navigate and mateu_dispatch_event. The code expires in minutes and works once.",
            Schema(["code"], Prop("code", "string", "the pairing code shown in the app, e.g. K7QF-4MZP")));
        var target = Prop("target", "string", null);
        target.Value["enum"] = new JsonArray("content", "drawer", "dialog");
        target.Value["description"] = "where to show it (default content)";
        yield return Tool("mateu_push_ui",
            "Show a screen in a live UI session: validate the YAML page first (nothing is sent when it has"
            + " errors), then render it in that tab, in the content area (default), a drawer or a dialog."
            + " Layout only: no view model is bound. Returns {delivered, session, target, validation} or"
            + " {delivered: false, reason, validation}.",
            Schema(["session", "yaml"],
                Prop("session", "string", sessionDescription),
                Prop("yaml", "string", "the page's YAML text"),
                target,
                Prop("title", "string", "optional: the drawer's or dialog's header")));
        yield return Tool("mateu_navigate",
            "Navigate a live UI session to a route of the app, like a click on the menu entry carrying"
            + " these fields. Returns {delivered, session}.",
            Schema(["session", "route"],
                Prop("session", "string", sessionDescription),
                Prop("route", "string", "the target route, e.g. /orders/42"),
                Prop("consumedRoute", "string", "optional: the route consumed by the app shell (usually \"\")"),
                Prop("actionId", "string", "optional: an action to run on arrival"),
                Prop("baseUrl", "string", "optional: the base URL of the target micro-frontend"),
                Prop("serverSideType", "string", "optional: the server-side type of the target UI"),
                Prop("uriPrefix", "string", "optional: the URI prefix (usually \"\")")));
        yield return Tool("mateu_dispatch_event",
            "Dispatch a named UI event in a live UI session, for the components that subscribe to it"
            + " (@SubscribeTo). The built-in events are reserved: use mateu_push_ui and mateu_navigate for"
            + " them. Returns {delivered, session}.",
            Schema(["session", "event"],
                Prop("session", "string", sessionDescription),
                Prop("event", "string", "the event name, e.g. highlight-row"),
                Prop("detail", "object", "optional: the event's detail")));
        yield return Tool("mateu_get_session_screen",
            "Read what the user sees in a live UI session, as that tab draws it: route, window"
            + " title, page header, fields (id, label, type, value, required, readOnly, error,"
            + " options), the actions the user can press (id, label, enabled), the rows of each"
            + " listing's current page with its search, filters, sort, page and total, an open"
            + " dialog or drawer (focus: overlay, in front of the page) and the last"
            + " messages. Only what the screen shows; long values and lists are capped and named"
            + " in truncated. Returns {session, screen}.",
            Schema(["session"], Prop("session", "string", sessionDescription)));
        yield return Tool("mateu_set_session_fields",
            "Type values into fields of the screen in a live UI session (the dialog's or drawer's"
            + " when one is open), exactly as the user editing them: validation, client rules"
            + " and the unsaved-changes state follow. Only fields the screen shows as editable:"
            + " any other refuses the whole call and nothing changes. Returns {session, screen}"
            + " after the change.",
            Schema(["session", "values"],
                Prop("session", "string", sessionDescription),
                Prop("values", "object",
                    "field id -> value (a string, number, boolean, or a list for a multi-value field)")));
        yield return Tool("mateu_run_session_action",
            "Press an action the screen in a live UI session offers (an id from"
            + " mateu_get_session_screen; a row action needs row), as the user clicking it:"
            + " validation runs, and a confirmation the action asks for is shown to the user,"
            + " who answers it. Returns {session, screen} once the screen settled.",
            Schema(["session", "actionId"],
                Prop("session", "string", sessionDescription),
                Prop("actionId", "string", "an action id from mateu_get_session_screen"),
                Prop("parameters", "object", "optional: extra parameters of the action"),
                Prop("row", "integer", "optional, for a row action: the 0-based index of the row in the listing's rows"),
                Prop("listing", "string",
                    "optional, for a row action on a screen with several listings: the listing id")));
    }

    static JsonObject Tool(string name, string description, JsonObject schema) =>
        new() { ["name"] = name, ["description"] = description, ["inputSchema"] = schema };

    static KeyValuePair<string, JsonObject> Prop(string name, string type, string? description)
    {
        var p = new JsonObject { ["type"] = type };
        if (description is not null) p["description"] = description;
        return new(name, p);
    }

    static JsonObject Schema(string[]? required = null, params KeyValuePair<string, JsonObject>[] properties)
    {
        var props = new JsonObject();
        foreach (var (name, p) in properties) props[name] = p;
        var schema = new JsonObject { ["type"] = "object", ["properties"] = props, ["additionalProperties"] = false };
        if (required is not null) schema["required"] = new JsonArray(required.Select(r => (JsonNode)r!).ToArray());
        return schema;
    }
}
