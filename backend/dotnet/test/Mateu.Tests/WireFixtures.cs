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

    [Text(Size = "xl")]
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
        Variant = AppVariant.HamburgerMenu,
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

// The access attributes as an ANONYMOUS caller sees them: the [EyesOnly] field is not on the wire,
// the [ReadOnlyUnless] one is read-only, the [DisabledUnless] button disabled.
[UI("conformance/access-annotations"), Title("Access annotations")]
public class AccessAnnotations
{
    public string? Name { get; set; } = "Ada";

    [EyesOnly(Roles = ["hr"])] public string? Salary { get; set; } = "100k";

    [ReadOnlyUnless(Roles = ["manager"])] public string? Notes { get; set; } = "n/a";

    [Button, DisabledUnless(Roles = ["manager"])] public void Approve() { }
}

// ── Listings and CRUDs ─────────────────────────────────────────────────────────────────────────

public enum ProductStatus { Available, OutOfStock, Discontinued }

// The starters' Product: an id, a text, a number and an enum.
public class Product
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public double Price { get; set; }
    public ProductStatus Status { get; set; }
}

// The plain CRUD the starters ship: listing with search + derived filters, New/Delete, the id
// column a link to the record.
[UI("conformance/crud"), Title("Products")]
public class ProductsCrud : Crud<Product>
{
    private static readonly List<Product> Store =
    [
        new() { Id = "P-001", Name = "Espresso machine", Price = 249.0, Status = ProductStatus.Available },
        new() { Id = "P-002", Name = "Coffee grinder", Price = 89.5, Status = ProductStatus.Available },
        new() { Id = "P-003", Name = "Milk frother", Price = 39.9, Status = ProductStatus.OutOfStock },
    ];

    public override IEnumerable<Product> Fetch(string? search) => Store;
    public override Product? Get(string id) => Store.FirstOrDefault(p => p.Id == id);
    public override void Save(Product product) { }
    public override void Delete(string id) { }
}

public class Book
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public int Pages { get; set; }
}

public class BookFilters
{
    public string? Title { get; set; }
    public bool Classic { get; set; }
}

public static class Books
{
    public static List<Book> All() =>
    [
        new() { Id = "b1", Title = "El Quijote", Pages = 863 },
        new() { Id = "b2", Title = "Rayuela", Pages = 600 },
    ];
}

// A read-only listing that declares a search box and a filters type — nothing else.
[UI("conformance/listing-filters"), Title("Books")]
public class FilteredBooks : IListing<Book>, Mateu.Uidl.ISearchable, IFilterable<BookFilters>
{
    public ListingData<Book> Search(SearchRequest request) => ListingData.From(Books.All());
}

// A listing that is navigable: the id column becomes the link to the record.
[UI("conformance/listing-navigable"), Title("Books")]
public class NavigableBooks : IListing<Book>, INavigable<Book, string>
{
    public ListingData<Book> Search(SearchRequest request) => ListingData.From(Books.All());
    public Book View(string id) => Books.All()[0];
}

// A sale: grouped by region, totals over amount and a count over invoice.
public class Sale
{
    public string Id { get; set; } = "";
    [GroupBy] public string Region { get; set; } = "";
    [Aggregate(AggregateFunction.Sum)] public double Amount { get; set; }
    [Aggregate(AggregateFunction.Count)] public string? Invoice { get; set; }
}

// A CRUD whose columns carry aggregates and whose rows group by a column.
[UI("conformance/crud-grouped"), Title("Sales")]
public class SalesCrud : Crud<Sale>
{
    public override IEnumerable<Sale> Fetch(string? search) =>
    [
        new() { Id = "1", Region = "North", Amount = 100.0, Invoice = "F-1" },
        new() { Id = "2", Region = "South", Amount = 50.0, Invoice = "F-2" },
        new() { Id = "3", Region = "North", Amount = 25.0, Invoice = "F-3" },
    ];
    public override Sale? Get(string id) => null;
    public override void Save(Sale sale) { }
    public override void Delete(string id) { }
}

public enum Tone { calm, loud }

// One column per basic type: what each becomes on a listing.
public class Measurement
{
    public string Label { get; set; } = "";
    public int Count { get; set; }
    public double Amount { get; set; }
    public bool Active { get; set; }
    public DateOnly? Day { get; set; }
    public DateTime? At { get; set; }
    public Tone Tone { get; set; }
}

// A bare listing whose row carries every basic type: the column mapping, pinned.
[UI("conformance/listing-columns"), Title("Measurements")]
public class MeasurementsListing : IListing<Measurement>
{
    public ListingData<Measurement> Search(SearchRequest request) => ListingData.From(new List<Measurement>());
}

/// <summary>The canonical header's previous/next record links (PageMetadataDto.PeerNav).</summary>
[UI("conformance/peer-nav"), Title("Record 2")]
public class PeerNavPage : IPeerNavigationSupplier
{
    public string? Name { get; set; } = "Two";

    public PeerNav? Peers() => new("Record 1", "/records/1", "Record 3", "/records/3");
}

