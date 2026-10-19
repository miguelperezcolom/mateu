using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core.Authoring;
using Mateu.Uidl;
using Microsoft.Extensions.Logging;

namespace Mateu.Core.Mcp;

/// <summary>
/// Minimal Model Context Protocol handler (JSON-RPC 2.0) for the native endpoint. Mirrors the Java
/// McpJsonRpc and the sidecar exactly — same protocol version, same tools, same resources, pinned by
/// <c>conformance/mcp/authoring.json</c> — so an agent sees the same surface whichever it talks to.
/// </summary>
/// <remarks>Protocol version 2024-11-05 is kept rather than bumped to a 2025 revision: those add
/// Streamable-HTTP session semantics this stateless POST endpoint does not implement, and clients
/// negotiate down to it.</remarks>
internal static class McpJsonRpc
{
    public const string ProtocolVersion = "2024-11-05";
    public const string ServerName = "mateu-mcp";
    public const string ServerVersion = "0.1.0";

    /// <summary>The setting that names the specs directory <c>mateu_save_spec</c> writes into.</summary>
    public const string SpecsDirSetting = "MATEU_DEV_SPECS_DIR";

    /// <summary>Tool results are pretty-printed, with non-ASCII kept as is (like Jackson's).</summary>
    private static readonly JsonSerializerOptions Pretty = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>Handle one JSON-RPC message. Returns the response node, or null for a notification.</summary>
    public static JsonNode? Handle(JsonNode? message, McpService svc) =>
        Handle(message, svc, DevSpecs.Enabled, DevSpecs.SpecsDir);

    /// <summary><see cref="Handle(JsonNode?, McpService)"/> with the development mode and the specs
    /// directory given (the host's — and the tests').</summary>
    internal static JsonNode? Handle(JsonNode? message, McpService svc, bool devMode, string? specsDir)
    {
        if (message is not JsonObject msg) return Err(null, -32600, "Invalid Request");
        var idNode = msg["id"];
        var isNotification = idNode is null;
        var method = AsString(msg["method"]) ?? "";
        try
        {
            switch (method)
            {
                case "initialize":
                    return Ok(idNode, new JsonObject
                    {
                        ["protocolVersion"] = ProtocolVersion,
                        ["capabilities"] = new JsonObject { ["tools"] = new JsonObject(), ["resources"] = new JsonObject() },
                        ["serverInfo"] = new JsonObject { ["name"] = ServerName, ["version"] = ServerVersion },
                    });
                case "notifications/initialized":
                case "initialized":
                    return null;
                case "ping":
                    return Ok(idNode, new JsonObject());
                case "tools/list":
                    return Ok(idNode, new JsonObject { ["tools"] = Tools(devMode, svc.Push is not null) });
                case "resources/list":
                {
                    var list = new JsonArray();
                    foreach (var r in AuthoringResources.Resources)
                        list.Add(new JsonObject
                        {
                            ["uri"] = r.Uri, ["name"] = r.Name, ["description"] = r.Description, ["mimeType"] = r.MimeType,
                        });
                    return Ok(idNode, new JsonObject { ["resources"] = list });
                }
                case "resources/read":
                {
                    var uri = AsString((msg["params"] as JsonObject)?["uri"]);
                    if (uri is null) return Err(idNode, -32602, "Invalid params: uri is required");
                    var resource = AuthoringResources.ByUri(uri);
                    if (resource is null) return Err(idNode, -32002, "Resource not found: " + uri);
                    return Ok(idNode, new JsonObject
                    {
                        ["contents"] = new JsonArray(new JsonObject
                        {
                            ["uri"] = resource.Uri,
                            ["mimeType"] = resource.MimeType,
                            ["text"] = AuthoringResources.Text(resource.File),
                        }),
                    });
                }
                case "tools/call":
                {
                    var pars = msg["params"] as JsonObject ?? new JsonObject();
                    var data = Dispatch(svc, AsString(pars["name"]) ?? "",
                        pars["arguments"] as JsonObject ?? new JsonObject(), devMode, specsDir);
                    return Ok(idNode, new JsonObject
                    {
                        ["content"] = new JsonArray(new JsonObject { ["type"] = "text", ["text"] = data.ToJsonString(Pretty) }),
                    });
                }
                default:
                    return isNotification ? null : Err(idNode, -32601, $"Method not found: {method}");
            }
        }
        catch (Exception e)
        {
            if (isNotification) return null;
            var text = ErrorText(e, method == "tools/call" ? AsString((msg["params"] as JsonObject)?["name"]) : null);
            if (method == "tools/call")
                // MCP convention: a tool error is a result with isError, not a protocol error.
                return Ok(idNode, new JsonObject
                {
                    ["isError"] = true,
                    ["content"] = new JsonArray(new JsonObject { ["type"] = "text", ["text"] = "Error: " + text }),
                });
            return Err(idNode, -32603, text);
        }
    }

