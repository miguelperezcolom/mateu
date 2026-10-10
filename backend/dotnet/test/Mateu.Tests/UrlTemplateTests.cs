using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>URL templates encode by position — the same cases as Java TemplateInterpolatorUrlTest,
/// libs/mateu interpolateUrl.test.ts and Python test_url_template.py: both legs reach the same url.</summary>
public class UrlTemplateTests
{
    private static string Url(string? template, Dictionary<string, string> state, Dictionary<string, string>? secrets = null) =>
        UrlTemplate.Interpolate(template, expr =>
            expr.StartsWith("state.") ? state.GetValueOrDefault(expr[6..]) :
            expr.StartsWith("secret.") ? secrets?.GetValueOrDefault(expr[7..]) : "");

    [Fact]
    public void A_path_value_cannot_add_segments_or_a_query() =>
        Assert.Equal("https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D",
            Url("https://api.example.com/people/${state.id}", new() { ["id"] = "1/../../admin?x=" }));

    [Fact]
    public void A_query_value_cannot_add_parameters() =>
        Assert.Equal("/search?q=a%20b%26page%3D99%23frag&page=1",
            Url("/search?q=${state.q}&page=1", new() { ["q"] = "a b&page=99#frag" }));

    [Fact]
    public void Reserved_and_unicode_characters_are_encoded_like_the_other_backends() =>
        Assert.Equal("/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-",
            Url("/x/${state.v}", new() { ["v"] = "Ñandú !'()*~._-" }));

    [Fact]
    public void A_secret_in_the_query_is_encoded_and_a_configured_origin_is_raw()
    {
        var secrets = new Dictionary<string, string> { ["KEY"] = "a&b=c d", ["BASE"] = "https://api.example.com/v1" };
        Assert.Equal("https://h/x?key=a%26b%3Dc%20d", Url("https://h/x?key=${secret.KEY}", new(), secrets));
        Assert.Equal("https://api.example.com/v1/people/7",
            Url("${secret.BASE}/people/${state.id}", new() { ["id"] = "7" }, secrets));
    }

    [Fact]
    public void Client_state_cannot_choose_the_origin()
    {
        Assert.Throws<ArgumentException>(() => Url("${state.base}/people", new() { ["base"] = "http://169.254.169.254" }));
        Assert.Throws<ArgumentException>(() => Url("https://${state.host}/people", new() { ["host"] = "evil" }));
    }

    [Fact]
    public void A_dot_segment_is_refused_in_the_path_but_not_in_the_query()
    {
        Assert.Throws<ArgumentException>(() => Url("/people/${state.id}", new() { ["id"] = ".." }));
        Assert.Equal("/people?id=..", Url("/people?id=${state.id}", new() { ["id"] = ".." }));
    }

    [Fact]
    public void Missing_values_and_templates_without_placeholders()
    {
        Assert.Equal("/people/", Url("/people/${state.missing}", new()));
        Assert.Equal("https://h/x", Url("https://h/x", new()));
        Assert.Equal("", Url(null, new()));
    }

    [Fact]
    public void Secret_env_fallback_reads_only_prefixed_variables()
    {
        Environment.SetEnvironmentVariable("MATEU_TEST_DB_PASSWORD", "hunter2");
        Environment.SetEnvironmentVariable("MATEU_SECRET_MATEU_TEST_TOKEN", "tok");
        try
        {
            var handler = new SyncHandler(new MateuRegistry(typeof(UrlTemplateTests).Assembly));
            Assert.Null(handler.ResolveSecret("MATEU_TEST_DB_PASSWORD"));
            Assert.Equal("tok", handler.ResolveSecret("MATEU_TEST_TOKEN"));
            Assert.Equal("MATEU_SECRET_X", UrlTemplate.SecretEnvName("X"));
        }
        finally
        {
            Environment.SetEnvironmentVariable("MATEU_TEST_DB_PASSWORD", null);
            Environment.SetEnvironmentVariable("MATEU_SECRET_MATEU_TEST_TOKEN", null);
        }
    }
}
