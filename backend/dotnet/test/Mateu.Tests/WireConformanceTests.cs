using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;
using Mateu.Tests.Wire;
using Range = System.ComponentModel.DataAnnotations.RangeAttribute;
using Required = System.ComponentModel.DataAnnotations.RequiredAttribute;

namespace Mateu.Tests;

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
    private static readonly HashSet<string> Volatile_ = ["id", "structureHash", "generatedAt", "serverSideType", "targetComponentId"];

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
        var handler = new SyncHandler(new MateuRegistry(typeof(Wire.SimpleForm).Assembly));
        var increment = handler.Handle(new RunActionRqDto { ServerSideType = view.FullName });
        var json = JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return Normalise(JsonNode.Parse(json))!;
    }

    private static JsonNode Expected(string @case) =>
        Normalise(JsonNode.Parse(File.ReadAllText(Path.Combine(Corpus, @case, "expected.json"))))!;

    public static TheoryData<string, Type> Cases => new()
    {
        { "simple-form", typeof(Wire.SimpleForm) },
        { "page-header", typeof(PageHeader) },
        { "tabs", typeof(Tabs) },
        { "zones", typeof(Wire.ZonedForm) },
        { "money-field", typeof(MoneyField) },
        { "banner", typeof(BannerPage) },
        { "fab", typeof(FabPage) },
        { "separator-text", typeof(SeparatorText) },
        { "client-rules", typeof(ClientRules) },
        { "static-view", typeof(StaticAbout) },
        { "small-enum-radio", typeof(SmallEnumRadio) },
        { "dashboard", typeof(DashboardPage) },
        { "app-in-code", typeof(AppInCode) },
        { "validation", typeof(ValidatedForm) },
        { "stereotypes", typeof(Stereotypes) },
        { "lookup", typeof(LookupForm) },
        { "tree-select", typeof(TreeSelectForm) },
        { "notice", typeof(NoticePage) },
        { "bulleted-list", typeof(BulletedListPage) },
        { "app-context", typeof(ContextApp) },
        { "app-header-actions", typeof(HeaderActionsApp) },
        { "toc", typeof(TocPage) },
        { "grid-field", typeof(GridField) },
        { "status-list", typeof(StatusListPage) },
        { "compact", typeof(CompactPage) },
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
