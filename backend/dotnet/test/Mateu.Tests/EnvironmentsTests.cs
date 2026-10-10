using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Environments for REST sources (mirrors Java's EnvironmentsSyncTest): a <c>type: Environment</c>
/// file (or <c>environments/&lt;name&gt;.yaml</c>) re-points named sources — base url, url, headers,
/// proxy — over sources.yaml for the active environment, without editing the catalogue.
/// </summary>
public class EnvironmentsTests
{
    private static readonly string Dir = Specs();

    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-env-").FullName;
        File.WriteAllText(Path.Combine(dir, "sources.yaml"), """
            sources:
              - name: orders
                source:
                  url: https://api.acme.com/v1/orders/${state.id}?x=1
                  headers: {Accept: application/json}
              - name: payments
                source:
                  url: /api/payments
              - name: untouched
                source:
                  url: https://other.com/x
            """);
        Directory.CreateDirectory(Path.Combine(dir, "environments"));
        File.WriteAllText(Path.Combine(dir, "environments", "pre.yaml"), """
            sources:
              orders:
                baseUrl: https://pre.api.acme.com/
                headers: {X-Api-Key: "${secret.ORDERS_KEY}"}
              payments: {url: https://pre.pay.acme.com/v1/payments, proxy: true}
            """);
        File.WriteAllText(Path.Combine(dir, "pro-env.yaml"), """
            type: Environment
            name: pro
            sources:
              payments: {baseUrl: https://pay.acme.com}
            """);
        return dir;
    }

    private static RestSourceCatalog Catalogue(string? environment) =>
        new RestSourceRegistry(new MateuRegistry(typeof(Access).Assembly), Dir, environment).Catalog;

    [Fact]
    public void The_active_environment_re_points_the_sources_it_names()
    {
        var pre = Catalogue("pre");
        var orders = pre.Get("orders")!.Source;
        Assert.Equal("https://pre.api.acme.com/v1/orders/${state.id}?x=1", orders.Url);
        Assert.Equal("application/json", orders.Headers!["Accept"]);
        Assert.Equal("${secret.ORDERS_KEY}", orders.Headers!["X-Api-Key"]);
        var payments = pre.Get("payments")!.Source;
        Assert.Equal("https://pre.pay.acme.com/v1/payments", payments.Url);
        Assert.True(payments.Proxy);
        Assert.Equal("https://other.com/x", pre.Get("untouched")!.Source.Url);
    }

    [Fact]
    public void A_typed_environment_file_anywhere_under_specs_is_found_by_its_name()
    {
        Assert.Equal("https://pay.acme.com/api/payments", Catalogue("pro").Get("payments")!.Source.Url);
    }

    [Fact]
    public void No_or_an_unknown_environment_leaves_the_catalogue_as_authored()
    {
        Assert.Equal("/api/payments", Catalogue(null).Get("payments")!.Source.Url);
        Assert.Equal("/api/payments", Catalogue("nope").Get("payments")!.Source.Url);
    }

    [Theory]
    [InlineData("https://a.com/x/y?q=1", "https://b.com", "https://b.com/x/y?q=1")]
    [InlineData("https://a.com", "https://b.com/", "https://b.com")]
    [InlineData("/api/x", "https://b.com/base", "https://b.com/base/api/x")]
    [InlineData("api/x", "https://b.com", "https://b.com/api/x")]
    [InlineData(null, "https://b.com", "https://b.com")]
    public void Rebase_keeps_the_path_under_the_new_origin(string? url, string baseUrl, string expected) =>
        Assert.Equal(expected, Environments.Rebase(url, baseUrl));
}
