using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Tests.Wire;

// The fixtures of the parity cases added for 3.0 GA (2026-11-10): the twins of Java's
// ParityConformanceFixtures, same semantics, each pinning one surface the port could not declare
// until then.

// ── page-decorations / page-decorations-supplied ────────────────────────────────────────────────

/// <summary>The page's avatar, header and footer blocks, declared on properties — never drawn in
/// the body, never part of the state.</summary>
[UI("conformance/page-decorations"), Title("Customer")]
public class PageDecorationsPage
{
    [Avatar] public IComponent Picture { get; set; } = new Mateu.Uidl.Avatar { Name = "Ada Lovelace" };

    [Header] public IComponent Banner { get; set; } = new Text("Gold member");

    [Footer] public IComponent Legal { get; set; } = new Text("Data kept for five years");

    public string? Name { get; set; } = "Ada";
}

/// <summary>The same blocks, supplied in code.</summary>
[UI("conformance/page-decorations-supplied"), Title("Customer")]
public class SuppliedDecorationsPage : IHeaderSupplier, IFooterSupplier, IAvatarSupplier
{
    public string? Name { get; set; } = "Ada";

    public IReadOnlyList<IComponent> Header() => [new Text("Gold member"), new Text("Since 2019")];

    public IReadOnlyList<IComponent> Footer() => [new Text("Data kept for five years")];

    public IComponent? Avatar() => new Mateu.Uidl.Avatar { Name = "Ada Lovelace" };
}

// ── tab-shortcuts ───────────────────────────────────────────────────────────────────────────────

[UI("conformance/tab-shortcuts"), Title("Tabs")]
public class TabShortcuts
{
    [Tab("General", Shortcut = "alt+1")] public string? Name { get; set; } = "Ada";

    [Tab("Details", Shortcut = "alt+2")] public string? City { get; set; } = "London";
}

// ── listing-column-options ──────────────────────────────────────────────────────────────────────

/// <summary>A row whose properties carry every reflected column option.</summary>
public class Shipment
{
    [Priority(1, Identifier = true)] public string Code { get; set; } = "";
    [ColumnWidth("9rem")] public string Carrier { get; set; } = "";
    [Line(2)] public string Destination { get; set; } = "";
    [Style("color: grey;")] public string Notes { get; set; } = "";
    [Tooltip("notes")] public string State { get; set; } = "";
}

[UI("conformance/listing-column-options"), Title("Shipments")]
public class ShipmentsListing : IListing<Shipment>
{
    public ListingData<Shipment> Search(SearchRequest request) => ListingData.From(new List<Shipment>());
}

// ── listing-mapped-values ───────────────────────────────────────────────────────────────────────

/// <summary>A row whose values are MAPPED on their way out: a status chip and a mapped label.</summary>
public class Ticket
{
    public string Id { get; set; } = "";

    [Status(StatusType.None), StatusMapping("OPEN", StatusType.Warning), StatusMapping("DONE", StatusType.Success)]
    public string State { get; set; } = "";

    [MappedValue("Normal"), ValueMapping("H", "High"), ValueMapping("L", "Low")]
    public string Urgency { get; set; } = "";
}

[UI("conformance/listing-mapped-values"), Title("Tickets")]
public class TicketsListing : IListing<Ticket>
{
    public ListingData<Ticket> Search(SearchRequest request) => ListingData.From(new List<Ticket>
    {
        new() { Id = "t1", State = "OPEN", Urgency = "H" },
        new() { Id = "t2", State = "DONE", Urgency = "X" },
    });
}

// ── crud-generated-new / crud-generated-edit ────────────────────────────────────────────────────

/// <summary>The server's ticket numbers: what a [GeneratedValue] property starts a creation form with.</summary>
public class TicketNumbers : IValueGenerator
{
    public object? Generate() => "T-100";
}

/// <summary>A reference the server generates, a code only editable when creating, and a free text.</summary>
public class SupportCase
{
    public string Id { get; set; } = "";
    [GeneratedValue(typeof(TicketNumbers))] public string? Reference { get; set; }
    [EditableOnlyWhenCreating] public string? Code { get; set; }
    public string? Title { get; set; }

    public override string ToString() => string.IsNullOrWhiteSpace(Title) ? "New case" : Title;
}

[UI("conformance/crud-generated"), Title("Cases")]
public class CasesCrud : Crud<SupportCase>
{
    internal static readonly List<SupportCase> Store =
        [new() { Id = "T-001", Reference = "T-001", Code = "INC", Title = "Printer jam" }];

