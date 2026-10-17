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

    public record McpBook(string Id, string Title);

    [UI("mcp-books"), Title("Books")]
    public class McpBooks : IListing<McpBook>, Mateu.Uidl.ISearchable
    {
        public ListingData<McpBook> Search(SearchRequest request) =>
            ListingData.From(new[] { new McpBook("b1", "El Quijote"), new McpBook("b2", "Rayuela") }
                .Where(b => b.Title.Contains(request.SearchText ?? "")).ToList());
    }

    [UI("mcp-restricted"), Title("Restricted")]
    public class McpRestrictedForm
    {
        public string Name { get; set; } = "Ada";
        [Button] public string Greet() => "done";
        [Button("Purge everything"), EyesOnly(Roles = ["admin"])] public string Purge() => "purged";
        [Fab("vaadin:bomb"), EyesOnly(Roles = ["admin"])] public string Detonate() => "boom";
    }

    [UI("mcp-restricted-books"), Title("Restricted books")]
    public class McpRestrictedBooks : IListing<McpBook>, IDeletable<string>
    {
        public ListingData<McpBook> Search(SearchRequest request) =>
            ListingData.From(new List<McpBook> { new("b1", "El Quijote") });

        public void DeleteAllById(IReadOnlyList<string> selectedIds) { }

        [ListToolbarButton, Label("Archive selected"), EyesOnly(Roles = ["admin"])]
        public void Archive(List<McpBook> selection) { }
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
        var byId = s["fields"]!.AsArray().ToDictionary(f => (string)f!["id"]!, f => f!.AsObject());
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
        var byId = s["actions"]!.AsArray().ToDictionary(a => (string)a!["id"]!, a => a!.AsObject());
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
          "children":[{"type":"ClientSide","metadata":{"type":"Crud","title":"Products","searchable":true,
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
    public void A_message_keeps_its_severity_and_title()
    {
        // the wire's message carries "variant", not "type": every error used to project as "info"
        var s = McpProjection.Project(JsonNode.Parse("""
        {"messages":[{"variant":"error","title":"Something went wrong","text":"Reference: abc"},{"text":"plain"}]}
        """));
        Assert.Equal("error", (string?)s["messages"]![0]!["type"]);
        Assert.Equal("Something went wrong", (string?)s["messages"]![0]!["title"]);
        Assert.Equal("info", (string?)s["messages"]![1]!["type"]);
        Assert.Null(s["messages"]![1]!["title"]);
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

    [Fact]
    public void A_listing_is_projected_and_a_search_filters_and_answers_its_rows()
    {
        var mcp = Service();
        var screen = mcp.DescribeScreen("mcp-books");
        Assert.True((bool)screen["listing"]!["searchable"]!); // the wire type is "Crud"

        var found = mcp.Search("mcp-books", "Ray", null);
        var rows = found["listing"]!["rows"]!.AsArray();
        Assert.Equal(new[] { "Rayuela" }, rows.Select(r => (string?)r!["title"]).ToArray());
        Assert.False(rows[0]!.AsObject().ContainsKey("_rowNumber"));
        Assert.Equal(1, (int)found["listing"]!["totalElements"]!);

        Assert.Equal(2, mcp.Search("mcp-books", "", null)["listing"]!["rows"]!.AsArray().Count);
    }

    static McpService ServiceAs(Identity? identity) =>
        new(new SyncHandler(new MateuRegistry(typeof(McpDemoForm).Assembly), null, () => identity), Json);

    [Fact]
    public void An_eyesonly_action_is_not_advertised_to_a_caller_who_may_not_run_it()
    {
        var anonymous = ServiceAs(null).DescribeScreen("mcp-restricted").ToJsonString();
        Assert.Contains("greet", anonymous);
        Assert.DoesNotContain("purge", anonymous);
        Assert.DoesNotContain("Purge everything", anonymous);
        Assert.DoesNotContain("detonate", anonymous);
        var listing = ServiceAs(null).DescribeScreen("mcp-restricted-books").ToJsonString();
        Assert.DoesNotContain("archive", listing);
        Assert.DoesNotContain("Archive selected", listing);

        var admin = ServiceAs(new Identity(Roles: ["admin"]));
        Assert.Contains("Purge everything", admin.DescribeScreen("mcp-restricted").ToJsonString());
        Assert.Contains("Archive selected", admin.DescribeScreen("mcp-restricted-books").ToJsonString());
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

    // ---- the tools over a real app (what an agent drives) ----

    public class McpOrders
    {
        public string Note { get; set; } = "orders";
    }

    public class McpInvoices
    {
        public string Note { get; set; } = "invoices";
    }

    /// <summary>An app whose menu is what mateu_list_routes reports.</summary>
    [App("Mcp App")]
    public class McpApp
    {
        [MenuItem("Orders")] public McpOrders Orders() => new();
        [MenuItem("Invoices", Group = "Billing")] public McpInvoices Invoices() => new();
    }

    public class McpBookFilters
    {
        public string? Title { get; set; }
    }

    [UI("mcp-books"), Title("Books")]
    public class McpBooks : IListing<CapBook>, Mateu.Uidl.ISearchable, IFilterable<McpBookFilters>
    {
        public static readonly System.Collections.Concurrent.ConcurrentQueue<(string? text, string? title)> Seen = new();

        public ListingData<CapBook> Search(SearchRequest request)
        {
            var filters = request.Filters<McpBookFilters>() ?? new McpBookFilters();
            Seen.Enqueue((request.SearchText, filters.Title));
            return ListingData.From(CapBooks.All().Where(b => filters.Title is null || b.Title.Contains(filters.Title)));
        }
    }

    [UI("mcp-failing")]
    public class McpFailing
    {
        public string Name { get; set; } = "x";
        [Button] public string Explode() => throw new InvalidOperationException("boom");
    }

    static readonly SyncHandler Shared = new(new MateuRegistry(typeof(McpDemoForm).Assembly));

    // The root of the test assembly is whichever [App] the scan met last, so the root load is pinned
    // to McpApp the way a single-app deployment resolves it.
    static McpService AppService() => new(Shared, Json, null,
        rq => Shared.Handle(rq.Route is null or "" ? rq with { ServerSideType = typeof(McpApp).FullName } : rq));

    [Fact]
    public void List_routes_reports_every_menu_leaf_with_its_caption_once_and_the_home()
    {
        var routes = AppService().ListRoutes().Select(r => ((string?)r!["route"], (string?)r["caption"])).ToList();
        Assert.Contains(routes, r => r.Item2 == "Orders");
        Assert.Contains(routes, r => r.Item2 == "Invoices");
        Assert.Contains(("", "Home"), routes);
        Assert.Equal(routes.Count, routes.Select(r => r.Item1).Distinct().Count());
        Assert.All(routes, r => Assert.False(r.Item1!.StartsWith('/')));
    }

    [Fact]
    public void Tools_call_list_routes_answers_the_routes_as_text_content()
    {
        var r = McpJsonRpc.Handle(new JsonObject
        {
            ["id"] = 3, ["method"] = "tools/call",
            ["params"] = new JsonObject { ["name"] = "mateu_list_routes" },
        }, AppService());
        var text = (string?)r!["result"]!["content"]![0]!["text"];
        Assert.Contains("Orders", text);
        Assert.Null(r["result"]!["isError"]);
    }

    [Fact]
    public void Search_sends_the_text_and_the_filters_to_the_listing()
    {
        var screen = McpJsonRpc.Handle(new JsonObject
        {
            ["id"] = 4, ["method"] = "tools/call",
            ["params"] = new JsonObject
            {
                ["name"] = "mateu_search",
                ["arguments"] = new JsonObject
                {
                    ["route"] = "/mcp-books", ["searchText"] = "Quijote",
                    ["filters"] = new JsonObject { ["title"] = "Quij" },
                },
            },
        }, Service());
        Assert.Null(screen!["result"]!["isError"]);
        Assert.Contains(McpBooks.Seen, s => s.text == "Quijote" && s.title == "Quij");
    }

    [Fact]
    public void Search_without_text_sends_no_search_text()
    {
        var before = McpBooks.Seen.Count;
        Service().Search("mcp-books", null, null);
        Assert.Contains(McpBooks.Seen.Skip(before), s => string.IsNullOrEmpty(s.text) && s.title is null);
    }

    [Fact]
    public void Run_action_seeds_the_component_state_before_running()
    {
        var screen = Service().RunAction("mcp-demo", "greet", new JsonObject { ["name"] = "Grace" });
        Assert.NotNull(screen["fields"]);
        var described = Service().DescribeScreen("/mcp-demo");
        Assert.Equal("Ada", (string?)described["fields"]!.AsArray().First(f => (string?)f!["id"] == "name")!["value"]);
    }

    [Fact]
    public void A_failing_tool_call_is_a_tool_error_not_a_protocol_error()
    {
        var r = McpJsonRpc.Handle(new JsonObject
        {
            ["id"] = 5, ["method"] = "tools/call",
            ["params"] = new JsonObject { ["name"] = "mateu_run_action", ["arguments"] = new JsonObject { ["route"] = "mcp-failing", ["actionId"] = "explode" } },
        }, Service());
        Assert.True((bool)r!["result"]!["isError"]!);
        Assert.StartsWith("Error: ", (string?)r["result"]!["content"]![0]!["text"]);
        Assert.Null(r["error"]);
    }

    [Fact]
    public void An_unknown_tool_is_a_tool_error()
    {
        var r = McpJsonRpc.Handle(new JsonObject
        {
            ["id"] = 6, ["method"] = "tools/call", ["params"] = new JsonObject { ["name"] = "mateu_nope" },
        }, Service());
        Assert.True((bool)r!["result"]!["isError"]!);
        Assert.Contains("Unknown tool: mateu_nope", (string?)r["result"]!["content"]![0]!["text"]);
    }

    [Fact]
    public void A_failing_notification_answers_nothing()
    {
        Assert.Null(McpJsonRpc.Handle(new JsonObject
        {
            ["method"] = "tools/call", ["params"] = new JsonObject { ["name"] = "mateu_nope" },
        }, Service()));
        Assert.Null(McpJsonRpc.Handle(new JsonObject { ["method"] = "nope/nope" }, Service()));
    }

    [Fact]
    public void Ping_answers_an_empty_result_and_a_non_object_message_is_method_not_found()
    {
        var ping = McpJsonRpc.Handle(new JsonObject { ["id"] = "p", ["method"] = "ping" }, Service());
        Assert.Equal("p", (string?)ping!["id"]);
        Assert.Empty(ping["result"]!.AsObject());
        Assert.Null(McpJsonRpc.Handle(JsonValue.Create(3), Service()));
    }

    [Fact]
    public void The_hosts_run_delegate_is_what_a_tool_call_goes_through()
    {
        RunActionRqDto? seen = null;
        var svc = new McpService(Shared, Json, "/base", rq => { seen = rq; return Shared.Handle(rq); });
        svc.DescribeScreen("mcp-demo");
        Assert.Equal("/mcp-demo", seen!.Route);
        Assert.Equal("", seen.ActionId);
        svc.DescribeScreen("");
        Assert.Equal("", seen.Route);
    }

    // ---- projection details an agent depends on ----

    [Fact]
    public void A_button_the_component_does_not_declare_is_still_an_action_and_links_keep_their_href()
    {
        var s = McpProjection.Project(JsonNode.Parse("""
        {"fragments":[{"component":{"type":"ServerSide","route":"/p","serverSideType":"P",
          "actions":[{"id":"docs","href":"https://docs.example.com"},{"id":"docs"},{"label":"no id"}],
          "children":[
            {"type":"ClientSide","metadata":{"type":"Button","actionId":"export"}},
            {"type":"ClientSide","metadata":{"type":"Button","actionId":"export","label":"Twice"}},
            {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"size","options":[{"value":3},{"value":"m","label":"Medium"}]}},
            {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"size","label":"dup"}},
            {"type":"ClientSide","metadata":{"type":"Page","pageTitle":"Settings","subtitle":"Yours","pageType":"form"}}
          ]},"state":{"size":"m"}}]}
        """));
        var byId = s["actions"]!.AsArray().ToDictionary(a => (string)a!["id"]!, a => a!.AsObject());
        Assert.Equal(2, byId.Count);
        Assert.Equal("https://docs.example.com", (string?)byId["docs"]["href"]);
        Assert.Equal("export", (string?)byId["export"]["label"]); // the first button wins, its id is its label
        var field = Assert.Single(s["fields"]!.AsArray());
        Assert.Equal("size", (string?)field!["label"]);
        Assert.Equal("m", (string?)field["value"]);
        Assert.Equal("3", (string?)field["options"]![0]!["label"]);
        Assert.Equal("Settings", (string?)s["title"]);
        Assert.Equal("Yours", (string?)s["subtitle"]);
        Assert.Equal("form", (string?)s["pageType"]);
        Assert.Equal("p", (string?)s["route"]);
    }

    [Fact]
    public void A_listing_titles_the_screen_and_its_columns_may_be_flat()
    {
        var s = McpProjection.Project(JsonNode.Parse("""
        {"fragments":[{"component":{"type":"ServerSide","initialData":{"q":"x"},"children":[{"type":"ClientSide","metadata":{"type":"Crudl",
          "title":"Orders","subtitle":"All of them",
          "columns":[{"fieldId":"ref","label":"Reference"},{"metadata":{}},{"id":"total"}],
          "filters":[{"fieldId":"status"},"junk"]}}]}}],
          "commands":[{"type":"pushStateToHistory","data":"/orders"},{"data":"untyped"}]}
        """));
        Assert.Equal("Orders", (string?)s["title"]);
        Assert.Equal("All of them", (string?)s["subtitle"]);
        Assert.Equal("x", (string?)s["state"]!["q"]);
        var columns = s["listing"]!["columns"]!.AsArray();
        Assert.Equal(["ref", "total"], columns.Select(c => (string)c!["id"]!).ToArray());
        Assert.Equal("Reference", (string?)columns[0]!["label"]);
        var filter = Assert.Single(s["listing"]!["filters"]!.AsArray());
        Assert.Equal("status", (string?)filter!["label"]);
        Assert.Equal("string", (string?)filter["dataType"]);
        Assert.Equal("pushStateToHistory", (string?)Assert.Single(s["commands"]!.AsArray())!["type"]);
        Assert.Empty(McpProjection.Project(JsonValue.Create(1))["fields"]!.AsArray());
    }
}