    /// <summary>What a failed call tells the agent — the request path's error boundary: a mistake of
    /// the caller (<see cref="UserFacingException"/>: an unknown tool, a missing argument, a refused
    /// path) is shown as written; anything else is the generic text with a reference id, logged at
    /// ERROR under that id (the raw message only with MATEU_ERRORS_DETAILED).</summary>
    internal static string ErrorText(Exception e, string? tool)
    {
        if (e is UserFacingException userFacing) return userFacing.Message;
        var cause = MateuErrors.Unwrap(e);
        var (message, reference) = ErrorBoundary.Describe(cause);
        if (reference is not null)
            MateuLogging.For("Mateu.Mcp").LogError(cause, "Unhandled error in MCP call {Tool} [{Reference}]",
                "mcp:" + (tool ?? ""), reference);
        return message.Text;
    }

    static JsonNode Dispatch(McpService svc, string name, JsonObject args, bool devMode, string? specsDir)
    {
        switch (name)
        {
            case "mateu_list_routes": return svc.ListRoutes();
            case "mateu_describe_screen": return svc.DescribeScreen(AsString(args["route"]) ?? "");
            case "mateu_run_action":
                return svc.RunAction(AsString(args["route"]) ?? "", AsString(args["actionId"]) ?? "", args["componentState"] as JsonObject);
            case "mateu_search":
                return svc.Search(AsString(args["route"]) ?? "", AsString(args["searchText"]), args["filters"] as JsonObject);
            case "mateu_list_components": return ComponentSchemas.List(AsString(args["query"]) ?? "");
            case "mateu_get_component_schema": return ComponentSchemas.SchemaOf(Argument(args, "type"));
            case "mateu_validate_uidl": return svc.Validate(Argument(args, "yaml"));
            case "mateu_preview_uidl": return svc.Preview(Argument(args, "yaml"), AsString(args["route"]) ?? "");
            case var push when McpPushTools.Names.Contains(push):
                if (svc.Push is null) throw new UserFacingException("Unknown tool: " + name);
                return McpPushTools.Dispatch(svc, svc.Push, name, args)!;
            case "mateu_save_spec":
                if (!devMode) throw new UserFacingException("Unknown tool: " + name);
                if (string.IsNullOrWhiteSpace(specsDir) || !Directory.Exists(specsDir))
                    throw new UserFacingException("No specs directory found (set " + SpecsDirSetting + ").");
                return svc.SaveSpec(Argument(args, "path"), Argument(args, "yaml"), specsDir);
            default:
                throw new UserFacingException("Unknown tool: " + name);
        }
    }

    /// <summary>A required string argument, or the caller's mistake.</summary>
    static string Argument(JsonObject args, string name) =>
        AsString(args[name]) ?? throw new UserFacingException("Missing argument " + UidlValidator.Quote(name) + ".");

