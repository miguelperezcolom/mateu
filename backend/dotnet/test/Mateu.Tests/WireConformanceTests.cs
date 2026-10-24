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
    /// An ACTION's id is not volatile: it is the name the client sends, so a missing or renamed action
    /// is a contract break (dropped with every generated id, the ports' CRUD forms shipped with dead
    /// Save/Edit buttons unnoticed).
    private static JsonNode? Normalise(JsonNode? node, bool inActions = false)
    {
        switch (node)
        {
            case JsonObject obj:
            {
                var result = new JsonObject();
                foreach (var name in obj.Select(p => p.Key).OrderBy(n => n, StringComparer.Ordinal))
                {
                    if (Volatile_.Contains(name) && !(name == "id" && inActions)) continue;
                    var value = Normalise(obj[name]?.DeepClone(), name == "actions");
                    if (IsDefault(value) && !(MeaningfulZero.Contains(name) && IsZero(value))) continue;
                    result[name] = value;
                }
                return result;
            }
            case JsonArray array:
            {
                var result = new JsonArray();
                foreach (var item in array) result.Add(Normalise(item?.DeepClone(), inActions));
                return result;
            }
            // A number compares by VALUE, not by spelling: Java writes a double weight as 3.0,
            // System.Text.Json as 3 — the same number to every renderer.
            case JsonValue v when v.GetValueKind() == JsonValueKind.Number && v.TryGetValue<double>(out var d):
                return JsonValue.Create(d);
            // the error boundary's per-request reference id: a log key, masked (Java's REFERENCE)
            case JsonValue v when v.GetValueKind() == JsonValueKind.String
                                  && Reference.IsMatch(v.GetValue<string>()):
                return JsonValue.Create(Reference.Replace(v.GetValue<string>(), "Reference: <ref>"));
            default:
                return node;
        }
    }

    /// <summary>Members whose zero value is NOT their absent value: a renderer reads an absent one
    /// as a non-zero default, so <c>false</c>/<c>0</c> must be sent explicitly and is kept here
    /// (<c>duration</c> 0 = a sticky toast; the booleans default to TRUE when absent;
    /// <c>debounceMillis</c> 0 = no debounce). Identical in the three runners (Java's
    /// <c>MEANINGFUL_ZERO</c>) and listed in reference/wire-specification.md.</summary>
    private static readonly HashSet<string> MeaningfulZero =
        ["duration", "visible", "opened", "open", "searchable", "centered", "asideSticky", "debounceMillis"];

    private static readonly System.Text.RegularExpressions.Regex Reference =
        new("Reference: [A-Za-z0-9-]+");

    private static bool IsZero(JsonNode? value) =>
        value is JsonValue v && (v.GetValueKind() is JsonValueKind.False or JsonValueKind.Number);

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

    private static JsonNode Actual(Type view, string? @case = null)
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(Wire.SimpleForm).Assembly));
        // A case with a request.json is pinned on that (second) request to its fixture type, not on
        // the first load — identical in the three runners.
        var requestFile = @case is null ? null : Path.Combine(Corpus, @case, "request.json");
        RunActionRqDto rq = new() { ServerSideType = view.FullName };
        if (requestFile is not null && File.Exists(requestFile))
        {
            var req = JsonNode.Parse(File.ReadAllText(requestFile))!.AsObject();
            rq = new RunActionRqDto
            {
                ServerSideType = view.FullName,
                Route = req["route"]?.GetValue<string>() ?? "",
                ConsumedRoute = req["consumedRoute"]?.GetValue<string>(),
                ActionId = req["actionId"]?.GetValue<string>() ?? "",
                ComponentState = req["componentState"] is JsonObject state
                    ? JsonSerializer.Deserialize<Dictionary<string, object?>>(state.ToJsonString())!
                    : new Dictionary<string, object?>(),
            };
        }
        UIIncrementDto increment;
        try
        {
            increment = handler.Handle(rq);
        }
        catch (Exception error)
        {
            // the adapter's error boundary (MateuExtensions), as it travels
            increment = MateuErrors.Increment(error, "conformance", detailed: false);
        }
        var json = JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        var normalised = Normalise(JsonNode.Parse(json))!;
        if (@case is not null && MediatedForms.Contains(@case) && normalised["fragments"] is JsonArray forms)
            foreach (var fragment in forms.OfType<JsonObject>())
                (fragment["component"] as JsonObject)?.Remove("route");
        return @case is not null && Mediated.Contains(@case) ? WithoutMediatorProtocol(normalised) : normalised;
    }

    /// <summary>Cases whose Java reference answers the first load with a MEDIATOR shell and the
    /// listing on the content load (a CRUD, or a listing promoted to one). The corpus pins that
    /// content; what it leaves out on every side is the mediator PROTOCOL around it — the content's
    /// <c>actions</c> (Java lets New/View/Delete bubble to its mediator, .NET answers them in place)
    /// and the mediator's private routing state (<c>initialData</c>/<c>state</c>). Mirrors Java's
    /// <c>MEDIATED</c> and Python's.</summary>
    /// <para>The wizard is the same story: Java's is a mediator too (a <c>*</c> catch-all, its
    /// position in its own state), .NET lists next/back/skip/the completion and keeps
    /// <c>__step</c> — so its actions and state stay out as well.</para>
    private static readonly HashSet<string> Mediated =
        ["crud", "crud-grouped", "listing-navigable", "wizard", "wizard-step-2", "crud-new", "crud-edit", "crud-view"];

    /// <summary>The CRUD's record forms: Java's mediator answers them on the CRUD's own route, the
    /// ports on the record's (<c>/new</c>, <c>/P-001/edit</c>) — the mediator protocol, left out on
    /// every side (Java's <c>MEDIATED_FORMS</c>).</summary>
    private static readonly HashSet<string> MediatedForms = ["crud-new", "crud-edit", "crud-view"];

    /// <summary>Drops the mediator protocol of a mediated case — identical in the three runners.</summary>
    private static JsonNode WithoutMediatorProtocol(JsonNode increment)
    {
        if (increment["fragments"] is JsonArray fragments)
            foreach (var fragment in fragments.OfType<JsonObject>())
            {
                fragment.Remove("state");
                if (fragment["component"] is JsonObject component)
                {
                    component.Remove("actions");
                    component.Remove("initialData");
                    // the mediator's own refresh subscriptions ("mateu-crud:*" events); .NET
                    // re-renders the listing in place
                    if (component["triggers"] is JsonArray triggers)
                        foreach (var t in triggers.OfType<JsonObject>().Where(t =>
                                     (t["eventName"]?.GetValue<string>() ?? "").StartsWith("mateu-crud:")).ToList())
                            triggers.Remove(t);
                }
            }
        return increment;
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
        { "access-annotations", typeof(AccessAnnotations) },
        { "crud", typeof(ProductsCrud) },
        { "listing-filters", typeof(FilteredBooks) },
        { "listing-navigable", typeof(Wire.NavigableBooks) },
        { "crud-grouped", typeof(SalesCrud) },
        { "listing-columns", typeof(MeasurementsListing) },
        { "peer-nav", typeof(PeerNavPage) },
        { "app-no-home-content", typeof(NoHomeApp) },
        { "card-menu", typeof(CardMenuApp) },
        { "app-extras", typeof(ExtrasApp) },
        { "welcome-banner", typeof(WelcomeBannerPage) },
        { "crud-search", typeof(ProductsCrud) },
        { "wizard", typeof(Wire.SignUpWizard) },
        { "rest-source", typeof(Wire.RestSourceForm) },
        { "action-effects", typeof(Wire.ActionEffectsPage) },
        { "drawer", typeof(Wire.DrawerPage) },
        { "rejected-save", typeof(Wire.RejectedSaveForm) },
        { "error-boundary", typeof(Wire.FailingActionPage) },
        { "wizard-step-2", typeof(Wire.SignUpWizard) },
        { "crud-new", typeof(ProductsCrud) },
        { "crud-edit", typeof(ProductsCrud) },
        { "crud-view", typeof(ProductsCrud) },
        { "generic-components", typeof(Wire.GenericComponentsPage) },
        { "triggers", typeof(Wire.TriggersForm) },
        { "field-help", typeof(Wire.FieldHelpForm) },
        { "field-hints", typeof(Wire.FieldHintsPage) },
        { "page-toolbar", typeof(Wire.PageToolbarForm) },
        { "form-columns", typeof(Wire.FormColumnsForm) },
    };

    [Fact]
    public void Every_case_of_the_corpus_is_wired()
    {
        // a case directory missing here would be a spec this port silently never checks
        var wired = Cases.Select(row => (string)row[0]).ToHashSet();
        var corpus = Directory.GetDirectories(Corpus).Select(Path.GetFileName).ToHashSet();
        Assert.Equal(corpus.OrderBy(c => c), wired.OrderBy(c => c));
        // and the allow-lists name only real cases, each with its paths
        Assert.Subset(wired, KnownDivergences.Keys.ToHashSet());
        Assert.Equal(KnownDivergences.Keys.OrderBy(k => k), AllowedPaths.Keys.OrderBy(k => k));
    }

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
    private static readonly IReadOnlyDictionary<string, string[]> AllowedPaths = new Dictionary<string, string[]>();

    private static readonly IReadOnlyDictionary<string, string> KnownDivergences = new Dictionary<string, string>();

    [Theory, MemberData(nameof(Cases))]
    public void Dotnet_matches_the_corpus(string @case, Type view)
    {
        var mine = Actual(view, @case);
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
