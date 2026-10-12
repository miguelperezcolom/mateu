using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.AspNetCore;
using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>The YAML display gallery (the Java golden source,
/// backend/shared/core/src/test/resources/specs/ui/display-gallery.yaml) built by the .NET YAML
/// loader: every display component the .NET fluent API has reaches the wire as itself — it used to
/// render "Unsupported component: &lt;type&gt;" for all but layouts, fields, buttons and texts.</summary>
public class YamlDisplayGalleryTests
{
    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "backend", "shared"))) dir = dir.Parent;
        return dir?.FullName ?? throw new InvalidOperationException("repo root not found");
    }

    private static void TypesOf(JsonNode? node, HashSet<string> out_)
    {
        switch (node)
        {
            case JsonObject o:
                if (o["metadata"] is JsonObject m && m["type"] is JsonValue t) out_.Add((string)t!);
                foreach (var (_, v) in o) TypesOf(v, out_);
                break;
            case JsonArray a:
                foreach (var v in a) TypesOf(v, out_);
                break;
        }
    }

    [Fact]
    public void Every_display_component_of_the_gallery_reaches_the_wire()
    {
        var root = RepoRoot();
        var yaml = File.ReadAllText(Path.Combine(root, "backend/shared/core/src/test/resources/specs/ui/display-gallery.yaml"));
        var tree = YamlComponentBuilder.Parse(yaml)!;
        var wire = JsonSerializer.SerializeToNode(ComponentMapper.Map(tree), MateuExtensions.Json)!;
        var found = new HashSet<string>();
        TypesOf(wire, found);
        var golden = JsonNode.Parse(File.ReadAllText(Path.Combine(root,
            "frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/display-gallery.golden.json")))!;
        var expected = new HashSet<string>();
        TypesOf(golden["fragments"]![0]!["component"], expected);
        // what the .NET fluent API does not have yet (design/walkthrough/pages.md)
        var notInDotnet = new[] { "Markdown", "Image", "Badge", "Avatar", "AvatarGroup", "Chart", "Bpmn", "ProgressBar" };
        Assert.Empty(expected.Except(notInDotnet).Except(found));
        var text = wire.ToJsonString();
        Assert.Contains("cancelBooking", text);
        Assert.Contains("Inside the notice", text);
        Assert.Contains("r101", text);
    }
}