    static string? AsString(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    /// <summary>The tool list — identical (names, descriptions, schemas, order) in the Java, .NET and
    /// Python backends and the sidecar; pinned by <c>conformance/mcp/authoring.json</c>.
    /// <c>mateu_save_spec</c> is listed only in development mode; the live UI push tools
    /// (<c>conformance/mcp/push.json</c>) only when push is on, after the base tools and before it.</summary>
    internal static JsonArray Tools(bool devMode, bool push = false)
    {
        var tools = new JsonArray(
            Tool("mateu_list_routes",
                "List the navigable routes of the Mateu app (derived from its menu). Returns [{route,"
                + " caption}].",
                ObjSchema()),
            Tool("mateu_describe_screen",
                "Load a screen by route and return a flat description an agent can act on: title,"
                + " fields (id, label, dataType, required, value, options), actions (id, label),"
                + " listing (if any), and the current state. Use route \"\" for the home screen.",
                ObjSchema(("route", "string", "route relative to the mount, \"\" = home")).Required("route")),
            Tool("mateu_run_action",
                "Run an action on a screen (an action id from mateu_describe_screen), optionally"
                + " seeding field values via componentState. Returns the resulting screen"
                + " projection (messages, navigation, new state).",
                ObjSchema(("route", "string", null), ("actionId", "string", null),
                    ("componentState", "object", "field id -> value; seeds/overrides form state")).Required("route", "actionId")),
            Tool("mateu_search",
                "Search a listing screen with free text (and optional filter values). Returns the"
                + " listing.",
                ObjSchema(("route", "string", null), ("searchText", "string", null), ("filters", "object", null)).Required("route")),
            Tool("mateu_list_components",
                "List the component types a YAML definition can use, each with a one-line description"
                + " and the names of its main attributes. Read mateu://guide first if you have not"
                + " authored Mateu YAML before.",
                ObjSchema(("query", "string", "optional: only the types whose name or description contains it"))),
            Tool("mateu_get_component_schema",
                "Return the JSON Schema of one component type: every key it accepts with its value"
                + " type, plus every definition it references (enums, nested records). A"
                + " #/$defs/Component reference means any component.",
                ObjSchema(("type", "string", "a component type (e.g. FormField) or any other schema definition")).Required("type")),
            Tool("mateu_validate_uidl",
                "Validate a YAML definition (a page, an app shell or any specs/ui file kind) without"
                + " rendering it. Returns {valid, kind, errors, warnings}; each issue has a code, a"
                + " message, a JSONPath and its line/column. Errors make the definition fail to"
                + " load; warnings are ignored keys, undeclared actions and references that do not"
                + " resolve.",
                ObjSchema(("yaml", "string", "the definition's YAML text")).Required("yaml")),
            Tool("mateu_preview_uidl",
                "Render a YAML page as the app would — layout only: no view model is bound and nothing"
                + " is saved — and return {rendered, screen, validation}: the screen projection"
                + " (title, fields, actions…) plus the validation report.",
                ObjSchema(("yaml", "string", "the page's YAML text"),
                    ("route", "string", "optional: the route to render it under (its access rules apply)")).Required("yaml")));
        if (push)
            foreach (var tool in McpPushTools.Tools()) tools.Add(tool);
        if (devMode)
            tools.Add(Tool("mateu_save_spec",
                "Development mode only: validate a YAML definition and, when it has no errors, write"
                + " it into the app's specs directory (path relative to it, e.g. customers.yaml"
                + " or partials/address.yaml); live reload shows it in the open browsers. Paths"
                + " outside the specs directory are refused.",
                ObjSchema(("path", "string", "relative to the specs directory, e.g. customers.yaml"),
                    ("yaml", "string", "the definition's YAML text")).Required("path", "yaml")));
        return tools;
    }

    static JsonObject Tool(string name, string description, JsonObject schema) =>
        new() { ["name"] = name, ["description"] = description, ["inputSchema"] = schema };

    static JsonObject ObjSchema(params (string Name, string Type, string? Description)[] properties)
    {
        var props = new JsonObject();
        foreach (var (name, type, description) in properties)
        {
            var p = new JsonObject { ["type"] = type };
            if (description is not null) p["description"] = description;
            props[name] = p;
        }
        return new JsonObject { ["type"] = "object", ["properties"] = props, ["additionalProperties"] = false };
    }

    static JsonObject Required(this JsonObject schema, params string[] names)
    {
        var required = new JsonArray();
        foreach (var n in names) required.Add(n);
        schema["required"] = required;
        return schema;
    }

    static JsonNode? Ok(JsonNode? id, JsonNode result)
    {
        if (id is null) return null;
        return new JsonObject { ["jsonrpc"] = "2.0", ["id"] = id.DeepClone(), ["result"] = result };
    }

    static JsonNode Err(JsonNode? id, int code, string message) =>
        new JsonObject
        {
            ["jsonrpc"] = "2.0",
            ["id"] = id?.DeepClone(),
            ["error"] = new JsonObject { ["code"] = code, ["message"] = message },
        };
}