/// <summary>The content slot of an app that declares only menu items (request.json: the
/// "_no_home_route" sentinel loaded against the app type).</summary>
[UI("conformance/app-no-home"), App("No home app")]
public class NoHomeApp
{
    [MenuItem("Orders")]
    public void Orders() { }
}

/// <summary>A card menu authored in code: a group shown as CARDS, each entry a card with its
/// description, its own entries the card's actions — mirrors the Java CardMenuApp fixture.</summary>
[UI("conformance/card-menu"), App("Card menu")]
public class CardMenuApp : IAppSupplier
{
    public AppShell GetApp() => new("Card menu", new List<MenuItemDto>
    {
        new("Bookings", "/b", "")
        {
            Display = "cards",
            Submenus = new List<MenuItemDto>
            {
                new("Reservations", "/b/r", "") { Description = "Search and modify reservations" },
            },
        },
        new("Plain", "/plain", ""),
    })
    {
        HomeRoute = "/plain",
        Variant = AppVariant.HamburgerMenu,
    };
}

/// <summary>The app-level shell extras as flags: command center, notification bell, global search.</summary>
[UI("conformance/app-extras"), App("Extras app", CommandCenter = true)]
public class ExtrasApp : INotificationsSupplier, IGlobalSearchSupplier
{
    [MenuItem("Home")]
    public void Home() { }

    public IReadOnlyList<AppNotification> Notifications() => [];

    public void MarkNotificationsRead(IReadOnlyList<string> ids) { }

    public IReadOnlyList<GlobalSearchResult> GlobalSearch(string searchText) => [];
}

/// <summary>The welcome banner: a centered HeroSection whose title falls back to the page title.</summary>
[UI("conformance/welcome-banner"), Title("Onboarding"), WelcomeBanner(Subtitle = "Three steps and you are done")]
public class WelcomeBannerPage
{
    public string? Name { get; set; } = "";
}

// A three-step wizard: two data steps and the read-only result screen; the case pins step 1.
[UI("conformance/wizard"), Title("Sign up")]
public class SignUpWizard : Wizard
{
    [Step(1), Required] public string? Email { get; set; }
    [Step(2)] public int Seats { get; set; } = 1;
    [Step(3)] public string? Reference { get; set; }

    public override string? CompletionActionLabel => "Sign up";
    public override Message Complete() => new("done");

    // Java names a step after its field (account / plan / done)
    public override string? StepTitle(int step) => step switch
    {
        1 => "Account",
        2 => "Plan",
        3 => "Done",
        _ => null,
    };
}

// Options from a REST endpoint: one field declares the request inline, the other names a
// catalogue source by ref.
[UI("conformance/rest-source"), Title("Shipping")]
public class RestSourceForm
{
    [RestOptions("https://api.example.com/countries?q=${state.country}",
        ItemsPath = "items", ValuePath = "code", LabelPath = "name")]
    public string? Country { get; set; }

    [RestOptions(Source = "currencies")]
    public string? Currency { get; set; }
}

// The generic fluent building blocks ported from Java (M-A5), in one component tree.
[UI("conformance/generic-components"), Title("Components")]
public class GenericComponentsPage : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content =
        [
            new Breadcrumbs("Order 42") { Items = [new Breadcrumb("Home", "/"), new Breadcrumb("Orders", "/orders")] },
            new Icon("vaadin:plus-circle"),
            new Notification("The order was saved") { Title = "Saved" },
            new Element("order-chart")
            {
                Attributes = new Dictionary<string, string> { ["id"] = "chart", ["kind"] = "bar" },
                On = new Dictionary<string, string> { ["click"] = "drill" },
                Content = "loading",
            },
            new Tooltip("Total including taxes") { Wrapped = new Text("1250 EUR") },
            new Details { Summary = new Text("More"), Content = new Text("Delivery notes"), Opened = true },
            new SplitLayout(new Text("Master"), new Text("Detail"))
            {
                Orientation = Orientation.Vertical, Variant = SplitLayoutVariant.Small,
            },
            new ConfirmDialog
            {
                Header = "Delete order?", Content = new Text("This cannot be undone"), CanCancel = true,
                ConfirmText = "Delete", ConfirmActionId = "deleteOrder", CancelActionId = "keepOrder",
            },
        ],
    };

    public string? Style => null;
}

// Every trigger kind a view can declare (M-A5): a periodic OnLoad refresh, OnSuccess/OnError of
// another action, OnValueChange of one field, and a [SubscribeTo] on the global bus.
[UI("conformance/triggers"), Title("Triggers")]
[Trigger(TriggerType.OnLoad, "refresh", TimeoutMillis = 5000, Times = 0, Background = true)]
[Trigger(TriggerType.OnSuccess, "reload", CalledActionId = "save")]
[Trigger(TriggerType.OnError, "notifyFailure", CalledActionId = "save")]
[Trigger(TriggerType.OnValueChange, "recalculate", PropertyName = "quantity")]
[SubscribeTo("order-saved", "reload")]
public class TriggersForm
{
    public int Quantity { get; set; } = 1;

    public void Refresh() { }
    public void Reload() { }
    public void Save() { }
    public void NotifyFailure() { }
    public void Recalculate() { }
}
