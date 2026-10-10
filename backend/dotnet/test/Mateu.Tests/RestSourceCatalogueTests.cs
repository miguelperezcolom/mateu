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

public class RestSourceCatalogueTests
{
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
        Assert.Equal("{}", Fetched(increment));
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
