using System.Collections.Concurrent;
using System.Diagnostics;
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
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// ── the host's screens (their remote base url is set by the fixture) ──────────────────────────────

public static class MfeRemote
{
    public static string Base = "http://127.0.0.1:1";

    public static MicroFrontend Server(string remote, int? timeoutMs, string route = "/widget") =>
        new(Base + "/" + remote, route) { ServerSideType = "remote.Widget", Resolve = Resolve.Server, TimeoutMs = timeoutMs };

    public static IComponent Page(params IComponent[] parts) => new VerticalLayout { Content = parts };
}

[UI("mfe-client")]
public class MfeClientOnly : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(new MicroFrontend(MfeRemote.Base + "/fast", "/widget") { ServerSideType = "x" });
}

[UI("mfe-fast")]
public class MfeFastServer : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("fast", 1000));
}

[UI("mfe-slow")]
public class MfeSlowServer : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("slow", 150));
}

[UI("mfe-broken")]
public class MfeBrokenServer : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("broken", 1000));
}

[UI("mfe-unregistered")]
public class MfeUnregistered : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(
        MfeRemote.Server("fast", 1000),
        new MicroFrontend("http://169.254.169.254/latest", "/meta-data") { Resolve = Resolve.Server });
}

[UI("mfe-parallel")]
public class MfeParallel : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(
        MfeRemote.Server("delayed", 2000),
        MfeRemote.Server("delayed", 2000, "/second"),
        MfeRemote.Server("delayed", 2000, "/third"));
}

[UI("mfe-cache-key")]
public class MfeCacheByKey : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("cachekey", 1000));
}

[UI("mfe-cache-user")]
public class MfeCachePerUser : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("cacheuser", 1000));
}

[UI("mfe-cache-shared")]
public class MfeCacheShared : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("cacheshared", 1000));
}

[UI("mfe-cache-none")]
public class MfeCacheNone : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("cachenone", 1000));
}

[UI("mfe-anon")]
public class MfeAnonymous : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("anon", 1000));
}

[UI("mfe-exchanged")]
public class MfeExchanged : IComponentTreeSupplier
{
    public IComponent Component() => MfeRemote.Page(MfeRemote.Server("exchanged", 1000));
}

[UI("mfe-slot-page")]
public class MfeSlotPage
{
    public string Name { get; set; } = "Front office";

    [ContentSlot(Key = "front-office.home.destacado", Fallback = "No news", Description = "The featured block")]
    public string? Destacado { get; set; }

    [ContentSlot(Key = "front-office.home.vacio", Fallback = "Nothing yet")]
    public string? Vacio { get; set; }

    [ContentSlot(Key = "front-office.home.vacio-sin-fallback")]
    public string? VacioSinFallback { get; set; }
}

[UI("mfe-dead-slot-page")]
public class MfeDeadSlotPage
{
    public string Name { get; set; } = "Front office";

    [ContentSlot(Key = "front-office.home.caido", Fallback = "Down fallback")]
    public string? Caido { get; set; }

    [ContentSlot(Key = "front-office.home.lento", Fallback = "Slow fallback", TimeoutMs = 100)]
    public string? Lento { get; set; }
}

// ── the remote side of the cache: views other hosts embed ─────────────────────────────────────────

[UI("mfe-cacheable-annotated"), CacheableFragment(30, VaryBy = "shared")]
public class MfeCacheableAnnotated
{
    public string Name { get; set; } = "x";
}

[UI("mfe-cacheable-keyed")]
public class MfeCacheableKeyed : IFragmentCachePolicySupplier
{
    public string Name { get; set; } = "x";

    public FragmentCachePolicy? CachePolicy(IncomingRequest request) => FragmentCachePolicy.ByKey("aud-A", 60);
}

/// <summary>Plays the remotes: a local Kestrel host speaking the Mateu sync endpoint — fast, slow,
/// broken, delayed, empty and cacheable remotes — recording every request it gets; and the Mateu host
/// (a second Kestrel host) that resolves the micro frontends against it.</summary>
public sealed class MfeHosts : IAsyncLifetime
{
    public readonly ConcurrentQueue<Dictionary<string, string?>> Requests = new();
    public readonly ConcurrentQueue<MicroFrontendResolutionEvent> Events = new();
    public int Cancelled;
    public string RemoteBase = "";
    public HttpClient Host = null!;
    private WebApplication _remote = null!;
    private WebApplication _host = null!;

