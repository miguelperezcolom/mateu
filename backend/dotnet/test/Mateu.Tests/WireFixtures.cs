using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Range = System.ComponentModel.DataAnnotations.RangeAttribute;
using Required = System.ComponentModel.DataAnnotations.RequiredAttribute;

namespace Mateu.Tests.Wire;

// ── Fixtures. Mirror the Java and Python ones with the same semantics. ────────────────────────

[UI("conformance/simple-form"), Title("Simple form"), Subtitle("Every basic field kind")]
public class SimpleForm
{
    [Section("Identity")]
    public string? Name { get; set; } = "Ada";

    public int Age { get; set; } = 36;
    public bool Active { get; set; } = true;
    public DateOnly BirthDate { get; set; } = new(1815, 12, 10);
    public ConformanceColour Colour { get; set; } = ConformanceColour.green;
}

// Lowercase members on purpose: the Java corpus enum constants are red/green/blue, so the option
// values and the seeded initialData value ("green") match Java's enum constant names.
public enum ConformanceColour { red, green, blue }

[UI("conformance/page-header"), Title("Requisition 4471"), Subtitle("Pending approval"), Overline("Requisitions")]
public class PageHeader
{
    // [Kpi] on a property hoists it into the header KPI band (out of the form body) — the .NET
    // analogue of Java's field-level @KPI. The value still rides in initialData/state.
    [Kpi("Amount")]
    public string? Amount { get; set; } = "1,240 €";

    [Timestamp("Last updated")]
    public string UpdatedAt { get; set; } = "2026-07-20 12:00";

    public string? Notes { get; set; } = "";
}

[UI("conformance/tabs"), Title("Tabs")]
public class Tabs
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
public class ZonedForm
{
    [Section("Main", Zone = "left")]
    public string? Name { get; set; } = "Ada";

    [Section("Side", Zone = "right")]
    public string? Notes { get; set; } = "Quiet";
}

[UI("conformance/money-field"), Title("Money field")]
public class MoneyField
{
    [Money]
    public decimal Price { get; set; } = 1250.5m;

    [PlainText, Money]
    public decimal Total { get; set; } = 99.5m;
}

[UI("conformance/banner"), Title("Banner page")]
public class BannerPage
{
    public string? Name { get; set; } = "Ada";

    [Banner(BannerTheme.Info, "Heads up")]
    public string Info() => "Something to note";
}

[UI("conformance/fab"), Title("Fab page")]
public class FabPage
{
    public string? Name { get; set; } = "Ada";

    [Fab("vaadin:plus", "Add")]
    public Message Add() => new("Added");
}

/// <summary>Section decorations: property-list rows, a separator above a field, a sized text.</summary>
[UI("conformance/separator-text"), Title("Guest file")]
public class SeparatorText
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
public class ClientRules
{
    // Declared before the [Hidden] property on purpose: Java emits all disabled rules before the
    // hidden ones, the ports emit per field in declaration order — this order makes them agree.
    [Disabled] public string? Code { get; set; } = "X-1";

    public bool Special { get; set; }

    [Hidden("!state.special")] public string? Nickname { get; set; } = "";
}

[UI("conformance/static-view"), Title("About"), StaticView]
public class StaticAbout
{
    public string? Heading { get; set; } = "This page never changes";
}

// Small-enum inference: under [AutoLayout] an enum with <= 4 constants renders as radio buttons
// (stereotype "radio"), not a dropdown — with its options on the wire.
[UI("conformance/small-enum-radio"), Title("Small enum radio"), AutoLayout]
public class SmallEnumRadio
{
    public ConformanceSize Size { get; set; } = ConformanceSize.MEDIUM;
}

public enum ConformanceSize { SMALL, MEDIUM, LARGE }

[UI("conformance/dashboard"), Title("Ops dashboard")]
public class DashboardPage : Dashboard
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
public class AppInCode : IAppSupplier
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

// Bean-validation constraints: [Required] sets the wire's required flag. .NET reads no numeric
// range ([Range] compiles but the mapper ignores it) and the wire has no ValidationDto, so the
// component-level validations Java derives from the constraints are a documented port gap.
// NOTE: the usings are ALIASES on purpose — a plain `using System.ComponentModel.DataAnnotations;`
// would make the existing [Timestamp(...)] fixture ambiguous (that namespace has its own
// TimestampAttribute → CS0104).
[UI("conformance/validation"), Title("Validated form")]
public class ValidatedForm
{
    [Required] public string? Name { get; set; } = "Ada";

    [Required] public string? Email { get; set; } = "ada@example.com";

    [Range(18, 99)] public int Age { get; set; } = 36;
}

// The stereotype vocabulary: slider/stars on ints, password/textarea on strings.
[UI("conformance/stereotypes"), Title("Stereotypes")]
public class Stereotypes
{
    [Stereotype("slider")]
    public int Volume { get; set; } = 50;

    [Stereotype("stars")]
    public int Rating { get; set; } = 4;

    [Password]
    public string? Secret { get; set; } = "hunter2";

    [Stereotype("textarea")]
    public string? Notes { get; set; } = "Some longer text";
}

/// <summary>A remote reference field: [Lookup] renders a combobox whose options come from the
/// field's search-&lt;fieldId&gt; action (stereotype combobox + remoteCoordinates on the wire); the
/// pre-set value's display label rides in the fragment data as &lt;fieldId&gt;-label, resolved
/// through the view's own ILookupLabelSupplier.</summary>
[UI("conformance/lookup"), Title("Lookup")]
public class LookupForm : ILookupLabelSupplier
{
    [Lookup] public string Supplier { get; set; } = "a2";

