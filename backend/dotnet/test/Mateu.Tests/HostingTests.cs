using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// An action that fails like a bug, and one that fails on purpose, for the user.
[UI("hosting-probe"), Title("Hosting probe")]
public class HostingProbeView
{
    [Button] public Message Explode() => throw new InvalidOperationException("db password is hunter2");
    [Button] public Message Refuse() => throw new UserFacingException("Check-in", "The booking is already checked in");
    [Button, DisabledUnless(Roles = ["manager"])] public Message Approve() => new("approved");
}

// A proxied source whose url carries a secret.
[UI("hosting-proxy"), Title("Hosting proxy")]
public class HostingProxyView
{
    [RestOptions("https://api.example.com/countries?key=${secret.API_KEY}", Proxy = true)]
    public string Country { get; set; } = "";
}

/// <summary>The ASP.NET Core adapter: identity from HttpContext.User, secrets, the error boundary and
/// the async proxy fetch.</summary>
[Collection("ActionSecurity")]
public class HostingTests
{
    private static ClaimsPrincipal User(params Claim[] claims) =>
        new(new ClaimsIdentity(claims, authenticationType: "test"));

    [Fact]
    public void Claims_map_to_the_identity_dimensions()
    {
        var id = ClaimsIdentityMapper.From(User(
            new Claim(ClaimTypes.Role, "manager"),
            new Claim("roles", "Sales Manager"),
            new Claim("groups", "[\"emea\",\"ops\"]"),
            new Claim("scope", "orders.read orders.write"),
            new Claim("permissions", "approve")))!;

        Assert.Equal(["manager", "Sales Manager"], id.Roles);
        Assert.Equal(["emea", "ops"], id.Groups);
        Assert.Equal(["orders.read", "orders.write"], id.Scopes);
        Assert.Equal(["approve"], id.Permissions);
    }

    [Fact]
    public void An_anonymous_user_has_no_identity()
    {
        Assert.Null(ClaimsIdentityMapper.From(new ClaimsPrincipal(new ClaimsIdentity())));
        Assert.Null(ClaimsIdentityMapper.From(null));
    }

    private static (SyncHandler Handler, IHttpContextAccessor Accessor) Host(Action<MateuOptions>? configure = null,
        Action<IServiceCollection>? services = null)
    {
        var sc = new ServiceCollection();
        services?.Invoke(sc);
        sc.AddMateu(configure ?? (_ => { }), typeof(HostingProbeView).Assembly);
        var sp = sc.BuildServiceProvider();
        return (sp.GetRequiredService<SyncHandler>(), sp.GetRequiredService<IHttpContextAccessor>());
    }

    private static RunActionRqDto Action(string route, string actionId) => new()
    {
        Route = route, ConsumedRoute = route, ActionId = actionId,
    };

    [Fact]
    public void AddMateu_matches_the_gates_against_the_request_user_by_default()
    {
        var (handler, accessor) = Host();

        // Before: AddMateu built the handler WITHOUT identity, so every gate denied everyone.
        accessor.HttpContext = new DefaultHttpContext { User = User(new Claim(ClaimTypes.Role, "manager")) };
        Assert.Contains("approved", JsonSerializer.Serialize(handler.Handle(Action("hosting-probe", "approve"))));

        accessor.HttpContext = new DefaultHttpContext { User = User(new Claim(ClaimTypes.Role, "clerk")) };
        Assert.Throws<MateuForbiddenException>(() => handler.Handle(Action("hosting-probe", "approve")));

        accessor.HttpContext = new DefaultHttpContext();
        Assert.Throws<MateuForbiddenException>(() => handler.Handle(Action("hosting-probe", "approve")));
    }

    [Fact]
    public void The_identity_mapping_is_configurable()
    {
        var (handler, accessor) = Host(o => o.Identity = ctx =>
            ctx.Request.Headers["X-Role"] is { Count: > 0 } role ? new Identity(Roles: [role.ToString()]) : null);
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["X-Role"] = "manager";
        accessor.HttpContext = ctx;
        Assert.Contains("approved", JsonSerializer.Serialize(handler.Handle(Action("hosting-probe", "approve"))));
    }

