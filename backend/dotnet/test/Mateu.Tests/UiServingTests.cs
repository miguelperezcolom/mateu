using System.IO.Compression;
using System.Net;
using System.Text;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Uidl;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

[UI("ui-probe"), Title("Probe")]
public class UiServingProbe
{
    public string Name { get; set; } = "x";
}

/// <summary><c>MapMateu(ui: …)</c>: this server serves a web renderer's page like a Java app does —
/// until 2026-10-17 it answered the sync API only and a first-time user had nothing to open in a
/// browser. The renderer is the <c>static/</c> folder of the mateu-vaadin / mateu-redwood jar (here:
/// the one checked into the repo) or the jar itself; the page answers the mount and its deep links,
/// the assets the origin root, and the API is never answered with the page.</summary>
public class UiServingTests
{
    // backend/dotnet/test/Mateu.Tests/bin/<cfg>/<tfm>/ → backend/
    private static readonly string VaadinStatic = Path.GetFullPath(Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..",
        "shared", "frontend", "vaadin-lit", "src", "main", "resources", "static"));

    private static bool RendererCheckedOut => File.Exists(Path.Combine(VaadinStatic, "_index.html"));

    private static async Task<(WebApplication App, HttpClient Http)> Host(string mount, string? ui)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(_ => { }, typeof(UiServingProbe).Assembly);
        var web = builder.Build();
        web.MapGet("/mine", () => Results.Json(new { mine = true }));
        web.MapMateu(mount, ui);
        await web.StartAsync();
        var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        var http = new HttpClient { BaseAddress = new Uri(address) };
        // a browser navigation; a `*/*` (fetch, curl) is a data fetch and never gets the page (Java's rule)
        http.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,*/*;q=0.8");
        return (web, http);
    }

    [Fact]
    public async Task Without_a_renderer_the_server_answers_the_api_only()
    {
        var (web, http) = await Host("", ui: null);
        await using var _ = web;
        var fetch = new HttpRequestMessage(HttpMethod.Get, "/");
        fetch.Headers.Accept.Clear();
        fetch.Headers.Accept.ParseAdd("application/json");
        var data = await http.SendAsync(fetch);
        Assert.Equal(HttpStatusCode.NotFound, data.StatusCode);
        Assert.DoesNotContain("MATEU_UI", await data.Content.ReadAsStringAsync());
        var sync = await http.PostAsync("/mateu/v3/sync", new StringContent("{\"route\":\"ui-probe\"}", Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, sync.StatusCode);
    }

    [Theory]
    [InlineData("", "/")]
    [InlineData("/shop", "/shop")]
    public async Task Without_a_renderer_a_browser_at_the_mount_gets_a_hint_not_a_bare_404(string mount, string path)
    {
        var (web, http) = await Host(mount, ui: null);
        await using var _ = web;
        var page = await http.GetAsync(path);
        Assert.Equal(HttpStatusCode.NotFound, page.StatusCode); // there is still no page here
        Assert.StartsWith("text/html", page.Content.Headers.ContentType!.ToString());
        var html = await page.Content.ReadAsStringAsync();
        Assert.Contains("MATEU_UI", html);
        Assert.Contains("POST " + mount + "/mateu/v3/sync/{route}", html);
        Assert.Equal(UiPage.ApiHintPage(mount), html);
        // a deep link keeps its plain 404, and the app's own routes win
        Assert.DoesNotContain("MATEU_UI", await (await http.GetAsync(mount + "/somewhere")).Content.ReadAsStringAsync());
        Assert.Contains("mine", await (await http.GetAsync("/mine")).Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task The_page_is_served_at_the_mount_and_its_deep_links_and_the_assets_at_the_root()
    {
        if (!RendererCheckedOut) return; // the Vaadin bundle is not next to this test (a packaged run)
        var (web, http) = await Host("", VaadinStatic);
        await using var _ = web;

        var home = await http.GetAsync("/");
        Assert.Equal(HttpStatusCode.OK, home.StatusCode);
        Assert.StartsWith("text/html", home.Content.Headers.ContentType!.ToString());
        Assert.Equal("no-cache", home.Headers.CacheControl!.ToString());
        var html = await home.Content.ReadAsStringAsync();
        Assert.Contains("<mateu-ui baseUrl=\"\" pathPrefix=\"\" style=\"width:100%;height:100vh;\"></mateu-ui>", html);
        Assert.DoesNotContain(UiPage.TitleMarker, html);
        Assert.DoesNotContain(UiPage.UiFrom, html);
        Assert.Contains("text/mateu-deferred", html); // the deferred-boot replayer travels with the page
        Assert.Contains("<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\">", html);

        Assert.Contains("<mateu-ui", await http.GetStringAsync("/ui-probe"));
        Assert.Contains("<mateu-ui", await http.GetStringAsync("/ui-probe/7/edit")); // any depth

        var js = await http.GetAsync("/assets/mateu-vaadin.js");
        Assert.Equal(HttpStatusCode.OK, js.StatusCode);
        Assert.Equal("text/javascript", js.Content.Headers.ContentType!.MediaType);
        Assert.Equal("no-cache", js.Headers.CacheControl!.ToString()); // no hash in the name: revalidate
        Assert.Equal("text/css", (await http.GetAsync("/assets/index.css")).Content.Headers.ContentType!.MediaType);
        Assert.Equal("image/svg+xml", (await http.GetAsync("/vite.svg")).Content.Headers.ContentType!.MediaType);
        Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/assets/nope.js")).StatusCode);
    }

    [Fact]
    public async Task The_api_and_the_apps_own_endpoints_are_never_answered_with_the_page()
    {
        if (!RendererCheckedOut) return;
        var (web, http) = await Host("", VaadinStatic);
        await using var _ = web;
        // an API miss stays a miss (a data fetch to a missing endpoint must never get the index)
        var miss = await http.GetAsync("/mateu/v3/nothing");
        Assert.True(miss.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.MethodNotAllowed);
        var sync = await http.PostAsync("/mateu/v3/sync", new StringContent("{\"route\":\"ui-probe\"}", Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, sync.StatusCode);
        // a deep link asked for as JSON is a data fetch, not a navigation
        var asJson = new HttpRequestMessage(HttpMethod.Get, "/ui-probe");
        asJson.Headers.Accept.Clear();
        asJson.Headers.Accept.ParseAdd("application/json");
        Assert.Equal(HttpStatusCode.NotFound, (await http.SendAsync(asJson)).StatusCode);
        // the app's own endpoints win
        Assert.Contains("\"mine\":true", await http.GetStringAsync("/mine"));
    }

    [Fact]
    public async Task A_mount_serves_its_page_under_its_prefix_only()
    {
        if (!RendererCheckedOut) return;
        var (web, http) = await Host("shop", VaadinStatic);
        await using var _ = web;
        foreach (var path in new[] { "/shop", "/shop/", "/shop/ui-probe" })
        {
            var r = await http.GetAsync(path);
            Assert.Equal(HttpStatusCode.OK, r.StatusCode);
            Assert.Contains("<mateu-ui baseUrl=\"/shop\" pathPrefix=\"/shop\"", await r.Content.ReadAsStringAsync());
        }
        Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/other")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await http.GetAsync("/assets/mateu-vaadin.js")).StatusCode); // at the origin root
        var sync = await http.PostAsync("/shop/mateu/v3/sync", new StringContent("{\"route\":\"ui-probe\"}", Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, sync.StatusCode);
    }

    [Fact]
    public async Task The_renderer_jar_itself_can_be_served_and_only_its_static_files()
    {
        if (!RendererCheckedOut) return;
        var jar = Path.Combine(Path.GetTempPath(), $"mateu-vaadin-{Guid.NewGuid():N}.jar");
        using (var zip = ZipFile.Open(jar, ZipArchiveMode.Create))
        {
            zip.CreateEntryFromFile(Path.Combine(VaadinStatic, "_index.html"), "static/_index.html");
            zip.CreateEntryFromFile(Path.Combine(VaadinStatic, "assets", "index.css"), "static/assets/index.css");
            using var writer = new StreamWriter(zip.CreateEntry("META-INF/MANIFEST.MF").Open());
            writer.Write("Manifest-Version: 1.0\n");
        }
        try
        {
            var (web, http) = await Host("", jar);
            await using var _ = web;
            Assert.Contains("<mateu-ui", await http.GetStringAsync("/"));
            Assert.Equal(HttpStatusCode.OK, (await http.GetAsync("/assets/index.css")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/META-INF/MANIFEST.MF")).StatusCode);
        }
        finally
        {
            File.Delete(jar);
        }
    }

    [Fact]
    public void A_wrong_location_fails_at_startup_and_a_path_never_escapes_the_renderer()
    {
        Assert.Throws<FileNotFoundException>(() => RendererFiles.At(Path.Combine(Path.GetTempPath(), "missing-" + Guid.NewGuid())));
        var notARenderer = Directory.CreateTempSubdirectory().FullName;
        var e = Assert.Throws<FileNotFoundException>(() => RendererFiles.At(notARenderer));
        Assert.Contains("_index.html", e.Message);
        if (!RendererCheckedOut) return;
        var files = RendererFiles.At(VaadinStatic);
        Assert.Null(files.Read("../pom.xml"));
        Assert.Null(files.Read("assets/../../pom.xml"));
        Assert.NotNull(files.Read("assets/index.css"));
    }

    [Fact]
    public void Mount_ui_mirrors_javas_index_page()
    {
        const string html = "<html><title>AQUIELTITULODELAPAGINA</title><body><!-- AQUIUI --><p>x</p><!-- HASTAAQUIUI --></body></html>";
        var out1 = UiPage.RenderIndex(html, "/a\"b", "T");
        Assert.Contains("<mateu-ui baseUrl=\"/a&quot;b\" pathPrefix=\"/a&quot;b\" style=\"width:100%;height:100vh;\"></mateu-ui>", out1);
        Assert.Contains("<title>T</title>", out1);
        Assert.DoesNotContain("<p>x</p>", out1);
        Assert.EndsWith("<!-- HASTAAQUIUI --></body></html>", out1);
        Assert.Equal("<html>no markers</html>", UiPage.MountUi("<html>no markers</html>", ""));
        Assert.True(UiPage.SpaCandidate("/orders/7"));
        Assert.False(UiPage.SpaCandidate("/mateu/v3/x"));
        Assert.False(UiPage.SpaCandidate("/"));
        Assert.False(UiPage.SpaCandidate("/a.js"));
        Assert.True(UiPage.AcceptsHtml(null));
        Assert.True(UiPage.AcceptsHtml("text/html,*/*"));
        Assert.False(UiPage.AcceptsHtml("application/json"));
        Assert.Equal(UiPage.ImmutableCacheControl, UiPage.CacheControlFor("/version_123/x.js"));
        Assert.Equal("no-cache", UiPage.CacheControlFor("/_redwood/app.js"));
        Assert.Null(UiPage.CacheControlFor("/vite.svg"));
    }
}
