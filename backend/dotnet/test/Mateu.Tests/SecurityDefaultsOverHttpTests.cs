using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
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
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// A view whose proxied sources reach a REAL upstream. The origin comes from server-held
// configuration (the secrets option), never from the request — the IRestSourceSupplier invariant.
[UI("http-proxy-secrets"), Title("Proxy secrets")]
public class HttpProxySecretsView : IRestSourceSupplier
{
    public string? Name { get; set; }

    public IReadOnlyList<DeclaredRestSource> DeclaredRestSources() =>
    [
        new(RestSourceKind.Action, "create", new RestDataSource
        {
            Url = "${secret.UPSTREAM}/people", Method = "POST", Proxy = true,
            Headers = new Dictionary<string, string>
            {
                ["X-Api-Key"] = "${secret.API_KEY}",
                ["Content-Type"] = "application/json",
            },
            Body = "{\"name\":\"${state.name}\"}",
        }),
        new(RestSourceKind.Action, "fail", new RestDataSource { Url = "${secret.UPSTREAM}/fail", Method = "PUT", Proxy = true }),
        new(RestSourceKind.Action, "remove", new RestDataSource { Url = "${secret.UPSTREAM}/gone", Method = "DELETE", Proxy = true }),
    ];
}

[UI("http-security-probe"), Title("Security probe")]
public class HttpSecurityProbeView
{
    public string Public { get; set; } = "everyone";
    [EyesOnly(Roles = ["hr"])] public string Salary { get; set; } = "100k";
    [Button] public Message Explode() => throw new InvalidOperationException("db password is hunter2");
    [Button, DisabledUnless(Roles = ["manager"])] public Message Approve() => new("approved");
}

/// <summary>The security defaults over REAL HTTP (a Kestrel host on a free port): the native MCP
/// endpoint is off unless enabled and goes through the same RBAC and error boundary as sync; a
/// malformed body is an error toast, never a raw 500; a denied action answers 403; no CORS header is
/// granted unless the host configures it; the proxied leg sends secrets upstream only, escapes JSON
/// bodies and surfaces failures. Mirrors Java's AdapterParityITFoundation and RestProxySecretsSyncTest.
/// In the DevMode collection with the other tests that boot a WebApplication.</summary>
[Collection("DevMode")]
public class SecurityDefaultsOverHttpTests
{
    private static readonly string ApiKey = "test-key-" + Guid.NewGuid().ToString("N");

    private sealed class Running(WebApplication app, HttpClient http) : IAsyncDisposable
    {
        public HttpClient Http { get; } = http;

        public async ValueTask DisposeAsync()
        {
            Http.Dispose();
            await app.StopAsync();
            await app.DisposeAsync();
            MateuLogging.UseLoggerFactory(null);
        }
    }

