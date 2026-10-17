using System.Net;
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

// The mobile hub's server side (design/mobile-app-hub.md, phase 1): the UI manifest and the
// "Open on mobile" flag. The JSON fixtures are the SAME strings Java's and Python's tests assert.

[App("Acme CRM", Route = "mobile-acme", MobileQr = true)]
[MobileApp(ShortName = "CRM", Icon = "/images/acme.svg", ThemeColor = "#1f6feb",
    OidcIssuer = "https://auth.acme.com/realms/acme", OidcClientId = "mateu-mobile")]
public class MobileAcmeApp
{
    [MenuItem("Home")] public MobileHome Home() => new();
}

[App("Plain", Route = "mobile-plain")]
public class MobilePlainApp
{
    [MenuItem("Home")] public MobileHome Home() => new();
}

public class MobileHome { public string? Name { get; set; } }

public class MobileManifestTests
{
    private const string Acme =
        "{\"name\":\"Acme CRM\",\"shortName\":\"CRM\",\"icon\":\"/images/acme.svg\",\"themeColor\":\"#1f6feb\","
        + "\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\",\"auth\":{\"type\":\"oidc\","
        + "\"issuer\":\"https://auth.acme.com/realms/acme\",\"clientId\":\"mateu-mobile\",\"scopes\":[\"openid\",\"profile\"]}}";

    private const string Plain = "{\"name\":\"Plain\",\"shortName\":\"Plain\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\"}";

    [Fact]
    public void The_acme_manifest_carries_the_declared_values_and_the_oidc_provider()
    {
        Assert.Equal(Acme, MobileManifest.Json(typeof(MobileAcmeApp)));
    }

    [Fact]
    public void A_plain_app_gets_its_title_and_no_auth()
    {
        Assert.Equal(Plain, MobileManifest.Json(typeof(MobilePlainApp)));
    }

    [Fact]
    public void Environment_settings_override_and_complete_the_manifest()
    {
        string[] keys = ["MATEU_MOBILE_OIDC_ISSUER", "MATEU_MOBILE_OIDC_CLIENT_ID", "MATEU_MOBILE_OIDC_SCOPES"];
        var saved = keys.ToDictionary(k => k, Environment.GetEnvironmentVariable);
        try
        {
            Environment.SetEnvironmentVariable("MATEU_MOBILE_OIDC_ISSUER", "https://idp.example");
            Environment.SetEnvironmentVariable("MATEU_MOBILE_OIDC_CLIENT_ID", "app");
            Environment.SetEnvironmentVariable("MATEU_MOBILE_OIDC_SCOPES", "openid email");
            Assert.Equal(
                "{\"name\":\"Plain\",\"shortName\":\"Plain\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\","
                + "\"auth\":{\"type\":\"oidc\",\"issuer\":\"https://idp.example\",\"clientId\":\"app\",\"scopes\":[\"openid\",\"email\"]}}",
                MobileManifest.Json(typeof(MobilePlainApp)));
        }
        finally
        {
            foreach (var (k, v) in saved) Environment.SetEnvironmentVariable(k, v);
        }
    }

    [Fact]
    public void Only_an_app_that_asks_carries_the_open_on_mobile_flag()
    {
        bool Flag(Type app) => ((AppMetadataDto)new ReflectionMapper().MapApp(app).Metadata).MobileQr;
        Assert.True(Flag(typeof(MobileAcmeApp)));
        Assert.False(Flag(typeof(MobilePlainApp)));
        var json = System.Text.Json.JsonSerializer.Serialize(
            new ReflectionMapper().MapApp(typeof(MobileAcmeApp)).Metadata, MateuExtensions.Json);
        Assert.Contains("\"mobileQr\":true", json);
    }

    [Fact]
    public async Task The_manifest_is_served_publicly_under_the_mount()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddMateu(typeof(MobileAcmeApp).Assembly);
        await using var app = builder.Build();
        app.MapMateu("mobile-acme");
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        using var http = new HttpClient { BaseAddress = new Uri(address) };

        using var response = await http.GetAsync("/mobile-acme/mateu/v3/manifest");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("public, max-age=300", response.Headers.CacheControl?.ToString());
        Assert.Equal("nosniff", string.Join(",", response.Headers.GetValues("X-Content-Type-Options")));
        Assert.Equal(Acme, await response.Content.ReadAsStringAsync());
    }
}