    public sealed class RemoteCatalog(MfeHosts hosts) : IRemoteCatalogSupplier
    {
        public IReadOnlyList<RemoteDescriptor> Remotes() =>
        [
            .. new[] { "fast", "slow", "broken", "delayed", "cachekey", "cacheuser", "cacheshared", "cachenone" }
                .Select(name => new RemoteDescriptor(name, hosts.RemoteBase + "/" + name, 1000)),
            new RemoteDescriptor("anon", hosts.RemoteBase + "/anon", 1000, IRemoteIdentityStrategy.NoneName),
            new RemoteDescriptor("exchanged", hosts.RemoteBase + "/exchanged", 1000, "exchange"),
        ];
    }

    /// <summary>A token exchange: the remote gets a token for ITS audience, not the user's own.</summary>
    public sealed class ExchangeIdentity : IRemoteIdentityStrategy
    {
        public string Name => "exchange";

        public IReadOnlyDictionary<string, string> Headers(RemoteDescriptor remote, IncomingRequest request) =>
            new Dictionary<string, string> { ["Authorization"] = "Bearer exchanged-for-" + remote.Id };
    }

    public sealed class Recorder(MfeHosts hosts) : IMicroFrontendResolutionListener
    {
        public void OnResolution(MicroFrontendResolutionEvent resolution) => hosts.Events.Enqueue(resolution);
    }

    public async Task InitializeAsync()
    {
        _remote = await Start(builder => { }, app => app.MapPost("/{**path}", Answer));
        RemoteBase = Address(_remote);
        MfeRemote.Base = RemoteBase;
        _host = await StartHost(o => { });
        Host = new HttpClient { BaseAddress = new Uri(Address(_host)) };
    }

    public async Task<WebApplication> StartHost(Action<MateuOptions> configure, Action<WebApplication>? map = null)
    {
        return await Start(builder =>
        {
            builder.Services.AddSingleton<IRemoteCatalogSupplier>(new RemoteCatalog(this));
            builder.Services.AddSingleton<IRemoteIdentityStrategy>(new ExchangeIdentity());
            builder.Services.AddSingleton<IMicroFrontendResolutionListener>(new Recorder(this));
            builder.Services.AddMateu(o =>
            {
                // the content service: a PATH on this server, as content-hub is deployed — and this
                // server's base url is the remote's (so the path lands there)
                o.Remotes.Add(new RemoteDescriptor("content", "/_content-hub", 1000));
                o.SelfBaseUrl = RemoteBase;
                configure(o);
            }, typeof(MfeHosts).Assembly);
        }, app =>
        {
            map?.Invoke(app);
            app.MapMateu();
        });
    }

    /// <summary>The remotes' answers, for a host that serves a remote path itself.</summary>
    public Task AnswerAsRemote(HttpContext ctx) => Answer(ctx);