    private sealed class FakeHttp(Func<HttpRequestMessage, HttpResponseMessage> answer) : HttpMessageHandler
    {
        public readonly List<string> Urls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Urls.Add(request.RequestUri!.ToString());
            return Task.FromResult(answer(request));
        }
    }

    private sealed class Secrets : ISecretsProvider
    {
        public string? Secret(string key) => key == "API_KEY" ? "s3cr3t" : null;
    }

    private static RunActionRqDto RestFetch() => new()
    {
        Route = "hosting-proxy", ConsumedRoute = "hosting-proxy", ActionId = "__restfetch__",
        Parameters = new() { ["_sourceKind"] = "options", ["_sourceId"] = "country" },
    };

    private static string RestFetched(UIIncrementDto increment) =>
        JsonSerializer.Serialize(((Dictionary<string, object?>)increment.AppData!)["_restfetch"]);

    [Fact]
    public async Task The_proxy_fetch_is_async_and_injects_the_registered_secret()
    {
        var fake = new FakeHttp(_ => new HttpResponseMessage(HttpStatusCode.OK)
            { Content = new StringContent("[{\"code\":\"ES\"}]") });
        var (handler, _) = Host(o => o.HttpClient = new HttpClient(fake),
            sc => sc.AddSingleton<ISecretsProvider, Secrets>());

        var increment = await handler.HandleAsync(RestFetch());

        Assert.Equal(["https://api.example.com/countries?key=s3cr3t"], fake.Urls);
        Assert.Equal("[{\"code\":\"ES\"}]", RestFetched(increment));
    }

    [Fact]
    public async Task A_failing_proxied_endpoint_answers_an_empty_result()
    {
        var fake = new FakeHttp(_ => new HttpResponseMessage(HttpStatusCode.BadGateway));
        var (handler, _) = Host(o => { o.HttpClient = new HttpClient(fake); o.Secrets = _ => "k"; });
        Assert.Equal("{}", RestFetched(await handler.HandleAsync(RestFetch())));
        Assert.Equal(["https://api.example.com/countries?key=k"], fake.Urls);
    }

    private static DefaultHttpContext Context(bool? detailed)
    {
        var sc = new ServiceCollection();
        sc.AddSingleton(new MateuOptions { DetailedErrors = detailed });
        return new DefaultHttpContext { RequestServices = sc.BuildServiceProvider(), TraceIdentifier = "trace-42" };
    }

    private static async Task<(UIIncrementDto Increment, int Status)> Guarded(bool? detailed, string actionId)
    {
        var (handler, _) = Host();
        var ctx = Context(detailed);
        var rq = Action("hosting-probe", actionId);
        var increment = await MateuExtensions.RunGuarded(ctx, rq, () => handler.HandleAsync(rq));
        return (increment, ctx.Response.StatusCode);
    }

    [Fact]
    public async Task An_unexpected_exception_becomes_a_generic_error_message_with_a_correlation_id()
    {
        var (increment, status) = await Guarded(detailed: false, "explode");
        Assert.Equal(200, status);
        var message = Assert.Single(increment.Messages);
        Assert.Equal("error", message.Variant);
        Assert.Contains("trace-42", message.Text);
        Assert.DoesNotContain("hunter2", message.Text);
    }

    [Fact]
    public async Task In_development_the_exception_detail_reaches_the_screen()
    {
        var (increment, _) = await Guarded(detailed: true, "explode");
        var message = Assert.Single(increment.Messages);
        Assert.Equal("InvalidOperationException", message.Title);
        Assert.Contains("hunter2", message.Text);
        Assert.Contains("trace-42", message.Text);
    }

    [Fact]
    public async Task A_user_facing_exception_shows_its_message_always()
    {
        var (increment, _) = await Guarded(detailed: false, "refuse");
        var message = Assert.Single(increment.Messages);
        Assert.Equal("Check-in", message.Title);
        Assert.Equal("The booking is already checked in", message.Text);
    }

    [Fact]
    public async Task A_denied_action_answers_403()
    {
        var (increment, status) = await Guarded(detailed: false, "approve");
        Assert.Equal(403, status);
        Assert.Equal("Forbidden", Assert.Single(increment.Messages).Text);
    }
}
