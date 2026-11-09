using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

public class GuardInvoice
{
    public string Id { get; set; } = "";
    public string Customer { get; set; } = "";
    [ReadOnly] public decimal Paid { get; set; }
    [ReadOnly] public string Status { get; set; } = "DRAFT";
    [Mateu.Uidl.Version, ReadOnly] public long Revision { get; set; }
}

[UI("guard-invoices"), Title("Invoices")]
public class GuardInvoices : Crud<GuardInvoice>
{
    public static readonly Dictionary<string, GuardInvoice> Store = new();
    public override IEnumerable<GuardInvoice> Fetch(string? search) => Store.Values;
    public override GuardInvoice? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(GuardInvoice entity) => Store[entity.Id] = entity;
}

public class GuardRow
{
    public string Team { get; set; } = "";
}

[UI("guard-groups"), Title("Groups")]
public class GuardGroups : Listing<FileFilters, GuardRow>
{
    public static readonly List<string> Closed = [];

    public override ListingData<GuardRow> Search(SearchRequest request) => ListingData.From<GuardRow>([]);

    [GroupAction("Close"), DisabledUnless(Roles = ["manager"])]
    public Message CloseGroup(string group)
    {
        Closed.Add(group);
        return new Message("closed");
    }
}

[UI("guard-refusing"), Title("Refusing")]
public class GuardRefusingView
{
    [Button] public Message Refuse() => throw new MateuForbiddenException("not for you");
}

