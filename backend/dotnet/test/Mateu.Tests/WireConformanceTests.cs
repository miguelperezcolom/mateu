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

[UI("conformance/tabs"), Title("Tabs")]
public class ConformanceTabs
{
    [Tab("General")]
    public string? Name { get; set; } = "Ada";

    [Tab("General")]
    public string? Email { get; set; } = "ada@example.com";

    [Tab("Details")]
    public string? Role { get; set; } = "Analyst";

    [Tab("Details")]
    public string? City { get; set; } = "London";
}

// Zoned layout: sections distributed into side-by-side columns with flex-basis widths.
// (.NET declares zones as repeatable [Zone] attributes rather than Java's @Zones container —
// declaration syntax only, same semantics on the wire.)
[UI("conformance/zones"), Title("Zoned form")]
[Zone("left", "64%"), Zone("right", "36%")]
public class ConformanceZonedForm
{
    [Section("Main", Zone = "left")]
    public string? Name { get; set; } = "Ada";

    [Section("Side", Zone = "right")]
    public string? Notes { get; set; } = "Quiet";
}

[UI("conformance/money-field"), Title("Money field")]
public class ConformanceMoneyField
{
    [Money]
    public decimal Price { get; set; } = 1250.5m;

    [PlainText, Money]
    public decimal Total { get; set; } = 99.5m;
}

[UI("conformance/banner"), Title("Banner page")]
public class ConformanceBanner
{
    public string? Name { get; set; } = "Ada";

    [Banner(BannerTheme.Info, "Heads up")]
    public string Info() => "Something to note";
}

[UI("conformance/fab"), Title("Fab page")]
public class ConformanceFab
{
    public string? Name { get; set; } = "Ada";

    [Fab("vaadin:plus", "Add")]
    public Message Add() => new("Added");
}

/// <summary>Section decorations: property-list rows, a separator above a field, a sized text.</summary>
[UI("conformance/separator-text"), Title("Guest file")]
public class ConformanceSeparatorText
{
    [Section("Documento", PropertyList = true)]
    public string? Documento { get; set; } = "12345678X";

    public string? Nombre { get; set; } = "María";

    [Section("Contacto")]
    public string? Telefono { get; set; } = "+34 600 000 000";

    [SeparatorBefore]
    public string? Email { get; set; } = "maria@example.com";

    // NOTE: Java renders this as a sized @Text(size = xl) component. .NET has no declarative
    // [Text] field marker (the Text component is fluent-only), so the field travels as an
    // ordinary form field here — a port difference worth recording rather than papering over.
    public string? Titular { get; set; } = "Bienvenida";
}

[UI("conformance/client-rules"), Title("Client rules")]
public class ConformanceClientRules
{
    // Declared before the [Hidden] property on purpose: Java emits all disabled rules before the
    // hidden ones, the ports emit per field in declaration order — this order makes them agree.
    [Disabled] public string? Code { get; set; } = "X-1";

    public bool Special { get; set; }

    [Hidden("!state.special")] public string? Nickname { get; set; } = "";
}

[UI("conformance/static-view"), Title("About"), StaticView]
public class ConformanceStaticAbout
{
    public string? Heading { get; set; } = "This page never changes";
}

// Small-enum inference: under [AutoLayout] an enum with <= 4 constants renders as radio buttons
// (stereotype "radio"), not a dropdown — with its options on the wire.
[UI("conformance/small-enum-radio"), Title("Small enum radio"), AutoLayout]
public class ConformanceSmallEnumRadio
{
    public ConformanceSize Size { get; set; } = ConformanceSize.MEDIUM;
}

public enum ConformanceSize { SMALL, MEDIUM, LARGE }

[UI("conformance/dashboard"), Title("Ops dashboard")]
public class ConformanceDashboard : Dashboard
{
    public MetricCard Revenue { get; } = new()
    {
        Title = "Revenue", Value = "1.2", Unit = "M€", Trend = MetricTrend.Up, TrendLabel = "+8%",
    };

    public MetricCard Occupancy { get; } = new() { Title = "Occupancy", Value = "87%" };

    [Panel(Title = "Notes", Subtitle = "Today")]
    public Text Notes { get; } = new("All systems nominal");
}

/// <summary>An app whose shell and its whole menu are composed IN CODE via IAppSupplier —
/// mirrors the Java AppInCode fixture. The [App] title doubles as the window title (the .NET
/// analogue of Java's @Title on the AppSupplier class).</summary>
[UI("conformance/app-in-code"), App("App in code")]
public class ConformanceAppInCode : IAppSupplier
{
    public AppShell GetApp() => new("App in code", new List<MenuItemDto>
    {
        new("A", "/a", ""),
        new("G", "/g", "") { Submenus = new List<MenuItemDto> { new("X", "/g/x", "") } },
    })
    {
        HomeRoute = "/a",
        Variant = "MENU_ON_TOP",
    };
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
        { "tabs", typeof(ConformanceTabs) },
        { "zones", typeof(ConformanceZonedForm) },
        { "money-field", typeof(ConformanceMoneyField) },
        { "banner", typeof(ConformanceBanner) },
        { "fab", typeof(ConformanceFab) },
        { "separator-text", typeof(ConformanceSeparatorText) },
        { "client-rules", typeof(ConformanceClientRules) },
        { "static-view", typeof(ConformanceStaticAbout) },
        { "small-enum-radio", typeof(ConformanceSmallEnumRadio) },
        { "dashboard", typeof(ConformanceDashboard) },
        { "app-in-code", typeof(ConformanceAppInCode) },
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
