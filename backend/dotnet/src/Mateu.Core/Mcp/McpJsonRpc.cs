using System.Text.Json.Nodes;

namespace Mateu.Core.Mcp;

/// <summary>
/// Minimal Model Context Protocol handler (JSON-RPC 2.0) for the native endpoint. Mirrors the
/// sidecar's index.mjs exactly (same protocol version + same 4 tools) so an agent sees the same
/// surface whether it talks to the sidecar or to a Mateu backend directly. C# mirror of the Java
/// McpJsonRpc.
/// </summary>
public static class McpJsonRpc
{
    public const string ProtocolVersion = "2024-11-05";
    public const string ServerName = "mateu-mcp";
    public const string ServerVersion = "0.1.0";

    /// <summary>Handle one JSON-RPC message. Returns the response node, or null for a notification.</summary>
    public static JsonNode? Handle(JsonNode? message, McpService svc)
    {
        var msg = message as JsonObject ?? new JsonObject();
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
                        ["capabilities"] = new JsonObject { ["tools"] = new JsonObject() },
                        ["serverInfo"] = new JsonObject { ["name"] = ServerName, ["version"] = ServerVersion },
                    });
                case "notifications/initialized":
                case "initialized":
                    return null;
                case "ping":
                    return Ok(idNode, new JsonObject());
                case "tools/list":
                    return Ok(idNode, new JsonObject { ["tools"] = Tools() });
                case "tools/call":
                {
                    var pars = msg["params"] as JsonObject ?? new JsonObject();
                    var data = Dispatch(svc, AsString(pars["name"]) ?? "", pars["arguments"] as JsonObject ?? new JsonObject());
                    return Ok(idNode, new JsonObject
                    {
                        ["content"] = new JsonArray(new JsonObject { ["type"] = "text", ["text"] = data.ToJsonString() }),
                    });
                }
                default:
                    return isNotification ? null : Err(idNode, -32601, $"Method not found: {method}");
            }
        }
        catch (Exception e)
        {
            if (isNotification) return null;
            if (method == "tools/call")
                return Ok(idNode, new JsonObject
                {
                    ["isError"] = true,
                    ["content"] = new JsonArray(new JsonObject { ["type"] = "text", ["text"] = "Error: " + e.Message }),
                });
            return Err(idNode, -32603, e.Message);
        }
    }

    static JsonNode Dispatch(McpService svc, string name, JsonObject args) => name switch
    {
        "mateu_list_routes" => svc.ListRoutes(),
        "mateu_describe_screen" => svc.DescribeScreen(AsString(args["route"]) ?? ""),
        "mateu_run_action" => svc.RunAction(AsString(args["route"]) ?? "", AsString(args["actionId"]) ?? "", args["componentState"] as JsonObject),
        "mateu_search" => svc.Search(AsString(args["route"]) ?? "", AsString(args["searchText"]), args["filters"] as JsonObject),
        _ => throw new ArgumentException($"Unknown tool: {name}"),
    };

    static string? AsString(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    static JsonArray Tools() => new(
        Tool("mateu_list_routes",
            "List the navigable routes of the Mateu app (from its menu). Returns [{route, caption}].",
            new JsonObject { ["type"] = "object", ["properties"] = new JsonObject() }),
        Tool("mateu_describe_screen",
            "Load a screen by route and return a flat description: title, fields (id, label, dataType, "
            + "required, value, options), actions (id, label), listing (if any), and current state.",
            new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject { ["route"] = StrProp("route relative to the mount, \"\" = home") },
                ["required"] = new JsonArray("route"),
            }),
        Tool("mateu_run_action",
            "Run an action id (optionally seeding field values via componentState). Returns the resulting screen.",
            new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject
                {
                    ["route"] = StrProp(null),
                    ["actionId"] = StrProp(null),
                    ["componentState"] = new JsonObject { ["type"] = "object" },
                },
                ["required"] = new JsonArray("route", "actionId"),
            }),
        Tool("mateu_search",
            "Search a listing screen by free text (and optional filters). Returns the listing.",
            new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject
                {
                    ["route"] = StrProp(null),
                    ["searchText"] = StrProp(null),
                    ["filters"] = new JsonObject { ["type"] = "object" },
                },
                ["required"] = new JsonArray("route"),
            }));

    static JsonObject Tool(string name, string description, JsonObject schema) =>
        new() { ["name"] = name, ["description"] = description, ["inputSchema"] = schema };

    static JsonObject StrProp(string? description)
    {
        var p = new JsonObject { ["type"] = "string" };
        if (description is not null) p["description"] = description;
        return p;
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