/// <summary>Guards only a crafted request exercises (the .NET twin of Python's
/// test_server_side_guards): read-only fields on a crud save, the write gate keyed on what the save
/// will do, the preview's alias budget, a route's pinned parameters on the proxied leg, the
/// <c>_appsource</c> proxy, redirects, and [GroupAction]'s access gates.</summary>
[Collection("ActionSecurity")]
public class ServerSideGuardsTests
{
    private sealed class RecordingHttp(HttpStatusCode status = HttpStatusCode.OK, string body = "[]") : HttpMessageHandler
    {
        public readonly List<HttpRequestMessage> Calls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            lock (Calls) Calls.Add(request);
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(body) });
        }
    }

    private static string Specs(params (string File, string Text)[] files)
    {
        var dir = Directory.CreateTempSubdirectory("mateu-guards").FullName;
        foreach (var (file, text) in files) File.WriteAllText(Path.Combine(dir, file), text);
        return dir;
    }

    private static JsonElement Json(object? value) => JsonSerializer.SerializeToElement(value);

    private static JsonElement Data(UIIncrementDto increment, string key) =>
        JsonSerializer.SerializeToElement(increment.AppData).GetProperty(key);

    private static SyncHandler Handler(string? specs = null, HttpClient? http = null, Func<string, string?>? secrets = null) =>
        new(new MateuRegistry(typeof(ServerSideGuardsTests).Assembly), secrets: secrets, http: http, specsDir: specs);

    // ── read-only fields on a crud save ──

    private static UIIncrementDto CrudCall(string route, string action, Dictionary<string, object?> state) => Handler().Handle(new RunActionRqDto
    {
        Route = route, ConsumedRoute = "guard-invoices", ActionId = action,
        ServerSideType = typeof(GuardInvoices).FullName, ComponentState = state,
    });

    [Fact]
    public void A_save_keeps_the_stored_value_of_a_read_only_field()
    {
        GuardInvoices.Store["7"] = new GuardInvoice { Id = "7", Customer = "Acme", Paid = 10, Status = "PENDING" };

        CrudCall("guard-invoices/7/edit", "save", new()
        {
            ["customer"] = Json("Globex"), ["paid"] = Json(0), ["status"] = Json("APPROVED"), ["revision"] = Json(0),
        });

        var saved = GuardInvoices.Store["7"];
        Assert.Equal("Globex", saved.Customer);
        Assert.Equal(10, saved.Paid);
        Assert.Equal("PENDING", saved.Status);
    }

    [Fact]
    public void A_create_starts_a_read_only_field_from_the_server()
    {
        CrudCall("guard-invoices/new", "create", new()
        {
            ["id"] = Json("8"), ["customer"] = Json("New"), ["paid"] = Json(99), ["status"] = Json("APPROVED"),
        });

        Assert.Equal(0, GuardInvoices.Store["8"].Paid);
        Assert.Equal("DRAFT", GuardInvoices.Store["8"].Status);
    }

    // ── the preview's alias budget ──

    private static string Preview(string yaml) => JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto
    {
        ActionId = "__preview__", Parameters = new() { ["_yaml"] = Json(yaml) },
    }));

    [Fact]
    public void An_alias_bomb_is_answered_without_being_built()
    {
        var lines = new List<string> { "a0: &a0 {type: Text, text: x}" };
        for (var level = 1; level <= 9; level++)
            lines.Add($"a{level}: &a{level} {{type: VerticalLayout, content: [{string.Join(", ", Enumerable.Repeat($"*a{level - 1}", 10))}]}}");
        lines.Add("layout: *a9");

        Assert.Contains("too many nodes", Preview(string.Join("\n", lines)));
    }

    [Fact]
    public void An_ordinary_alias_still_previews()
    {
        var answer = Preview("a: &a {type: Text, text: Twice}\nlayout: {type: VerticalLayout, content: [*a, *a]}");
        Assert.Equal(2, answer.Split("Twice").Length - 1);
    }

    // ── a route's pinned parameters on the proxied leg ──

    private const string PinnedRoutes = "routes:\n  - route: tenants/acme/people\n    layout: people.yaml\n    fixedParams: {tenant: acme}\n";

    private const string PinnedPage = """
        actions:
          - id: removeAll
            restAction:
              forEachSelectedRow: true
              source: {url: "https://api.example.com/${state.tenant}/people/${state.id}", method: DELETE, proxy: true}
        layout: {type: Text, text: People}
        """;

    private static Task<UIIncrementDto> PinnedFetch(RecordingHttp http, Dictionary<string, object?> state, Dictionary<string, object?> extra)
    {
        var parameters = new Dictionary<string, object?> { ["_sourceKind"] = "action", ["_sourceId"] = "removeAll" };
        foreach (var (k, v) in extra) parameters[k] = v;
        return Handler(Specs(("routes.yaml", PinnedRoutes), ("people.yaml", PinnedPage)), new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "tenants/acme/people", ActionId = "__restfetch__", ComponentState = state, Parameters = parameters,
        });
    }

    [Fact]
    public async Task An_action_parameter_cannot_override_a_fixed_param()
    {
        var http = new RecordingHttp();
        await PinnedFetch(http, new() { ["id"] = Json("1") }, new() { ["tenant"] = Json("other") });
        Assert.Equal("https://api.example.com/acme/people/1", Assert.Single(http.Calls).RequestUri!.ToString());
    }

    [Fact]
    public async Task A_selected_row_cannot_override_a_fixed_param()
    {
        var http = new RecordingHttp();
        await PinnedFetch(http,
            new() { ["crud_selected_items"] = Json(new[] { new { id = "1", tenant = "other" } }) },
            new() { ["_forEachSelectedRow"] = Json("true") });
        Assert.Equal("https://api.example.com/acme/people/1", Assert.Single(http.Calls).RequestUri!.ToString());
    }

    // ── the _appsource proxy of a YAML app shell ──

    private const string ShellRoutes = "routes:\n  - {route: '', layout: shell.yaml}\n";

    private const string Shell = """
        type: AppShell
        title: T
        contextSelectors:
          - fieldName: hotel
            optionsSource: {url: "https://api.example.com/hotels", proxy: true, sample: [{value: H1, label: Palma}]}
        notifications:
          source: {url: "https://api.example.com/inbox?q=${state.searchText}", proxy: true, headers: {X-Api-Key: "${secret.KEY}"}}
        globalSearch:
          source: {url: "https://api.example.com/search"}
        menu:
          - {type: RouteLink, label: Home, route: home}
        """;

    private static RunActionRqDto AppSource(string role, string field = "", params (string, object?)[] extra)
    {
        var parameters = new Dictionary<string, object?> { ["_appSource"] = Json(role), ["_field"] = Json(field) };
        foreach (var (k, v) in extra) parameters[k] = v;
        return new RunActionRqDto { Route = "", ActionId = "_appsource", Parameters = parameters };
    }

    private static SyncHandler ShellHandler(HttpClient? http = null) =>
        Handler(Specs(("routes.yaml", ShellRoutes), ("shell.yaml", Shell)), http, key => key == "KEY" ? "s3cret" : null);

    [Fact]
    public async Task The_appsource_proxy_calls_what_the_shell_declares_with_the_secret_on_the_server()
    {
        var http = new RecordingHttp(body: "{\"items\":[1]}");

        var answer = await ShellHandler(new HttpClient(http)).HandleAsync(AppSource("notifications", "", ("searchText", Json("a b"))));

        var call = Assert.Single(http.Calls);
        Assert.Equal("https://api.example.com/inbox?q=a%20b", call.RequestUri!.AbsoluteUri);
        Assert.Equal("s3cret", call.Headers.GetValues("X-Api-Key").Single());
        Assert.Contains("\"items\":[1]", JsonSerializer.Serialize(Data(answer, "_restfetch")));
    }

    [Fact]
    public void The_sync_path_answers_appsource_too()
    {
        var http = new RecordingHttp(body: "[]");
        ShellHandler(new HttpClient(http)).Handle(AppSource("notifications"));
        Assert.Single(http.Calls);
    }

    [Fact]
    public async Task A_role_the_shell_does_not_fill_is_a_404_and_a_direct_source_a_403()
    {
        var unfilled = await ShellHandler().HandleAsync(AppSource("notificationsRead"));
        var error = JsonSerializer.SerializeToElement(Data(unfilled, "_restfetchError"));
        Assert.Equal(404, error.GetProperty("status").GetInt32());

        await Assert.ThrowsAnyAsync<MateuForbiddenException>(() => ShellHandler().HandleAsync(AppSource("globalSearch")));
    }

    [Fact]
    public async Task A_picker_is_named_by_its_field_and_sample_mode_answers_without_calling()
    {
        var http = new RecordingHttp();
        var handler = new SyncHandler(new MateuRegistry(typeof(ServerSideGuardsTests).Assembly), http: new HttpClient(http),
            specsDir: Specs(("routes.yaml", ShellRoutes), ("shell.yaml", Shell))) { MockSources = true };

        var answer = await handler.HandleAsync(AppSource("contextOptions", "hotel"));

        Assert.Contains("H1", JsonSerializer.Serialize(Data(answer, "_restfetch")));
        Assert.Empty(http.Calls);
        Assert.Equal(404, JsonSerializer.SerializeToElement(
            Data(await handler.HandleAsync(AppSource("contextOptions", "nope")), "_restfetchError")).GetProperty("status").GetInt32());
    }

    // ── redirects ──

    private const string Redirected = "actions:\n  - id: go\n    restAction:\n      source:\n        url: \"{0}\"\n        proxy: true\n        headers: {{X-Api-Key: \"${{secret.KEY}}\"}}\nlayout: {{type: Text, text: P}}\n";

    private static RunActionRqDto Go() => new()
    {
        Route = "p", ActionId = "__restfetch__",
        Parameters = new() { ["_sourceKind"] = Json("action"), ["_sourceId"] = Json("go") },
    };

    private static string SpecsFor(string url) =>
        Specs(("routes.yaml", "routes:\n  - route: p\n    layout: p.yaml\n"), ("p.yaml", string.Format(Redirected, url)));

    [Fact]
    public async Task A_3xx_is_a_failed_call()
    {
        var http = new RecordingHttp(HttpStatusCode.Found, "");
        var answer = await Handler(SpecsFor("https://api.example.com/x"), new HttpClient(http)).HandleAsync(Go());
        Assert.Equal(302, JsonSerializer.SerializeToElement(Data(answer, "_restfetchError")).GetProperty("status").GetInt32());
    }

    [Fact]
    public async Task The_default_client_does_not_follow_a_redirect_with_the_secret()
    {
        var port = FreePort();
        var target = FreePort();
        using var listener = new HttpListener();
        listener.Prefixes.Add($"http://127.0.0.1:{port}/");
        using var attacker = new HttpListener();
        attacker.Prefixes.Add($"http://127.0.0.1:{target}/");
        listener.Start();
        attacker.Start();
        var attackerHit = attacker.GetContextAsync();
        var served = listener.GetContextAsync().ContinueWith(t =>
        {
            t.Result.Response.StatusCode = 302;
            t.Result.Response.RedirectLocation = $"http://127.0.0.1:{target}/stolen";
            t.Result.Response.Close();
            return t.Result.Request.Headers["X-Api-Key"];
        });

        var answer = await Handler(SpecsFor($"http://127.0.0.1:{port}/start"), secrets: _ => "s3cret").HandleAsync(Go());

        Assert.Equal("s3cret", await served);
        Assert.Equal(302, JsonSerializer.SerializeToElement(Data(answer, "_restfetchError")).GetProperty("status").GetInt32());
        await Task.Delay(100);
        Assert.False(attackerHit.IsCompleted);
    }

    private static int FreePort()
    {
        var socket = new TcpListener(IPAddress.Loopback, 0);
        socket.Start();
        var port = ((IPEndPoint)socket.LocalEndpoint).Port;
        socket.Stop();
        return port;
    }

    // ── [GroupAction] ──

    [Fact]
    public void A_group_action_keeps_its_access_gates()
    {
        GuardGroups.Closed.Clear();
        Assert.ThrowsAny<MateuForbiddenException>(() => Handler().Handle(new RunActionRqDto
        {
            Route = "guard-groups", ConsumedRoute = "guard-groups", ActionId = "action-on-row-closeGroup",
            ServerSideType = typeof(GuardGroups).FullName,
            Parameters = new() { ["_groupValue"] = Json("A") },
        }));
        Assert.Empty(GuardGroups.Closed);
    }
}

