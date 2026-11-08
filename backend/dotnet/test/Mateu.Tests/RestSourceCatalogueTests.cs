using System.Net;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>Holds [RestSource] declarations WITHOUT being a registered view, so they never reach the
/// catalogue of the other suites' handlers; the tests pass it to the registry explicitly.</summary>
[RestSource("countries", "https://example.com/countries", ValuePath = "code", Description = "declared")]
[RestSource("invoices", "/api/invoices", Headers = ["Authorization: Bearer ${secret.TOKEN}"],
    Fields = ["customerName=customer.name", "total = amounts.total"], TotalPath = "meta.total",
    Provenance = RestSourceProvenance.Existing, ItemsPath = "items")]
public class DeclaredSources;

/// <summary>Contributes catalogue entries only inside a test flow that switched it on (an AsyncLocal),
/// so the type — discovered by every handler that scans this assembly — leaks nothing elsewhere.</summary>
public class TestSourceSupplier : IRestSourceCatalogSupplier
{
    public static readonly AsyncLocal<bool> Enabled = new();

    public IReadOnlyList<RestSourceEntry> RestSources() => Enabled.Value
        ? [new RestSourceEntry("countries", new RestDataSource { Url = "https://config.example.com/countries" })]
        : [];
}

[UI("by-ref-sources"), Title("By reference")]
public class ByRefSourcesView
{
    [RestOptions(Source = "partners")] public string? Partner { get; set; }
    [RestOptions(Source = "countries", LabelPath = "name.official")] public string? Country { get; set; }
    [RestOptions("https://inline.example.com/x")] public string? Inline { get; set; }

    [Button, RestAction(Source = "invoices")] public void Pay() { }
}

[UI("supplied-sources"), Title("Supplied")]
public class SuppliedSourcesView : IRestSourceSupplier
{
    public string? Tag { get; set; }

    public IReadOnlyList<DeclaredRestSource> DeclaredRestSources() =>
    [
        new(RestSourceKind.Options, "tag",
            new RestDataSource { Url = "https://tags.example.com/all?key=${secret.TAGS_KEY}", Proxy = true }),
        new(RestSourceKind.Data, RestDataSource.OfRef("partners")),
    ];
}

/// <summary>A proxied per-row write: a bulk action runs it once per selected row (forEachSelectedRow).</summary>
[UI("bulk-delete-sources"), Title("Bulk")]
public class BulkDeleteSourcesView : IRestSourceSupplier
{
    public IReadOnlyList<DeclaredRestSource> DeclaredRestSources() =>
    [
        new(RestSourceKind.Action, "delete",
            new RestDataSource { Url = "https://api.example.com/people/${state.id}", Method = "DELETE", Proxy = true }),
    ];
}

/// <summary>A proxied source with a RELATIVE url: this app's own endpoint.</summary>
[UI("relative-proxy-sources"), Title("Relative")]
public class RelativeProxySourcesView : IRestSourceSupplier
{
    public IReadOnlyList<DeclaredRestSource> DeclaredRestSources() =>
    [
        new(RestSourceKind.Action, "person",
            new RestDataSource { Url = "/api/people/${state.id}", Proxy = true }),
    ];
}

/// <summary>A listing AND a live board, both proxied ROWS sources: the board's fetch names its id.</summary>
public class TwoRowsSourcesView : IRestSourceSupplier
{
    public IReadOnlyList<DeclaredRestSource> DeclaredRestSources() =>
    [
        new(RestSourceKind.Rows, "listing", new RestDataSource { Url = "https://api.example.com/listing", Proxy = true }),
        new(RestSourceKind.Rows, "board", new RestDataSource { Url = "https://api.example.com/board", Proxy = true }),
    ];
}

