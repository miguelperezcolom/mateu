using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Core.Mcp;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Agent-operability plane (.NET). Pure projection tests (inline wire) — the C# twin of the
/// sidecar's projection.test.mjs and the Java McpProjectionTest — plus a projection over REAL .NET
/// wire that pins RBAC (an [EyesOnly] field never reaches an unauthorized agent) and the JSON-RPC
/// protocol surface. (P4, design/riu-agent-operability-plan.md.)
/// </summary>
public class McpTests
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    [UI("mcp-demo")]
    public class McpDemoForm
    {
        public string Name { get; set; } = "Ada";
        [EyesOnly(Roles = ["admin"])] public string Secret { get; set; } = "classified";
        [Button] public string Greet() => "done";
    }

    static McpService Service() => new(new SyncHandler(new MateuRegistry(typeof(McpDemoForm).Assembly)), Json);

    // ---- pure projection (inline wire) ----

    [Fact]
    public void Projects_title_fields_types_options_values()
    {
        var inc = JsonNode.Parse("""
        {"wireVersion":"3.0",
         "commands":[{"type":"SetWindowTitle","data":"Simple form"}],
         "fragments":[{"component":{"type":"ServerSide","route":"_empty","serverSideType":"com.acme.F","pageType":"form",
           "children":[
             {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"name","label":"Name","dataType":"string","required":true}},
             {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"colour","label":"Colour","stereotype":"select",
               "options":[{"value":"red","label":"red"},{"value":"green","label":"green"}]}}
           ]},
           "state":{"name":"Ada","colour":"green"}}]}
        """);
        var s = McpProjection.Project(inc);
        Assert.Equal("Simple form", (string?)s["title"]);
        Assert.Equal("", (string?)s["route"]); // _empty normalised
        Assert.Equal("3.0", (string?)s["wireVersion"]);
        var byId = s["fields"]!.AsArray().ToDictionary(f => (string?)f!["id"], f => f!.AsObject());
        Assert.Equal("string", (string?)byId["name"]["dataType"]);
        Assert.True((bool)byId["name"]["required"]!);
        Assert.Equal("Ada", (string?)byId["name"]["value"]);
        Assert.Equal("select", (string?)byId["colour"]["stereotype"]);
        Assert.Equal(2, byId["colour"]["options"]!.AsArray().Count);
    }

    [Fact]
    public void Actions_ids_from_serverside_labels_from_buttons()
    {
        var inc = JsonNode.Parse("""
        {"fragments":[{"component":{"type":"ServerSide","route":"editor","serverSideType":"com.acme.E",
          "actions":[{"id":"save","confirmationRequired":true,"shortcut":"ctrl+s"},{"id":"cancel"}],
          "children":[{"type":"ClientSide","metadata":{"type":"Button","actionId":"save","label":"Guardar"}}]},"state":{}}]}
        """);
        var s = McpProjection.Project(inc);
        var byId = s["actions"]!.AsArray().ToDictionary(a => (string?)a!["id"], a => a!.AsObject());
        Assert.Equal("Guardar", (string?)byId["save"]["label"]);
        Assert.Equal("ctrl+s", (string?)byId["save"]["shortcut"]);
        Assert.True((bool)byId["save"]["confirmationRequired"]!);
        Assert.Equal("cancel", (string?)byId["cancel"]["label"]);
    }

    [Fact]
    public void Crudl_projects_columns_searchable_filters()
    {
        var inc = JsonNode.Parse("""
        {"fragments":[{"component":{"type":"ServerSide","route":"products","serverSideType":"com.acme.P",
          "children":[{"type":"ClientSide","metadata":{"type":"Crudl","title":"Products","searchable":true,
            "columns":[{"metadata":{"id":"name","caption":"Name"}},{"metadata":{"id":"price","caption":"Price"}}],
            "filters":[{"fieldId":"category","label":"Category","dataType":"string"}]}}]}}]}
        """);
        var s = McpProjection.Project(inc);
        Assert.True((bool)s["listing"]!["searchable"]!);
        Assert.Equal(new[] { "name", "price" }, s["listing"]!["columns"]!.AsArray().Select(c => (string?)c!["id"]).ToArray());
        Assert.Equal("category", (string?)s["listing"]!["filters"]![0]!["id"]);
    }

    [Fact]
    public void Navigation_commands_surfaced()
    {
        var s = McpProjection.Project(JsonNode.Parse("""
        {"commands":[{"type":"navigateTo","data":"/thanks"},{"type":"SetWindowTitle","data":"x"}],"fragments":[]}
        """));
        Assert.Single(s["commands"]!.AsArray());
        Assert.Equal("navigateTo", (string?)s["commands"]![0]!["type"]);
    }

    [Fact]
    public void Empty_increment_does_not_throw()
    {
        var s = McpProjection.Project(new JsonObject());
        Assert.Empty(s["fields"]!.AsArray());
        Assert.Empty(s["actions"]!.AsArray());
    }

    [Fact]
    public void Normalize_route()
    {
        Assert.Equal("", McpProjection.NormalizeRoute("_empty"));
        Assert.Equal("products", McpProjection.NormalizeRoute("/products"));
        Assert.Equal("", McpProjection.NormalizeRoute(null));
    }

    // ---- projection over REAL .NET wire (RBAC + parity) ----

    [Fact]
    public void Projection_over_real_wire_hides_eyesonly_and_keeps_fields_and_action()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(McpDemoForm).Assembly));
        var increment = handler.Handle(new RunActionRqDto { ServerSideType = typeof(McpDemoForm).FullName });
        var node = JsonSerializer.SerializeToNode(increment, Json);
        var screen = McpProjection.Project(node);
        var ids = screen["fields"]!.AsArray().Select(f => (string?)f!["id"]).ToList();
        Assert.Contains("name", ids);
        Assert.DoesNotContain("secret", ids); // [EyesOnly] never reaches an unauthorized agent
        var actionIds = screen["actions"]!.AsArray().Select(a => (string?)a!["id"]).ToList();
        Assert.Contains("greet", actionIds);
    }

    // ---- JSON-RPC protocol ----

    [Fact]
    public void JsonRpc_initialize()
    {
        var r = McpJsonRpc.Handle(new JsonObject { ["id"] = 1, ["method"] = "initialize" }, Service());
        Assert.Equal("mateu-mcp", (string?)r!["result"]!["serverInfo"]!["name"]);
        Assert.False(string.IsNullOrEmpty((string?)r["result"]!["protocolVersion"]));
    }

    [Fact]
    public void JsonRpc_tools_list()
    {
        var r = McpJsonRpc.Handle(new JsonObject { ["id"] = 2, ["method"] = "tools/list" }, Service());
        var names = r!["result"]!["tools"]!.AsArray().Select(t => (string?)t!["name"]).OrderBy(x => x).ToArray();
        Assert.Equal(new[] { "mateu_describe_screen", "mateu_list_routes", "mateu_run_action", "mateu_search" }, names);
    }

    [Fact]
    public void JsonRpc_notification_yields_null()
    {
        Assert.Null(McpJsonRpc.Handle(new JsonObject { ["method"] = "notifications/initialized" }, Service()));
    }

    [Fact]
    public void JsonRpc_unknown_method_yields_32601()
    {
        var r = McpJsonRpc.Handle(new JsonObject { ["id"] = 9, ["method"] = "nope/nope" }, Service());
        Assert.Equal(-32601, (int)r!["error"]!["code"]!);
    }
}
