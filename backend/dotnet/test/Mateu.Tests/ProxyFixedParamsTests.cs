using System.Net;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("proxy-flavoured")]
public class ProxyFlavouredView
{
    public string? Flavour { get; set; }

    [RestOptions("https://api.example.com/items?flavour=${state.flavour}", Proxy = true)]
    public string Item { get; set; } = "";
}

/// <summary>A route's fixedParams are re-applied over the client state on the PROXIED REST leg too
/// (a pin enforced only in the browser would be a suggestion): the server-side fetch interpolates
/// the pinned value, whatever the client sent.</summary>
public class ProxyFixedParamsTests
{
    private sealed class FakeHttp : HttpMessageHandler
    {
        public readonly List<string> Urls = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            lock (Urls) Urls.Add(request.RequestUri!.ToString());
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("[]") });
        }
    }

    [Fact]
    public async Task The_fixed_param_wins_over_the_client_state_on_the_proxied_fetch()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-proxy-fixed").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + $"  - route: flavour/beta\n    viewModel: {typeof(ProxyFlavouredView).FullName}\n    fixedParams: {{flavour: beta}}\n");
        var fake = new FakeHttp();
        var handler = new SyncHandler(new MateuRegistry(typeof(ProxyFixedParamsTests).Assembly),
            http: new HttpClient(fake), specsDir: dir);

        await handler.HandleAsync(new RunActionRqDto
        {
            Route = "/flavour/beta", ConsumedRoute = "/flavour/beta", ActionId = "__restfetch__",
            ServerSideType = typeof(ProxyFlavouredView).FullName,
            ComponentState = new() { ["flavour"] = JsonSerializer.SerializeToElement("forged") },
            Parameters = new() { ["_sourceKind"] = "options", ["_sourceId"] = "item" },
        });

        Assert.Equal(["https://api.example.com/items?flavour=beta"], fake.Urls);
    }
}
