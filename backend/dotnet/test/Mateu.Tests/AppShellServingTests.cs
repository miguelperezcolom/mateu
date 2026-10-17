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

[UI("serving-orders"), Title("Orders")]
public class ServingOrders
{
    public string Note { get; set; } = "orders";
}

public enum ServingHotel { palma, madrid }

// An app with menu items and no explicit home: its wire home is the "_no_home_route" sentinel.
[App("Serving shop")]
public class ServingShopApp
{
    [AppContext("Hotel")] public ServingHotel Hotel { get; set; } = ServingHotel.palma;

    [MenuItem("Orders")] public ServingOrders Orders() => new();
}

/// <summary>The app shell as a browser drives it (found walking the demo in the Vaadin renderer):
/// the shell's content slot must not get the shell again, and the shell must point the browser at
/// its own mount — never at an origin built from the request the app saw.</summary>
[Collection("DevMode")]
public class AppShellServingTests
{
    private static readonly MateuRegistry Registry = new(typeof(AppShellServingTests).Assembly);

    [Fact]
    public void The_content_slot_of_an_app_without_a_home_gets_a_page_not_the_shell_again()
    {
        var handler = new SyncHandler(Registry);
        var shell = handler.Handle(new RunActionRqDto { ServerSideType = typeof(ServingShopApp).FullName! });
        var app = Assert.IsType<AppMetadataDto>(Assert.IsType<ClientSideComponentDto>(shell.Fragments[0].Component).Metadata);
        // an app naming no home opens on its first menu item (the wire carries it); the sentinel below is
        // what an older shell, or a route-only load, still asks for
        Assert.Equal("/serving-orders", app.HomeRoute);
        // the documented load action "__load__" (how the Redwood renderer boots) is the same load
        var viaLoad = handler.Handle(new RunActionRqDto { ServerSideType = typeof(ServingShopApp).FullName!, ActionId = "__load__" });
        Assert.IsType<AppMetadataDto>(Assert.IsType<ClientSideComponentDto>(viaLoad.Fragments[0].Component).Metadata);

        // what the shell's content slot then loads: Java renders the app class as a plain page
        // (ActionInstanceCreator.isTerminalRoute); the shell again nested itself in its own content
        // area and reloaded forever
        var content = handler.Handle(new RunActionRqDto
        {
            Route = "_no_home_route", ConsumedRoute = "", ServerSideType = typeof(ServingShopApp).FullName!,
        });
        Assert.IsNotType<ClientSideComponentDto>(content.Fragments[0].Component);
        var page = Assert.IsType<ServerSideComponentDto>(content.Fragments[0].Component);
        Assert.Contains(page.Children, c => c is ClientSideComponentDto { Metadata: PageMetadataDto });
        // the app's [AppContext] selector is the header's, never a field of that page
        Assert.DoesNotContain("\"fieldId\":\"hotel\"", System.Text.Json.JsonSerializer.Serialize(content, MateuExtensions.Json));
    }

    [Theory]
    [InlineData("")]
    [InlineData("hotel")]
    public async Task The_shell_names_its_mount_not_the_origin_the_app_saw(string mount)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(_ => { }, typeof(AppShellServingTests).Assembly);
        await using var web = builder.Build();
        web.MapMateu(mount);
        await web.StartAsync();
        try
        {
            var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            using var http = new HttpClient { BaseAddress = new Uri(address) };
            var prefix = mount == "" ? "" : "/" + mount;
            var body = "{\"route\":\"\",\"serverSideType\":\"" + typeof(ServingShopApp).FullName + "\"}";
            var r = await http.PostAsync(prefix + "/mateu/v3/sync", new StringContent(body, Encoding.UTF8, "application/json"));
            using var json = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
            var metadata = json.RootElement.GetProperty("fragments")[0].GetProperty("component").GetProperty("metadata");
            Assert.Equal("App", metadata.GetProperty("type").GetString());
            // the documented contract, and what the Redwood renderer calls: it answered 404
            var viaComponents = await http.PostAsync(prefix + "/mateu/v3/components/_/action",
                new StringContent(body, Encoding.UTF8, "application/json"));
            Assert.Equal(System.Net.HttpStatusCode.OK, viaComponents.StatusCode);
            using var json2 = JsonDocument.Parse(await viaComponents.Content.ReadAsStringAsync());
            Assert.Equal("App", json2.RootElement.GetProperty("fragments")[0].GetProperty("component")
                .GetProperty("metadata").GetProperty("type").GetString());
            // Java's controllers pass their relative mount; an absolute http://127.0.0.1:<port> is
            // unreachable (mixed content, CORS) behind a TLS-terminating or Host-rewriting proxy
            Assert.Equal(prefix, metadata.GetProperty("homeBaseUrl").GetString());
        }
        finally
        {
            await web.StopAsync();
        }
    }
}