    private static async Task<WebApplication> Start(Action<WebApplicationBuilder> configure, Action<WebApplication> map)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        configure(builder);
        var app = builder.Build();
        map(app);
        await app.StartAsync();
        return app;
    }

    public static string Address(WebApplication app) =>
        app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();

    public async Task DisposeAsync()
    {
        Host.Dispose();
        await _host.StopAsync();
        await _host.DisposeAsync();
        await _remote.StopAsync();
        await _remote.DisposeAsync();
        MateuLogging.UseLoggerFactory(null);
    }

    private async Task Answer(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value!;
        var headers = new Dictionary<string, string?> { ["path"] = path };
        foreach (var name in new[] { "Authorization", "X-Mateu-Correlation-Id", "X-Mateu-Fragment-Keys" })
            if (ctx.Request.Headers.TryGetValue(name, out var value)) headers[name] = value.ToString();
        Requests.Enqueue(headers);
        var request = await JsonSerializer.DeserializeAsync<RunActionRqDto>(ctx.Request.Body, MateuExtensions.Json)
                      ?? new RunActionRqDto();
        var remoteName = path[1..path.IndexOf('/', 1)];
        try
        {
            switch (remoteName)
            {
                case "slow":
                    await Task.Delay(3000, ctx.RequestAborted);
                    break;
                case "delayed":
                    await Task.Delay(400, ctx.RequestAborted);
                    break;
                case "broken":
                    await Reply(ctx, 500, "boom");
                    return;
            }
        }
        catch (OperationCanceledException)
        {
            Interlocked.Increment(ref Cancelled);
            return;
        }
        FragmentCacheDto? policy = null;
        var text = "hello from " + remoteName;
        switch (remoteName)
        {
            case "cachekey":
            {
                var auth = headers.GetValueOrDefault("Authorization") ?? "";
                var key = auth.Contains("alice") || auth.Contains("anna") ? "aud-A" : "aud-B";
                var held = headers.GetValueOrDefault("X-Mateu-Fragment-Keys") ?? "";
                if (held.Split(',').Contains(key))
                {
                    await Reply(ctx, 200, Json(Increment(null, new FragmentCacheDto(60, "key") { Key = key, NotModified = true })));
                    return;
                }
                policy = new FragmentCacheDto(60, "key") { Key = key };
                text = "content for " + key;
                break;
            }
            case "cacheuser": policy = new FragmentCacheDto(60, "user"); break;
            case "cacheshared": policy = new FragmentCacheDto(60, "shared"); break;
            case "cachenone": policy = new FragmentCacheDto(60, "none"); break;
            case "_content-hub":
                if (path.Contains("front-office.home.vacio"))
                {
                    await Reply(ctx, 204, "");
                    return;
                }
                if (path.EndsWith("front-office.home.caido"))
                {
                    await Reply(ctx, 503, "down");
                    return;
                }
                if (path.EndsWith("front-office.home.lento"))
                {
                    try { await Task.Delay(3000, ctx.RequestAborted); }
                    catch (OperationCanceledException) { return; }
                }
                text = "slot " + path[(path.LastIndexOf('/') + 1)..];
                break;
        }
        var fragment = new UIFragmentDto(request.InitiatorComponentId!,
            new ClientSideComponentDto(new TextMetadataDto(text) { Container = "p" }, "t", [], null, null, null),
            new Dictionary<string, object?>(), new Dictionary<string, object?>(), "Replace", null);
        await Reply(ctx, 200, Json(Increment(fragment, policy)));
    }

    private static UIIncrementDto Increment(UIFragmentDto? fragment, FragmentCacheDto? policy) =>
        // a remote's message (and command) never reaches the host's page
        UIIncrementDto.Of(
            commands: [UICommandDto.NavigateTo("/elsewhere")],
            messages: [new MessageDto("info", "bottom", "", "remote toast", 3000)],
            fragments: fragment is null ? [] : [fragment]) with { FragmentCache = policy };

    private static string Json(object value) => JsonSerializer.Serialize(value, MateuExtensions.Json);

    private static async Task Reply(HttpContext ctx, int status, string body)
    {
        ctx.Response.StatusCode = status;
        if (status != 204)
        {
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(body);
        }
    }
}

/// <summary>The acceptance criteria of server-side micro frontend resolution and [ContentSlot]
/// (docs/specs/microfrontend-server-resolution.md), against REAL remotes over HTTP — the port of
/// Java's MicroFrontendServerResolutionSyncTest. In the DevMode collection with the other tests that
/// boot a WebApplication (they share the process-wide logger factory).</summary>
[Collection("DevMode")]
public class MicroFrontendServerResolutionTests : IClassFixture<MfeHosts>
{
    private readonly MfeHosts _hosts;

    public MicroFrontendServerResolutionTests(MfeHosts hosts)
    {
        _hosts = hosts;
        _hosts.Requests.Clear();
        _hosts.Events.Clear();
    }

    private List<Dictionary<string, string?>> Requests => _hosts.Requests.ToList();
    private List<MicroFrontendResolutionEvent> Events => _hosts.Events.ToList();

    private Task<(JsonObject Body, HttpStatusCode Status)> Load(string route, string? authorization = "Bearer alice",
        string? correlationId = null, string actionId = "") => Post(_hosts.Host, route, authorization, correlationId, actionId);