/// <summary>What only the HTTP boundary decides.</summary>
[Collection("ProcessWideState")]
public class ServerSideGuardsOverHttpTests
{
    private static async Task WithServer(Func<HttpClient, Task> test)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(_ => { }, typeof(ServerSideGuardsOverHttpTests).Assembly);
        await using var web = builder.Build();
        web.MapMateu("");
        await web.StartAsync();
        try
        {
            var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            using var http = new HttpClient { BaseAddress = new Uri(address) };
            await test(http);
        }
        finally
        {
            await web.StopAsync();
        }
    }

    private static StringContent Body(string json) => new(json, Encoding.UTF8, "application/json");

    [Fact]
    public Task A_refusal_thrown_inside_an_action_is_a_403() => WithServer(async http =>
    {
        var answer = await http.PostAsync("/mateu/v3/sync/guard-refusing",
            Body("{\"route\":\"guard-refusing\",\"actionId\":\"refuse\",\"serverSideType\":\"" + typeof(GuardRefusingView).FullName + "\"}"));

        Assert.Equal(HttpStatusCode.Forbidden, answer.StatusCode);
        Assert.Contains("Forbidden", await answer.Content.ReadAsStringAsync());
    });

    [Fact]
    public Task A_malformed_body_on_the_stream_endpoint_is_an_error_increment() => WithServer(async http =>
    {
        var answer = await http.PostAsync("/mateu/v3/sse/anything", Body("{not json"));

        var text = await answer.Content.ReadAsStringAsync();
        Assert.Equal("text/event-stream", answer.Content.Headers.ContentType!.MediaType);
        Assert.StartsWith("data: ", text);
        Assert.Contains("\"messages\"", text);
        Assert.Contains("Reference", text);
    });
}
