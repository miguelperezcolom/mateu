using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Mateu.Core;
using Mateu.Dtos;

namespace Mateu.Tests;

/// <summary>Renders a YAML definition of the JAVA test specs (backend/shared/core/src/test/resources/
/// specs/ui) through the .NET sync handler and compares it to the Java golden the browser expander is
/// pinned on (libs/mateu …/expander/__fixtures__/&lt;name&gt;.golden.json), with the conformance
/// normaliser — so the two servers are held to ONE rendered wire, not to two descriptions of it.</summary>
/// <para>Ids are part of the contract here (a template's slots are found BY ID), so they are kept —
/// except generated ones (uuids, Java's <c>&lt;kind&gt;-&lt;8 hex&gt;</c> hashes), which each server
/// makes up on its own.</para>
internal static class YamlGoldenHarness
{
    public static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !Directory.Exists(Path.Combine(dir.FullName, "backend", "shared"))) dir = dir.Parent;
        return dir?.FullName ?? throw new InvalidOperationException("repo root not found");
    }

    public static string JavaSpecs => Path.Combine(RepoRoot(), "backend/shared/core/src/test/resources/specs/ui");

    public static string GoldenPath(string name) => Path.Combine(RepoRoot(),
        "frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__", name + ".golden.json");

    private static readonly Regex Generated =
        new("^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[A-Za-z]+-[0-9a-f]{8}|fieldId)$");

    /// <summary>Keeps the authored ids (renamed so the conformance normaliser, which drops every
    /// <c>id</c>, keeps them) and drops the generated ones.</summary>
    private static JsonNode? KeepAuthoredIds(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
            {
                var result = new JsonObject();
                foreach (var (key, value) in o)
                {
                    if (key == "id")
                    {
                        if (value is JsonValue v && v.TryGetValue<string>(out var s) && !Generated.IsMatch(s))
                            result["_id"] = s;
                        continue;
                    }
                    result[key] = KeepAuthoredIds(value?.DeepClone());
                }
                return result;
            }
            case JsonArray a:
            {
                var result = new JsonArray();
                foreach (var item in a) result.Add(KeepAuthoredIds(item?.DeepClone()));
                return result;
            }
            default:
                return node?.DeepClone();
        }
    }

    public static JsonNode Normalised(JsonNode? node) =>
        WireConformanceTests.Normalise(KeepAuthoredIds(node)) ?? new JsonObject();

    /// <summary>The Java golden's first fragment component and window-title command, normalised.</summary>
    public static JsonNode Expected(string name)
    {
        var golden = JsonNode.Parse(File.ReadAllText(GoldenPath(name)))!;
        return Normalised(Pick(golden));
    }

    private static JsonObject Pick(JsonNode increment) => new()
    {
        ["commands"] = increment["commands"]?.DeepClone(),
        ["component"] = increment["fragments"]![0]!["component"]!.DeepClone(),
    };

    /// <summary>The .NET answer to a first load of <paramref name="route"/> over the Java specs.</summary>
    public static JsonNode Actual(string route, string? specsDir = null, Type? anchor = null)
    {
        var handler = new SyncHandler(new MateuRegistry((anchor ?? typeof(YamlGoldenHarness)).Assembly),
            specsDir: specsDir ?? JavaSpecs);
        var increment = handler.Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        var json = JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return Normalised(Pick(JsonNode.Parse(json)!));
    }

    public static List<string> Diffs(JsonNode expected, JsonNode actual)
    {
        var diffs = new List<string>();
        WireConformanceTests.Diff("$", expected, actual, diffs);
        return diffs;
    }
}