public class RestSourceCatalogueTests
{
    [Fact]
    public void A_rows_fetch_names_its_source_when_a_page_has_two()
    {
        // the one NAMED first (mirrors Java RestSourceResolver): the board got the listing's rows
        var view = new TwoRowsSourcesView();
        Assert.Equal("https://api.example.com/board",
            ReflectionMapper.ResolveRestSource(typeof(TwoRowsSourcesView), view, "rows", "board")!.Url);
        Assert.Equal("https://api.example.com/listing",
            ReflectionMapper.ResolveRestSource(typeof(TwoRowsSourcesView), view, "rows", "")!.Url);
    }

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Dir = Path.Combine(AppContext.BaseDirectory, "catalogue-specs");

    private static RestSourceCatalog Authored() => RestSourceRegistry.AuthoredFrom(Dir);

    [Fact]
    public void A_RestSource_attribute_becomes_an_entry()
    {
        var catalog = RestSourceRegistry.DerivedFrom([typeof(DeclaredSources)], []);
        var invoices = catalog.Get("invoices")!;
        Assert.Equal("/api/invoices", invoices.Source.Url);
        Assert.Equal("Bearer ${secret.TOKEN}", invoices.Source.Headers!["Authorization"]);
        Assert.Equal("customer.name", invoices.Fields["customerName"]);
        Assert.Equal("amounts.total", invoices.PathOf("total"));
        Assert.Equal("untouched", invoices.PathOf("untouched"));
        Assert.Equal("meta.total", invoices.TotalPath);
        // a declared provenance wins over the url inference
        Assert.Equal(RestSourceProvenance.Existing, invoices.EffectiveProvenance());
        // auto: another origin is somebody else's
        Assert.Equal(RestSourceProvenance.Existing, catalog.Get("countries")!.EffectiveProvenance());
    }

    [Fact]
    public void The_authored_file_nests_the_request_under_source()
    {
        var catalog = Authored();
        Assert.Equal(["countries", "orders", "partners"], catalog.Sources.Select(e => e.Name));
        var orders = catalog.Get("orders")!;
        Assert.Equal("/api/orders?since=${state.since}", orders.Source.Url);
        Assert.Equal("data", orders.Source.ItemsPath);
        Assert.Equal("GET", orders.Source.Method);
        Assert.Equal("customer.name", orders.Fields["customerName"]);
        Assert.Equal(RestSourceProvenance.Generate, orders.EffectiveProvenance());
        // an unknown provenance falls back to the inference
        Assert.Equal(RestSourceProvenance.Auto, catalog.Get("partners")!.Provenance);
        Assert.True(catalog.Get("partners")!.Source.Proxy);
        Assert.Equal(["orders"], catalog.ToImplement().Select(e => e.Name));
        Assert.Equal(["countries", "partners"], catalog.Consumed().Select(e => e.Name));
    }

    [Fact]
    public void Authored_wins_and_replaces_the_derived_entry_outright()
    {
        var merged = Authored().MergedOver(RestSourceRegistry.DerivedFrom([typeof(DeclaredSources)], []));
        var countries = merged.Get("countries")!;
        Assert.Equal("https://restcountries.com/v3.1/all?fields=cca2,name", countries.Source.Url);
        // replaced, not combined: nothing of the declared entry survives
        Assert.StartsWith("ISO country codes", countries.Description);
        Assert.Equal("cca2", countries.Source.ValuePath);
        // derived-only entries stay
        Assert.NotNull(merged.Get("invoices"));
    }

    [Fact]
    public void A_supplier_contributes_after_the_attributes_and_overrides_them()
    {
        TestSourceSupplier.Enabled.Value = true;
        var catalog = RestSourceRegistry.DerivedFrom([typeof(DeclaredSources)], [typeof(TestSourceSupplier)]);
        Assert.Equal("https://config.example.com/countries", catalog.Get("countries")!.Source.Url);
        TestSourceSupplier.Enabled.Value = false;
        Assert.Equal("https://example.com/countries",
            RestSourceRegistry.DerivedFrom([typeof(DeclaredSources)], [typeof(TestSourceSupplier)]).Get("countries")!.Source.Url);
    }

