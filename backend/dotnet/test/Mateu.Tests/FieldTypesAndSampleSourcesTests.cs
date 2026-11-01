using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures ──────────────────────────────────────────────────────────────────

/// <summary>Contributes field types in code only inside a test flow that switched it on (an
/// AsyncLocal), so the type — discovered by every handler that scans this assembly — leaks nothing
/// into the other suites.</summary>
public class TestFieldTypeSupplier : IFieldTypeCatalogSupplier
{
    public static readonly AsyncLocal<bool> Enabled = new();

    public IReadOnlyList<FieldTypeEntry> FieldTypes() => Enabled.Value
        ?
        [
            new FieldTypeEntry("OrderStatus") { Label = "From code", DataType = "string" },
            new FieldTypeEntry("Phone") { Label = "Phone", Stereotype = "phone" },
        ]
        : [];
}

public class TypedOrder
{
    public string Id { get; set; } = "";
    [FieldType("OrderStatus")] public string Status { get; set; } = "";
    [FieldType("Money"), Label("Amount")] public decimal Total { get; set; }
    [FieldType("Nope")] public string Note { get; set; } = "";
}

[UI("typed-orders"), Title("Orders")]
public class TypedOrders : IListing<TypedOrder>
{
    public ListingData<TypedOrder> Search(SearchRequest request) =>
        ListingData.From([new TypedOrder { Id = "1", Status = "OPEN", Total = 120.5m }]);
}

/// <summary>A view whose actions are PROXIED calls to the sampled "orders" catalogue entry (the
/// write is a PUT: by reference, the attribute default POST means "the entry's method", GET).</summary>
[UI("ft-sampled"), Title("Sampled")]
public class SampledOrdersView
{
    public string? Customer { get; set; }

    [Button, RestAction(Source = "orders")] public void Load() { }

    [Button, RestAction(Source = "orders", Method = "PUT", Body = "{\"customer\":\"${state.customer}\"}")]
    public void Create() { }
}

/// <summary>
/// The field type catalogue (<c>types.yaml</c> + <see cref="IFieldTypeCatalogSupplier"/>) and sample
/// data on REST sources (<c>sample:</c> / <c>sampleFile:</c>) — the .NET mirror of Java's
/// FieldTypesSyncTest + SampleSourcesSyncTest, over the same fixture shapes.
/// </summary>
public class FieldTypesAndSampleSourcesTests
{
    private static readonly string Dir = Path.Combine(AppContext.BaseDirectory, "field-types-specs");
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static FieldTypeRegistry Types() => new(Dir);

    private static IReadOnlyList<FormField> Fields(IComponent? tree) =>
        ((VerticalLayout)tree!).Content.Cast<FormField>().ToList();

    // ── Field types ───────────────────────────────────────────────────────────

    [Fact]
    public void A_field_takes_the_type_attributes_as_defaults_and_its_own_win()
    {
        var types = Types();
        var fields = Fields(YamlComponentBuilder.Parse(File.ReadAllText(Path.Combine(Dir, "customer.yaml")), types: types));

        var email = fields.Single(f => f.FieldId == "email");
        Assert.Equal("E-mail", email.Label);
        Assert.Equal("email", email.Stereotype);
        Assert.True(email.Required);

        // own attributes win over the type's
        var backup = fields.Single(f => f.FieldId == "backup");
        Assert.Equal("Backup e-mail", backup.Label);
        Assert.False(backup.Required);
        Assert.Equal("email", backup.Stereotype);
    }