    private static async Task<Running> Boot(Action<MateuOptions>? configure = null)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o => configure?.Invoke(o), typeof(HttpSecurityProbeView).Assembly);
        var app = builder.Build();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return new Running(app, new HttpClient { BaseAddress = new Uri(address) });
    }

    private static StringContent JsonBody(string json) => new(json, Encoding.UTF8, "application/json");

    // ── MCP ──────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Mcp_is_off_by_default()
    {
        await using var host = await Boot();
        var r = await host.Http.PostAsync("/mateu/mcp", JsonBody("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}"));
        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
    }

    [Fact]
    public async Task Mcp_is_served_when_enabled()
    {
        await using var host = await Boot(o => o.Mcp = true);
        var r = await host.Http.PostAsync("/mateu/mcp", JsonBody("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}"));
        Assert.Contains("protocolVersion", await r.Content.ReadAsStringAsync());
        var n = await host.Http.PostAsync("/mateu/mcp", JsonBody("{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}"));
        Assert.Equal(HttpStatusCode.Accepted, n.StatusCode);
    }

    [Fact]
    public void The_environment_turns_mcp_on_only_with_a_true_value()
    {
        var before = Environment.GetEnvironmentVariable("MATEU_MCP_ENABLED");
        try
        {
            foreach (var (value, expected) in new[] { ("true", true), ("1", true), ("YES", true), ("false", false), ("", false) })
            {
                Environment.SetEnvironmentVariable("MATEU_MCP_ENABLED", value);
                Assert.Equal(expected, MateuOptions.McpEnabledByEnvironment());
            }
        }
        finally { Environment.SetEnvironmentVariable("MATEU_MCP_ENABLED", before); }
    }

    [Fact]
    public async Task A_malformed_mcp_message_is_a_parse_error_not_a_500()
    {
        await using var host = await Boot(o => o.Mcp = true);
        var r = await host.Http.PostAsync("/mateu/mcp", JsonBody("{not json"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.Contains("-32700", await r.Content.ReadAsStringAsync());
    }

    private static async Task<string> ToolCall(Running host, string name, string arguments)
    {
        var r = await host.Http.PostAsync("/mateu/mcp", JsonBody(
            "{\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"tools/call\",\"params\":{\"name\":\"" + name + "\",\"arguments\":" + arguments + "}}"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("result").GetProperty("content")[0].GetProperty("text").GetString()!;
    }

    [Fact]
    public async Task A_failing_mcp_tool_call_goes_through_the_error_boundary()
    {
        await using var host = await Boot(o => o.Mcp = true);
        var text = await ToolCall(host, "mateu_run_action", "{\"route\":\"http-security-probe\",\"actionId\":\"explode\"}");
        Assert.DoesNotContain("hunter2", text);
        Assert.Contains("Reference", text);
    }

    [Fact]
    public async Task Mcp_applies_the_same_rbac_as_sync()
    {
        await using var host = await Boot(o => o.Mcp = true);
        var text = await ToolCall(host, "mateu_describe_screen", "{\"route\":\"http-security-probe\"}");
        Assert.Contains("everyone", text);
        Assert.DoesNotContain("100k", text);
        var denied = await ToolCall(host, "mateu_run_action", "{\"route\":\"http-security-probe\",\"actionId\":\"approve\"}");
        Assert.DoesNotContain("approved", denied);
    }

    // ── sync endpoint ────────────────────────────────────────────────────────

    [Fact]
    public async Task A_malformed_body_is_an_error_toast_not_a_500()
    {
        await using var host = await Boot();
        var r = await host.Http.PostAsync("/mateu/v3/sync/http-security-probe", JsonBody("{not json"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        var increment = await r.Content.ReadFromJsonAsync<UIIncrementDto>(MateuExtensions.Json);
        Assert.Equal("error", Assert.Single(increment!.Messages).Variant);
    }

    [Fact]
    public async Task An_unexpected_exception_shows_a_reference_never_its_text()
    {
        await using var host = await Boot();
        var r = await host.Http.PostAsJsonAsync("/mateu/v3/sync/http-security-probe",
            new RunActionRqDto { Route = "http-security-probe", ActionId = "explode" }, MateuExtensions.Json);
        var body = await r.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.DoesNotContain("hunter2", body);
        Assert.Contains("Reference", body);
    }

    [Fact]
    public async Task A_denied_action_answers_403_and_never_runs()
    {
        await using var host = await Boot();
        var r = await host.Http.PostAsJsonAsync("/mateu/v3/sync/http-security-probe",
            new RunActionRqDto { Route = "http-security-probe", ActionId = "approve" }, MateuExtensions.Json);
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
        Assert.DoesNotContain("approved", await r.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task An_eyes_only_field_is_hidden_from_an_anonymous_caller()
    {
        await using var host = await Boot();
        var r = await host.Http.PostAsJsonAsync("/mateu/v3/sync/http-security-probe",
            new RunActionRqDto { Route = "http-security-probe" }, MateuExtensions.Json);
        var body = await r.Content.ReadAsStringAsync();
        Assert.Contains("everyone", body);
        Assert.DoesNotContain("100k", body);
    }

    [Fact]
    public async Task No_cross_origin_access_is_granted_by_default()
    {
        await using var host = await Boot();
        using var preflight = new HttpRequestMessage(HttpMethod.Options, "/mateu/v3/sync/http-security-probe");
        preflight.Headers.Add("Origin", "http://other.example");
        preflight.Headers.Add("Access-Control-Request-Method", "POST");
        var p = await host.Http.SendAsync(preflight);
        Assert.False(p.Headers.Contains("Access-Control-Allow-Origin"));
        using var post = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/http-security-probe")
        {
            Content = JsonBody("{\"route\":\"http-security-probe\"}"),
        };
        post.Headers.Add("Origin", "http://other.example");
        var a = await host.Http.SendAsync(post);
        Assert.False(a.Headers.Contains("Access-Control-Allow-Origin"));
    }

    // ── the proxied leg against a real upstream ──────────────────────────────

    private sealed record Received(string Method, string Path, string Body, Dictionary<string, string> Headers);

    private static async Task<(WebApplication App, string Origin, ConcurrentQueue<Received> Seen)> Upstream()
    {
        var seen = new ConcurrentQueue<Received>();
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        var app = builder.Build();
        app.Run(async ctx =>
        {
            using var reader = new StreamReader(ctx.Request.Body);
            var body = await reader.ReadToEndAsync();
            var headers = ctx.Request.Headers.ToDictionary(h => h.Key.ToLowerInvariant(), h => h.Value.ToString());
            seen.Enqueue(new Received(ctx.Request.Method, ctx.Request.Path, body, headers));
            switch (ctx.Request.Path.Value)
            {
                case "/fail": ctx.Response.StatusCode = 500; break;
                case "/gone": ctx.Response.StatusCode = 204; break;
                default:
                    ctx.Response.ContentType = "application/json";
                    await ctx.Response.WriteAsync("{\"id\":42}");
                    break;
            }
        });
        await app.StartAsync();
        var origin = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First().TrimEnd('/');
        return (app, origin, seen);
    }

    private static async Task<(int Status, string Body)> RestFetch(Running host, string sourceId, string? name = null)
    {
        var rq = new RunActionRqDto
        {
            Route = "http-proxy-secrets", ConsumedRoute = "http-proxy-secrets", ActionId = "__restfetch__",
            ServerSideType = typeof(HttpProxySecretsView).FullName,
            Parameters = new() { ["_sourceKind"] = "action", ["_sourceId"] = sourceId },
            ComponentState = name is null ? new() : new() { ["name"] = name },
        };
        var r = await host.Http.PostAsJsonAsync("/mateu/v3/sync/http-proxy-secrets", rq, MateuExtensions.Json);
        return ((int)r.StatusCode, await r.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task The_proxied_leg_sends_the_secret_upstream_only_and_escapes_the_json_body()
    {
        var (upstream, origin, seen) = await Upstream();
        try
        {
            await using var host = await Boot(o => o.Secrets = key => key switch
            {
                "UPSTREAM" => origin,
                "API_KEY" => ApiKey,
                _ => null,
            });
            var tricky = "Ana \"la\" O'Neil\nsecond\", \"admin\": true, \"x\":\"";

            var (status, body) = await RestFetch(host, "create", tricky);

            Assert.Equal(200, status);
            Assert.True(seen.TryDequeue(out var rq));
            Assert.Equal("POST", rq!.Method);
            Assert.Equal(ApiKey, rq.Headers["x-api-key"]);
            Assert.StartsWith("application/json", rq.Headers["content-type"]);
            using (var sent = JsonDocument.Parse(rq.Body))
            {
                Assert.Equal(tricky, sent.RootElement.GetProperty("name").GetString());
                Assert.Single(sent.RootElement.EnumerateObject());
            }
            Assert.Contains("\"_restfetch\":{\"id\":42}", body);
            Assert.DoesNotContain(ApiKey, body);

            var (_, failed) = await RestFetch(host, "fail");
            Assert.Contains("\"_restfetchError\":{\"status\":500,\"message\":\"Request failed (HTTP 500)\"}", failed);
            Assert.DoesNotContain("\"_restfetch\":", failed);

            var (_, gone) = await RestFetch(host, "remove");
            Assert.Contains("\"_restfetch\":{}", gone);
        }
        finally
        {
            await upstream.StopAsync();
            await upstream.DisposeAsync();
        }
    }
}
