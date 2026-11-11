using System.Net;
using System.Text;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

[UI("deploy-probe"), Title("Deploy probe")]
public class DeployProbe
{
    public string Name { get; set; } = "x";
}

/// <summary>Deployment behind proxies (Java's <c>SseHeaders</c> / <c>ForwardedPrefix</c> /
/// <c>IndexPage.underPrefix</c>): event streams a buffering proxy passes on as written, the served
/// page under a path prefix, and the JSON content types every adapter accepts.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class DeploymentTests
{
    // backend/dotnet/test/Mateu.Tests/bin/<cfg>/<tfm>/ → backend/
    private static readonly string VaadinStatic = Path.GetFullPath(Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..",
        "shared", "frontend", "vaadin-lit", "src", "main", "resources", "static"));

    private static bool RendererCheckedOut => File.Exists(Path.Combine(VaadinStatic, "_index.html"));

    private static async Task<(WebApplication App, HttpClient Http)> Host(
        string? ui = null, bool? trusted = null, string? pathBase = null)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o => o.ForwardedPrefixTrusted = trusted, typeof(DeployProbe).Assembly);
        var web = builder.Build();
        if (pathBase is not null) web.UsePathBase(pathBase);
        web.MapMateu("", ui);
        await web.StartAsync();
        var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        var http = new HttpClient { BaseAddress = new Uri(address) };
        http.DefaultRequestHeaders.Accept.ParseAdd("text/html");
        return (web, http);
    }

    private static StringContent Body(string contentType)
    {
        var content = new StringContent("{\"route\":\"deploy-probe\"}", Encoding.UTF8);
        content.Headers.Remove("Content-Type");
        content.Headers.TryAddWithoutValidation("Content-Type", contentType);
        return content;
    }

    [Fact]
    public async Task Every_event_stream_tells_proxies_not_to_buffer_it()
    {
        var (web, http) = await Host();
        await using var _ = web;
        var r = await http.PostAsync("/mateu/v3/sse/deploy-probe", Body("application/json"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.StartsWith("text/event-stream", r.Content.Headers.ContentType!.ToString());
        Assert.Equal("no", r.Headers.GetValues("X-Accel-Buffering").Single());
        // HttpClient parses the header (and may reorder its directives): compare them as a set
        Assert.True(r.Headers.CacheControl!.NoCache);
        Assert.True(r.Headers.CacheControl.NoTransform);
        Assert.Equal("no-cache, no-transform", MateuExtensions.SseHeaderValues["Cache-Control"]);
    }

    [Theory]
    [InlineData("application/vnd.mateu+json")]
    [InlineData("application/json ;charset=UTF-8")]
    public async Task Sync_and_sse_accept_every_json_content_type(string contentType)
    {
        var (web, http) = await Host();
        await using var _ = web;
        foreach (var kind in new[] { "sync", "sse" })
        {
            var r = await http.PostAsync($"/mateu/v3/{kind}/deploy-probe", Body(contentType));
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        }
    }

    [Fact]
    public void A_prefix_is_normalised_like_java()
    {
        Assert.Equal("", UiPage.NormalizePrefix(null));
        Assert.Equal("", UiPage.NormalizePrefix("/"));
        Assert.Equal("/app", UiPage.NormalizePrefix("app/"));
        Assert.Equal("/a/b", UiPage.NormalizePrefix("/a/b, /c"));
        Assert.Equal("", UiPage.NormalizePrefix("//evil.example"));
        Assert.Equal("", UiPage.NormalizePrefix("/x\"><script>"));
        Assert.Equal("", UiPage.NormalizePrefix("/a/../b"));
        Assert.Equal("/root", UiPage.RequestPrefix("/root", "/proxy", trusted: false));
        Assert.Equal("/proxy", UiPage.RequestPrefix("/root", "/proxy", trusted: true));
        Assert.Equal("", UiPage.RequestPrefix("", "", trusted: true));
    }

    [Fact]
    public void Under_prefix_rewrites_the_page_like_java()
    {
        var html = "<html><head><base href=\"/\"><script src=\"/assets/a.js\"></script>"
                   + "<link rel='stylesheet' href='/assets/a.css'><link href=\"//cdn.example/x.css\">"
                   + "<script>window.vbInitConfig = { BASE_URL: '/_redwood/' };</script>"
                   + "<meta name=\"mateu-dev\" content=\"/mateu/dev/events\"></head><body>"
                   + "<mateu-ui baseUrl=\"/shop\" pathPrefix=\"/shop\"></mateu-ui></body></html>";
        var output = UiPage.UnderPrefix(html, "/ctx");
        Assert.Contains("<base href=\"/ctx/\">", output);
        Assert.Contains("src=\"/ctx/assets/a.js\"", output);
        Assert.Contains("href='/ctx/assets/a.css'", output);
        Assert.Contains("href=\"//cdn.example/x.css\"", output);
        Assert.Contains("BASE_URL: '/ctx/_redwood/'", output);
        Assert.Contains("content=\"/ctx/mateu/dev/events\"", output);
        Assert.Contains("<mateu-ui baseUrl=\"/ctx/shop\" contextPath=\"/ctx\" pathPrefix=\"/shop\">", output);
        Assert.Equal(html, UiPage.UnderPrefix(html, ""));
    }

    [Fact]
    public async Task The_x_forwarded_prefix_is_ignored_unless_trusted()
    {
        if (!RendererCheckedOut) return;
        var (web, http) = await Host(VaadinStatic, trusted: false);
        await using var _ = web;
        var rq = new HttpRequestMessage(HttpMethod.Get, "/");
        rq.Headers.Add("X-Forwarded-Prefix", "/evil");
        var page = await (await http.SendAsync(rq)).Content.ReadAsStringAsync();
        Assert.DoesNotContain("/evil", page);
        Assert.Contains("src=\"/assets/", page);
    }

    [Fact]
    public async Task A_trusted_x_forwarded_prefix_puts_the_page_under_it()
    {
        if (!RendererCheckedOut) return;
        var (web, http) = await Host(VaadinStatic, trusted: true);
        await using var _ = web;
        var rq = new HttpRequestMessage(HttpMethod.Get, "/");
        rq.Headers.Add("X-Forwarded-Prefix", "/admin");
        var page = await (await http.SendAsync(rq)).Content.ReadAsStringAsync();
        Assert.Contains("src=\"/admin/assets/", page);
        Assert.Contains("baseUrl=\"/admin\"", page);
        Assert.Contains("contextPath=\"/admin\"", page);
        // the proxy strips the prefix: the assets keep being served where they always were
        Assert.Equal(HttpStatusCode.OK, (await http.GetAsync("/assets/mateu-vaadin.js")).StatusCode);
    }

    [Fact]
    public async Task The_path_base_is_the_prefix()
    {
        if (!RendererCheckedOut) return;
        var (web, http) = await Host(VaadinStatic, pathBase: "/console");
        await using var _ = web;
        var page = await (await http.GetAsync("/console/")).Content.ReadAsStringAsync();
        Assert.Contains("src=\"/console/assets/", page);
        Assert.Contains("baseUrl=\"/console\"", page);
        Assert.Contains("contextPath=\"/console\"", page);
        Assert.Equal(HttpStatusCode.OK, (await http.GetAsync("/console/assets/mateu-vaadin.js")).StatusCode);
    }
}