    [Fact]
    public void Each_target_takes_only_its_own_attributes_and_the_reference_never_reaches_the_wire()
    {
        var catalog = FieldTypeRegistry.AuthoredFrom(Dir);
        Assert.Equal(["OrderStatus", "Money", "Email", "Zip"], catalog.Types.Select(t => t.Id));

        var column = FieldTypeResolver.Apply(
            new Dictionary<object, object> { ["type"] = "GridColumn", ["id"] = "status", ["fieldType"] = "OrderStatus" }, catalog);
        Assert.False(column.ContainsKey("fieldType"));
        Assert.Equal("Status", column["label"]);
        Assert.Equal("status", column["dataType"]);
        var tones = (IDictionary<object, object>)column["tones"];
        Assert.Equal("warning", tones["OPEN"]);
        Assert.Equal("success", tones["SHIPPED"]);
        Assert.False(column.ContainsKey("options")); // a column has no options

        var filter = FieldTypeResolver.Apply(
            new Dictionary<object, object> { ["type"] = "FormField", ["id"] = "status", ["fieldType"] = "OrderStatus" }, catalog);
        Assert.Equal(2, ((IEnumerable<object>)filter["options"]).Count());
        Assert.False(filter.ContainsKey("tones")); // a form field has no tones

        var money = FieldTypeResolver.Apply(
            new Dictionary<object, object> { ["type"] = "GridColumn", ["id"] = "total", ["fieldType"] = "Money", ["label"] = "Amount" }, catalog);
        Assert.Equal("Amount", money["label"]);
        Assert.Equal("money", money["dataType"]);
        Assert.Equal("end", money["align"]);
    }

    [Fact]
    public void A_types_file_under_any_name_is_discovered_by_its_header()
    {
        // catalogs/more-types.yaml declares `type: Types`: found like a `type: Actions` file. Before,
        // only <dir>/types.yaml was read and a file created under another name was ignored.
        var zip = FieldTypeRegistry.AuthoredFrom(Dir).Get("Zip");
        Assert.NotNull(zip);
        Assert.Equal("Postal code", zip!.Label);
        Assert.Equal("00000", zip.Placeholder);
        // the conventional file is read first; a file found by its header comes after it
        Assert.Equal("Zip", FieldTypeRegistry.AuthoredFrom(Dir).Types.Last().Id);
    }

    [Fact]
    public void An_unknown_type_is_warned_about_once_and_the_field_renders_as_declared()
    {
        var warned = new ConcurrentDictionary<string, bool>();
        var node = new Dictionary<object, object> { ["type"] = "FormField", ["id"] = "nickname", ["fieldType"] = "Nope", ["label"] = "Nickname" };
        var resolved = FieldTypeResolver.Apply(node, FieldTypeRegistry.AuthoredFrom(Dir), warned);
        FieldTypeResolver.Apply(node, FieldTypeRegistry.AuthoredFrom(Dir), warned);

        Assert.Equal(["Nope"], warned.Keys);
        Assert.False(resolved.ContainsKey("fieldType"));
        Assert.Equal("Nickname", resolved["label"]);

        // and the page still renders, the field as declared
        var nickname = Fields(YamlComponentBuilder.Parse(File.ReadAllText(Path.Combine(Dir, "customer.yaml")), types: Types()))
            .Single(f => f.FieldId == "nickname");
        Assert.Equal("Nickname", nickname.Label);
        Assert.Equal("regular", nickname.Stereotype);
    }

    [Fact]
    public void A_code_supplier_contributes_types_and_the_authored_file_wins_by_id()
    {
        TestFieldTypeSupplier.Enabled.Value = true;
        try
        {
            var catalog = new FieldTypeRegistry(new MateuRegistry(typeof(TestFieldTypeSupplier).Assembly), Dir).Catalog;
            // authored replaces the code entry outright
            Assert.Equal("Status", catalog.Get("OrderStatus")!.Label);
            Assert.Equal("status", catalog.Get("OrderStatus")!.DataType);
            // code-only types stay
            Assert.Equal("phone", catalog.Get("Phone")!.Stereotype);

            var phone = Fields(YamlComponentBuilder.Parse(File.ReadAllText(Path.Combine(Dir, "customer.yaml")),
                    types: new FieldTypeRegistry(new MateuRegistry(typeof(TestFieldTypeSupplier).Assembly), Dir)))
                .Single(f => f.FieldId == "phone");
            Assert.Equal("Phone", phone.Label);
            Assert.Equal("phone", phone.Stereotype);
        }
        finally
        {
            TestFieldTypeSupplier.Enabled.Value = false;
        }
    }