    public override IEnumerable<SupportCase> Fetch(string? search) => Store;
    public override SupportCase? Get(string id) => Store.FirstOrDefault(c => c.Id == id);
    public override void Save(SupportCase entity) { }
    public override void Delete(string id) { }
}

// ── wizard-labels ───────────────────────────────────────────────────────────────────────────────

/// <summary>[WizardLabels]: the built-in Back and Next buttons carry the wizard's own words; the
/// case pins the SECOND of three data steps, where both show.</summary>
[UI("conformance/wizard-labels"), Title("Join"), WizardLabels(Back = "Previous", Next = "Continue")]
public class LabelledWizard : Wizard
{
    [Step(1)] public string? Name { get; set; } = "Ada";
    [Step(2)] public string? City { get; set; } = "London";
    [Step(3)] public bool Agree { get; set; }
    [Step(4)] public string? Reference { get; set; }

    public override string? CompletionActionLabel => "Join";
    public override string CompletionActionId => "join";
    public override Message Complete() => new("done");

    // Java names a step after its field (who / where / confirm / thanks)
    public override string? StepTitle(int step) => step switch
    {
        1 => "Who",
        2 => "Where",
        3 => "Confirm",
        4 => "Thanks",
        _ => null,
    };
}

// ── island-data ─────────────────────────────────────────────────────────────────────────────────

/// <summary>A view embedded in another page: its lookup label travels WITH the island.</summary>
public class SupplierIsland : ILookupLabelSupplier
{
    [Lookup] public string Supplier { get; set; } = "a2";

    public string? Label(string fieldName, object id) => "a2".Equals(id) ? "Acme" : null;
}

[UI("conformance/island-data"), Title("Island")]
public class IslandDataPage : IComponentTreeSupplier
{
    public IComponent Component() => new EmbeddedView(new SupplierIsland());

    public string? Style => null;
}

// ── app-fabs / fab-style ────────────────────────────────────────────────────────────────────────

/// <summary>App-level floating buttons ([Fab] methods of the app class), one restyled.</summary>
[UI("conformance/app-fabs"), App("Fab app")]
public class FabApp
{
    [MenuItem("Home")]
    public void Home() { }

    [Fab("vaadin:plus")]
    public Message Create() => new("created");

    [Fab("vaadin:question", order: 1, ButtonStyle = "tertiary")]
    public Message Help() => new("help");
}

/// <summary>A page-level [Fab] whose button style is not the default.</summary>
[UI("conformance/fab-style"), Title("Fab page")]
public class StyledFabPage
{
    public string? Name { get; set; } = "Ada";

    [Fab("vaadin:edit", ButtonStyle = "secondary")]
    public Message Edit() => new("edit");
}

// ── field-decorations ───────────────────────────────────────────────────────────────────────────

public enum DecorationSize { S, M, L }

/// <summary>Presentation declared on the class and its properties.</summary>
[UI("conformance/field-decorations"), Title("Decorations"), Style("max-width: 40rem;"), CssClasses("decorated")]
public class FieldDecorations
{
    [UseRadioButtons, OptionsLayout(Columns = 3)]
    public DecorationSize Size { get; set; } = DecorationSize.M;

    [Style("color: grey;")] public string? Styled { get; set; } = "a";

    [DivStyle("padding: 1rem;")] public string? Wrapped { get; set; } = "c";

    [Notice(Theme = "warning", Slim = true, ActionLabel = "Review", ActionId = "review")]
    public string? Complaints { get; set; } = "2 complaints pending";
}

// ── class-rules ─────────────────────────────────────────────────────────────────────────────────

/// <summary>Class-level [Rule] and [FormValidation]: declared once, for the whole form.</summary>
[UI("conformance/class-rules"), Title("Order")]
[Rule("state.total > 100", "SetDataValue", "discount", "hidden", "false")]
[FormValidation("state.total >= 0", "total", "Cannot be negative")]
public class ClassRulesForm
{
    public int Total { get; set; } = 10;
    public string? Discount { get; set; } = "";
}

// ── banner-options ──────────────────────────────────────────────────────────────────────────────

[UI("conformance/banner-options"), Title("Banners")]
public class BannerOptionsPage
{
    public string? Name { get; set; } = "Ada";

    [Banner(BannerTheme.Warning, "Maintenance", Closeable = true, TimeoutSeconds = 10)]
    public string Maintenance() => "Tonight at 22:00";
}
