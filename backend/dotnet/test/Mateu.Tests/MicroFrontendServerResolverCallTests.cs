using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Core.MicroFrontends;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>What the host SENDS to a remote when it resolves a micro frontend on the server, and what it
/// does with odd answers — against an in-memory transport (the Kestrel suites cover the real wire).</summary>
public class MicroFrontendServerResolverCallTests
{
    private const string Base = "https://orders.acme.com/ui";

    /// <summary>Answers every call with a fixed status and body, and keeps what it was sent.</summary>
    private sealed class Answering(HttpStatusCode status, string body) : HttpMessageHandler
    {
        public readonly ConcurrentQueue<(Uri Uri, JsonObject Body)> Calls = new();

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            var sent = await request.Content!.ReadAsStringAsync(token);
            Calls.Enqueue((request.RequestUri!, (JsonObject)JsonNode.Parse(sent)!));
            return new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
        }
    }

    private sealed class Supplier(params RemoteDescriptor[] remotes) : IRemoteCatalogSupplier
    {
        public IReadOnlyList<RemoteDescriptor> Remotes() => remotes;
    }

    private sealed class Recording : IMicroFrontendResolutionListener
    {
        public readonly ConcurrentQueue<MicroFrontendResolutionEvent> Events = new();
        public void OnResolution(MicroFrontendResolutionEvent resolution) => Events.Enqueue(resolution);
    }

    private sealed class Failing : IMicroFrontendResolutionListener
    {
        public void OnResolution(MicroFrontendResolutionEvent resolution) => throw new InvalidOperationException("boom");
    }

    private static MicroFrontendServerResolver Resolver(HttpMessageHandler handler,
        IReadOnlyList<IMicroFrontendResolutionListener>? listeners = null, RemoteDescriptor? remote = null) => new(
        new DefaultRemoteRegistry([new Supplier(remote ?? new RemoteDescriptor("orders", Base, 2000))]),
        new HttpClient(handler), new InMemoryFragmentCacheStore(), new RemoteIdentityStrategies(),
        new DefaultCorrelationIdProvider(), listeners ?? [], MicroFrontendSettings.Defaults);

    private static UIIncrementDto PageWith(MicroFrontendMetadataDto microFrontend) => UIIncrementDto.Of(fragments:
    [
        new UIFragmentDto("page",
            new ClientSideComponentDto(microFrontend with
            {
                Server = microFrontend.Server ?? new ServerResolutionDto(2000, null, null, null, true),
            }, "mfe", [], null, null, null),
            new Dictionary<string, object?>(), new Dictionary<string, object?>(), "Replace", null),
    ]);

    private static MicroFrontendMetadataDto Resolved(UIIncrementDto increment) =>
        (MicroFrontendMetadataDto)((ClientSideComponentDto)increment.Fragments[0].Component!).Metadata;

    private const string OneFragment =
        """{"fragments":[{"targetComponentId":"x","component":{"type":"ClientSide","metadata":{"type":"Text","text":"hi"}}}]}""";

    [Fact]
    public async Task The_island_is_asked_as_a_content_load_with_its_app_state()
    {
        var http = new Answering(HttpStatusCode.OK, OneFragment);
        var resolved = await Resolver(http).ResolveAsync(PageWith(new MicroFrontendMetadataDto(Base, "orders")
        {
            ServerSideType = "com.acme.Orders",
            AppState = new Dictionary<string, object?> { ["tenant"] = "acme" },
        }), new IncomingRequest());

        var (uri, body) = Assert.Single(http.Calls);
        Assert.Equal(Base + "/mateu/v3/sync/orders", uri.ToString());
        // no declared consumed route = "" (a CONTENT load), never the fresh-load "_empty"
        Assert.Equal("", body["consumedRoute"]!.GetValue<string>());
        Assert.Equal("com.acme.Orders", body["serverSideType"]!.GetValue<string>());
        Assert.Equal("acme", body["appState"]!["tenant"]!.GetValue<string>());
        Assert.NotNull(Resolved(resolved).Resolved);
    }

    private sealed record Tenant(string Name, int Seats);

    [Fact]
    public async Task An_app_state_object_travels_as_its_json_properties()
    {
        var http = new Answering(HttpStatusCode.OK, OneFragment);
        await Resolver(http).ResolveAsync(PageWith(new MicroFrontendMetadataDto(Base, "/orders")
        {
            AppState = new Tenant("acme", 3),
        }), new IncomingRequest());
        var (_, body) = Assert.Single(http.Calls);
        Assert.Equal("acme", body["appState"]!["name"]!.GetValue<string>());
        Assert.Equal(3, body["appState"]!["seats"]!.GetValue<int>());

        // a value that is not an object brings no app state rather than failing the call
        var scalar = new Answering(HttpStatusCode.OK, OneFragment);
        await Resolver(scalar).ResolveAsync(PageWith(new MicroFrontendMetadataDto(Base, "/orders") { AppState = 42 }),
            new IncomingRequest());
        Assert.Empty(Assert.Single(scalar.Calls).Body["appState"]!.AsObject());
    }

    [Fact]
    public async Task A_failing_listener_does_not_bring_the_resolution_down()
    {
        var recording = new Recording();
        var resolved = await Resolver(new Answering(HttpStatusCode.OK, OneFragment), [new Failing(), recording])
            .ResolveAsync(PageWith(new MicroFrontendMetadataDto(Base, "/orders")), new IncomingRequest());
        Assert.NotNull(Resolved(resolved).Resolved);
        var resolution = Assert.Single(recording.Events);
        Assert.Equal(MicroFrontendResolutionOutcome.Embedded, resolution.Outcome);
        Assert.Equal("orders", resolution.RemoteId);
    }

    [Fact]
    public async Task Not_modified_for_a_key_the_host_does_not_hold_degrades_to_the_client()
    {
        var recording = new Recording();
        var resolved = await Resolver(
                new Answering(HttpStatusCode.OK, """{"fragments":[],"fragmentCache":{"maxAgeSeconds":60,"varyBy":"key","key":"aud-X","notModified":true}}"""),
                [recording])
            .ResolveAsync(PageWith(new MicroFrontendMetadataDto(Base, "/orders")), new IncomingRequest());
        Assert.Null(Resolved(resolved).Resolved);
        Assert.Null(Resolved(resolved).Server);
        var resolution = Assert.Single(recording.Events);
        Assert.Equal(MicroFrontendResolutionOutcome.Error, resolution.Outcome);
        Assert.Equal("client", resolution.DegradedTo);
        Assert.Contains("not-modified", resolution.Error);
    }

    [Fact]
    public async Task A_remote_on_a_path_of_this_server_needs_the_servers_own_base_url()
    {
        var http = new Answering(HttpStatusCode.OK, OneFragment);
        var resolver = Resolver(http, remote: new RemoteDescriptor("local", "/orders-ui", 2000));
        var page = PageWith(new MicroFrontendMetadataDto("/orders-ui", "/orders"));

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            resolver.ResolveAsync(page, new IncomingRequest(), () => null));
        Assert.Contains("SelfBaseUrl", error.Message);
        // a self base url that is not a bare origin is no better than none
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            resolver.ResolveAsync(page, new IncomingRequest(), () => "https://host.example/some/path"));
        Assert.Empty(http.Calls);

        await resolver.ResolveAsync(page, new IncomingRequest(), () => "https://host.example/");
        Assert.Equal("https://host.example/orders-ui/mateu/v3/sync/orders", Assert.Single(http.Calls).Uri.ToString());
    }

    [Theory]
    [InlineData("https://host.example", "https://host.example")]
    [InlineData(" http://host.example:8080/ ", "http://host.example:8080")]
    [InlineData("ftp://host.example", null)]
    [InlineData("https://user@host.example", null)]
    [InlineData("https://host.example/app", null)]
    [InlineData("not a url", null)]
    [InlineData("", null)]
    public void A_self_base_url_must_be_a_bare_http_origin(string self, string? expected) =>
        Assert.Equal(expected, MicroFrontendServerResolver.SaneOrigin(self));

    [Fact]
    public void A_route_that_would_leave_the_remote_app_is_refused()
    {
        Assert.Equal("https://orders.acme.com/ui/mateu/v3/sync/a/b",
            MicroFrontendServerResolver.ConstrainedTarget(Base, "/a/b").ToString());
        Assert.Throws<ArgumentException>(() => MicroFrontendServerResolver.ConstrainedTarget(Base, "/../../../admin"));
        Assert.Throws<ArgumentException>(() => MicroFrontendServerResolver.ConstrainedTarget(Base, "@evil.io/x"));
    }

    [Fact]
    public void Outcomes_are_named_as_javas_constants()
    {
        Assert.Equal("FROM_CACHE", MicroFrontendServerResolver.OutcomeName(MicroFrontendResolutionOutcome.FromCache));
        Assert.Equal("TIMEOUT", MicroFrontendServerResolver.OutcomeName(MicroFrontendResolutionOutcome.Timeout));
    }
}
