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

// Every UI as an installable Progressive Web App (Mateu.Core.Pwa, Java's io.mateu.core.infra.Pwa).
// The manifest JSON strings are the cross-port fixtures: Java's PwaTest and Python's test_pwa.py
// assert exactly the same ones, and the worker, registration script and icons are byte-identical
// copies of Java's resources (checked below when the repository is next to the test).

[App("Acme CRM", Route = "pwa-acme")]
[MobileApp(ShortName = "CRM", Icon = "/images/acme.svg", ThemeColor = "#1f6feb")]
public class PwaAcmeApp
{
    [MenuItem("Home")] public PwaHome Home() => new();
}

[App("Plain", Route = "pwa-plain")]
public class PwaPlainApp
{
    [MenuItem("Home")] public PwaHome Home() => new();
}

public class PwaHome { public string? Name { get; set; } }

/// <summary>Sets MATEU_PWA_ENABLED / MATEU_MOBILE_* and dev mode, which every host booting in parallel
/// reads, so it runs apart from them.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class PwaTests
{
    internal const string PlainManifest =
        "{\"id\":\"/\",\"name\":\"Plain\",\"short_name\":\"Plain\",\"start_url\":\"/\",\"scope\":\"/\","
        + "\"display\":\"standalone\",\"background_color\":\"#ffffff\",\"icons\":["
        + "{\"src\":\"icon-192.png\",\"sizes\":\"192x192\",\"type\":\"image/png\",\"purpose\":\"any\"},"
        + "{\"src\":\"icon-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"any\"},"
        + "{\"src\":\"icon-maskable-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"maskable\"}]}";

    internal const string AcmeManifest =
        "{\"id\":\"/crm\",\"name\":\"Acme CRM\",\"short_name\":\"CRM\",\"start_url\":\"/crm\","
        + "\"scope\":\"/crm\",\"display\":\"standalone\",\"background_color\":\"#ffffff\","
        + "\"theme_color\":\"#1f6feb\",\"icons\":["
        + "{\"src\":\"/images/acme.svg\",\"sizes\":\"any\",\"type\":\"image/svg+xml\",\"purpose\":\"any\"},"
        + "{\"src\":\"icon-192.png\",\"sizes\":\"192x192\",\"type\":\"image/png\",\"purpose\":\"any\"},"
        + "{\"src\":\"icon-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"any\"},"
        + "{\"src\":\"icon-maskable-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"maskable\"}]}";

    private const string VaadinPage =
        "<html><head><title>T</title><script src=\"/assets/mateu-theme.js\"></script>"
        + "<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\"></script>"
        + "<link rel=\"stylesheet\" href=\"/assets/index.css\"><link rel=\"icon\" href=\"/api/me.png\">"
        + "</head><body></body></html>";

    private static MobileManifest.Derived Acme => MobileManifest.Derive(typeof(PwaAcmeApp));
    private static MobileManifest.Derived Plain => MobileManifest.Derive(typeof(PwaPlainApp));

    private static void WithEnv(Dictionary<string, string?> values, Action body)
    {
        var saved = values.Keys.ToDictionary(k => k, Environment.GetEnvironmentVariable);
        try
        {
            foreach (var (k, v) in values) Environment.SetEnvironmentVariable(k, v);
            body();
        }
        finally
        {
            foreach (var (k, v) in saved) Environment.SetEnvironmentVariable(k, v);
        }
    }

    [Fact]
    public void The_manifest_is_derived_like_the_mobile_one()
    {
        Assert.Equal(PlainManifest, Pwa.ManifestJson(Plain, "/", "/"));
        Assert.Equal(AcmeManifest, Pwa.ManifestJson(Acme, "/crm", "/crm"));
    }

    [Fact]
    public void A_setting_wins_as_for_the_mobile_manifest()
    {
        WithEnv(new()
        {
            ["MATEU_MOBILE_THEME_COLOR"] = "#000000",
            ["MATEU_MOBILE_ICON"] = "https://cdn.acme.com/icon-512.png",
        }, () =>
        {
            var json = Pwa.ManifestJson(Acme, "/", "/");
            Assert.Contains("\"theme_color\":\"#000000\"", json);
            Assert.Contains(
                "{\"src\":\"https://cdn.acme.com/icon-512.png\",\"sizes\":\"any\",\"type\":\"image/png\",\"purpose\":\"any\"}",
                json);
        });
    }

    [Fact]
    public void Only_hex_theme_colours_and_safe_icons_are_kept()
    {
        static MobileManifest.Derived Icon(string? icon, string? theme = null) => new("X", "X", icon, theme);
        var json = Pwa.ManifestJson(Icon("http://insecure.example/logo.png", "red"), "/", "/");
        Assert.DoesNotContain("theme_color", json);
        Assert.DoesNotContain("insecure", json);
        Assert.Equal("/logo.png", Pwa.DeclaredIcon(Icon("logo.png")));
        Assert.Null(Pwa.DeclaredIcon(Icon("/favicon.ico")));
        Assert.Null(Pwa.DeclaredIcon(Icon("javascript:alert(1)")));
        Assert.Null(Pwa.DeclaredIcon(Icon("data:text/html,<b>")));
        Assert.Equal("data:image/png;base64,AAAA", Pwa.DeclaredIcon(Icon("data:image/png;base64,AAAA")));
        Assert.Null(Pwa.DeclaredIcon(Icon("//cdn.example/logo.png")));
        Assert.Equal("https://cdn.example/logo.png?v=1", Pwa.DeclaredIcon(Icon("https://cdn.example/logo.png?v=1")));
        Assert.Null(Pwa.DeclaredIcon(null));
        Assert.Equal("#abc", Pwa.ThemeColor(Icon(null, "#abc")));
        Assert.Null(Pwa.ThemeColor(Icon(null, "#abcde")));
    }

    [Fact]
    public void Scopes_and_folders()
    {
        Assert.Equal("/", Pwa.ScopeOf(""));
        Assert.Equal("/", Pwa.ScopeOf(null));
        Assert.Equal("/crm", Pwa.ScopeOf("/crm/"));
        Assert.Equal("/back-office", Pwa.ScopeOf("back-office"));
        Assert.Equal("/mateu/v3/pwa/", Pwa.DirOf(""));
        Assert.Equal("/crm/mateu/v3/pwa/", Pwa.DirOf("/crm"));
    }

    [Fact]
    public void Query_values_are_encoded_like_java_url_encoder()
    {
        Assert.Equal("https%3A%2F%2Fstatic.oracle.com%2Fcdn%2F", Pwa.UrlEncode("https://static.oracle.com/cdn/"));
        Assert.Equal("a+b%7E*._-%C3%A9%26", Pwa.UrlEncode("a b~*._-é&"));
    }

    [Fact]
    public void The_page_gets_the_manifest_the_colour_and_the_worker()
    {
        var html = Pwa.Served(VaadinPage, "/crm", Acme, "build-1", configured: true);
        Assert.Contains(
            "<link rel=\"manifest\" href=\"/crm/mateu/v3/pwa/manifest.webmanifest\" crossorigin=\"use-credentials\">",
            html);
        Assert.Contains("<meta name=\"theme-color\" content=\"#1f6feb\">", html);
        // an SVG logo is no iOS home-screen icon: Mateu's PNG instead
        Assert.Contains("<link rel=\"apple-touch-icon\" href=\"/crm/mateu/v3/pwa/icon-192.png\">", html);
        Assert.Contains("<script src=\"/crm/mateu/v3/pwa/register.js\" data-sw=\"/crm/mateu/v3/pwa/sw.js?v=", html);
        Assert.Contains("&amp;s=%2Fassets%2F\" data-scope=\"/crm\" defer></script></head>", html);
        // an icon link is not a folder of the page's own files
        Assert.DoesNotContain("%2Fapi%2F", html);
        // the whole head, in Java's order, right before </head>
        var version = VersionOf(html);
        Assert.Equal(
            VaadinPage.Replace("</head>",
                "<link rel=\"manifest\" href=\"/crm/mateu/v3/pwa/manifest.webmanifest\" crossorigin=\"use-credentials\">"
                + "<meta name=\"theme-color\" content=\"#1f6feb\">"
                + "<link rel=\"apple-touch-icon\" href=\"/crm/mateu/v3/pwa/icon-192.png\">"
                + "<script src=\"/crm/mateu/v3/pwa/register.js\" data-sw=\"/crm/mateu/v3/pwa/sw.js?v=" + version
                + "&amp;s=%2Fassets%2F\" data-scope=\"/crm\" defer></script></head>"),
            html);
        // a page that already links a manifest is left alone
        Assert.Equal(html, Pwa.Served(html, "/crm", Acme, "build-1", configured: true));
    }

    [Fact]
    public void A_png_icon_is_the_apple_touch_icon()
    {
        var html = Pwa.Served(VaadinPage, "", new MobileManifest.Derived("X", "X", "/img/app.png", null), "b",
            configured: true);
        Assert.Contains("<link rel=\"apple-touch-icon\" href=\"/img/app.png\">", html);
        Assert.DoesNotContain("theme-color", html);
    }

    [Fact]
    public void The_worker_version_follows_the_page_and_the_build()
    {
        var a = Pwa.Served(VaadinPage, "", null, "b1", configured: true);
        var b = Pwa.Served(VaadinPage.Replace("mateu-vaadin.js", "mateu-vaadin2.js"), "", null, "b1", configured: true);
        var c = Pwa.Served(VaadinPage, "", null, "b2", configured: true);
        Assert.Equal(16, VersionOf(a).Length);
        Assert.Matches("^[0-9a-f]{16}$", VersionOf(a));
        Assert.NotEqual(VersionOf(a), VersionOf(b));
        Assert.NotEqual(VersionOf(a), VersionOf(c));
        Assert.Equal(VersionOf(a), VersionOf(Pwa.Served(VaadinPage, "", null, "b1", configured: true)));
    }

    private static string VersionOf(string html)
    {
        var at = html.IndexOf("sw.js?v=", StringComparison.Ordinal) + "sw.js?v=".Length;
        return html.Substring(at, 16);
    }

    [Fact]
    public void Static_folders_are_where_scripts_and_stylesheets_come_from()
    {
        var redwood =
            "<head><base href=\"/\"><link rel=\"preconnect\" href=\"https://static.oracle.com\">"
            + "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://static.oracle.com/cdn/jet/18/x.css\">"
            + "<link rel=\"stylesheet\" href=\"_redwood/resources/css/app.css?v=1\">"
            + "<script type=\"text/mateu-deferred\" data-src=\"https://static.oracle.com/cdn/jet/require.js\"></script>"
            + "<script src=\"/mateu/v3/x.js\"></script><script src=\"/root.js\"></script>"
            + "<script src=\"data:text/javascript,1\"></script></head>";
        Assert.Equal(["https://static.oracle.com/cdn/", "/_redwood/"], Pwa.StaticFolders(redwood));
    }

    [Fact]
    public void Switched_off_the_page_is_untouched_and_the_worker_unregisters()
    {
        Assert.Equal(VaadinPage, Pwa.Served(VaadinPage, "", null, "b", configured: false));
        Assert.Null(Pwa.Asset(Pwa.Manifest, "", () => Plain, configured: false));
        Assert.Null(Pwa.Asset(Pwa.Register, "", () => Plain, configured: false));
        var worker = Pwa.Asset(Pwa.Worker, "", () => Plain, configured: false)!;
        Assert.Contains("unregister()", Encoding.UTF8.GetString(worker.Body));
        Assert.Equal(Pwa.Resource(Pwa.WorkerOff), worker.Body);
    }

    [Fact]
    public void The_environment_variable_switches_it_off()
    {
        WithEnv(new() { [Pwa.EnabledEnvVar] = "false" }, () =>
        {
            Assert.False(Pwa.Enabled());
            Assert.Equal(VaadinPage, Pwa.Served(VaadinPage, "", null, "b"));
            // the host's option wins over the environment
            Assert.True(Pwa.Enabled(true));
        });
        WithEnv(new() { [Pwa.EnabledEnvVar] = null }, () => Assert.True(Pwa.Enabled()));
    }

    [Fact]
    public void Off_in_development_mode()
    {
        try
        {
            DevSpecs.Enable(true);
            Assert.False(Pwa.Enabled(true));
            Assert.Equal(VaadinPage, Pwa.Served(VaadinPage, "", null, "b", configured: true));
        }
        finally
        {
            DevSpecs.Enable(false);
        }
    }

    [Fact]
    public void The_files()
    {
        var manifest = Pwa.Asset(Pwa.Manifest, "/crm", () => Acme, configured: true)!;
        Assert.Equal("application/manifest+json", manifest.ContentType);
        Assert.Equal(AcmeManifest, Encoding.UTF8.GetString(manifest.Body));
        Assert.Equal("public, max-age=300", manifest.Headers["Cache-Control"]);
        Assert.Equal("nosniff", manifest.Headers["X-Content-Type-Options"]);
        Assert.False(manifest.Headers.ContainsKey("Service-Worker-Allowed"));

        var worker = Pwa.Asset(Pwa.Worker, "/crm", () => Acme, configured: true)!;
        Assert.Equal("/crm", worker.Headers["Service-Worker-Allowed"]);
        Assert.Equal("no-cache", worker.Headers["Cache-Control"]);
        Assert.Equal("text/javascript; charset=utf-8", worker.Headers["Content-Type"]);
        Assert.Contains("networkFirst", Encoding.UTF8.GetString(worker.Body));

        Assert.Equal(Pwa.Resource(Pwa.Register), Pwa.Asset(Pwa.Register, "/crm", () => Acme, configured: true)!.Body);
        foreach (var icon in new[] { Pwa.Icon192, Pwa.Icon512, Pwa.IconMaskable })
        {
            var asset = Pwa.Asset(icon, "/crm", () => Acme, configured: true)!;
            Assert.Equal("image/png", asset.ContentType);
            Assert.Equal("public, max-age=86400", asset.Headers["Cache-Control"]);
            // a PNG signature
            Assert.Equal(new byte[] { 0x89, (byte)'P', (byte)'N', (byte)'G' }, asset.Body.Take(4).ToArray());
        }
        Assert.Null(Pwa.Asset("../secret", "/crm", () => Acme, configured: true));
        Assert.Null(Pwa.Asset("../x", "/crm", () => Acme, configured: true));
        Assert.Null(Pwa.Asset("sw-off.js", "/crm", () => Acme, configured: true));
        Assert.Null(Pwa.Asset("unknown.js", "/crm", () => Acme, configured: true));
        Assert.Null(Pwa.Asset(null, "/crm", () => Acme, configured: true));
    }

    [Fact]
    public void The_embedded_files_are_byte_identical_to_javas()
    {
        string? dir = null;
        for (var d = new DirectoryInfo(AppContext.BaseDirectory); d != null && dir is null; d = d.Parent)
        {
            var candidate = Path.Combine(d.FullName, "backend", "shared", "core", "src", "main", "resources",
                "io", "mateu", "core", "infra", "pwa");
            if (Directory.Exists(candidate)) dir = candidate;
            candidate = Path.Combine(d.FullName, "shared", "core", "src", "main", "resources",
                "io", "mateu", "core", "infra", "pwa");
            if (dir is null && Directory.Exists(candidate)) dir = candidate;
        }
        if (dir is null) return; // the Java sources are not next to this test (a packaged run)
        string[] files = [Pwa.Worker, Pwa.WorkerOff, Pwa.Register, Pwa.Icon192, Pwa.Icon512, Pwa.IconMaskable];
        Assert.Equal(files.OrderBy(f => f, StringComparer.Ordinal),
            Directory.GetFiles(dir).Select(Path.GetFileName).OrderBy(f => f, StringComparer.Ordinal));
        foreach (var file in files)
            Assert.True(File.ReadAllBytes(Path.Combine(dir, file)).SequenceEqual(Pwa.Resource(file)),
                file + " differs from Java's copy");
    }

    [Fact]
    public void The_pwa_paths_are_never_the_page()
    {
        Assert.True(Pwa.IsEndpoint("/crm/mateu/v3/pwa/sw.js"));
        Assert.False(UiPage.SpaCandidate("/crm/mateu/v3/pwa/sw.js"));
        Assert.False(Pwa.IsEndpoint("/crm/orders"));
    }

    private const string Template =
        "<html><head><title>AQUIELTITULODELAPAGINA</title>"
        + "<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\"></script>"
        + "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>";

    private static async Task<(WebApplication App, HttpClient Http)> Host(string mount, string ui, bool? pwa = null)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Environment.EnvironmentName = "Production";
        builder.Services.AddMateu(o => o.Pwa = pwa, typeof(PwaAcmeApp).Assembly);
        var web = builder.Build();
        web.MapMateu(mount, ui);
        await web.StartAsync();
        var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
        var http = new HttpClient { BaseAddress = new Uri(address) };
        http.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml,*/*;q=0.8");
        return (web, http);
    }

    [Fact]
    public async Task The_files_are_served_under_the_mount_and_the_page_carries_the_head()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-pwa");
        try
        {
            File.WriteAllText(Path.Combine(dir.FullName, UiPage.Index), Template);
            var (web, http) = await Host("pwa-acme", dir.FullName);
            await using var _ = web;
            using var __ = http;

            using var manifest = await http.GetAsync("/pwa-acme/mateu/v3/pwa/manifest.webmanifest");
            Assert.Equal(HttpStatusCode.OK, manifest.StatusCode);
            Assert.Equal("application/manifest+json", manifest.Content.Headers.ContentType?.MediaType);
            Assert.Equal("public, max-age=300", manifest.Headers.CacheControl?.ToString());
            Assert.Equal("nosniff", string.Join(",", manifest.Headers.GetValues("X-Content-Type-Options")));
            Assert.Equal(AcmeManifest.Replace("/crm", "/pwa-acme"), await manifest.Content.ReadAsStringAsync());

            using var worker = await http.GetAsync("/pwa-acme/mateu/v3/pwa/sw.js");
            Assert.Equal(HttpStatusCode.OK, worker.StatusCode);
            Assert.Equal("text/javascript; charset=utf-8", worker.Content.Headers.ContentType?.ToString());
            Assert.Equal("no-cache", worker.Headers.CacheControl?.ToString());
            Assert.Equal("/pwa-acme", string.Join(",", worker.Headers.GetValues("Service-Worker-Allowed")));
            Assert.Equal(Pwa.Resource(Pwa.Worker), await worker.Content.ReadAsByteArrayAsync());

            using var icon = await http.GetAsync("/pwa-acme/mateu/v3/pwa/icon-512.png");
            Assert.Equal("image/png", icon.Content.Headers.ContentType?.MediaType);
            Assert.Equal(Pwa.Resource(Pwa.Icon512), await icon.Content.ReadAsByteArrayAsync());

            // unknown files are 404s — never the page, never a renderer file
            foreach (var path in new[] { "/pwa-acme/mateu/v3/pwa/sw-off.js", "/pwa-acme/mateu/v3/pwa/nope.js",
                         "/pwa-acme/mateu/v3/pwa/nope" })
            {
                using var miss = await http.GetAsync(path);
                Assert.Equal(HttpStatusCode.NotFound, miss.StatusCode);
                Assert.DoesNotContain("<mateu-ui", await miss.Content.ReadAsStringAsync());
            }

            var page = await http.GetStringAsync("/pwa-acme");
            Assert.Contains("<mateu-ui", page);
            Assert.Contains(
                "<link rel=\"manifest\" href=\"/pwa-acme/mateu/v3/pwa/manifest.webmanifest\" crossorigin=\"use-credentials\">",
                page);
            Assert.Contains("<meta name=\"theme-color\" content=\"#1f6feb\">", page);
            Assert.Contains("&amp;s=%2Fassets%2F\" data-scope=\"/pwa-acme\" defer></script></head>", page);
            // the version hashes the page as served, with the host's build id
            var build = web.Services.GetRequiredService<VersionSkew>().BuildId;
            var bare = page.Remove(page.IndexOf("<link rel=\"manifest\"", StringComparison.Ordinal),
                page.IndexOf("</head>", StringComparison.Ordinal) - page.IndexOf("<link rel=\"manifest\"", StringComparison.Ordinal));
            Assert.Equal(Pwa.Version(bare, build), VersionOf(page));
            await web.StopAsync();
        }
        finally
        {
            dir.Delete(true);
        }
    }

    [Fact]
    public async Task Switched_off_by_the_option_the_page_has_no_head_and_the_worker_unregisters()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-pwa-off");
        try
        {
            File.WriteAllText(Path.Combine(dir.FullName, UiPage.Index), Template);
            var (web, http) = await Host("", dir.FullName, pwa: false);
            await using var _ = web;
            using var __ = http;
            Assert.DoesNotContain("rel=\"manifest\"", await http.GetStringAsync("/"));
            Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/mateu/v3/pwa/manifest.webmanifest")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/mateu/v3/pwa/register.js")).StatusCode);
            using var worker = await http.GetAsync("/mateu/v3/pwa/sw.js");
            Assert.Equal(HttpStatusCode.OK, worker.StatusCode);
            Assert.Equal(Pwa.Resource(Pwa.WorkerOff), await worker.Content.ReadAsByteArrayAsync());
            await web.StopAsync();
        }
        finally
        {
            dir.Delete(true);
        }
    }
}
