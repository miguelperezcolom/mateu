using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Core.Authoring;
using Xunit;

namespace Mateu.Tests;

/// <summary>The proxied leg of the source-template corpus (<c>conformance/client/source-templates.json</c>):
/// the .NET server must send the URL the browser would — the same corpus Java, Python, libs/mateu and
/// Redwood run.</summary>
public class SourceTemplateCorpusTests
{
    private static JsonObject Corpus()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "client"))) dir = dir.Parent;
        return (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "client", "source-templates.json")))!;
    }

    public static IEnumerable<object[]> Cases() =>
        Corpus()["cases"]!.AsArray().Select(c => new object[] { c!["name"]!.GetValue<string>() });

    private static IReadOnlyDictionary<string, object?> StateOf(JsonNode? node) =>
        JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(node?.ToJsonString() ?? "{}")!
            .ToDictionary(kv => kv.Key, kv => (object?)kv.Value);

    private static string Url(string template, IReadOnlyDictionary<string, object?> state) =>
        UrlTemplate.Interpolate(template, expr => UrlTemplate.ValueOf(expr, state, _ => null));

    [Theory]
    [MemberData(nameof(Cases))]
    public void The_proxied_leg_sends_what_the_browser_would(string name)
    {
        var c = Corpus()["cases"]!.AsArray().First(x => x!["name"]!.GetValue<string>() == name)!;
        Assert.Equal(c["expected"]!.GetValue<string>(), Url(c["template"]!.GetValue<string>(), StateOf(c["state"])));
    }

    [Fact]
    public void An_expression_outside_the_subset_renders_empty_and_is_flagged()
    {
        Assert.True(ProxyExpression.IsSupported("(state.page ?? 0) * 20"));
        Assert.False(ProxyExpression.IsSupported("state.items.map(i => i.id)"));
        Assert.Equal("https://api.example.com/x?ids=",
            Url("https://api.example.com/x?ids=${state.items.map(i => i.id)}", StateOf(JsonNode.Parse("""{"items":[]}"""))));
    }

    [Fact]
    public void Secrets_only_through_the_secret_root_and_data_is_browser_only()
    {
        var empty = new Dictionary<string, object?>();
        Assert.Equal("s3cretAPI_KEY", UrlTemplate.ValueOf("secret.API_KEY ?? 'none'", empty, k => "s3cret" + k));
        Assert.Equal("", UrlTemplate.ValueOf("data.id", StateOf(JsonNode.Parse("""{"id":1}""")), _ => null));
    }

    [Theory]
    [InlineData("1 + 2 * 3", "7")]
    [InlineData("'a' + 1", "a1")]
    [InlineData("10 / 4", "2.5")]
    [InlineData("null == undefined", "true")]
    [InlineData("encodeURIComponent('a b!')", "a%20b!")]
    [InlineData("state.l.length", "2")]
    [InlineData("JSON.stringify(state.o)", """{"a":1}""")]
    [InlineData("state.x ? 'y' : 'n'", "n")]
    public void JavaScript_semantics_of_the_subset(string expression, string expected) =>
        Assert.Equal(expected, ProxyExpression.Text(ProxyExpression.Evaluate(expression,
            StateOf(JsonNode.Parse("""{"l":[1,2],"o":{"a":1},"x":0}""")), null)));

    [Fact]
    public void The_validator_flags_a_source_template_the_server_cannot_evaluate()
    {
        const string listing = """
            type: Listing
            rowsSource:
              url: "https://api.example.com/x?offset=${(state.page ?? 0) * 20}&id=${data.id}&ids=${state.items.map(i => i.id)}"
            columns: [{type: GridColumn, id: name}]
            """;
        var messages = UidlValidator.Default.Validate(listing)["warnings"]!.AsArray()
            .Where(w => w!["code"]!.GetValue<string>() == "proxy_unsafe_template")
            .Select(w => w!["message"]!.GetValue<string>()).ToList();
        Assert.Equal(2, messages.Count);
        Assert.Contains("${data.id}", messages[0]);
        Assert.Contains("only the browser has", messages[0]);
        Assert.Contains("state.items.map", messages[1]);
        Assert.DoesNotContain("state.page", string.Join(" ", messages));
    }
}
