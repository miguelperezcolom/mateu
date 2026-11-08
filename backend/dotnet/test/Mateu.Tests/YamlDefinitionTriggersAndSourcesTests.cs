using System.Net;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A definition-only page's <c>triggers:</c> and its PROXIED reads — the rest of Java's
/// <c>SeededYamlPage</c> (mirrors Java's YamlDeclaredTriggersSyncTest and
/// SeededYamlPageRestSourcesTest, and Python's test_yaml_definition_triggers_and_sources.py): the
/// declared triggers reach the wire as Java's TriggerMapper emits them, and a listing's rows / a
/// select's options read off a keyed catalogue entry are fetched by the server through
/// <c>__restfetch__</c> (the source resolved off the catalogue <c>ref</c>, <c>${secret.X}</c> from the
/// secrets provider) — never from a client url, never a direct source on request.
/// </summary>
public class YamlDefinitionTriggersAndSourcesTests
{
    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-triggers-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: watch
                layout: watch.yaml
              - route: products
                layout: products.yaml
              - route: about
                layout: about.yaml
              - route: catalogue
                layout: catalogue.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "catalogue.yaml"), """
            type: Listing
            title: Catalogue
            rowsSource: {ref: products}
            columns:
              - {type: GridColumn, id: name, label: Name}
            """);
        File.WriteAllText(Path.Combine(dir, "sources.yaml"), """
            sources:
              - name: products
                source:
                  url: https://api.test/products
                  proxy: true
                  headers: {X-Api-Key: "${secret.API_KEY}"}
              - name: categories
                source:
                  url: https://api.test/categories
                  proxy: true
                  headers: {X-Api-Key: "${secret.API_KEY}"}
              - name: open
                source:
                  url: https://api.test/open
            """);
        File.WriteAllText(Path.Combine(dir, "watch.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - {type: FormField, id: amount, label: Amount}
            triggers:
              - {type: OnLoadTrigger, actionId: preload}
              - {type: OnCustomEventTrigger, actionId: refresh, eventName: something-happened}
              - {type: OnValueChangeTrigger, actionId: recompute, propertyName: amount}
              - {type: AutoSaveTrigger, actionId: save, debounceMillis: 300}
              - {type: NoSuchTrigger, actionId: lost}
              - {type: OnCustomEventTrigger, actionId: lost, eventName: x, source: NOWHERE}
            """);
        File.WriteAllText(Path.Combine(dir, "products.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - {type: FormField, id: category, label: Category, stereotype: select, optionsSource: {ref: categories}}
                - {type: FormField, id: other, label: Other, stereotype: select, optionsSource: {ref: open}}
                - type: Listing
                  title: Products
                  rowsSource: {ref: products}
                  columns:
                    - {type: GridColumn, id: name, label: Name}
            """);
        File.WriteAllText(Path.Combine(dir, "about.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - {type: Text, text: About}
            """);
        return dir;
    }

    private static readonly string Dir = Specs();

    private sealed class RecordingHttp : HttpMessageHandler
    {
        public HttpRequestMessage? Last;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Last = request;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"items\":[]}") });
        }
    }

    private static SyncHandler Handler(HttpClient? http = null) =>
        new(new MateuRegistry(typeof(YamlDefinitionTriggersAndSourcesTests).Assembly),
            secrets: name => "k-" + name, http: http, specsDir: Dir);

    private static ServerSideComponentDto Load(string route) =>
        Assert.IsType<ServerSideComponentDto>(Handler()
            .Handle(new RunActionRqDto { Route = route, ConsumedRoute = "_empty" }).Fragments[0].Component);

    private static JsonElement Triggers(ServerSideComponentDto page) =>
        JsonDocument.Parse(JsonSerializer.Serialize(page.Triggers, new JsonSerializerOptions(JsonSerializerDefaults.Web)))
            .RootElement;

    [Fact]
    public void A_page_declaring_triggers_is_a_server_side_component_carrying_them()
    {
        var triggers = Triggers(Load("/watch")).EnumerateArray().ToList();
        // the unparseable ones (unknown type, unknown source) are dropped, the rest kept in order
        Assert.Equal(["preload", "refresh", "recompute", "save"],
            triggers.Select(t => t.GetProperty("actionId").GetString()));
        Assert.Equal("OnLoad", triggers[0].GetProperty("type").GetString());
        Assert.Equal("something-happened", triggers[1].GetProperty("eventName").GetString());
        // a YAML custom-event trigger without a source listens on itself, as Java's record defaults
        Assert.Equal("SELF", triggers[1].GetProperty("source").GetString());
        Assert.Equal("amount", triggers[2].GetProperty("propertyName").GetString());
        Assert.Equal(300, triggers[3].GetProperty("debounceMillis").GetInt32());
        // triggers alone claim no action
        Assert.Empty(Load("/watch").Actions);
    }

    [Fact]
    public void A_page_without_declared_triggers_keeps_its_bare_layout()
    {
        var component = Handler().Handle(new RunActionRqDto { Route = "/about", ConsumedRoute = "_empty" })
            .Fragments[0].Component;
        Assert.IsNotType<ServerSideComponentDto>(component);
    }

    [Fact]
    public void A_proxied_listing_or_select_makes_the_page_answer_restfetch()
    {
        var page = Load("/products");
        Assert.Equal(["__restfetch__"], page.Actions.Select(a => a.Id));
        Assert.Equal("form", page.PageType);
        var json = JsonSerializer.Serialize(page, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        Assert.DoesNotContain("API_KEY", json);
        Assert.DoesNotContain("X-Api-Key", json);
    }

    [Fact]
    public void A_listing_page_served_for_its_proxied_rows_is_a_collection()
    {
        var page = Load("/catalogue");
        Assert.Equal("collection", page.PageType);
        Assert.Equal(["__restfetch__"], page.Actions.Select(a => a.Id));
    }

    [Fact]
    public async Task The_listings_rows_are_fetched_by_the_server_with_the_secret()
    {
        var http = new RecordingHttp();
        var answer = await Handler(new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "/products",
            ActionId = "__restfetch__",
            // a listing with no id is named like the listing mapper's default
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "rows", ["_sourceId"] = "crud" },
        });
        Assert.Equal("https://api.test/products", http.Last!.RequestUri!.ToString());
        Assert.Equal("k-API_KEY", http.Last.Headers.GetValues("X-Api-Key").Single());
        Assert.Contains("items", JsonSerializer.Serialize(answer.AppData));
    }

    [Fact]
    public async Task A_selects_options_are_fetched_by_the_fields_id()
    {
        var http = new RecordingHttp();
        await Handler(new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "/products",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "options", ["_sourceId"] = "category" },
        });
        Assert.Equal("https://api.test/categories", http.Last!.RequestUri!.ToString());
        Assert.Equal("k-API_KEY", http.Last.Headers.GetValues("X-Api-Key").Single());
    }

    [Fact]
    public async Task A_direct_source_is_not_proxied_on_request()
    {
        await Assert.ThrowsAsync<MateuForbiddenException>(() => Handler().HandleAsync(new RunActionRqDto
        {
            Route = "/products",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "options", ["_sourceId"] = "other" },
        }));
    }

    [Fact]
    public async Task An_undeclared_source_fetches_nothing()
    {
        var http = new RecordingHttp();
        var answer = await Handler(new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "/products",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "options", ["_sourceId"] = "nope" },
        });
        Assert.Null(http.Last);
        Assert.Equal("{\"_restfetch\":{}}", JsonSerializer.Serialize(answer.AppData));
    }
}