    [Fact]
    public void The_registry_scans_the_registered_classes_and_the_supplier_assemblies()
    {
        TestSourceSupplier.Enabled.Value = true;
        var registry = new RestSourceRegistry(new MateuRegistry(typeof(TestSourceSupplier).Assembly), Dir);
        // authored over the supplier's "countries"
        Assert.Equal("https://restcountries.com/v3.1/all?fields=cca2,name", registry.Catalog.Get("countries")!.Source.Url);
        TestSourceSupplier.Enabled.Value = false;
    }

    private static SyncHandler Handler(RestSourceCatalog catalog, HttpClient? http = null, Func<string, string?>? secrets = null) =>
        new(new MateuRegistry(typeof(ByRefSourcesView).Assembly), secrets: secrets, http: http,
            restSources: new RestSourceRegistry(catalog));

    [Fact]
    public void The_app_carries_the_catalogue_and_the_rest_sources_capability()
    {
        var json = JsonSerializer.Serialize(Handler(Authored()).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);
        Assert.Contains("\"restSources\":[{\"name\":\"countries\",\"source\":{\"url\":\"https://restcountries.com/v3.1/all?fields=cca2,name\"", json);
        Assert.Contains("\"name\":\"orders\"", json);
        Assert.Contains("\"fields\":{\"customerName\":\"customer.name\"},\"totalPath\":\"meta.total\",\"provenance\":\"generate\"", json);
        Assert.Contains("\"rest-sources\"", json);

        // no catalogue → neither the entries nor the token
        var bare = JsonSerializer.Serialize(Handler(RestSourceCatalog.Empty).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);
        Assert.Contains("\"restSources\":[]", bare);
        Assert.DoesNotContain("\"rest-sources\"", bare);
    }

    [Fact]
    public void A_page_with_no_app_shell_carries_the_catalogue_entries_it_references()
    {
        // the catalogue rides the app metadata, which a shell-less page never receives: the
        // response itself carries the entries its components name (only those), so the browser
        // can resolve the refs (Java's RestActionSyncTest twin)
        var response = Handler(Authored()).Handle(new RunActionRqDto { Route = "by-ref-sources" });
        Assert.NotNull(response.RestSources);
        Assert.Equal(["countries", "partners"], response.RestSources!.Select(e => e.Name).OrderBy(n => n, StringComparer.Ordinal));
        Assert.Equal("https://restcountries.com/v3.1/all?fields=cca2,name",
            response.RestSources!.Single(e => e.Name == "countries").Source.Url);
        // nothing named → nothing on the wire
        var bare = JsonSerializer.Serialize(Handler(RestSourceCatalog.Empty).Handle(new RunActionRqDto { Route = "by-ref-sources" }), Json);
        Assert.DoesNotContain("\"restSources\"", bare);
        // a response carrying the app catalogue gets no second copy
        var app = Handler(Authored()).Handle(new RunActionRqDto { ServerSideType = typeof(Wire.ContextApp).FullName });
        Assert.Null(app.RestSources);
    }

    [Fact]
    public void A_by_ref_surface_carries_only_the_name()
    {
        var json = JsonSerializer.Serialize(Handler(Authored()).Handle(new RunActionRqDto { Route = "by-ref-sources" }), Json);
        // the default paths and method are left to the entry; an explicit path still travels
        Assert.Contains("\"optionsSource\":{\"url\":\"\",\"method\":\"\",\"headers\":{},\"body\":\"\",\"itemsPath\":\"\",\"valuePath\":\"\",\"labelPath\":\"\",\"proxy\":false,\"ref\":\"partners\"}", json);
        Assert.Contains("\"labelPath\":\"name.official\",\"proxy\":false,\"ref\":\"countries\"", json);
        Assert.Contains("\"url\":\"https://inline.example.com/x\",\"method\":\"GET\"", json);
        Assert.Contains("\"ref\":\"invoices\"", json);
        // partners is a proxy source in the catalogue → the view advertises __restfetch__
        Assert.Contains("\"id\":\"__restfetch__\"", json);
        // without the catalogue, the same view has no proxy source to advertise
        Assert.DoesNotContain("__restfetch__",
            JsonSerializer.Serialize(Handler(RestSourceCatalog.Empty).Handle(new RunActionRqDto { Route = "by-ref-sources" }), Json));
    }