    public string? Label(string fieldName, object id) => "a2".Equals(id) ? "Acme" : null;
}

/// <summary>A [TreeSelect] field: stereotype treeSelect, the leavesOnly flag as treeLeavesOnly,
/// and a hierarchical option set — the options carry their CHILDREN on the wire.</summary>
[UI("conformance/tree-select"), Title("Tree select")]
public class TreeSelectForm : IOptionsSupplier
{
    [TreeSelect(leavesOnly: true)]
    public string? Zone { get; set; } = "";

    public IReadOnlyList<Option> Options(string fieldName) =>
        fieldName == "zone"
            ? [
                new Option("es", "Spain", [new Option("mca", "Mallorca"), new Option("men", "Menorca")]),
                new Option("pt", "Portugal"),
            ]
            : [];
}

// The fluent Notice: a compact themed inline banner, composed as a component tree — the one
// shape all three servers share (the declarative @Notice String-field marker is Java-only).
[UI("conformance/notice"), Title("Notice")]
public class NoticePage : IComponentTreeSupplier
{
    public IComponent Component() => new Notice("2 complaints pending")
    {
        Theme = "warning", ActionLabel = "Review", ActionId = "review", Slim = true,
    };

    // No container styling: the ports' tree suppliers declare none. The Java default
    // ("max-width:900px;margin: auto;") is an envelope member this case is not about.
    public string? Style => null;
}

/// <summary>A [BulletedList] collection property renders as a plain read-only bulleted list
/// (stereotype bulletedList).</summary>
[UI("conformance/bulleted-list"), Title("Bulleted list")]
public class BulletedListPage
{
    [BulletedList]
    public List<string> Preferences { get; set; } = ["Extra pillow", "High floor", "Sea view"];
}

/// <summary>An [AppContext] enum property on the app class becomes a header context selector
/// (contextSelectors): fieldName from the camelCased property, label from the attribute, options
/// from the enum constants (value = constant name, label = humanized). Mirrors the Java
/// ContextApp fixture — enum members are lowercase on purpose so the option values match Java's
/// enum constants ("palma", not "Palma"). A [MenuItem] member named Home stands in for Java's
/// `@Menu String home` leaf: it CLASSIFIES the class as a (declarative) app, so homeRoute resolves
/// to "_no_home_route" and the leaf's path derives from the member name → "/home".</summary>
[UI("conformance/app-context"), App("Context app")]
public class ContextApp
{
    [AppContext("Hotel")]
    public ConformanceHotel Hotel { get; set; } = ConformanceHotel.palma;

    [MenuItem("Home")]
    public void Home() { }
}

public enum ConformanceHotel { palma, madrid }

/// <summary>App header actions: the app class implements IAppActionsSupplier and its actions
/// travel on the app metadata as contextActions — a plain button (actionId + label + icon) and a
/// dropdown (null actionId, children) whose children are the only dispatching leaves.</summary>
[UI("conformance/app-header-actions"), App("Header actions")]
public class HeaderActionsApp : IAppActionsSupplier
{
    // Mirrors Java's `@Menu String home` leaf: a void return carries no [UI] route, so the entry's
    // path derives from the member name → "/home" (label "Home"), and the @Menu member classifies
    // the class as a declarative app (homeRoute "_no_home_route").
    [MenuItem("Home")]
    public void Home() { }

    public IReadOnlyList<AppHeaderAction> AppActions() =>
    [
        new("sync", "Sync now", "vaadin:refresh"),
        AppHeaderAction.Menu("Export", "vaadin:download",
            [new("exportPdf", "As PDF"), new("exportExcel", "As Excel")]),
    ];

    public Message Sync() => new("Synced");
}

/// <summary>[Toc] forces the sticky sections index: the page carries toc=true.</summary>
[UI("conformance/toc"), Title("Long document"), Toc]
public class TocPage
{
    [Section("Overview")]
    public string? Summary { get; set; } = "All good";

    [Section("Details")]
    public string? Detail { get; set; } = "Everything";

    [Section("Contact")]
    public string? Phone { get; set; } = "+34 600 000 000";

    [Section("History")]
    public string? History { get; set; } = "Created 2026";

    [Section("Notes")]
    public string? Notes { get; set; } = "None";
}

public class ConformanceGuestRow
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
}

/// <summary>A list of nested rows becomes a grid: columns from the row type, [OnRowSelected]
/// the click.</summary>
[UI("conformance/grid-field"), Title("Guest grid")]
public class GridField
{
    [OnRowSelected("onSel")]
    public List<ConformanceGuestRow> Guests { get; set; } =
        [new() { Name = "Alice", Age = 34 }, new() { Name = "Bob", Age = 29 }];

    public void OnSel(ConformanceGuestRow row) { }
}

/// <summary>The StatusList front-office component: labelled status rows — a chip row and an action row.</summary>
[UI("conformance/status-list"), Title("Status list")]
public class StatusListPage : IComponentTreeSupplier
{
    public IComponent Component() => new StatusList
    {
        Id = "statusList",
        Items =
        [
            new StatusItem
            {
                Id = "ses", Icon = "✓", Title = "Traveller report",
                Description = "Sent automatically on check-in",
                Status = "Automatic", StatusColor = "success",
            },
            new StatusItem
            {
                Id = "key", Icon = "🔑", Title = "Encode key card",
                Description = "Digital key add-on",
                ActionLabel = "Encode", ActionId = "encodeKey",
            },
        ],
    };
}

// [Compact]: high-density mode — the page component carries the compact style marker.
[UI("conformance/compact"), Title("Compact page"), Compact]
public class CompactPage
{
    public string? Name { get; set; } = "Ada";

    public string? Email { get; set; } = "ada@example.com";
}
