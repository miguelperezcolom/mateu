using Mateu.AspNetCore;
using Mateu.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

/// <summary><c>MateuOptions.OracleCdnUrl</c> / <c>MATEU_ORACLE_CDN_URL</c> (Java: <c>mateu.oracle-cdn.url</c>):
/// the Redwood page loads Oracle's CDN content (JET, Spectra, the VB runtime, gallery images) from a
/// mirror the organisation hosts. Mateu never bundles those files — it only re-points the URLs of the
/// page it serves.</summary>
[Collection(ProcessWideStateCollection.Name)]
public class OracleCdnMirrorTests
{
    private const string Template =
        "<html><head><title>AQUIELTITULODELAPAGINA</title>"
        + "<link rel=\"preconnect\" href=\"https://static.oracle.com\" crossorigin>"
        + "<script>window.vbInitConfig = { JET_CDN_PATH: 'https://static.oracle.com/cdn/jet/18.1.0-2510.3', "
        + "JET_CDN_VERSION: '18.1.0' };</script>"
        + "<script type=\"text/mateu-deferred\" data-src=\"https://static.oracle.com/cdn/vb/2510.3/visual-runtime.js\"></script>"
        + "<link rel=\"stylesheet\" href=\"https://static.oracle.com/cdn/spectra/25.10.0/oj-sp.css\">"
        + "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>";

    [Fact]
    public void Off_leaves_the_page_unchanged()
    {
        Assert.Equal(UiPage.RenderIndex(Template, "", "T"), UiPage.RenderIndex(Template, "", "T", oracleCdn: null));
        Assert.Contains("https://static.oracle.com/cdn/jet/18.1.0-2510.3", UiPage.RenderIndex(Template, "", "T"));
    }

    [Fact]
    public void On_no_static_oracle_com_is_left()
    {
        var mirror = UiPage.ResolveOracleCdn("https://cdn.example.com:8443/oracle/cdn/", out var rejected);
        Assert.Null(rejected);
        Assert.Equal("https://cdn.example.com:8443/oracle/cdn", mirror);
        var html = UiPage.RenderIndex(Template, "", "T", oracleCdn: mirror);
        Assert.DoesNotContain("static.oracle.com", html);
        Assert.Contains("JET_CDN_PATH: 'https://cdn.example.com:8443/oracle/cdn/jet/18.1.0-2510.3'", html);
        Assert.Contains("data-src=\"https://cdn.example.com:8443/oracle/cdn/vb/2510.3/visual-runtime.js\"", html);
        Assert.Contains("<link rel=\"preconnect\" href=\"https://cdn.example.com:8443\" crossorigin>", html);
        // only the URLs change
        Assert.Equal(UiPage.RenderIndex(Template, "", "T").Length,
            html.Replace("https://cdn.example.com:8443/oracle/cdn", UiPage.OracleCdn)
                .Replace("href=\"https://cdn.example.com:8443\"", UiPage.OracleCdnPreconnect).Length);
    }

    [Theory]
    [InlineData("cdn.example.com/oracle/cdn")]
    [InlineData("/oracle/cdn")]
    [InlineData("ftp://cdn.example.com/oracle/cdn")]
    [InlineData("javascript:alert(1)")]
    [InlineData("https://cdn.example.com/\"><script>alert(1)</script>")]
    [InlineData("https://cdn.example.com/a b")]
    [InlineData("https://cdn.example.com/it's")]
    public void An_invalid_value_is_ignored_with_a_warning(string value)
    {
        Assert.Null(UiPage.ResolveOracleCdn(value, out var rejected));
        Assert.NotNull(rejected);
    }

    [Fact]
    public void Blank_is_off_and_the_environment_variable_is_the_fallback()
    {
        var before = Environment.GetEnvironmentVariable(UiPage.OracleCdnEnvVar);
        try
        {
            Environment.SetEnvironmentVariable(UiPage.OracleCdnEnvVar, null);
            Assert.Null(UiPage.ResolveOracleCdn("  ", out var none));
            Assert.Null(none);
            Environment.SetEnvironmentVariable(UiPage.OracleCdnEnvVar, "https://mirror.example.org/cdn");
            Assert.Equal("https://mirror.example.org/cdn", UiPage.ResolveOracleCdn(null, out _));
            Assert.Equal("https://opt.example.org/cdn", UiPage.ResolveOracleCdn("https://opt.example.org/cdn", out _));
        }
        finally { Environment.SetEnvironmentVariable(UiPage.OracleCdnEnvVar, before); }
    }

    [Theory]
    [InlineData("https://cdn.example.com/oracle/cdn", true)]
    [InlineData("not a url", false)]
    [InlineData(null, false)]
    public async Task The_served_page_is_re_pointed_at_the_mirror(string? mirror, bool rewritten)
    {
        var before = Environment.GetEnvironmentVariable(UiPage.OracleCdnEnvVar);
        Environment.SetEnvironmentVariable(UiPage.OracleCdnEnvVar, null);
        var dir = Directory.CreateTempSubdirectory("mateu-oracle-cdn");
        try
        {
            File.WriteAllText(Path.Combine(dir.FullName, UiPage.Index), Template);
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls("http://127.0.0.1:0");
            builder.Environment.EnvironmentName = "Production";
            builder.Services.AddMateu(o => o.OracleCdnUrl = mirror, typeof(UiServingProbe).Assembly);
            await using var web = builder.Build();
            web.MapMateu("", dir.FullName);
            await web.StartAsync();
            var address = web.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            using var http = new HttpClient { BaseAddress = new Uri(address) };
            http.DefaultRequestHeaders.Accept.ParseAdd("text/html");
            var page = await http.GetStringAsync("/");
            Assert.Equal(!rewritten, page.Contains("static.oracle.com"));
            if (rewritten) Assert.Contains("https://cdn.example.com/oracle/cdn/vb/2510.3/visual-runtime.js", page);
            await web.StopAsync();
        }
        finally
        {
            Environment.SetEnvironmentVariable(UiPage.OracleCdnEnvVar, before);
            dir.Delete(true);
        }
    }
}