    private static async Task<(JsonObject Body, HttpStatusCode Status)> Post(HttpClient http, string route,
        string? authorization = "Bearer alice", string? correlationId = null, string actionId = "")
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/" + route)
        {
            Content = new StringContent("{\"route\":\"" + route + "\",\"actionId\":\"" + actionId + "\"}",
                Encoding.UTF8, "application/json"),
        };
        if (authorization is not null) message.Headers.TryAddWithoutValidation("Authorization", authorization);
        if (correlationId is not null) message.Headers.TryAddWithoutValidation("X-Mateu-Correlation-Id", correlationId);
        using var response = await http.SendAsync(message);
        return ((JsonObject)JsonNode.Parse(await response.Content.ReadAsStringAsync())!, response.StatusCode);
    }

    private static List<JsonObject> All(JsonNode? node, Func<JsonObject, bool> match)
    {
        var found = new List<JsonObject>();
        void Walk(JsonNode? n)
        {
            switch (n)
            {
                case JsonObject o:
                    if (match(o)) found.Add(o);
                    foreach (var (_, v) in o) Walk(v);
                    break;
                case JsonArray a:
                    foreach (var v in a) Walk(v);
                    break;
            }
        }
        Walk(node);
        return found;
    }

    private static List<JsonObject> MicroFrontends(JsonNode? node) =>
        All(node, o => (string?)o["type"] == "MicroFrontend");

    private static JsonObject OnlyMicroFrontend(JsonObject increment)
    {
        var found = MicroFrontends(increment["fragments"]);
        Assert.Single(found);
        return found[0];
    }

    private static List<string?> Texts(JsonNode? node) =>
        All(node, o => (string?)o["type"] == "Text").Select(o => (string?)o["text"]).ToList();

    private int Hits(string remote) => Requests.Count(r => r["path"]!.StartsWith("/" + remote + "/"));

    private static string IslandId(string baseUrl, string route, string consumed, string type) =>
        "mfe_" + System.Text.RegularExpressions.Regex.Replace(baseUrl + "|" + route + "|" + consumed + "|" + type, "[^a-zA-Z0-9]", "_");

    // ── acceptance criteria ─────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task A_micro_frontend_without_resolve_is_exactly_as_before()
    {
        var (increment, _) = await Load("mfe-client");
        var microFrontend = OnlyMicroFrontend(increment);
        Assert.Null(microFrontend["resolved"]);
        Assert.Equal(
            new[] { "actionId", "appState", "baseUrl", "consumedRoute", "cssClasses", "route", "serverSideType", "style", "type" },
            microFrontend.Select(p => p.Key).OrderBy(k => k, StringComparer.Ordinal));
        Assert.Empty(Requests);
    }

    [Fact]
    public async Task A_server_micro_frontend_that_answers_in_time_is_embedded_keeping_its_origin()
    {
        var (increment, _) = await Load("mfe-fast");
        var microFrontend = OnlyMicroFrontend(increment);
        var resolved = microFrontend["resolved"]!.AsObject();
        Assert.Equal(["hello from fast"], Texts(resolved));
        // resolving is not absorbing: the island still points at the remote
        Assert.Equal(_hosts.RemoteBase + "/fast", (string?)microFrontend["baseUrl"]);
        Assert.Equal("/widget", (string?)microFrontend["route"]);
        Assert.Equal("remote.Widget", (string?)microFrontend["serverSideType"]);
        // its fragments target the island the renderer hosts it in
        Assert.Equal(IslandId(_hosts.RemoteBase + "/fast", "/widget", "_empty", "remote.Widget"),
            (string?)resolved["fragments"]![0]!["targetComponentId"]);
        // what acts on a page stays out: the page is the host's
        Assert.Empty(resolved["messages"]!.AsArray());
        Assert.Empty(resolved["commands"]!.AsArray());
        Assert.Empty(increment["messages"]!.AsArray());
        // the server-only resolution info never travels
        Assert.DoesNotContain("server", microFrontend.Select(p => p.Key));
        Assert.Equal(1, Hits("fast"));
        Assert.Equal([MicroFrontendResolutionOutcome.Embedded], Events.Select(e => e.Outcome));
    }

    [Fact]
    public async Task A_slow_remote_degrades_to_the_client_at_its_deadline_and_the_call_is_cancelled()
    {
        var before = Volatile.Read(ref _hosts.Cancelled);
        var watch = Stopwatch.StartNew();
        var (increment, _) = await Load("mfe-slow");
        Assert.True(watch.ElapsedMilliseconds < 1500, $"the remote takes 3 s, the budget is 150 ms: {watch.ElapsedMilliseconds}");
        var microFrontend = OnlyMicroFrontend(increment);
        Assert.Null(microFrontend["resolved"]);
        Assert.Equal(_hosts.RemoteBase + "/slow", (string?)microFrontend["baseUrl"]);
        var resolution = Assert.Single(Events);
        Assert.Equal(MicroFrontendResolutionOutcome.Timeout, resolution.Outcome);
        Assert.Equal("client", resolution.DegradedTo);
        Assert.Equal("slow", resolution.RemoteId);
        // the call is cancelled: the remote sees its request aborted long before its 3 s
        var cancelled = Stopwatch.StartNew();
        while (Volatile.Read(ref _hosts.Cancelled) == before && cancelled.ElapsedMilliseconds < 2000) await Task.Delay(20);
        Assert.True(Volatile.Read(ref _hosts.Cancelled) > before, "the remote call was not cancelled");
    }

    [Fact]
    public async Task A_remote_error_degrades_to_the_client_and_leaves_a_trace()
    {
        var (increment, _) = await Load("mfe-broken");
        var microFrontend = OnlyMicroFrontend(increment);
        Assert.Null(microFrontend["resolved"]);
        Assert.Equal(_hosts.RemoteBase + "/broken", (string?)microFrontend["baseUrl"]);
        var resolution = Assert.Single(Events);
        Assert.Equal(MicroFrontendResolutionOutcome.Error, resolution.Outcome);
        Assert.Equal("client", resolution.DegradedTo);
        Assert.Contains("HTTP 500", resolution.Error);
        Assert.False(string.IsNullOrWhiteSpace(resolution.CorrelationId));
    }

    [Fact]
    public async Task A_url_outside_the_registered_remotes_is_a_configuration_error_and_nothing_is_asked()
    {
        var (increment, _) = await Load("mfe-unregistered");
        Assert.Empty(Requests); // not even the registered one
        Assert.Empty(MicroFrontends(increment["fragments"]));
        Assert.Contains(increment["messages"]!.AsArray(), m => ((string?)m!["text"])!.Contains("Reference"));
    }

    [Fact]
    public async Task Several_fragments_are_asked_in_parallel()
    {
        var watch = Stopwatch.StartNew();
        var (increment, _) = await Load("mfe-parallel");
        var elapsed = watch.ElapsedMilliseconds;
        var microFrontends = MicroFrontends(increment["fragments"]);
        Assert.Equal(3, microFrontends.Count);
        Assert.All(microFrontends, m => Assert.NotNull(m["resolved"]));
        Assert.Equal(3, Hits("delayed"));
        // each takes 400 ms: in a row that is 1.2 s
        Assert.True(elapsed < 1100, $"took {elapsed} ms");
    }

    [Fact]
    public async Task The_remote_gets_the_users_identity_and_the_correlation_id()
    {
        await Load("mfe-fast", "Bearer alice", "corr-42");
        var request = Assert.Single(Requests);
        Assert.Equal("Bearer alice", request.GetValueOrDefault("Authorization"));
        Assert.Equal("corr-42", request.GetValueOrDefault("X-Mateu-Correlation-Id"));
        Assert.Equal("corr-42", Assert.Single(Events).CorrelationId);
    }

    [Fact]
    public async Task A_remote_gets_the_identity_its_strategy_says()
    {
        await Load("mfe-anon");
        await Load("mfe-exchanged");
        var requests = Requests;
        Assert.Equal(2, requests.Count);
        Assert.Null(requests[0].GetValueOrDefault("Authorization")); // none: anonymous
        Assert.False(string.IsNullOrWhiteSpace(requests[0].GetValueOrDefault("X-Mateu-Correlation-Id")));
        Assert.Equal("Bearer exchanged-for-exchanged", requests[1].GetValueOrDefault("Authorization"));
    }

    [Fact]
    public async Task A_fragment_cached_by_key_is_shared_by_callers_with_the_same_key()
    {
        var first = OnlyMicroFrontend((await Load("mfe-cache-key", "Bearer alice")).Body);
        Assert.Equal(["content for aud-A"], Texts(first["resolved"]));
        Assert.Equal(1, Hits("cachekey"));

        // the same caller again, within the max age: from the cache, nobody asked
        var again = OnlyMicroFrontend((await Load("mfe-cache-key", "Bearer alice")).Body);
        Assert.Equal(["content for aud-A"], Texts(again["resolved"]));
        Assert.Equal(1, Hits("cachekey"));

        // another caller with the SAME key: the remote is told what the host holds and answers "yours"
        var anna = OnlyMicroFrontend((await Load("mfe-cache-key", "Bearer anna")).Body);
        Assert.Equal(["content for aud-A"], Texts(anna["resolved"]));
        Assert.Equal("aud-A", Requests[1].GetValueOrDefault("X-Mateu-Fragment-Keys"));
        Assert.Equal(MicroFrontendResolutionOutcome.FromCache, Events[^1].Outcome);

        // another key: not from the cache
        var bob = OnlyMicroFrontend((await Load("mfe-cache-key", "Bearer bob")).Body);
        Assert.Equal(["content for aud-B"], Texts(bob["resolved"]));
        Assert.Equal(MicroFrontendResolutionOutcome.Embedded, Events[^1].Outcome);
    }

    [Fact]
    public async Task A_fragment_cached_per_user_is_not_shared_between_users()
    {
        await Load("mfe-cache-user", "Bearer carol");
        await Load("mfe-cache-user", "Bearer carol");
        Assert.Equal(1, Hits("cacheuser"));
        await Load("mfe-cache-user", "Bearer dave");
        Assert.Equal(2, Hits("cacheuser"));
    }

    [Fact]
    public async Task A_shared_fragment_is_cached_for_everyone()
    {
        await Load("mfe-cache-shared", "Bearer erin");
        await Load("mfe-cache-shared", "Bearer frank");
        Assert.Equal(1, Hits("cacheshared"));
    }

    [Fact]
    public async Task A_fragment_declared_none_is_never_cached()
    {
        await Load("mfe-cache-none");
        await Load("mfe-cache-none");
        await Load("mfe-cache-none");
        Assert.Equal(3, Hits("cachenone"));
    }

    [Fact]
    public async Task A_content_slot_with_content_is_painted_in_the_same_response()
    {
        var (increment, _) = await Load("mfe-slot-page");
        var slots = MicroFrontends(increment["fragments"]);
        var slot = Assert.Single(slots);
        Assert.Equal(["slot front-office.home.destacado"], Texts(slot["resolved"]));
        // the url was built from the key, against the registered content remote
        Assert.Equal("/_content-hub", (string?)slot["baseUrl"]);
        var paths = Requests.Select(r => r["path"]).ToList();
        Assert.Contains("/_content-hub/mateu/v3/sync/content-slots/front-office.home.destacado", paths);
        Assert.All(paths, p => Assert.StartsWith("/_content-hub/", p));
        Assert.All(Requests, r => Assert.Equal("Bearer alice", r.GetValueOrDefault("Authorization")));
        // the empty slot paints its fallback; the one without fallback paints nothing — and the client
        // is never handed a slot to ask for
        var texts = Texts(increment["fragments"]);
        Assert.Contains("Nothing yet", texts);
        Assert.DoesNotContain("No news", texts);
        Assert.DoesNotContain(All(increment["fragments"], o => o["id"] is not null),
            o => (string?)o["id"] == "slot_front_office_home_vacio_sin_fallback");
        var outcomes = Events.Select(e => (e.SlotKey, e.Outcome)).ToList();
        Assert.Contains(("front-office.home.destacado", MicroFrontendResolutionOutcome.Embedded), outcomes);
        Assert.Contains(("front-office.home.vacio", MicroFrontendResolutionOutcome.Empty), outcomes);
        Assert.Contains(("front-office.home.vacio-sin-fallback", MicroFrontendResolutionOutcome.Empty), outcomes);
    }

    [Fact]
    public async Task A_content_slot_that_is_down_or_slow_paints_its_fallback_and_the_screen_stands()
    {
        var watch = Stopwatch.StartNew();
        var (increment, status) = await Load("mfe-dead-slot-page");
        var elapsed = watch.ElapsedMilliseconds;
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Empty(MicroFrontends(increment["fragments"]));
        var texts = Texts(increment["fragments"]);
        Assert.Contains("Down fallback", texts);
        Assert.Contains("Slow fallback", texts);
        Assert.Empty(increment["messages"]!.AsArray());
        Assert.True(elapsed < 1500, $"took {elapsed} ms");
        Assert.Equal(
            new[] { MicroFrontendResolutionOutcome.Timeout, MicroFrontendResolutionOutcome.Error },
            Events.Select(e => e.Outcome).OrderByDescending(o => o == MicroFrontendResolutionOutcome.Timeout));
        Assert.All(Events, e => Assert.Equal("fallback", e.DegradedTo));
    }

    [Fact]
    public async Task A_remote_on_a_path_of_this_server_is_called_at_its_own_socket()
    {
        // no SelfBaseUrl: the content service is a PATH of this very server, reached through the
        // local socket the request arrived on (never a request header)
        var host = await _hosts.StartHost(o => o.SelfBaseUrl = null,
            app => app.MapPost("/_content-hub/{**path}", _hosts.AnswerAsRemote));
        try
        {
            using var http = new HttpClient { BaseAddress = new Uri(MfeHosts.Address(host)) };
            var (increment, status) = await Post(http, "mfe-slot-page");
            Assert.Equal(HttpStatusCode.OK, status);
            var slot = Assert.Single(MicroFrontends(increment["fragments"]));
            Assert.Equal(["slot front-office.home.destacado"], Texts(slot["resolved"]));
            Assert.Contains("/_content-hub/mateu/v3/sync/content-slots/front-office.home.destacado",
                Requests.Select(r => r["path"]));
        }
        finally
        {
            await host.StopAsync();
            await host.DisposeAsync();
        }
    }

    [Fact]
    public void The_local_origin_is_written_from_the_socket()
    {
        Assert.Equal("http://127.0.0.1:8080", MateuExtensions.LocalOrigin(System.Net.IPAddress.Parse("127.0.0.1"), 8080, false));
        Assert.Equal("https://[::1]:8443", MateuExtensions.LocalOrigin(System.Net.IPAddress.IPv6Loopback, 8443, true));
        Assert.Equal("http://10.0.0.5:80", MateuExtensions.LocalOrigin(System.Net.IPAddress.Parse("10.0.0.5").MapToIPv6(), 80, false));
        Assert.Null(MateuExtensions.LocalOrigin(null, 8080, false));
        Assert.Null(MateuExtensions.LocalOrigin(System.Net.IPAddress.Loopback, 0, false));
    }

    [Fact]
    public async Task The_slot_descriptor_is_served_only_when_enabled()
    {
        var (refused, status) = await Load("mfe-slot-page", actionId: "__content_slots__");
        Assert.Equal(HttpStatusCode.Forbidden, status);
        Assert.Null(refused["appData"]);

        var enabled = await _hosts.StartHost(o => o.ContentSlotsDescriptorEnabled = true);
        try
        {
            using var http = new HttpClient { BaseAddress = new Uri(MfeHosts.Address(enabled)) };
            var (answer, ok) = await Post(http, "mfe-slot-page", actionId: "__content_slots__");
            Assert.Equal(HttpStatusCode.OK, ok);
            var descriptor = answer["appData"]!["_contentSlots"]!;
            Assert.Equal(1, (int)descriptor["version"]!);
            var slot = descriptor["slots"]!.AsArray()
                .Single(s => (string?)s!["key"] == "front-office.home.destacado")!;
            Assert.Equal("front-office", (string?)slot["application"]);
            Assert.Equal("home", (string?)slot["screen"]);
            Assert.Equal("destacado", (string?)slot["name"]);
            Assert.Equal(typeof(MfeSlotPage).FullName, (string?)slot["declaredIn"]);
            Assert.Equal("Destacado", (string?)slot["field"]);
            Assert.Equal("mfe-slot-page", (string?)slot["route"]);
            Assert.Equal("No news", (string?)slot["fallback"]);
            Assert.Equal("The featured block", (string?)slot["description"]);
            Assert.Equal(0, (int)slot["timeoutMs"]!);
            Assert.False((bool)slot["degradeToClient"]!);
            Assert.Empty(descriptor["duplicates"]!.AsArray());
        }
        finally
        {
            await enabled.StopAsync();
            await enabled.DisposeAsync();
        }
    }
}
