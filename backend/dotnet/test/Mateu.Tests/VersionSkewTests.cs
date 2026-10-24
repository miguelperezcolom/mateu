using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Mateu.Tests;

/// <summary>The version-skew transport headers over real HTTP: <c>X-Mateu-Build</c> on every Mateu
/// response (a load, a refused action, a 404), the override, its CORS exposure, and the one-time
/// warning for a renderer speaking another wire major. In the DevMode collection with the other tests
/// that boot a WebApplication.</summary>
[Collection("DevMode")]
public class VersionSkewTests
{
    private sealed class Captured : ILoggerProvider
    {
        public readonly ConcurrentQueue<string> Lines = new();
        public ILogger CreateLogger(string categoryName) => new L(this, categoryName);
        public void Dispose() { }

        private sealed class L(Captured owner, string category) : ILogger
        {
            public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
            public bool IsEnabled(LogLevel logLevel) => true;
            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
                Func<TState, Exception?, string> formatter)
            {
                if (category == "Mateu.VersionSkew") owner.Lines.Enqueue(logLevel + ": " + formatter(state, exception));
            }
        }
    }

    private sealed class Running(WebApplication app, HttpClient http, Captured log) : IAsyncDisposable
    {
        public HttpClient Http { get; } = http;
        public Captured Log { get; } = log;

        public async ValueTask DisposeAsync()
        {
            Http.Dispose();
            await app.StopAsync();
            await app.DisposeAsync();
            MateuLogging.UseLoggerFactory(null);
        }
    }

    private static async Task<Running> Boot(Action<MateuOptions>? configure = null, bool cors = false)
    {
        var log = new Captured();
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Logging.AddProvider(log);
        builder.Services.AddMateu(o => configure?.Invoke(o), typeof(HttpSecurityProbeView).Assembly);
        if (cors)
            builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
                p.WithOrigins("http://other.example").AllowAnyHeader().AllowAnyMethod().WithExposedHeaders("X-Other")));
        var app = builder.Build();
        if (cors) app.UseCors();
        app.MapMateu();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        return new Running(app, new HttpClient { BaseAddress = new Uri(address) }, log);
    }

    private static Task<HttpResponseMessage> Sync(Running host, string actionId = "", string? renderer = null)
    {
        var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/http-security-probe")
        {
            Content = JsonContent.Create(new RunActionRqDto { Route = "http-security-probe", ActionId = actionId },
                options: MateuExtensions.Json),
        };
        if (renderer is not null) rq.Headers.TryAddWithoutValidation(VersionSkew.RendererHeader, renderer);
        return host.Http.SendAsync(rq);
    }

    private static string Build(HttpResponseMessage r) =>
        Assert.Single(r.Headers.GetValues(VersionSkew.BuildHeader));

    [Fact]
    public async Task Every_mateu_response_carries_the_build_header()
    {
        await using var host = await Boot();
        var ok = await Sync(host);
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        var build = Build(ok);
        Assert.Matches("^[0-9a-f]{16}$", build);

        var refused = await Sync(host, "no-such-action");
        Assert.Equal(HttpStatusCode.Forbidden, refused.StatusCode);
        Assert.Equal(build, Build(refused));

        var missing = await host.Http.PostAsync("/mateu/v3/nothing-here",
            new StringContent("{}", Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal(build, Build(missing));
    }

    [Fact]
    public async Task A_non_mateu_path_does_not_carry_it()
    {
        await using var host = await Boot();
        var r = await host.Http.GetAsync("/somewhere-else");
        Assert.False(r.Headers.Contains(VersionSkew.BuildHeader));
    }

    [Fact]
    public async Task The_build_id_is_stable_across_hosts_of_the_same_release()
    {
        string first, second;
        await using (var a = await Boot()) first = Build(await Sync(a));
        await using (var b = await Boot()) second = Build(await Sync(b));
        Assert.Equal(first, second);
    }

    [Fact]
    public async Task The_option_overrides_it_sanitised()
    {
        await using var host = await Boot(o => o.BuildId = "release 42/blue" + new string('x', 80));
        var build = Build(await Sync(host));
        Assert.StartsWith("release42blue", build);
        Assert.Equal(64, build.Length);
    }

    [Fact]
    public void The_environment_overrides_it_when_no_option_is_set()
    {
        var before = Environment.GetEnvironmentVariable(VersionSkew.BuildIdEnvironmentVariable);
        try
        {
            Environment.SetEnvironmentVariable(VersionSkew.BuildIdEnvironmentVariable, "v1.2.3");
            Assert.Equal("v1.2.3", new VersionSkew(null, new MateuRegistry(typeof(HttpSecurityProbeView).Assembly)).BuildId);
            Assert.Equal("opt", new VersionSkew("opt", new MateuRegistry(typeof(HttpSecurityProbeView).Assembly)).BuildId);
        }
        finally { Environment.SetEnvironmentVariable(VersionSkew.BuildIdEnvironmentVariable, before); }
    }

    [Fact]
    public void Specs_change_the_computed_id()
    {
        var registry = new MateuRegistry(typeof(HttpSecurityProbeView).Assembly);
        var dir = Directory.CreateTempSubdirectory("mateu-build-").FullName;
        try
        {
            File.WriteAllText(Path.Combine(dir, "home.yaml"), "type: VerticalLayout\n");
            var before = VersionSkew.Compute(registry, dir);
            Assert.Equal(before, VersionSkew.Compute(registry, dir));
            File.WriteAllText(Path.Combine(dir, "home.yaml"), "type: HorizontalLayout\n");
            Assert.NotEqual(before, VersionSkew.Compute(registry, dir));
        }
        finally { Directory.Delete(dir, true); }
    }

    [Fact]
    public async Task Cors_exposes_the_build_header_next_to_the_hosts_own()
    {
        await using var host = await Boot(cors: true);
        var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/http-security-probe")
        {
            Content = JsonContent.Create(new RunActionRqDto { Route = "http-security-probe" }, options: MateuExtensions.Json),
        };
        rq.Headers.Add("Origin", "http://other.example");
        var r = await host.Http.SendAsync(rq);
        Assert.Equal("http://other.example", Assert.Single(r.Headers.GetValues("Access-Control-Allow-Origin")));
        var exposed = string.Join(",", r.Headers.GetValues("Access-Control-Expose-Headers"));
        Assert.Contains(VersionSkew.BuildHeader, exposed);
        Assert.Contains("X-Other", exposed);
    }

    [Fact]
    public async Task Without_cors_nothing_is_exposed()
    {
        await using var host = await Boot();
        var rq = new HttpRequestMessage(HttpMethod.Post, "/mateu/v3/sync/http-security-probe")
        {
            Content = JsonContent.Create(new RunActionRqDto { Route = "http-security-probe" }, options: MateuExtensions.Json),
        };
        rq.Headers.Add("Origin", "http://other.example");
        var r = await host.Http.SendAsync(rq);
        Assert.False(r.Headers.Contains("Access-Control-Expose-Headers"));
    }

    [Fact]
    public async Task A_renderer_of_another_wire_major_is_warned_about_once()
    {
        await using var host = await Boot();
        await Sync(host, renderer: "vaadin/2.9.0 wire/2.4");
        await Sync(host, renderer: "vaadin/2.9.0 wire/2.4");
        await Sync(host, renderer: "vaadin/3.0.0 wire/3.0");
        await Sync(host, renderer: "garbled");
        await Sync(host);
        var line = Assert.Single(host.Log.Lines);
        Assert.Equal("Warning: Renderer 'vaadin/2.9.0 wire/2.4' speaks wire 2.4; this server speaks "
                     + UIIncrementDto.CurrentWireVersion + ". Upgrade the renderer or the server so their majors match.", line);
    }

    [Fact]
    public void The_remembered_renderers_are_bounded()
    {
        var skew = new VersionSkew("x", new MateuRegistry(typeof(HttpSecurityProbeView).Assembly));
        for (var i = 0; i < VersionSkew.MaxRememberedRenderers; i++)
            Assert.NotNull(skew.WarningFor($"r/{i} wire/2.0", "3.0"));
        Assert.Null(skew.WarningFor("r/overflow wire/2.0", "3.0"));
        Assert.Null(skew.WarningFor("r/0 wire/2.0", "3.0"));
        Assert.Equal(2, VersionSkew.WireMajorOf("redwood/3.0.0 wire/2.1"));
        Assert.Null(VersionSkew.WireMajorOf("redwood/3.0.0"));
    }
}
