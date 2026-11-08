using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Core.Bundle;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// The .NET half of the BUNDLE conformance corpus (<c>conformance/bundle/README.md</c>): each case is
/// a <c>specs/ui</c> directory every backend reads as it is, and <c>manifest.json</c> (pre-rendered)
/// / <c>manifest-specs-only.json</c> (specs mode) are the normalised manifests Java's exporter writes
/// for it — frozen goldens this port's exporter must reproduce.
/// </summary>
public class BundleConformanceTests
{
    private static readonly string Corpus =
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../../conformance/bundle"));

    public static readonly string[] Cases = ["yaml-shell"];

    public static IEnumerable<object[]> Goldens() =>
        Cases.SelectMany(c => new[] { new object[] { c, false }, [c, true] });

    /// <summary>Mirrors Java's BundleConformanceTest.normalisedManifest: each entry's wire parsed and
    /// normalised like the wire corpus, the build time dropped, the entries sorted by route.</summary>
    internal static JsonNode NormalisedManifest(JsonObject raw)
    {
        var copy = raw.DeepClone().AsObject();
        copy.Remove("generatedAt");
        var entries = new JsonArray();
        foreach (var entry in (copy["entries"] as JsonArray ?? []).OfType<JsonObject>()
                     .OrderBy(e => e["route"]?.GetValue<string>() ?? "", StringComparer.Ordinal).ToList())
        {
            var e = entry.DeepClone().AsObject();
            foreach (var key in new[] { "json", "contentJson" })
                if (e[key] is JsonValue v && v.TryGetValue<string>(out var text))
                    e[key] = JsonNode.Parse(text);
            entries.Add(e);
        }
        copy["entries"] = entries;
        return WireConformanceTests.Normalise(copy)!;
    }

    internal static JsonObject Export(string @case, bool specsOnly)
    {
        var specs = Path.Combine(Corpus, @case, "specs", "ui");
        var handler = new SyncHandler(new MateuRegistry(typeof(Mateu.Uidl.Form).Assembly), specsDir: specs);
        var manifest = new BundleExporter(handler, specs)
            .ExportAll("", staticOnly: true, includeParamRoutes: true, specsOnly: specsOnly);
        return JsonNode.Parse(manifest.ToJson())!.AsObject();
    }

    [Fact]
    public void Every_bundle_case_is_wired() =>
        Assert.Equal(Cases.OrderBy(c => c), Directory.GetDirectories(Corpus).Select(Path.GetFileName).OrderBy(c => c));

    [Theory]
    [MemberData(nameof(Goldens))]
    public void DotNet_bundles_like_the_reference(string @case, bool specsOnly)
    {
        var golden = Path.Combine(Corpus, @case, specsOnly ? "manifest-specs-only.json" : "manifest.json");
        var expected = WireConformanceTests.Normalise(JsonNode.Parse(File.ReadAllText(golden)));
        var actual = NormalisedManifest(Export(@case, specsOnly));
        var diffs = new List<string>();
        WireConformanceTests.Diff("$", expected, actual, diffs);
        Assert.True(diffs.Count == 0,
            $"'{@case}' ({(specsOnly ? "specs-only" : "pre-rendered")}) diverges from {golden}:\n  "
            + string.Join("\n  ", diffs.Take(40)));
    }
}