    private sealed class FakeHttp(HttpStatusCode status = HttpStatusCode.OK) : HttpMessageHandler
    {
        public readonly List<string> Urls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Urls.Add(request.RequestUri!.ToString());
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent("[{\"id\":1}]") });
        }
    }

    private static RunActionRqDto RestFetch(string route, string kind, string id) => new()
    {
        Route = route, ConsumedRoute = route, ActionId = "__restfetch__",
        Parameters = new() { ["_sourceKind"] = kind, ["_sourceId"] = id },
    };

    private static string Fetched(UIIncrementDto increment) =>
        JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetch"]);

    [Fact]
    public async Task A_proxied_reference_is_resolved_from_the_catalogue_the_server_holds()
    {
        var fake = new FakeHttp();
        var handler = Handler(Authored(), new HttpClient(fake), key => key == "PARTNERS_KEY" ? "k1" : null);
        var increment = await handler.HandleAsync(RestFetch("by-ref-sources", "options", "partner"));
        Assert.Equal(["https://partners.example.com/api/list?key=k1"], fake.Urls);
        Assert.Equal("[{\"id\":1}]", Fetched(increment));
    }

    [Fact]
    public async Task A_reference_the_catalogue_does_not_carry_fetches_nothing()
    {
        var fake = new FakeHttp();
        var increment = await Handler(RestSourceCatalog.Empty, new HttpClient(fake))
            .HandleAsync(RestFetch("by-ref-sources", "options", "partner"));
        Assert.Empty(fake.Urls);
        // nothing to call: the misconfiguration is surfaced (as on Java), not read as an empty success
        Assert.Equal("{\"status\":0,\"message\":\"Request failed\"}",
            JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetchError"]));
    }

    private sealed class ScriptedHttp(Func<HttpRequestMessage, HttpStatusCode> answer) : HttpMessageHandler
    {
        public readonly List<string> Calls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Calls.Add(request.Method + " " + request.RequestUri!.AbsoluteUri);
            var status = answer(request);
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent((int)status >= 400 ? "{\"message\":\"in use\"}" : ""),
            });
        }
    }

    private static RunActionRqDto Bulk(params string[] ids) => new()
    {
        Route = "bulk-delete-sources", ConsumedRoute = "bulk-delete-sources", ActionId = "__restfetch__",
        ComponentState = new()
        {
            ["crud_selected_items"] = JsonSerializer.SerializeToElement(ids.Select(id => new { id }).ToArray()),
        },
        Parameters = new()
        {
            ["_sourceKind"] = "action", ["_sourceId"] = "delete",
            ["_forEachSelectedRow"] = JsonSerializer.SerializeToElement(true),
        },
    };

    /// <summary>Java <c>RestProxyRelativeUrlSyncTest</c>: a relative proxied url is called on this
    /// server's own base url (it used to fail as an invalid request URI).</summary>
    [Fact]
    public async Task A_relative_proxied_url_is_called_on_this_servers_own_base_url()
    {
        var fake = new FakeHttp();
        var handler = new SyncHandler(new MateuRegistry(typeof(ByRefSourcesView).Assembly),
            http: new HttpClient(fake), restSources: new RestSourceRegistry(RestSourceCatalog.Empty))
        {
            SelfBaseUrl = "http://127.0.0.1:5005/",
        };
        var rq = RestFetch("relative-proxy-sources", "action", "person");
        rq = rq with { ComponentState = new() { ["id"] = JsonSerializer.SerializeToElement("1") } };
        var increment = await handler.HandleAsync(rq);
        Assert.Equal(["http://127.0.0.1:5005/api/people/1"], fake.Urls);
        Assert.Equal("[{\"id\":1}]", Fetched(increment));
    }

    [Fact]
    public async Task A_bulk_proxied_write_runs_once_per_selected_row()
    {
        // Java RestProxyCalls.forEachSelectedRow: each row over the state, one round trip
        var http = new ScriptedHttp(_ => HttpStatusCode.NoContent);
        var increment = await Handler(RestSourceCatalog.Empty, new HttpClient(http)).HandleAsync(Bulk("a b", "7"));
        Assert.Equal(["DELETE https://api.example.com/people/a%20b", "DELETE https://api.example.com/people/7"], http.Calls);
        Assert.Equal("{}", Fetched(increment));
    }

    [Fact]
    public async Task A_failed_row_of_a_bulk_write_is_reported()
    {
        var http = new ScriptedHttp(rq => rq.RequestUri!.ToString().EndsWith("/2") ? HttpStatusCode.Conflict : HttpStatusCode.OK);
        var increment = await Handler(RestSourceCatalog.Empty, new HttpClient(http)).HandleAsync(Bulk("1", "2", "3"));
        Assert.Equal(3, http.Calls.Count);
        Assert.Equal("{\"status\":409,\"message\":\"1 of 3 failed (HTTP 409)\",\"detail\":\"in use\"}",
            JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetchError"]));
    }

    [Fact]
    public async Task The_action_parameters_reach_a_proxied_template()
    {
        // a kanban move's _toColumnId etc. reach ${state.x} on the proxied leg, as on the direct one
        var http = new ScriptedHttp(_ => HttpStatusCode.OK);
        await Handler(RestSourceCatalog.Empty, new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "bulk-delete-sources", ConsumedRoute = "bulk-delete-sources", ActionId = "__restfetch__",
            Parameters = new() { ["_sourceKind"] = "action", ["_sourceId"] = "delete", ["id"] = "9" },
        });
        Assert.Equal(["DELETE https://api.example.com/people/9"], http.Calls);
    }

    [Fact]
    public async Task A_direct_source_is_never_proxied()
    {
        // the inline option is not Proxy: the browser calls it, the server refuses to (403)
        var fake = new FakeHttp();
        await Assert.ThrowsAsync<MateuForbiddenException>(() =>
            Handler(Authored(), new HttpClient(fake)).HandleAsync(RestFetch("by-ref-sources", "options", "inline")));
        Assert.Empty(fake.Urls);
    }

    [Fact]
    public void A_proxied_sources_headers_and_body_stay_off_the_wire()
    {
        var proxied = new RestDataSourceDto("https://x.example.com")
        {
            Proxy = true, Headers = new() { ["X-Api-Key"] = "${secret.KEY}" }, Body = "{\"a\":1}",
        };
        var json = JsonSerializer.Serialize(proxied, Json);
        Assert.DoesNotContain("X-Api-Key", json);
        Assert.DoesNotContain("\"body\":\"", json);
        // the server still reads them (it makes that call)
        Assert.Equal("${secret.KEY}", proxied.Headers!["X-Api-Key"]);
        // a direct source keeps them: the browser makes that call
        var direct = proxied with { Proxy = false };
        Assert.Contains("X-Api-Key", JsonSerializer.Serialize(direct, Json));
    }

    [Fact]
    public async Task A_RestSourceSupplier_view_gates_and_resolves_the_proxy_fetch()
    {
        var json = JsonSerializer.Serialize(Handler(RestSourceCatalog.Empty).Handle(new RunActionRqDto { Route = "supplied-sources" }), Json);
        Assert.Contains("\"id\":\"__restfetch__\"", json);

        var fake = new FakeHttp();
        var handler = Handler(Authored(), new HttpClient(fake), key => key == "TAGS_KEY" ? "t" : key == "PARTNERS_KEY" ? "p" : null);
        await handler.HandleAsync(RestFetch("supplied-sources", "options", "tag"));
        // data: one per view, so the id does not matter; the supplied ref resolves from the catalogue
        await handler.HandleAsync(RestFetch("supplied-sources", "data", "whatever"));
        // a kind/id the view never declared fetches nothing
        await handler.HandleAsync(RestFetch("supplied-sources", "options", "other"));
        Assert.Equal(["https://tags.example.com/all?key=t", "https://partners.example.com/api/list?key=p"], fake.Urls);
    }
}
