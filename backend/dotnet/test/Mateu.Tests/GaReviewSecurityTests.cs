using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Mateu.Tests;

// ── S4: __restfetch__ and the gates of the declaring member ──

[UI("ga-proxy"), Title("Proxy")]
public class GaProxyView
{
    [RestOptions("https://hr.example.com/payroll", Proxy = true), EyesOnly(Roles = ["hr"])]
    public string? Payroll { get; set; }

    [RestAction("https://api.example.com/purge", Method = "DELETE", Proxy = true), DisabledUnless(Roles = ["admin"])]
    public void Purge() { }

    [RestAction("https://api.example.com/hide", Method = "DELETE", Proxy = true), EyesOnly(Roles = ["admin"])]
    public void Hide() { }
}

// ── S1: a type the authored route table binds, named under another route ──

[UI("ga-payroll-own"), Title("Payroll")]
public class GaPayrollView
{
    public double Salary { get; set; } = 100;

    [Button] public Message Pay() => new($"paid {Salary.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
}

// ── S2: [EyesOnly] on a listing row ──

public class GaEmp
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    [EyesOnly(Roles = ["hr"])] public string Salary { get; set; } = "";
}

internal static class GaEmpData
{
    public static List<GaEmp> All() => [new() { Id = "e1", Name = "Ana", Salary = "SALARY-SECRET-123" }];
}

[UI("ga-emps"), Title("Employees")]
public class GaEmpCrud : Crud<GaEmp>
{
    public override IEnumerable<GaEmp> Fetch(string? search) => GaEmpData.All();
}

[UI("ga-emp-listing"), Title("Employees")]
public class GaEmpListing : IListing<GaEmp>
{
    public ListingData<GaEmp> Search(SearchRequest request) => ListingData.From(GaEmpData.All());
}

// ── S3: access attributes one level down ──

public class GaPay
{
    [ReadOnlyUnless(Roles = ["manager"])] public double Salary { get; set; } = 100;
    [EyesOnly(Roles = ["manager"])] public string SecretNote { get; set; } = "top-nested-secret";
}

[UI("ga-nested"), Title("Employee")]
public class GaNestedEmployee
{
    public string Name { get; set; } = "Ana";
    [Inline] public GaPay Pay { get; set; } = new();
    public GaPay Other { get; set; } = new();

    [Button]
    public Message Save() => new(string.Join("|", Pay.Salary, Pay.SecretNote, Other.Salary, Other.SecretNote));
}

// ── S5: write paths bind only what the form let the user write ──

public class GaAccount
{
    public string Name { get; set; } = "Main";
    [ReadOnly] public decimal Balance { get; set; } = 10;
}

[UI("ga-account"), Title("Account")]
public class GaAccountView : AutoEditableView<GaAccount>
{
    public static GaAccount? Persisted;
    public override GaAccount Load() => new();
    public override void Persist(GaAccount entity) => Persisted = entity;
}

public class GaPart
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    [EditableOnlyWhenCreating] public string Sku { get; set; } = "";
    [HiddenInList] public string Internal { get; set; } = "";
}

[UI("ga-parts"), Title("Parts"), InlineEditing]
public class GaParts : Crud<GaPart>
{
    public static readonly Dictionary<string, GaPart> Store = new();
    public override IEnumerable<GaPart> Fetch(string? search) => Store.Values;
    public override GaPart? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(GaPart entity) => Store[entity.Id] = entity;
}

public class GaBook
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    [ReadOnly] public decimal Price { get; set; } = 5;
}

[UI("ga-cap-books"), Title("Books")]
public class GaCapBooks : IListing<GaBook>, IEditable<GaBook, string>, ICreatable<GaBook, string>
{
    public static readonly Dictionary<string, GaBook> Store = new();
    public static GaBook? LastSaved;
    public static GaBook? LastCreated;

    public ListingData<GaBook> Search(SearchRequest request) => ListingData.From(Store.Values.ToList());
    public GaBook Edit(string id) => new() { Id = Store[id].Id, Title = Store[id].Title, Price = Store[id].Price };

    public string Save(GaBook editor)
    {
        LastSaved = editor;
        return editor.Id;
    }

    public GaBook CreationForm() => new() { Price = 7 };

    public string Create(GaBook form)
    {
        LastCreated = form;
        return "new";
    }
}

// ── S6: create with a client-chosen id on a crud that does not edit ──

