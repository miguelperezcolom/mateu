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
    /// <para><c>homeServerSideType</c> is a server type name exactly like <c>serverSideType</c> (a
    /// Java binary class name vs a CLR full name, by construction never equal); the Java and Python
    /// normalisers do not list it yet — it belongs in theirs too.</para>
    private static readonly HashSet<string> Volatile_ =
        ["id", "structureHash", "generatedAt", "serverSideType", "homeServerSideType", "targetComponentId"];

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
        Assert.NotNull(view);
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

    /// <summary>The ONLY cases allowed to differ from the corpus, each with the reason. Anything not
    /// listed here that diverges FAILS the build — and a listed case that starts to match fails too,
    /// so the list can only shrink. A reason must name something wrong in the Java golden itself (a
    /// harness leak), never a .NET gap: a .NET gap is fixed, not allow-listed. Each entry is scoped
    /// to the wire paths the reason explains: a difference ANYWHERE else in a listed case still
    /// fails.</summary>
    private static readonly IReadOnlyDictionary<string, string[]> AllowedPaths = new Dictionary<string, string[]>
    {
        ["app-context"] = [AppRestSources, AppCapabilities],
        ["app-header-actions"] = [AppRestSources, AppCapabilities],
        ["app-in-code"] = [AppRestSources, AppCapabilities],
        ["dashboard"] = ["$.fragments[0].component.actions"],
    };

    private const string AppRestSources = "$.fragments[0].component.metadata.restSources";
    private const string AppCapabilities = "$.fragments[0].component.metadata.requiredCapabilities";

    private static readonly IReadOnlyDictionary<string, string> KnownDivergences = new Dictionary<string, string>
    {
        // The Java core TEST classpath carries a specs/ui/sources.yaml (countries/orders/invoices),
        // and the Java harness renders the conformance apps inside that environment: every APP
        // golden therefore carries AppDto.restSources with those three entries plus a "rest-sources"
        // token in requiredCapabilities, which no fixture declares. The .NET (and Python) apps
        // correctly emit neither. Fix belongs in the Java harness (render the corpus without the
        // test catalogue), then regenerate these three goldens.
        ["app-context"] = "Java harness leak: restSources + 'rest-sources' capability from the core test catalogue",
        ["app-header-actions"] = "Java harness leak: restSources + 'rest-sources' capability from the core test catalogue",
        ["app-in-code"] = "Java harness leak: restSources + 'rest-sources' capability from the core test catalogue",
        // Java's FieldActionCollector walks the `notes` panel field (an io.mateu.uidl.data.Text, a
        // COMPONENT holder, not a nested form) as if it were a nested form, and advertises twelve
        // nested-form-action-notes-variants_* list actions for Text's internal `variants` list.
        // Those actions name no field of the view and nothing can dispatch them; the .NET dashboard
        // (whose composition otherwise matches member for member) correctly emits none. Fix belongs
        // in Java (skip component-holder fields when collecting nested-form actions).
        ["dashboard"] = "Java bug: nested-form list actions advertised for the internals of a Text panel field",
    };

    [Theory, MemberData(nameof(Cases))]
    public void Dotnet_matches_the_corpus(string @case, Type view)
    {
        var mine = Actual(view);
        var theirs = Expected(@case);
        var diffs = new List<string>();
        Diff("$", theirs, mine, diffs);

        if (KnownDivergences.TryGetValue(@case, out var reason))
        {
            Assert.True(diffs.Count > 0,
                $"'{@case}' now MATCHES the corpus — remove it from KnownDivergences ({reason})");
            // only the paths the reason explains may differ
            var allowed = AllowedPaths[@case];
            diffs = diffs.Where(d => !allowed.Any(a => d.StartsWith(a, StringComparison.Ordinal))).ToList();
        }
        Assert.True(diffs.Count == 0,
            $"'{@case}' diverges from conformance/cases/{@case}/expected.json:\n  "
            + string.Join("\n  ", diffs.Take(40)));
    }

    /// <summary>A path-wise diff of two normalised trees (expected vs actual), so a failure says
    /// WHERE the wire differs instead of dumping two documents.</summary>
    private static void Diff(string path, JsonNode? expected, JsonNode? actual, List<string> diffs)
    {
        switch (expected, actual)
        {
            case (JsonObject e, JsonObject a):
                foreach (var key in e.Select(p => p.Key).Union(a.Select(p => p.Key)).OrderBy(k => k, StringComparer.Ordinal))
                {
                    if (!a.ContainsKey(key)) diffs.Add($"{path}.{key}: missing (expected {Short(e[key])})");
                    else if (!e.ContainsKey(key)) diffs.Add($"{path}.{key}: unexpected {Short(a[key])}");
                    else Diff($"{path}.{key}", e[key], a[key], diffs);
                }
                break;
            case (JsonArray e, JsonArray a):
                if (e.Count != a.Count) diffs.Add($"{path}: {a.Count} items, expected {e.Count}");
                for (var i = 0; i < Math.Min(e.Count, a.Count); i++) Diff($"{path}[{i}]", e[i], a[i], diffs);
                break;
            default:
                if (expected?.ToJsonString() != actual?.ToJsonString())
                    diffs.Add($"{path}: {Short(actual)}, expected {Short(expected)}");
                break;
        }
    }

    private static string Short(JsonNode? node)
    {
        var s = node?.ToJsonString() ?? "null";
        return s.Length > 160 ? s[..160] + "…" : s;
    }
}