    [Fact]
    public void A_listing_column_typed_by_the_catalogue_carries_its_tones_on_the_wire()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(TypedOrders).Assembly), fieldTypes: Types());
        var json = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto
        {
            Route = "/typed-orders", ConsumedRoute = "/typed-orders", ServerSideType = typeof(TypedOrders).FullName,
        }), Json);

        Assert.Contains("\"id\":\"status\",\"label\":\"Status\",\"type\":\"GridColumn\",\"dataType\":\"status\"", json);
        Assert.Contains("\"tones\":{\"OPEN\":\"warning\",\"SHIPPED\":\"success\"}", json);
        // own [Label] wins; the type's data type applies; no tones → no key
        Assert.Contains("\"id\":\"total\",\"label\":\"Amount\",\"type\":\"GridColumn\",\"dataType\":\"money\"", json);
        Assert.Single(System.Text.RegularExpressions.Regex.Matches(json, "\"tones\""));
        // an unknown type renders the column as declared
        Assert.Contains("\"id\":\"note\",\"label\":\"Note\"", json);
    }

    // ── Sample data ───────────────────────────────────────────────────────────

    private sealed class CountingHttp : HttpMessageHandler
    {
        public int Calls;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Interlocked.Increment(ref Calls);
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"real\":true}") });
        }
    }

    private static SyncHandler Sampled(bool mock, HttpClient? http = null) =>
        new(new MateuRegistry(typeof(SampledOrdersView).Assembly), http: http,
            restSources: new RestSourceRegistry(RestSourceRegistry.AuthoredFrom(Dir)))
        {
            MockSources = mock,
        };

    private static Task<UIIncrementDto> RestFetch(SyncHandler handler, string actionId) =>
        handler.HandleAsync(new RunActionRqDto
        {
            Route = "ft-sampled", ConsumedRoute = "ft-sampled", ActionId = "__restfetch__",
            Parameters = new() { ["_sourceKind"] = "action", ["_sourceId"] = actionId },
            ComponentState = new() { ["customer"] = "Initech" },
        });

    private static string Fetched(UIIncrementDto increment) =>
        JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetch"], Json);

    [Fact]
    public async Task Without_the_opt_in_the_endpoint_is_called_for_real()
    {
        // 127.0.0.1:1 refuses: a real call fails, and the failure is surfaced (not an empty success)
        var increment = await RestFetch(Sampled(mock: false), "load");
        Assert.Equal("{\"status\":0,\"message\":\"Request failed\"}",
            JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetchError"], Json));
    }

    [Fact]
    public async Task With_the_opt_in_a_read_answers_with_the_sample()
    {
        var body = Fetched(await RestFetch(Sampled(mock: true), "load"));
        Assert.Equal(
            "{\"data\":[{\"id\":1,\"customer\":\"Acme\",\"status\":\"OPEN\",\"total\":120.5},{\"id\":2,\"customer\":\"Globex\",\"status\":\"SHIPPED\",\"total\":80}],\"meta\":{\"total\":2}}",
            body);
    }

    [Fact]
    public async Task With_the_opt_in_a_write_succeeds_without_calling_the_endpoint()
    {
        var http = new CountingHttp();
        Assert.Equal("{}", Fetched(await RestFetch(Sampled(mock: true, new HttpClient(http)), "create")));
        Assert.Equal(0, http.Calls);

        // the same write without the opt-in does reach the endpoint
        var real = new CountingHttp();
        Assert.Equal("{\"real\":true}", Fetched(await RestFetch(Sampled(mock: false, new HttpClient(real)), "create")));
        Assert.Equal(1, real.Calls);
    }

    [Fact]
    public void A_sample_file_is_read_relative_to_the_specs_directory()
    {
        var customers = RestSourceRegistry.AuthoredFrom(Dir).Get("customers")!;
        Assert.Equal("fixtures/customers.json", customers.SampleFile);
        Assert.Equal("[{\"id\":7,\"name\":\"Acme\"}]", JsonSerializer.Serialize(customers.EffectiveSample(), Json));
    }

    [Fact]
    public void Samples_and_mockSources_travel_on_the_app_only_in_sample_mode()
    {
        static string App(bool mock) => JsonSerializer.Serialize(Sampled(mock).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);

        var plain = App(mock: false);
        Assert.DoesNotContain("\"mockSources\"", plain);
        Assert.DoesNotContain("\"sample\"", plain);
        Assert.Contains("\"name\":\"orders\"", plain);

        var mocked = App(mock: true);
        Assert.Contains("\"mockSources\":true", mocked);
        Assert.Contains("\"sample\":{\"data\":[{\"id\":1,", mocked);
        Assert.Contains("\"sample\":[{\"id\":7,\"name\":\"Acme\"}]", mocked);
    }

    [Fact]
    public void The_environment_opt_in_reads_true_or_1_only()
    {
        Assert.True(SampleSources.Truthy("true"));
        Assert.True(SampleSources.Truthy(" TRUE "));
        Assert.True(SampleSources.Truthy("1"));
        Assert.False(SampleSources.Truthy("false"));
        Assert.False(SampleSources.Truthy(null));
        Assert.False(SampleSources.Truthy("yes"));
    }
}