public class GaNote
{
    public string Id { get; set; } = "";
    public string Text { get; set; } = "";
}

[UI("ga-noedit"), Title("Notes")]
public class GaNoEditNotes : Crud<GaNote>
{
    public static readonly Dictionary<string, GaNote> Store = new();
    public override bool CanEdit => false;
    public override IEnumerable<GaNote> Fetch(string? search) => Store.Values;
    public override GaNote? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(GaNote entity) => Store[entity.Id] = entity;
}

// ── ports #5 / #6 over HTTP ──

[UI("ga-staff-only"), Title("Staff"), EyesOnly(Roles = ["staff"])]
public class GaStaffOnlyView
{
    public string Name { get; set; } = "x";
}

[UI("ga-doc"), Title("Doc")]
public class GaDocView
{
    [Button] public Document Download() => Document.Lazy("x.csv", "text/csv", () => "a,b"u8.ToArray());
}

/// <summary>The .NET fixes of the GA review (2026-11-13): security S1, S2, S3 (pin), S4, S5, S6, S8,
/// the upload file name (S11), and the ports review's #5 (the live-updates stream passes the
/// handler's checks), #6 (MCP gets the mount path, not an origin from the Host header) and #7
/// (security refusals go to ILogger, without control characters).</summary>
public class GaReviewSecurityTests
{
    private static JsonElement J(object? value) => JsonSerializer.SerializeToElement(value);

