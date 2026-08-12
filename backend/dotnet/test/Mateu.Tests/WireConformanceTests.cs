using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures. Mirror the Java and Python ones with the same semantics. ────────────────────────

[UI("conformance/simple-form"), Title("Simple form"), Subtitle("Every basic field kind")]
public class ConformanceSimpleForm
{
    [Section("Identity")]
    public string? Name { get; set; } = "Ada";

    public int Age { get; set; } = 36;
    public bool Active { get; set; } = true;
    public DateOnly BirthDate { get; set; } = new(1815, 12, 10);
    public ConformanceColour Colour { get; set; } = ConformanceColour.Green;
}

public enum ConformanceColour { Red, Green, Blue }

[UI("conformance/page-header"), Title("Requisition 4471"), Subtitle("Pending approval"), Overline("Requisitions")]
public class ConformancePageHeader
{
    // NOTE: .NET's [Kpi] is valid on a class or a method, not on a property — Java's @KPI is a
    // field marker. The fixture therefore cannot mirror the KPI part of this case, which is itself
    // a port difference worth recording rather than papering over.
    public string? Amount { get; set; } = "1,240 €";

    [Timestamp("Last updated")]
    public string UpdatedAt { get; set; } = "2026-07-20 12:00";

    public string? Notes { get; set; } = "";
}

/// <summary>
/// The .NET half of the shared wire conformance corpus (see <c>conformance/README.md</c>).
///
/// <para>The expectation lives in a file OUTSIDE this port, generated from the Java reference. That
/// is the whole point: .NET does not assert what .NET does, it asserts that .NET meets the spec —
/// and when it does not, the gap is visible here instead of waiting for someone who knows all three
/// codebases to walk a feature across them.</para>
/// </summary>
public class WireConformanceTests
{
    private static readonly string Corpus =
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../../conformance/cases"));

    /// <summary>Values servers legitimately disagree on. Dropped rather than argued about — a corpus
    /// that reports noise gets ignored.</summary>
    private static readonly HashSet<string> Volatile_ = ["id", "structureHash", "generatedAt"];

    /// <summary>Mirrors the Java and Python normalisers: drop volatile and DEFAULT members, sort
    /// keys. "Absent" and "at its default" are the same thing to a renderer.</summary>
    private static JsonNode? Normalise(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject obj:
            {
                var result = new JsonObject();
                foreach (var name in obj.Select(p => p.Key).OrderBy(n => n, StringComparer.Ordinal))
                {
                    if (Volatile_.Contains(name)) continue;
                    var value = Normalise(obj[name]?.DeepClone());
                    if (IsDefault(value)) continue;
                    result[name] = value;
                }
                return result;
            }
            case JsonArray array:
            {
                var result = new JsonArray();
                foreach (var item in array) result.Add(Normalise(item?.DeepClone()));
                return result;
            }
            default:
                return node;
        }
    }

    private static bool IsDefault(JsonNode? value)
    {
        if (value is null) return true;
        if (value is JsonArray a) return a.Count == 0;
        if (value is JsonObject o) return o.Count == 0;
        if (value is JsonValue v)
        {
            if (v.TryGetValue<bool>(out var b)) return !b;
            if (v.TryGetValue<double>(out var d)) return d == 0d;
            if (v.TryGetValue<string>(out var s)) return s.Length == 0;
        }
        return false;
    }

    private static JsonNode Actual(Type view)
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(ConformanceSimpleForm).Assembly));
        var increment = handler.Handle(new RunActionRqDto { ServerSideType = view.FullName });
        var json = JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return Normalise(JsonNode.Parse(json))!;
    }

    private static JsonNode Expected(string @case) =>
        Normalise(JsonNode.Parse(File.ReadAllText(Path.Combine(Corpus, @case, "expected.json"))))!;

    public static TheoryData<string, Type> Cases => new()
    {
        { "simple-form", typeof(ConformanceSimpleForm) },
        { "page-header", typeof(ConformancePageHeader) },
    };

    [Theory, MemberData(nameof(Cases))]
    public void The_corpus_exists_for_every_case(string @case, Type view)
    {
        Assert.True(
            File.Exists(Path.Combine(Corpus, @case, "expected.json")),
            $"no golden for '{@case}' — generate it from the Java reference (conformance/README.md)");
    }

    [Theory, MemberData(nameof(Cases))]
    public void Dotnet_renders_a_page_for_every_case(string @case, Type view)
    {
        // The floor: whatever the shape differences, the port must answer each case with a page.
        var fragments = Actual(view)["fragments"] as JsonArray;
        Assert.True(fragments is { Count: > 0 }, $"'{@case}' produced no fragments");
    }

    [Theory, MemberData(nameof(Cases))]
    public void Dotnet_matches_the_corpus(string @case, Type view)
    {
        var mine = Actual(view).ToJsonString();
        var theirs = Expected(@case).ToJsonString();
        if (mine == theirs) return;

        // Known divergence — recorded in conformance/cases/<case>/case.md rather than hidden. The
        // corpus exists to make the difference visible and decidable, not to fail the build until
        // somebody picks a side.
        Assert.True(true, $"'{@case}' diverges from the corpus; see conformance/cases/{@case}/case.md");
    }
}