/// <summary>What a field type hands a field that names it (<see cref="FieldTypeResolver.AttributesOf"/>):
/// its attributes as authored YAML values, so its options and options source travel with it.</summary>
public class FieldTypeAttributesTests
{
    [Fact]
    public void A_type_supplies_its_options_and_its_options_source_as_yaml_values()
    {
        var type = new FieldTypeEntry("country")
        {
            Label = "Country",
            Required = true,
            Options = [new Option("ES", "Spain"), new Option("PT", "Portugal")],
            OptionsSource = new RestDataSource
            {
                Ref = "countries", Url = "/api/countries", Method = "GET",
                ItemsPath = "content", ValuePath = "code", LabelPath = "name", Proxy = true,
            },
            Min = 1, Max = 10.5,
        };
        var a = FieldTypeResolver.AttributesOf(type);
        Assert.Equal("Country", a["label"]);
        Assert.Equal("true", a["required"]);
        var options = Assert.IsAssignableFrom<IEnumerable<object>>(a["options"]).Cast<IDictionary<object, object>>().ToList();
        Assert.Equal(["ES", "PT"], options.Select(o => (string)o["value"]));
        Assert.Equal(["Spain", "Portugal"], options.Select(o => (string)o["label"]));
        var source = Assert.IsAssignableFrom<IDictionary<object, object>>(a["optionsSource"]);
        Assert.Equal("countries", source["ref"]);
        Assert.Equal("/api/countries", source["url"]);
        Assert.Equal("GET", source["method"]);
        Assert.Equal("content", source["itemsPath"]);
        Assert.Equal("code", source["valuePath"]);
        Assert.Equal("name", source["labelPath"]);
        Assert.Equal("true", source["proxy"]);
        Assert.Equal("1", a["min"]);
        Assert.Equal("10.5", a["max"]);
        Assert.False(a.ContainsKey("placeholder")); // absent attributes are omitted
    }

    [Fact]
    public void An_empty_options_source_supplies_nothing()
    {
        var a = FieldTypeResolver.AttributesOf(new FieldTypeEntry("plain") { OptionsSource = new RestDataSource() });
        Assert.False(a.ContainsKey("optionsSource"));
        Assert.False(a.ContainsKey("options"));
    }
}
