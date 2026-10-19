using System.Text.Json.Nodes;
using Mateu.Core.Authoring;
using Xunit;

namespace Mateu.Tests;

/// <summary>R6: <c>mateu_save_spec</c> refuses a page that would run code in the browser — a saved
/// spec is served through the ordinary (trusted) render path, so an anonymous dev-mode agent could
/// otherwise persist an <c>Element import:</c> every browser opening the route executes. Shared cases:
/// <c>conformance/mcp/save-spec-script.json</c> (Java, Python and the sidecar run the same).</summary>
public class SaveSpecScriptRefusalTests
{
    static JsonObject Corpus()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "conformance", "mcp"))) dir = dir.Parent;
        Assert.NotNull(dir);
        return (JsonObject)JsonNode.Parse(File.ReadAllText(Path.Combine(dir!.FullName, "conformance", "mcp", "save-spec-script.json")))!;
    }

    [Fact]
    public void Every_script_capable_construct_is_refused_and_a_plain_page_is_not()
    {
        var corpus = Corpus();
        Assert.Equal(SpecWriter.ScriptRefusal, corpus["reason"]!.GetValue<string>());
        foreach (var c in corpus["cases"]!.AsArray())
        {
            var name = c!["name"]!.GetValue<string>();
            var refusal = SpecWriter.AgentRefusal("component", c["yaml"]!.GetValue<string>());
            if (c["refused"]!.GetValue<bool>()) Assert.True(refusal == SpecWriter.ScriptRefusal, $"{name}: {refusal}");
            else Assert.True(refusal is null, $"{name}: {refusal}");
        }
    }

    [Fact]
    public void An_alias_bomb_is_refused_rather_than_expanded()
    {
        var yaml = "a: &a [x, x, x, x, x, x, x, x, x, x]\n";
        var prev = "a";
        for (var i = 0; i < 8; i++)
        {
            var next = "l" + i;
            yaml += $"{next}: &{next} [*{prev}, *{prev}, *{prev}, *{prev}, *{prev}, *{prev}, *{prev}, *{prev}, *{prev}, *{prev}]\n";
            prev = next;
        }
        Assert.Equal(SpecWriter.ScriptRefusal, SpecWriter.AgentRefusal("component", yaml));
    }
}