    private static string Json(object? value) =>
        JsonSerializer.Serialize(value, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    private sealed class RecordingHttp : HttpMessageHandler
    {
        public readonly List<HttpRequestMessage> Calls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            lock (Calls) Calls.Add(request);
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("[]") });
        }
    }

    private static SyncHandler Handler(Identity? identity = null, string? specs = null, HttpClient? http = null) =>
        new(new MateuRegistry(typeof(GaReviewSecurityTests).Assembly), identity: () => identity, http: http, specsDir: specs);

    // ── S4 ──

    private static Task<UIIncrementDto> Fetch(Identity? identity, RecordingHttp http, string kind, string id) =>
        Handler(identity, http: new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "ga-proxy", ServerSideType = typeof(GaProxyView).FullName, ActionId = "__restfetch__",
            Parameters = new() { ["_sourceKind"] = J(kind), ["_sourceId"] = J(id) },
        });

    [Theory]
    [InlineData("action", "purge")]
    [InlineData("action", "hide")]
    [InlineData("options", "payroll")]
    public async Task A_proxied_fetch_is_refused_when_its_declaring_member_is_refused(string kind, string id)
    {
        var http = new RecordingHttp();
        await Assert.ThrowsAsync<MateuForbiddenException>(() => Fetch(null, http, kind, id));
        await Assert.ThrowsAsync<MateuForbiddenException>(() => Fetch(new Identity(Roles: ["viewer"]), http, kind, id));
        Assert.Empty(http.Calls);
    }

    [Theory]
    [InlineData("action", "purge", "admin")]
    [InlineData("action", "hide", "admin")]
    [InlineData("options", "payroll", "hr")]
    public async Task A_proxied_fetch_runs_for_a_caller_the_member_lets_in(string kind, string id, string role)
    {
        var http = new RecordingHttp();
        await Fetch(new Identity(Roles: [role]), http, kind, id);
        Assert.Single(http.Calls);
    }

    // ── S1 ──

    private static readonly string PayrollSpecs = WriteSpecs();

    private static string WriteSpecs()
    {
        var dir = Directory.CreateTempSubdirectory("ga-s1-").FullName;
        var view = typeof(GaPayrollView).FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), $"""
            routes:
              - route: ga-payroll
                layout: payroll.yaml
                viewModel: {view}
                access: {"{"}roles: [admin]{"}"}
              - route: ga-payroll-locked
                layout: locked.yaml
                viewModel: {view}
              - route: ga-hello
                layout: hello.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "payroll.yaml"), """
            layout:
              type: FormField
              id: salary
              dataType: number
            """);
        File.WriteAllText(Path.Combine(dir, "locked.yaml"), """
            layout:
              type: FormField
              id: salary
              dataType: number
              readOnlyUnless: {roles: [admin]}
            """);
        File.WriteAllText(Path.Combine(dir, "hello.yaml"), "layout: {type: Text, text: Hello}\n");
        return dir;
    }

    private static UIIncrementDto Pay(string route, Identity? identity = null) => Handler(identity, PayrollSpecs).Handle(new RunActionRqDto
    {
        Route = route, ServerSideType = typeof(GaPayrollView).FullName, ActionId = "pay",
        ComponentState = new() { ["salary"] = J(999) },
    });

    [Theory]
    [InlineData("/ga-payroll")]
    [InlineData("/ga-hello")]
    [InlineData("/nowhere")]
    [InlineData("")]
    [InlineData("/ga-payroll-locked/../ga-hello")]
    public void A_bound_view_model_named_under_another_route_keeps_its_access(string route)
    {
        Assert.Throws<MateuForbiddenException>(() => Pay(route));
    }

    [Fact]
    public void A_bound_view_model_answers_where_it_is_bound_and_at_its_own_route()
    {
        // the locked layout keeps the server's value; the class's own [UI] route is the author's
        // public declaration; an admin passes everywhere
        Assert.Equal("paid 100", Assert.Single(Pay("/ga-payroll-locked").Messages).Text);
        // under the entry (a sub-path its layout does not name): that entry's locks still hold
        Assert.Equal("paid 100", Assert.Single(Pay("/ga-payroll-locked/7").Messages).Text);
        Assert.Equal("paid 999", Assert.Single(Pay("/ga-payroll-own").Messages).Text);
        Assert.Equal("paid 999", Assert.Single(Pay("/ga-hello", new Identity(Roles: ["admin"])).Messages).Text);
    }

    // ── S2 ──

    private static string Search<T>(string route, Identity? identity) => Json(Handler(identity).Handle(new RunActionRqDto
    {
        Route = route, ServerSideType = typeof(T).FullName, ActionId = "search",
        ComponentState = new() { ["sort"] = J(new[] { new { field = "salary", direction = "descending" } }) },
    }));

    [Fact]
    public void A_restricted_row_field_is_not_in_the_row_data()
    {
        Assert.DoesNotContain("SALARY-SECRET", Search<GaEmpCrud>("ga-emps", null));
        Assert.DoesNotContain("SALARY-SECRET", Search<GaEmpListing>("ga-emp-listing", null));
        Assert.Contains("Ana", Search<GaEmpCrud>("ga-emps", null));
        Assert.Contains("SALARY-SECRET", Search<GaEmpCrud>("ga-emps", new Identity(Roles: ["hr"])));
        Assert.Contains("SALARY-SECRET", Search<GaEmpListing>("ga-emp-listing", new Identity(Roles: ["hr"])));
    }

    // ── S3 (pin: MayWrite and the state strip are recursive in .NET) ──

    [Fact]
    public void Access_attributes_hold_inside_a_nested_form()
    {
        var load = Json(Handler().Handle(new RunActionRqDto { Route = "ga-nested" }));
        Assert.DoesNotContain("top-nested-secret", load);

        var saved = Handler().Handle(new RunActionRqDto
        {
            Route = "ga-nested", ServerSideType = typeof(GaNestedEmployee).FullName, ActionId = "save",
            ComponentState = new()
            {
                ["pay"] = J(new { salary = 999, secretNote = "pwned" }),
                ["pay-salary"] = J(999), ["pay-secretNote"] = J("pwned"),
                ["other"] = J(new { salary = 999, secretNote = "pwned" }),
            },
        });
        Assert.Equal("100|top-nested-secret|100|top-nested-secret", Assert.Single(saved.Messages).Text);
        var manager = Handler(new Identity(Roles: ["manager"])).Handle(new RunActionRqDto
        {
            Route = "ga-nested", ServerSideType = typeof(GaNestedEmployee).FullName, ActionId = "save",
            ComponentState = new() { ["pay"] = J(new { salary = 999, secretNote = "ok" }) },
        });
        Assert.Equal("999|ok|100|top-nested-secret", Assert.Single(manager.Messages).Text);
    }

    // ── S5 ──

    [Fact]
    public void An_editable_view_save_keeps_a_read_only_field()
    {
        Handler().Handle(new RunActionRqDto
        {
            Route = "ga-account/edit", ServerSideType = typeof(GaAccountView).FullName, ActionId = "save",
            ComponentState = new() { ["name"] = J("Renamed"), ["balance"] = J(1_000_000_000) },
        });
        Assert.Equal("Renamed", GaAccountView.Persisted!.Name);
        Assert.Equal(10, GaAccountView.Persisted.Balance);
    }

    [Fact]
    public void An_inline_row_edit_keeps_create_only_and_off_grid_fields()
    {
        lock (GaParts.Store)
        {
            GaParts.Store.Clear();
            GaParts.Store["p1"] = new GaPart { Id = "p1", Name = "Bolt", Sku = "SKU-1", Internal = "kept" };
            Handler().Handle(new RunActionRqDto
            {
                ActionId = "update-row", ServerSideType = typeof(GaParts).FullName,
                Parameters = new()
                {
                    ["_editedRow"] = J(new { id = "p1", name = "Bolt M8", sku = "HACKED", @internal = "HACKED" }),
                },
            });
            Assert.Equal("Bolt M8", GaParts.Store["p1"].Name);
            Assert.Equal("SKU-1", GaParts.Store["p1"].Sku);
            Assert.Equal("kept", GaParts.Store["p1"].Internal);
        }
    }

    [Fact]
    public void A_capability_save_and_create_keep_read_only_fields()
    {
        GaCapBooks.Store["b1"] = new GaBook { Id = "b1", Title = "Old", Price = 10 };
        Handler().Handle(new RunActionRqDto
        {
            Route = "ga-cap-books/b1/edit", ServerSideType = typeof(GaCapBooks).FullName, ActionId = "save",
            ComponentState = new() { ["id"] = J("b1"), ["title"] = J("New"), ["price"] = J(0) },
        });
        Assert.Equal("New", GaCapBooks.LastSaved!.Title);
        Assert.Equal(10, GaCapBooks.LastSaved.Price);
        Assert.Equal("b1", GaCapBooks.LastSaved.Id);

        Handler().Handle(new RunActionRqDto
        {
            Route = "ga-cap-books/new", ServerSideType = typeof(GaCapBooks).FullName, ActionId = "create",
            ComponentState = new() { ["title"] = J("Created"), ["price"] = J(999) },
        });
        Assert.Equal("Created", GaCapBooks.LastCreated!.Title);
        Assert.Equal(7, GaCapBooks.LastCreated.Price);
    }

    // ── S6 ──

    private static UIIncrementDto CreateNote(string id) => Handler().Handle(new RunActionRqDto
    {
        Route = "ga-noedit/new", ServerSideType = typeof(GaNoEditNotes).FullName, ActionId = "create",
        ComponentState = new() { ["id"] = J(id), ["text"] = J("overwritten") },
    });

    [Fact]
    public void A_create_naming_a_stored_record_is_an_edit_and_is_gated_as_one()
    {
        GaNoEditNotes.Store["P-001"] = new GaNote { Id = "P-001", Text = "original" };
        Assert.Throws<MateuForbiddenException>(() => CreateNote("P-001"));
        Assert.Equal("original", GaNoEditNotes.Store["P-001"].Text);

        var fresh = "P-" + Guid.NewGuid().ToString("N");
        CreateNote(fresh);
        Assert.Equal("overwritten", GaNoEditNotes.Store[fresh].Text);
    }

    // ── S11 (.NET part) ──

    [Theory]
    [InlineData("../../etc/passwd", "passwd")]
    [InlineData("C:\\Users\\x\\report.pdf", "report.pdf")]
    [InlineData("a\r\nb.txt", "ab.txt")]
    [InlineData("..", "file")]
    [InlineData("  ", "file")]
    [InlineData(null, "file")]
    [InlineData("photo.jpg", "photo.jpg")]
    public void The_store_gets_a_bare_file_name(string? sent, string expected) =>
        Assert.Equal(expected, FileUploads.BareFileName(sent));

    // ── S8 ──

    [Fact]
    public void The_gzip_cache_is_keyed_by_the_content_not_the_request_path()
    {
        var raw = Encoding.UTF8.GetBytes(Guid.NewGuid() + new string('x', 4096));
        var first = UiPage.Gzipped("/assets/x.js", raw);
        Assert.Same(first, UiPage.Gzipped("/assets//x.js", raw));
        Assert.Same(first, UiPage.Gzipped("/assets///x.js", raw));
    }

    [Fact]
    public void An_empty_path_segment_names_no_renderer_file()
    {
        var dir = Directory.CreateTempSubdirectory("ga-renderer-").FullName;
        File.WriteAllText(Path.Combine(dir, UiPage.Index), "<html><body>AQUIUI</body></html>");
        Directory.CreateDirectory(Path.Combine(dir, "assets"));
        File.WriteAllText(Path.Combine(dir, "assets", "x.js"), "console.log(1)");
        var renderer = RendererFiles.At(dir);
        Assert.NotNull(MateuExtensions.UiAnswer("/assets/x.js", "*/*", "", renderer, "T", false));
        Assert.Null(MateuExtensions.UiAnswer("/assets//x.js", "*/*", "", renderer, "T", false));
    }
}

/// <summary>The tests of <see cref="GaReviewSecurityTests"/> that touch process-wide state (the
/// logger factory, a host).</summary>
[Collection(ProcessWideStateCollection.Name)]
public class GaReviewProcessWideTests
{
    private sealed class Capture : ILoggerFactory
    {
        public readonly System.Collections.Concurrent.ConcurrentQueue<(string Category, string Message)> Entries = new();
        public ILogger CreateLogger(string categoryName) => new Logger(this, categoryName);
        public void AddProvider(ILoggerProvider provider) { }
        public void Dispose() { }

        private sealed class Logger(Capture owner, string category) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
            public bool IsEnabled(LogLevel logLevel) => true;
            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
                Func<TState, Exception?, string> formatter) => owner.Entries.Enqueue((category, formatter(state, exception)));
        }
    }

    [Fact]
    public void A_security_refusal_goes_to_ILogger_and_cannot_forge_a_line()
    {
        var capture = new Capture();
        MateuLogging.UseLoggerFactory(capture);
        try
        {
            Assert.Throws<MateuForbiddenException>(() =>
                new SyncHandler(new MateuRegistry(typeof(GaReviewProcessWideTests).Assembly)).Handle(new RunActionRqDto
                {
                    Route = "ga-doc", ServerSideType = typeof(GaDocView).FullName,
                    ActionId = "x\n[mateu] security: admin signed in",
                }));
        }
        finally
        {
            MateuLogging.UseLoggerFactory(null);
        }
        var line = Assert.Single(capture.Entries, e => e.Category == ActionGuard.SecurityCategory);
        Assert.DoesNotContain("\n", line.Message);
        Assert.Contains("no such action", line.Message);
    }

    [Fact]
    public void The_gzip_cache_is_bounded()
    {
        for (var i = 0; i < UiPage.MaxGzipEntries + 40; i++)
            UiPage.Gzipped("/assets/x.js", Encoding.UTF8.GetBytes(i + new string('y', 2048)));
        Assert.True(UiPage.GzipCacheCount <= UiPage.MaxGzipEntries, $"{UiPage.GzipCacheCount} entries");
    }

    private static async Task<(WebApplication App, HttpClient Http)> Host(bool mcp)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o => o.Mcp = mcp, typeof(GaReviewProcessWideTests).Assembly);
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return (app, new HttpClient { BaseAddress = new Uri(address), Timeout = TimeSpan.FromSeconds(20) });
    }

    [Fact]
    public async Task The_live_updates_stream_passes_the_handlers_access_checks()
    {
        var (app, http) = await Host(mcp: false);
        await using var _ = app;
        using var __ = http;
        var body = JsonSerializer.Serialize(new
        {
            route = "/ga-staff-only", actionId = "_live-updates", serverSideType = typeof(GaStaffOnlyView).FullName,
        });
        using var response = await http.PostAsync("/mateu/v3/sse/ga-staff-only",
            new StringContent(body, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var events = (await response.Content.ReadAsStringAsync()).Split("\n\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.Single(events);
        await app.StopAsync();
    }

    [Fact]
    public async Task Mcp_never_builds_a_url_from_the_Host_header()
    {
        var (app, http) = await Host(mcp: true);
        await using var _ = app;
        using var __ = http;
        var call = new JsonObject
        {
            ["jsonrpc"] = "2.0", ["id"] = 1, ["method"] = "tools/call",
            ["params"] = new JsonObject
            {
                ["name"] = "mateu_run_action",
                ["arguments"] = new JsonObject { ["route"] = "/ga-doc", ["actionId"] = "download" },
            },
        };
        using var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/mcp")
        {
            Content = new StringContent(call.ToJsonString(), Encoding.UTF8, "application/json"),
        };
        rq.Headers.Host = "evil.example";
        using var response = await http.SendAsync(rq);
        var text = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("/mateu/", text);
        Assert.DoesNotContain("evil.example", text);
        await app.StopAsync();
    }
}
