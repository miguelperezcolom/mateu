using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI(""), Title("Simple Form")]
public class SimpleForm
{
    [Required] public string? Name { get; set; }

    [Button] public Message Greet() => new($"Hello {Name}!");
    [Button] public PageBanner Warn() => new(BannerTheme.Warning, "Heads up", "Something to note");
    [Button] public string GoHome() => "/things";
}

[UI("amounts"), Title("Amounts")]
public class AmountsForm
{
    public double Total { get; set; }
    public float Rate { get; set; }
    public decimal Price { get; set; }

    [Button] public Message Echo() => new($"{Total}|{Rate}|{Price}");
}

[UI("orders-db"), Title("Orders (DB)")]
public class DbOrders : Crud<Thing>
{
    public static Pageable? LastPageable;

    public override IEnumerable<Thing> Fetch(string? search) =>
        throw new InvalidOperationException("pushdown must skip Fetch");

    // Simulates a database query: count + page inside, real total.
    public override PageResult<Thing>? Find(
        string? searchText, IReadOnlyDictionary<string, object?> filters, Pageable pageable)
    {
        LastPageable = pageable;
        return new PageResult<Thing>([new Thing { Id = "42", Name = "From the DB" }], 1234);
    }
}

[App("Test App"), AI("/ai/chat")]
[RemoteMenu("Payments", "https://payments.example.com", Explode = true)]
public class TestApp : IAppActionsSupplier
{
    [MenuItem("Things")] public Things Things() => new();

    [AppContext("Hotel")]
    public IReadOnlyList<OptionDto> Hotel() => [new("1", "Hotel 1"), new("2", "Hotel 2")];

    public IReadOnlyList<AppHeaderAction> AppActions() =>
    [
        new("sync", "Sync now", "refresh"),
        AppHeaderAction.Menu("Export", "download",
            [new("exportPdf", "As PDF"), new("exportExcel", "As Excel")]),
    ];

    public Message Sync() => new("Synced");
}

public class Thing
{
    public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
}

[UI("capture"), Title("Capture")]
public class CaptureForm : IOptionsSupplier
{
    [Signature] public string Firma { get; set; } = "";
    [PhotoCapture] public string Foto { get; set; } = "";
    [TreeSelect(leavesOnly: true)] public string Zone { get; set; } = "";

    public IReadOnlyList<Option> Options(string fieldName) =>
        fieldName == "zone"
            ? [new Option("es", "Spain", [new Option("mca", "Mallorca")]), new Option("pt", "Portugal")]
            : [];
}

[UI("things"), Title("Things")]
public class Things : Crud<Thing>
{
    public override IEnumerable<Thing> Fetch(string? search) =>
        [new() { Id = "1", Name = "Alpha" }, new() { Id = "2", Name = "Beta" }];
}

public enum BookingChannel { Web, Phone, Agency }

public class Booking
{
    public string Id { get; set; } = "";
    public string Guest { get; set; } = "";
    public bool Paid { get; set; }
    public BookingChannel Channel { get; set; }
    public DateOnly Created { get; set; }
    [RangeFilter] public double Total { get; set; }
}

[UI("bookings"), Title("Bookings")]
public class Bookings : Crud<Booking>
{
    public override IEnumerable<Booking> Fetch(string? search) =>
    [
        new() { Id = "b1", Guest = "Smith", Paid = true, Channel = BookingChannel.Web, Created = new DateOnly(2026, 1, 10), Total = 100 },
        new() { Id = "b2", Guest = "Jones", Paid = false, Channel = BookingChannel.Phone, Created = new DateOnly(2026, 2, 10), Total = 250 },
        new() { Id = "b3", Guest = "Brown", Paid = true, Channel = BookingChannel.Agency, Created = new DateOnly(2026, 3, 10), Total = 400 },
    ];
}

[UI("order"), Title("Order")]
public class OrderForm : IOptionsSupplier
{
    [Lookup] public string Supplier { get; set; } = "";

    public IReadOnlyList<Option> Options(string fieldName) =>
        fieldName == "supplier"
            ? [new Option("a1", "Acme Tools"), new Option("a2", "Acme Paint"), new Option("b1", "Bolts Inc")]
            : [];
}

// A SEMANTIC attribute: one domain word bundling framework configuration — the C# analogue of
// Java's composed annotations, resolved transitively by Meta.Find.
[AttributeUsage(AttributeTargets.Property)]
[Money, Label("Importe total")]
public sealed class ImporteTotalAttribute : Attribute;

[UI("invoice"), Title("Invoice")]
public class InvoiceForm
{
    [ImporteTotal] public decimal Total { get; set; }
}

[UI("booking-form"), Title("Booking")]
public class BookingWithLookup : IOptionsSupplier, ILookupLabelSupplier
{
    [Lookup] public string Supplier { get; set; } = "a2";
    [Searchable(typeof(HotelSelector))] public string Hotel { get; set; } = "h2";

    public IReadOnlyList<Option> Options(string fieldName) =>
        fieldName == "supplier" ? [new Option("a1", "Acme Tools"), new Option("a2", "Acme Paint")] : [];

    public string? Label(string fieldName, object id) =>
        fieldName == "supplier" && (string)id == "a2" ? "Acme Paint" : null;
}

[UI("secured-form"), Title("Secured")]
public class SecuredForm
{
    public string? Name { get; set; }
    [EyesOnly(Roles = ["staff"])] public string? InternalNotes { get; set; }
    [ReadOnlyUnless(Roles = ["manager"])] public decimal Discount { get; set; }
    [DisabledUnless(Permissions = ["approve"])] public bool Approved { get; set; }

    [Button, DisabledUnless(Roles = ["manager"])] public Message Close() => new("Closed");
}

// One declared model, projected per audience: [Audience] hides the member when an audience IS
// selected (appState["audience"], the [AppContext] selector named audience) and doesn't match.
// A UX projection, NOT security — combine with [EyesOnly] for real access control.
[UI("audience-form"), Title("Check-in")]
public class AudienceProjectedForm
{
    public string BookingCode { get; set; } = "B-42";
    [Audience("staff")] public string? InternalNotes { get; set; } = "VIP, late arrival";
    [Audience("cliente")] public string? WelcomeMessage { get; set; } = "Bienvenido";

    [Button, Audience("staff")] public Message Audit() => new("audited");
}

public class EditableGuest
{
    [ReadOnly] public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int Age { get; set; }
}

[UI("editable-grid"), Title("Editable grid")]
public class EditableGridForm
{
    [InlineEditing]
    public List<EditableGuest> Guests { get; set; } = [new() { Id = "g1", Name = "Alice", Age = 34 }];

    [Button] public Message Save() => new($"{Guests.Count} guests: {Guests[0].Name}/{Guests[0].Age}");
}

[App("Grouped App", Variant = "TILES")]
public class ExplicitVariantApp
{
    [MenuItem("Things")] public Things T1() => new();
}

[App("Grouped Auto App")]
public class GroupedApp
{
    [MenuItem("Products", Group = "Catalog")] public Things P1() => new();
    [MenuItem("Prices", Group = "Catalog")] public Things P2() => new();
    [MenuItem("Home")] public Things H1() => new();
}

[UI("zoned"), Title("Zoned")]
[Zone("left", "64%"), Zone("right", "36%")]
public class ZonedForm
{
    [Section("Main", Zone = "left")] public string? A { get; set; }
    public string? B { get; set; }
    [Section("Side", Zone = "right")] public string? C { get; set; }
    [Section("Loose")] public string? D { get; set; }
}

public enum BookingSource { Web, Phone, Agency }

public class BookingRow
{
    public string Locator { get; set; } = "";
    public string Guest { get; set; } = "";
    public BookingSource Source { get; set; }
    public DateOnly Created { get; set; }
    public double Total { get; set; }
}

public class BookingFilters
{
    public DateRange? Created { get; set; }
    public NumberRange? Total { get; set; }
    public ISet<BookingSource>? Sources { get; set; }
    public string? Guest { get; set; }
}

public class HotelRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

public class HotelFilters;

[UI("hotel-selector"), Title("Hotels")]
public class HotelSelector : Listing<HotelFilters, HotelRow>, ISelector<HotelRow>, ILookupLabelSupplier
{
    public override IEnumerable<HotelRow> Search(string? searchText, HotelFilters filters) =>
        [new() { Id = "h1", Name = "Palace" }, new() { Id = "h2", Name = "Marina" }];

    public SelectedItem Selected(HotelRow row) => new(row.Id, row.Name);

    public string? Label(string fieldName, object id) =>
        Search(null, new HotelFilters()).FirstOrDefault(h => h.Id == (string)id)?.Name;
}

[UI("reservation"), Title("Reservation")]
public class ReservationForm
{
    [Searchable(typeof(HotelSelector))] public string? Hotel { get; set; }
}

public class ZoneRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<ZoneRow> Children { get; set; } = [];
}

public class ZoneFilters;

[UI("zone-selector"), Title("Zones")]
public class ZoneSelector : Listing<ZoneFilters, ZoneRow>, ISelector<ZoneRow>
{
    public override string GridLayout() => "tree";

    public override IEnumerable<ZoneRow> Search(string? searchText, ZoneFilters filters) =>
    [
        new()
        {
            Id = "espana", Name = "España",
            Children =
            [
                new() { Id = "baleares", Name = "Baleares", Children = [new() { Id = "mallorca", Name = "Mallorca" }] },
            ],
        },
        new() { Id = "portugal", Name = "Portugal" },
    ];

    public SelectedItem Selected(ZoneRow row) => new(row.Id, row.Name);
}

[UI("bookings-listing"), Title("Bookings (typed filters)")]
public class BookingsListing : Listing<BookingFilters, BookingRow>
{
    private static readonly List<BookingRow> Rows =
    [
        new() { Locator = "B-001", Guest = "Smith", Source = BookingSource.Web, Created = new DateOnly(2026, 7, 2), Total = 320 },
        new() { Locator = "B-002", Guest = "Jones", Source = BookingSource.Phone, Created = new DateOnly(2026, 7, 5), Total = 149.5 },
        new() { Locator = "B-003", Guest = "Garcia", Source = BookingSource.Agency, Created = new DateOnly(2026, 7, 9), Total = 890 },
        new() { Locator = "B-004", Guest = "Brown", Source = BookingSource.Web, Created = new DateOnly(2026, 7, 12), Total = 260 },
    ];

    public override IEnumerable<BookingRow> Search(string? searchText, BookingFilters filters) =>
        Rows.Where(r => string.IsNullOrWhiteSpace(searchText)
                        || (r.Guest + " " + r.Locator).Contains(searchText, StringComparison.OrdinalIgnoreCase))
            .Where(r => filters.Created is null || filters.Created.Contains(r.Created))
            .Where(r => filters.Total is null || filters.Total.Contains((decimal)r.Total))
            .Where(r => filters.Sources is null || filters.Sources.Count == 0 || filters.Sources.Contains(r.Source));
}

[UI("folded"), Title("Folded"), FoldedLayout]
public class FoldedForm
{
    [Section("One")] public string? A { get; set; }
    [Section("Two")] public string? B { get; set; }
}

public class Guest
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
}

[UI("checkin"), Title("Check-in")]
public class CheckInForm
{
    public static string? LastSelected;

    [OnRowSelected("onGuestSelected", Shortcut = "ctrl+shift")]
    public List<Guest> Guests { get; set; } =
        [new() { Name = "Alice", Age = 34 }, new() { Name = "Bob", Age = 29 }];

    public Message OnGuestSelected(Guest guest)
    {
        LastSelected = $"{guest.Name}/{guest.Age}";
        return new Message($"Selected {guest.Name}");
    }
}

[UI("ruled"), Title("Ruled")]
public class RuledForm : IRuleSupplier
{
    public bool Special { get; set; }
    [Hidden("!state.special")] public string? SpecialCode { get; set; }
    [Disabled] public string? Locked { get; set; } = "fixed";

    public IReadOnlyList<Rule> Rules() => [Rule.Disable("specialCode", "state.locked == 'frozen'")];
}

[UI("long-doc"), Title("Long Doc"), Toc]
public class LongDocForm
{
    [Section("One")] public string? A { get; set; }
    [Section("Two")] public string? B { get; set; }
}

public class Hotel
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("hotel-search"), Title("Hotel Search")]
public class HotelSearch : HeroSearch<Hotel>
{
    public override string? HeroTitle() => "Find your stay";
    public override string? HeroSubtitle() => "Search 200 hotels";

    public override IEnumerable<Hotel> Fetch(string? search) =>
        [new() { Id = "h1", Name = "Palace" }];
}

[UI("overlays"), Title("Overlays")]
public class OverlayDemo
{
    [Button] public Drawer OpenPanel() => new()
    {
        HeaderTitle = "Edit contact",
        Width = "480px",
        Content = new Text("drawer body"),
    };

    [Button] public Dialog OpenDialog() => new()
    {
        HeaderTitle = "Confirm",
        Content = new Text("dialog body"),
    };

    [Button] public UICommandDto SaveAndClose() => UICommandDto.CloseModal("contact-saved", new { id = 7 });
}

public enum StockStatus { Ok, Low, Out }

public class StockItem
{
    [ReadOnly] public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int Units { get; set; }
    public bool Active { get; set; }
    public StockStatus Status { get; set; }
}

[UI("stock"), Title("Stock"), InlineEditing]
public class StockCrud : Crud<StockItem>
{
    public static readonly Dictionary<string, StockItem> Store = new()
    {
        ["s1"] = new StockItem { Id = "s1", Name = "Bolts", Units = 12, Active = true, Status = StockStatus.Ok },
    };

    public override IEnumerable<StockItem> Fetch(string? search) => Store.Values;

    public override StockItem? Get(string id) => Store.GetValueOrDefault(id);

    public override void Save(StockItem entity) => Store[entity.Id] = entity;

    // A BULK list action over the grid's selected rows (List toolbar button).
    [ListToolbarButton]
    public void Deactivate(List<StockItem> rows)
    {
        foreach (var row in rows)
        {
            row.Active = false;
            Save(row);
        }
    }

    [ListToolbarButton(confirmationRequired: true, rowsSelectedRequired: false), Label("Restock everything")]
    public Message RestockAll() => new("Restocked");
}

// Listing aggregates + row grouping: [Aggregate] columns total over the WHOLE filtered set,
// the [GroupBy] column groups the rows (implicit primary sort + per-group subtotals).
public class Sale
{
    public string Id { get; set; } = "";
    [GroupBy] public string Region { get; set; } = "";
    public string Product { get; set; } = "";
    [Aggregate(AggregateFunction.Sum)] public double Amount { get; set; }
    [Aggregate(AggregateFunction.Count)] public string? Invoice { get; set; }
}

[UI("sales"), Title("Sales")]
public class Sales : Crud<Sale>
{
    public override IEnumerable<Sale> Fetch(string? search) =>
    [
        new() { Id = "1", Region = "North", Product = "Widget", Amount = 100, Invoice = "F-1" },
        new() { Id = "2", Region = "South", Product = "Widget", Amount = 50, Invoice = "F-2" },
        new() { Id = "3", Region = "North", Product = "Gadget", Amount = 25, Invoice = "F-3" },
        new() { Id = "4", Region = "South", Product = "Gadget", Amount = 25, Invoice = null },
    ];
}

public class UpperTranslator : ITranslator
{
    public string Translate(string key) => key.ToUpperInvariant();
}

[UI("decorated"), Title("Decorated"), Subtitle("a subtitle")]
[Emits("ev-out"), SubscribeTo("ev-in", "act")]
public class Decorated
{
    [Banner(BannerTheme.Warning, "Careful")] public string Warn() => "be careful";
    public string? Field { get; set; }
}

[UI("wiz"), Title("Wiz")]
public class Wiz : Wizard
{
    [Step(1)] public string? A { get; set; }
    [Step(2)] public string? B { get; set; }
    public override Message Complete() => new("done");
}

[UI("linked"), Title("Linked")]
public class LinkedForm
{
    public string CustomerId { get; set; } = "42";

    [LinkTo("/customers/${state.customerId}")]
    public string? CustomerName { get; set; } = "Ada";

    [LinkTo("https://mateu.io", Icon = "vaadin:external-link", Title = "Abrir ${state.customerName}", Target = "_blank")]
    public string? Website { get; set; }

    public string? Plain { get; set; }
}

[UI("supplied-links"), Title("Supplied links")]
public class SuppliedLinkForm : ILinkSupplier
{
    [LinkTo("/annotated/${state.customerId}")]
    public string CustomerId { get; set; } = "42";

    public string OrderId { get; set; } = "A-1";

    public NavLink? Link(string memberName) =>
        memberName == nameof(OrderId) ? new NavLink("/orders/${state.orderId}", Icon: "vaadin:cart") : null;
}

[UI("featured"), Title("Featured"), Compact, ConfirmOnNavigationIfDirty]
public class Featured
{
    [Tab("One")] public string? Name { get; set; }
    [Tab("One"), Password] public string? Secret { get; set; }
    [Tab("Two"), Multiline] public string? Bio { get; set; }
    [Tab("Two"), Money] public decimal Salary { get; set; }
    [Tab("Two"), PlainText] public string? Joined { get; set; } = "2021-03-14";

    [Kpi("Tickets")] public string Tickets() => "42";
    [Fab("plus", "Add", 0)] public Message Add() => new("Added");
    [Button, Shortcut("ctrl+s")] public Message Save() => new($"Saved {Name}");
}

public class SyncHandlerTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(SimpleForm).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    [Fact]
    public void InitialLoad_emits_window_title_and_form_with_required_name_field_and_greet_button()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "", ConsumedRoute = "_empty" });
        var json = Render(inc);

        // Same wire shape the Java backend emits for SimpleForm.
        Assert.Contains("\"type\":\"SetWindowTitle\"", json);
        Assert.Contains("\"data\":\"Simple Form\"", json);
        Assert.Contains("\"type\":\"ServerSide\"", json);
        Assert.Contains("\"serverSideType\":\"Mateu.Tests.SimpleForm\"", json);
        Assert.Contains("\"type\":\"FormField\"", json);
        Assert.Contains("\"fieldId\":\"name\"", json);
        Assert.Contains("\"dataType\":\"string\"", json);
        Assert.Contains("\"required\":true", json);
        Assert.Contains("\"label\":\"Greet\"", json);
        Assert.Contains("\"actionId\":\"greet\"", json);
    }

    [Fact]
    public void Greet_action_returns_hello_message_built_from_componentState()
    {
        var rq = new RunActionRqDto
        {
            Route = "",
            ActionId = "greet",
            ServerSideType = typeof(SimpleForm).FullName,
            ComponentState = new() { ["name"] = JsonSerializer.SerializeToElement("Mateu") },
        };

        var inc = Handler().Handle(rq);

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("Hello Mateu!", msg.Text);
        Assert.Equal("success", msg.Variant);
        Assert.Empty(inc.Fragments);
    }

    [Fact]
    public void Integer_state_values_pour_into_double_float_and_decimal_properties()
    {
        // The JS client integerizes whole doubles (343.0 travels as 343): numeric widening must
        // rebuild the typed properties. Pins the behavior the Java core guarantees after the
        // FieldValueConverter/TypeCoercionHelper widening fix.
        var rq = new RunActionRqDto
        {
            Route = "/amounts",
            ActionId = "echo",
            ServerSideType = typeof(AmountsForm).FullName,
            ComponentState = new()
            {
                ["total"] = JsonSerializer.SerializeToElement(343),
                ["rate"] = JsonSerializer.SerializeToElement(2),
                ["price"] = JsonSerializer.SerializeToElement(99),
            },
        };

        var inc = Handler().Handle(rq);

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("343|2|99", msg.Text);
    }

    [Fact]
    public void App_shell_emits_menu_from_menuitem_methods()
    {
        var inc = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName });
        var json = Render(inc);

        Assert.Contains("\"type\":\"App\"", json);
        Assert.Contains("\"title\":\"Test App\"", json);
        Assert.Contains("\"label\":\"Things\"", json);
        Assert.Contains("\"route\":\"/things\"", json);
    }

    [Fact]
    public void Capture_and_tree_fields_reach_the_wire()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "/capture", ServerSideType = typeof(CaptureForm).FullName });
        var json = Render(inc);

        Assert.Contains("\"stereotype\":\"signature\"", json);
        Assert.Contains("\"stereotype\":\"camera\"", json);
        Assert.Contains("\"stereotype\":\"treeSelect\"", json);
        Assert.Contains("\"treeLeavesOnly\":true", json);
        Assert.Contains("\"label\":\"Mallorca\"", json);
    }

    [Fact]
    public void App_context_selectors_reach_the_wire()
    {
        var inc = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName });
        var json = Render(inc);

        Assert.Contains("\"contextSelectors\"", json);
        Assert.Contains("\"fieldName\":\"hotel\"", json);
        Assert.Contains("\"label\":\"Hotel 2\"", json);
    }

    [Fact]
    public void App_header_actions_reach_the_wire()
    {
        var inc = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName });
        var json = Render(inc);

        Assert.Contains("\"contextActions\":[" +
            "{\"actionId\":\"sync\",\"label\":\"Sync now\",\"icon\":\"refresh\",\"children\":null}," +
            "{\"actionId\":null,\"label\":\"Export\",\"icon\":\"download\",\"children\":[" +
            "{\"actionId\":\"exportPdf\",\"label\":\"As PDF\",\"icon\":null,\"children\":null}," +
            "{\"actionId\":\"exportExcel\",\"label\":\"As Excel\",\"icon\":null,\"children\":null}]}]", json);
    }

    [Fact]
    public void App_header_action_dispatches_against_the_app_class()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            ServerSideType = typeof(TestApp).FullName,
            ActionId = "sync",
        });

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("Synced", msg.Text);
    }

    [Fact]
    public void Find_override_pushes_search_down_and_skips_the_in_memory_pipeline()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(DbOrders).FullName,
            ComponentState = new()
            {
                ["page"] = JsonSerializer.SerializeToElement(2),
                ["size"] = JsonSerializer.SerializeToElement(25),
                ["sort"] = JsonSerializer.SerializeToElement(new[] { new { field = "name", direction = "descending" } }),
            },
        };

        var json = Render(Handler().Handle(rq));

        // The page comes back verbatim with the query's real total (Fetch would have thrown)…
        Assert.Contains("\"totalElements\":1234", json);
        Assert.Contains("From the DB", json);
        // …and the request's paging + sort reached the override.
        Assert.Equal(2, DbOrders.LastPageable!.Page);
        Assert.Equal(25, DbOrders.LastPageable.Size);
        Assert.Equal(new SortSpec("name", true), Assert.Single(DbOrders.LastPageable.Sort));
    }

    [Fact]
    public void Remote_menu_emits_a_federated_entry()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName }));

        Assert.Contains("\"label\":\"Payments\"", json);
        Assert.Contains("\"remote\":true", json);
        Assert.Contains("\"baseUrl\":\"https://payments.example.com\"", json);
        Assert.Contains("\"explode\":true", json);
    }

    [Fact]
    public void Micro_frontend_component_mounts_a_remote_island()
    {
        var dto = ComponentMapper.Map(new Mateu.Uidl.MicroFrontend("https://billing.example.com", "/invoices"));
        var json = JsonSerializer.Serialize<ComponentDto>(dto, Json);

        Assert.Contains("\"type\":\"MicroFrontend\"", json);
        Assert.Contains("\"baseUrl\":\"https://billing.example.com\"", json);
        Assert.Contains("\"route\":\"/invoices\"", json);
        Assert.Contains("\"consumedRoute\":\"_empty\"", json);
    }

    [Fact]
    public void App_metadata_carries_the_sse_chat_url()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName }));
        Assert.Contains("\"sseUrl\":\"/ai/chat\"", json);
    }

    [Fact]
    public void Preexisting_lookup_and_searchable_values_resolve_their_labels()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "booking-form", ConsumedRoute = "booking-form" });

        var frag = Assert.Single(inc.Fragments);
        var json = JsonSerializer.Serialize(frag.Data, Json);
        // [Lookup] resolves via the view's ILookupLabelSupplier / options…
        Assert.Contains("\"supplier-label\":\"Acme Paint\"", json);
        // …[Searchable] asks its selector (HotelSelector implements nothing → falls to null? It
        // must implement ILookupLabelSupplier to resolve; Marina comes from its Selected source).
        Assert.Contains("\"hotel-label\":\"Marina\"", json);
    }

    [Fact]
    public void Permission_gates_hide_readonly_and_disable_without_identity()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "secured-form", ConsumedRoute = "secured-form" }));

        // No identity: [EyesOnly] hides, [ReadOnlyUnless] locks, [DisabledUnless] disables.
        Assert.DoesNotContain("internalNotes", json);
        Assert.Contains("\"label\":\"Discount\",\"stereotype\":\"regular\",\"treeLeavesOnly\":false,\"required\":false,\"readOnly\":true", json);
        Assert.Contains("\"fieldId\":\"approved\"", json);
        Assert.Contains("\"fieldName\":\"approved\",\"fieldAttribute\":\"disabled\"", json);
        Assert.Contains("\"actionId\":\"close\",\"type\":\"Button\",\"disabled\":true", json);
    }

    [Fact]
    public void Permission_gates_open_up_for_an_authorized_identity()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(SimpleForm).Assembly), null,
            () => new Identity(Roles: ["staff", "manager"], Permissions: ["approve"]));
        var json = JsonSerializer.Serialize(
            handler.Handle(new RunActionRqDto { Route = "secured-form", ConsumedRoute = "secured-form" }), Json);

        Assert.Contains("internalNotes", json);
        Assert.DoesNotContain("\"fieldName\":\"approved\",\"fieldAttribute\":\"disabled\"", json);
        Assert.Contains("\"actionId\":\"close\",\"type\":\"Button\",\"disabled\":false", json);
    }

    [Fact]
    public void Audience_unset_shows_every_projection()
    {
        // No audience selected → no projection active → the full model renders.
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "audience-form", ConsumedRoute = "audience-form" }));

        Assert.Contains("bookingCode", json);
        Assert.Contains("internalNotes", json);
        Assert.Contains("welcomeMessage", json);
        Assert.Contains("\"actionId\":\"audit\"", json);
    }

    [Fact]
    public void Audience_projection_hides_unmatched_fields_and_buttons()
    {
        var cliente = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "audience-form",
            ConsumedRoute = "audience-form",
            AppState = new() { ["audience"] = JsonSerializer.SerializeToElement("cliente") },
        }));
        Assert.Contains("bookingCode", cliente);
        Assert.DoesNotContain("internalNotes", cliente);
        Assert.Contains("welcomeMessage", cliente);
        Assert.DoesNotContain("\"actionId\":\"audit\"", cliente);

        var staff = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "audience-form",
            ConsumedRoute = "audience-form",
            AppState = new() { ["audience"] = JsonSerializer.SerializeToElement("staff") },
        }));
        Assert.Contains("bookingCode", staff);
        Assert.Contains("internalNotes", staff);
        Assert.DoesNotContain("welcomeMessage", staff);
        Assert.Contains("\"actionId\":\"audit\"", staff);
    }

    [Fact]
    public void Blank_audience_counts_as_unset()
    {
        var json = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "audience-form",
            ConsumedRoute = "audience-form",
            AppState = new() { ["audience"] = JsonSerializer.SerializeToElement("") },
        }));
        Assert.Contains("internalNotes", json);
        Assert.Contains("welcomeMessage", json);
    }

    [Fact]
    public void Inline_editing_grid_field_emits_editable_cells_and_rows_bind_back()
    {
        var renderJson = Render(Handler().Handle(new RunActionRqDto { Route = "editable-grid", ConsumedRoute = "editable-grid" }));
        // Cells edit in place, [ReadOnly] row columns stay display-only.
        Assert.Contains("\"id\":\"name\",\"label\":\"Name\",\"type\":\"GridColumn\",\"dataType\":\"string\",\"stereotype\":null,\"editable\":true,\"editorType\":\"text\"", renderJson);
        Assert.Contains("\"id\":\"id\",\"label\":\"Id\",\"type\":\"GridColumn\",\"dataType\":\"string\",\"stereotype\":null,\"editable\":false", renderJson);

        // The edited rows travel in the form state and bind back into List<EditableGuest>.
        var rq = new RunActionRqDto
        {
            ActionId = "save",
            Route = "editable-grid",
            ServerSideType = typeof(EditableGridForm).FullName,
            ComponentState = new()
            {
                ["guests"] = JsonSerializer.SerializeToElement(
                    new[] { new { id = "g1", name = "Alice B.", age = 35 } }),
            },
        };
        var msg = Assert.Single(Handler().Handle(rq).Messages);
        Assert.Equal("1 guests: Alice B./35", msg.Text);
    }

    [Fact]
    public void App_variant_follows_the_java_auto_decision_table()
    {
        // Flat leaf menu → TABS.
        var flat = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName }));
        Assert.Contains("\"variant\":\"TABS\"", flat);

        // Grouped menu (folders, ≤7 top-level) → MENU_ON_TOP, entries nested as submenus.
        var grouped = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(GroupedApp).FullName }));
        Assert.Contains("\"variant\":\"MENU_ON_TOP\"", grouped);
        Assert.Contains("\"label\":\"Catalog\"", grouped);
        Assert.Contains("\"label\":\"Prices\"", grouped);

        // An explicit [App(Variant = ...)] always wins.
        var explicitVariant = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(ExplicitVariantApp).FullName }));
        Assert.Contains("\"variant\":\"TILES\"", explicitVariant);
    }

    [Fact]
    public void Semantic_attribute_bundles_framework_configuration()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "invoice", ConsumedRoute = "invoice" }));

        // [ImporteTotal] behaves as if the property carried [Money] + [Label] directly
        // (editable money fields keep the numeric data type; the stereotype carries the intent).
        Assert.Contains("\"dataType\":\"number\",\"label\":\"Importe total\",\"stereotype\":\"money\"", json);
        Assert.Contains("\"label\":\"Importe total\"", json);
    }

    [Fact]
    public void Tree_selector_emits_the_tree_grid_layout_without_a_children_column()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "zone-selector", ConsumedRoute = "zone-selector" }));

        Assert.Contains("\"gridLayout\":\"tree\"", json);
        // The children list rides inside the rows, never as a column…
        Assert.DoesNotContain("\"id\":\"children\"", json);
        // …and the selector wiring is intact.
        Assert.Contains("\"id\":\"select\"", json);
        Assert.Contains("action-on-row-select", json);
    }

    [Fact]
    public void Tree_search_returns_hierarchical_rows_with_nested_children()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(ZoneSelector).FullName,
        };

        var json = Render(Handler().Handle(rq));

        // Two roots; the whole hierarchy rides in one payload as nested children arrays.
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains(
            "\"name\":\"Baleares\",\"children\":[{\"id\":\"mallorca\",\"name\":\"Mallorca\",\"children\":[]}]",
            json);
        Assert.Contains("\"id\":\"portugal\",\"name\":\"Portugal\",\"children\":[]", json);
    }

    [Fact]
    public void Searchable_field_renders_with_the_searchable_stereotype()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "reservation", ConsumedRoute = "reservation" }));
        Assert.Contains("\"stereotype\":\"searchable\"", json);
    }

    [Fact]
    public void Codesearch_opens_the_selector_listing_in_a_dialog()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "codesearch-hotel",
            Route = "reservation",
            ServerSideType = typeof(ReservationForm).FullName,
            InitiatorComponentId = "comp-3",
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        Assert.Equal("comp-3", frag.TargetComponentId);
        Assert.Equal("Add", frag.Action);
        var json = Render(inc);
        // A Dialog whose content is the selector's own server-side listing…
        Assert.Contains("\"type\":\"Dialog\"", json);
        Assert.Contains(typeof(HotelSelector).FullName!, json);
        // …with the Select action column, the host field id, and its own search wiring.
        Assert.Contains("\"id\":\"select\",\"label\":\"Select\",\"type\":\"GridColumn\",\"dataType\":\"action\"", json);
        Assert.Contains("\"_fieldId\":\"hotel\"", json);
        Assert.Contains("action-on-row-select", json);
        Assert.Contains("\"OnLoad\"", json);
    }

    [Fact]
    public void Selecting_a_row_writes_id_and_label_back_and_closes_the_dialog()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "action-on-row-select",
            ServerSideType = typeof(HotelSelector).FullName,
            ComponentState = new() { ["_fieldId"] = JsonSerializer.SerializeToElement("hotel") },
            Parameters = new()
            {
                ["_clickedRow"] = JsonSerializer.SerializeToElement(new { id = "h2", name = "Marina" }),
            },
        };

        var inc = Handler().Handle(rq);

        Assert.Equal(3, inc.Commands.Count);
        var json = Render(inc);
        Assert.Contains("\"eventName\":\"value-changed\"", json);
        Assert.Contains("\"fieldId\":\"hotel\",\"value\":\"h2\"", json);
        Assert.Contains("\"eventName\":\"data-changed\"", json);
        Assert.Contains("\"key\":\"hotel-label\",\"value\":\"Marina\"", json);
        Assert.Contains("\"eventName\":\"close-modal-requested\"", json);
    }

    [Fact]
    public void Declarative_listing_emits_typed_filter_widgets_and_read_only_columns()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "bookings-listing", ConsumedRoute = "bookings-listing" }));

        // Typed filters render range/multi widgets — the type is the developer's explicit ask…
        Assert.Contains("\"fieldId\":\"created\",\"dataType\":\"date\",\"label\":\"Created\",\"stereotype\":\"dateRange\"", json);
        Assert.Contains("\"fieldId\":\"total\",\"dataType\":\"number\",\"label\":\"Total\",\"stereotype\":\"numberRange\"", json);
        Assert.Contains("\"fieldId\":\"sources\",\"dataType\":\"string\",\"label\":\"Sources\",\"stereotype\":\"multiSelect\"", json);
        // …plain fields keep single-value widgets, and the listing is read-only.
        Assert.Contains("\"fieldId\":\"guest\",\"dataType\":\"string\",\"label\":\"Guest\",\"stereotype\":\"regular\"", json);
        Assert.Contains("\"canEdit\":false", json);
        Assert.Contains("\"id\":\"locator\"", json);
    }

    [Fact]
    public void Listing_search_assembles_typed_filters_from_flat_state_keys()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(BookingsListing).FullName,
            ComponentState = new()
            {
                ["searchText"] = JsonSerializer.SerializeToElement(""),
                ["created_from"] = JsonSerializer.SerializeToElement("2026-07-04"),
                ["created_to"] = JsonSerializer.SerializeToElement("2026-07-10"),
                ["sources"] = JsonSerializer.SerializeToElement(new[] { "Phone", "Agency" }),
            },
        };

        var inc = Handler().Handle(rq);
        var json = Render(inc);

        // Only Jones (Phone, 07-05) and Garcia (Agency, 07-09) fall in range AND source set.
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Jones", json);
        Assert.Contains("Garcia", json);
        Assert.DoesNotContain("Smith", json);
        Assert.DoesNotContain("Brown", json);
    }

    [Fact]
    public void Listing_search_assembles_number_ranges_and_comma_joined_sets()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(BookingsListing).FullName,
            ComponentState = new()
            {
                ["total_from"] = JsonSerializer.SerializeToElement("200"),
                // Comma-joined after a URL restore; a stale constant is dropped, not fatal.
                ["sources"] = JsonSerializer.SerializeToElement("Web,Gone"),
            },
        };

        var json = Render(Handler().Handle(rq));

        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Smith", json);
        Assert.Contains("Brown", json);
        Assert.DoesNotContain("Garcia", json);
    }

    [Fact]
    public void Folded_layout_puts_the_section_cards_in_one_horizontal_row()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "folded", ConsumedRoute = "folded" }));

        Assert.Contains("\"type\":\"HorizontalLayout\"", json);
        Assert.Contains("One", json);
        Assert.Contains("Two", json);
    }

    [Fact]
    public void Zones_lay_sections_out_as_side_by_side_columns()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "zoned", ConsumedRoute = "zoned" }));

        // A horizontal row of vertical columns…
        Assert.Contains("\"type\":\"HorizontalLayout\"", json);
        Assert.Contains("width: 100%; align-items: flex-start;", json);
        // …declared zones size by their width, the unzoned section falls into a flexible column…
        Assert.Contains("flex: 1 1 calc(64% - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);", json);
        Assert.Contains("flex: 1 1 calc(36% - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);", json);
        Assert.Contains("flex: 1 1 12rem; min-width: min(20rem, 100%);", json);
        Assert.Contains("\"wrap\":true", json);
        // …and every section card survives.
        Assert.Contains("Main", json);
        Assert.Contains("Side", json);
        Assert.Contains("Loose", json);
    }

    [Fact]
    public void List_of_rows_property_renders_as_a_grid_form_field()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "checkin", ConsumedRoute = "checkin" }));

        Assert.Contains("\"dataType\":\"array\"", json);
        Assert.Contains("\"stereotype\":\"grid\"", json);
        Assert.Contains("\"itemIdPath\":\"_rowNumber\"", json);
        // Columns come from the row type, initial rows ride as camelCase dicts…
        Assert.Contains("\"id\":\"name\",\"label\":\"Name\"", json);
        Assert.Contains("\"id\":\"age\",\"label\":\"Age\"", json);
        Assert.Contains("Alice", json);
        // …and [OnRowSelected] wires the click + shortcut and advertises the action.
        Assert.Contains("\"onItemSelectionActionId\":\"onGuestSelected\"", json);
        Assert.Contains("\"rowSelectionShortcut\":\"ctrl\\u002Bshift\"", json);
        Assert.Contains("\"id\":\"onGuestSelected\"", json);
    }

    [Fact]
    public void Row_click_injects_the_clicked_row_into_the_method()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "onGuestSelected",
            Route = "checkin",
            ServerSideType = typeof(CheckInForm).FullName,
            Parameters = new()
            {
                ["_clickedRow"] = JsonSerializer.SerializeToElement(new { name = "Bob", age = 29 }),
            },
        };

        var inc = Handler().Handle(rq);

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("Selected Bob", msg.Text);
        Assert.Equal("Bob/29", CheckInForm.LastSelected);
    }

    [Fact]
    public void Hidden_disabled_and_supplier_rules_ride_on_the_server_side_component()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "ruled", ConsumedRoute = "ruled" }));

        // [Hidden(expr)] → a hidden rule with the client-side expression…
        Assert.Contains("\"fieldName\":\"specialCode\",\"fieldAttribute\":\"hidden\",\"value\":null,\"expression\":\"!state.special\"", json);
        // …[Disabled] → an unconditional disabled rule…
        Assert.Contains("\"fieldName\":\"locked\",\"fieldAttribute\":\"disabled\",\"value\":null,\"expression\":\"true\"", json);
        // …and IRuleSupplier contributes programmatic rules (the apostrophes JSON-escape to ').
        Assert.Contains("state.locked == \\u0027frozen\\u0027", json);
        Assert.Contains("\"action\":\"SetDataValue\"", json);
        Assert.Contains("\"result\":\"Continue\"", json);
    }

    [Fact]
    public void Toc_marks_the_page_for_a_sticky_sections_index()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { Route = "long-doc", ConsumedRoute = "long-doc" }));
        Assert.Contains("\"toc\":true", json);
    }

    [Fact]
    public void Hero_search_renders_a_hero_over_a_cards_listing_and_does_not_preload()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "hotel-search", ConsumedRoute = "hotel-search" });
        var json = Render(inc);

        Assert.Contains("\"type\":\"HeroSection\"", json);
        Assert.Contains("\"title\":\"Find your stay\"", json);
        Assert.Contains("\"crudlType\":\"cards\"", json);
        // Starts empty: no OnLoad→search trigger (the user searches).
        Assert.DoesNotContain("\"OnLoad\"", json);
    }

    [Fact]
    public void Action_returned_drawer_is_an_add_fragment_on_the_initiator()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "openPanel",
            Route = "overlays",
            ServerSideType = typeof(OverlayDemo).FullName,
            InitiatorComponentId = "comp-9",
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        Assert.Equal("comp-9", frag.TargetComponentId);
        Assert.Equal("Add", frag.Action);
        var json = Render(inc);
        Assert.Contains("\"type\":\"Drawer\"", json);
        Assert.Contains("\"headerTitle\":\"Edit contact\"", json);
        Assert.Contains("\"position\":\"end\"", json);
        Assert.Contains("drawer body", json);
    }

    [Fact]
    public void Action_returned_dialog_is_an_add_fragment_too()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "openDialog",
            Route = "overlays",
            ServerSideType = typeof(OverlayDemo).FullName,
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        Assert.Equal("Add", frag.Action);
        var json = Render(inc);
        Assert.Contains("\"type\":\"Dialog\"", json);
        Assert.Contains("\"closeButtonOnHeader\":true", json);
        Assert.Contains("dialog body", json);
    }

    [Fact]
    public void Close_modal_command_carries_the_named_event_and_detail()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "saveAndClose",
            Route = "overlays",
            ServerSideType = typeof(OverlayDemo).FullName,
        };

        var inc = Handler().Handle(rq);

        var cmd = Assert.Single(inc.Commands);
        Assert.Equal("CloseModal", cmd.Type);
        var json = Render(inc);
        Assert.Contains("\"eventName\":\"contact-saved\"", json);
        Assert.Contains("\"id\":7", json);
    }

    [Fact]
    public void Lookup_field_renders_a_remote_combobox_on_the_wire()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "order", ConsumedRoute = "order" });
        var json = Render(inc);

        Assert.Contains("\"stereotype\":\"combobox\"", json);
        Assert.Contains("\"remoteCoordinates\":{\"action\":\"search-supplier\"", json);
    }

    [Fact]
    public void Lookup_search_filters_and_pages_the_suppliers_options()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search-supplier",
            Route = "order",
            ServerSideType = typeof(OrderForm).FullName,
            InitiatorComponentId = "comp-1",
            Parameters = new()
            {
                ["searchText"] = JsonSerializer.SerializeToElement("acme"),
                ["page"] = JsonSerializer.SerializeToElement(0),
                ["size"] = JsonSerializer.SerializeToElement(10),
            },
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        Assert.Equal("comp-1", frag.TargetComponentId);
        var json = Render(inc);
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Acme Tools", json);
        Assert.Contains("Acme Paint", json);
        Assert.DoesNotContain("Bolts Inc", json);
    }

    [Fact]
    public void Inline_editing_marks_data_columns_editable_and_advertises_update_row()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "stock", ConsumedRoute = "stock" });
        var json = Render(inc);

        // Data columns edit in place with the widget matching their type…
        Assert.Contains("\"id\":\"name\",\"label\":\"Name\",\"type\":\"GridColumn\",\"dataType\":null,\"stereotype\":null,\"editable\":true,\"editorType\":\"text\"", json);
        Assert.Contains("\"editorType\":\"integer\"", json);
        Assert.Contains("\"editorType\":\"boolean\"", json);
        Assert.Contains("\"editorType\":\"select\"", json);
        // …enum editors carry their constants as options…
        Assert.Contains("\"editorOptions\":[{\"value\":\"Ok\"", json);
        // …[ReadOnly] columns stay display-only…
        Assert.Contains("\"id\":\"id\",\"label\":\"Id\",\"type\":\"GridColumn\",\"dataType\":null,\"stereotype\":null,\"editable\":false", json);
        // …and the crud advertises the update-row action.
        Assert.Contains("update-row", json);
    }

    [Fact]
    public void List_toolbar_button_emits_toolbar_button_and_selection_flagged_action()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "stock", ConsumedRoute = "stock" });
        var json = Render(inc);

        // The bulk method rides on the listing toolbar (label from [Label] or humanized name)…
        Assert.Contains("\"label\":\"Deactivate\",\"actionId\":\"action-on-row-deactivate\"", json);
        Assert.Contains("\"label\":\"Restock everything\",\"actionId\":\"action-on-row-restockAll\"", json);
        // …and its action advertises the confirmation/selection flags the frontend enforces
        // (same field names as Java's ActionDto).
        Assert.Contains(
            "{\"id\":\"action-on-row-deactivate\",\"validationRequired\":false,"
            + "\"confirmationRequired\":false,\"rowsSelectedRequired\":true,\"bubble\":true}", json);
        Assert.Contains(
            "{\"id\":\"action-on-row-restockAll\",\"validationRequired\":false,"
            + "\"confirmationRequired\":true,\"rowsSelectedRequired\":false,\"bubble\":true}", json);
    }

    [Fact]
    public void List_toolbar_button_dispatch_receives_typed_selected_rows_and_researches()
    {
        StockCrud.Store.Clear();
        StockCrud.Store["s1"] = new StockItem { Id = "s1", Name = "Bolts", Units = 12, Active = true, Status = StockStatus.Ok };
        StockCrud.Store["s2"] = new StockItem { Id = "s2", Name = "Nuts", Units = 5, Active = true, Status = StockStatus.Low };

        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "action-on-row-deactivate",
            ServerSideType = typeof(StockCrud).FullName,
            ComponentState = new()
            {
                ["crud_selected_items"] = JsonSerializer.SerializeToElement(new[]
                {
                    new { id = "s1", name = "Bolts", units = 12, active = true, status = "Ok" },
                }),
            },
        });

        // The selected rows reached the method TYPED — only s1 was deactivated.
        Assert.False(StockCrud.Store["s1"].Active);
        Assert.True(StockCrud.Store["s2"].Active);
        // A void method re-runs the search so the listing reflects the changes.
        var frag = Assert.Single(inc.Fragments);
        Assert.Null(frag.Component);
        Assert.Contains("\"totalElements\":2", Render(inc));
    }

    [Fact]
    public void List_toolbar_button_non_null_result_maps_as_usual()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "action-on-row-restockAll",
            ServerSideType = typeof(StockCrud).FullName,
        });

        Assert.Equal("Restocked", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Update_row_rebuilds_the_entity_and_saves_it()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "update-row",
            ServerSideType = typeof(StockCrud).FullName,
            Parameters = new()
            {
                ["_editedRow"] = JsonSerializer.SerializeToElement(
                    new { id = "s1", name = "Bolts XL", units = 20, active = false, status = "Low" }),
            },
        };

        var inc = Handler().Handle(rq);

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("success", msg.Variant);
        var saved = StockCrud.Store["s1"];
        Assert.Equal("Bolts XL", saved.Name);
        Assert.Equal(20, saved.Units);
        Assert.False(saved.Active);
        Assert.Equal(StockStatus.Low, saved.Status);
    }

    [Fact]
    public void Crud_search_returns_rows_as_data_only_fragment()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new() { ["searchText"] = JsonSerializer.SerializeToElement("") },
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        // The data fragment goes back to the component that initiated the search.
        Assert.Equal("ux_main", frag.TargetComponentId);
        Assert.Null(frag.Component);
        var json = Render(inc);
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Alpha", json);
        Assert.Contains("Beta", json);
    }

    [Fact]
    public void Crud_search_sorts_and_paginates()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new()
            {
                ["searchText"] = JsonSerializer.SerializeToElement(""),
                ["sort"] = JsonSerializer.SerializeToElement(new[] { new { field = "name", direction = "descending" } }),
                ["page"] = JsonSerializer.SerializeToElement(0),
                ["size"] = JsonSerializer.SerializeToElement(1),
            },
        };

        var inc = Handler().Handle(rq);
        var json = Render(inc);
        // total is the full dataset (2), the page carries one row, and descending sort puts Beta first
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("\"pageSize\":1", json);
        Assert.Contains("Beta", json);
        Assert.DoesNotContain("Alpha", json);
    }

    [Fact]
    public void Crud_view_renders_prefilled_readonly_form_with_view_toolbar()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/1",
            ServerSideType = typeof(Things).FullName,
        });
        var json = Render(inc);

        Assert.Contains("\"actionId\":\"cancel-view\"", json);
        Assert.Contains("\"actionId\":\"edit\"", json);
        Assert.Contains("\"initialValue\":\"Alpha\"", json); // prefilled from Get("1")
        Assert.Contains("\"readOnly\":true", json);
    }

    [Fact]
    public void Crud_create_navigates_back_to_list_with_saved_message()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/new",
            ActionId = "create",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new() { ["name"] = JsonSerializer.SerializeToElement("Gamma") },
        });

        var nav = Assert.Single(inc.Commands);
        Assert.Equal("NavigateTo", nav.Type);
        Assert.Equal("/things", nav.Data);
        Assert.Equal("Saved", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Crud_create_with_missing_required_field_returns_validation_error()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/new",
            ActionId = "create",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new(), // Name missing
        });

        Assert.Empty(inc.Commands);
        var msg = Assert.Single(inc.Messages);
        Assert.Equal("error", msg.Variant);
        Assert.Contains("Name", msg.Text);
    }

    [Fact]
    public void Translator_translates_titles_and_labels()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(SimpleForm).Assembly), new UpperTranslator());
        var json = Render(handler.Handle(new RunActionRqDto { Route = "" }));

        Assert.Contains("SIMPLE FORM", json); // title translated
        Assert.Contains("\"label\":\"NAME\"", json); // field label translated
    }

    [Fact]
    public void Page_decorations_subtitle_and_banner_are_emitted()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(Decorated).FullName }));

        Assert.Contains("\"subtitle\":\"a subtitle\"", json);
        Assert.Contains("\"theme\":\"WARNING\"", json);
        Assert.Contains("\"title\":\"Careful\"", json);
        Assert.Contains("be careful", json);
    }

    [Fact]
    public void Events_emit_name_and_subscription_trigger()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(Decorated).FullName }));

        Assert.Contains("\"emitsName\":\"ev-out\"", json);
        Assert.Contains("\"type\":\"OnCustomEvent\"", json);
        Assert.Contains("\"event\":\"ev-in\"", json);
        Assert.Contains("\"actionId\":\"act\"", json);
    }

    [Fact]
    public void Wizard_renders_steps_and_completes_on_finish()
    {
        var step1 = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(Wiz).FullName }));
        Assert.Contains("\"type\":\"ProgressBar\"", step1);
        Assert.Contains("\"actionId\":\"next\"", step1);

        var finish = Handler().Handle(new RunActionRqDto
        {
            ActionId = "next",
            ServerSideType = typeof(Wiz).FullName,
            ComponentState = new() { ["__step"] = JsonSerializer.SerializeToElement(2) },
        });
        Assert.Equal("done", Assert.Single(finish.Messages).Text);
    }

    [Fact]
    public void Tabs_stereotypes_kpis_fabs_shortcuts_and_page_flags_are_emitted()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(Featured).FullName }));

        // Tabs: a TabLayout with one Tab per [Tab] name.
        Assert.Contains("\"type\":\"TabLayout\"", json);
        Assert.Contains("\"type\":\"Tab\"", json);
        Assert.Contains("\"label\":\"One\"", json);
        Assert.Contains("\"label\":\"Two\"", json);

        // Field stereotypes. Editable [Money] fields keep the numeric data type — the money
        // STEREOTYPE carries the formatting intent (the money editor takes a plain number).
        Assert.Contains("\"stereotype\":\"password\"", json);
        Assert.Contains("\"stereotype\":\"textarea\"", json);
        Assert.Contains("\"multiline\":true", json);
        Assert.Contains("\"stereotype\":\"money\"", json);
        Assert.Contains("\"stereotype\":\"plainText\"", json);

        // KPIs and FABs.
        Assert.Contains("\"title\":\"Tickets\"", json);
        Assert.Contains("\"value\":\"42\"", json);
        Assert.Contains("\"icon\":\"plus\"", json);
        Assert.Contains("\"actionId\":\"add\"", json);

        // Button shortcut + page-level flags. (The '+' serializes as the + escape.)
        Assert.Contains("\"shortcut\":\"ctrl", json);
        Assert.Contains("\"confirmOnNavigationIfDirty\":true", json);
        Assert.Contains("--mateu-compact:1", json);
    }

    [Fact]
    public void LinkTo_travels_verbatim_for_client_side_interpolation_and_absent_links_are_null()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(LinkedForm).FullName }));

        // The annotation's href/title travel as RAW ${...} templates (interpolated client-side);
        // unset attribute members travel as "" — exactly like the Java @LinkTo defaults.
        Assert.Contains("\"link\":{\"href\":\"/customers/${state.customerId}\",\"icon\":\"\",\"title\":\"\",\"target\":\"\"}", json);
        Assert.Contains("\"link\":{\"href\":\"https://mateu.io\",\"icon\":\"vaadin:external-link\",\"title\":\"Abrir ${state.customerName}\",\"target\":\"_blank\"}", json);

        // Fields without [LinkTo] carry "link":null (Mateu's JSON keeps nulls, like the Java wire).
        Assert.Contains("\"link\":null", json);
    }

    [Fact]
    public void LinkSupplier_wins_over_the_attribute_and_null_falls_back_to_it()
    {
        var json = Render(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(SuppliedLinkForm).FullName }));

        // The supplier's link (members it leaves unset serialize as null, like Java's builder).
        Assert.Contains("\"link\":{\"href\":\"/orders/${state.orderId}\",\"icon\":\"vaadin:cart\",\"title\":null,\"target\":null}", json);

        // The supplier returned null for CustomerId → the [LinkTo] attribute applies.
        Assert.Contains("\"link\":{\"href\":\"/annotated/${state.customerId}\",\"icon\":\"\",\"title\":\"\",\"target\":\"\"}", json);
    }

    [Fact]
    public void Fab_action_is_invoked_by_method_name()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "add",
            ServerSideType = typeof(Featured).FullName,
        });
        Assert.Equal("Added", Assert.Single(inc.Messages).Text);
    }

    // ── Smart-search listing filters ─────────────────────────────────────────────

    [Fact]
    public void Crud_list_metadata_carries_the_smart_search_filters()
    {
        var json = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "/bookings", ServerSideType = typeof(Bookings).FullName,
        }));

        Assert.Contains("\"filters\":[", json);
        // enum → multi-select with the constants as options
        Assert.Contains("\"fieldId\":\"channel\",\"dataType\":\"string\",\"label\":\"Channel\",\"stereotype\":\"multiSelect\"", json);
        Assert.Contains("{\"value\":\"Web\",\"label\":\"Web\"", json);
        // temporal → date range by default; [RangeFilter] numeric → number range
        Assert.Contains("\"fieldId\":\"created\",\"dataType\":\"date\",\"label\":\"Created\",\"stereotype\":\"dateRange\"", json);
        Assert.Contains("\"fieldId\":\"total\",\"dataType\":\"number\",\"label\":\"Total\",\"stereotype\":\"numberRange\"", json);
        // strings and bools keep the single-value widget
        Assert.Contains("\"fieldId\":\"guest\",\"dataType\":\"string\",\"label\":\"Guest\",\"stereotype\":\"regular\"", json);
        Assert.Contains("\"fieldId\":\"paid\",\"dataType\":\"boolean\",\"label\":\"Paid\",\"stereotype\":\"regular\"", json);
    }

    private static UIIncrementDto SearchBookings(Dictionary<string, object?> state)
    {
        state.TryAdd("searchText", JsonSerializer.SerializeToElement(""));
        return Handler().Handle(new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(Bookings).FullName,
            ComponentState = state,
        });
    }

    [Fact]
    public void Crud_search_applies_the_enum_multi_select_as_IN()
    {
        var json = Render(SearchBookings(new()
        {
            ["channel"] = JsonSerializer.SerializeToElement(new[] { "Web", "Phone" }),
        }));
        Assert.Contains("Smith", json);
        Assert.Contains("Jones", json);
        Assert.DoesNotContain("Brown", json);

        // comma-joined after a URL restore behaves the same
        var restored = Render(SearchBookings(new()
        {
            ["channel"] = JsonSerializer.SerializeToElement("Web,Agency"),
        }));
        Assert.Contains("Smith", restored);
        Assert.Contains("Brown", restored);
        Assert.DoesNotContain("Jones", restored);
    }

    [Fact]
    public void Crud_search_applies_date_and_number_ranges()
    {
        var json = Render(SearchBookings(new()
        {
            ["created_from"] = JsonSerializer.SerializeToElement("2026-01-15"),
            ["created_to"] = JsonSerializer.SerializeToElement("2026-02-20"),
        }));
        Assert.Contains("Jones", json);
        Assert.DoesNotContain("Smith", json);
        Assert.DoesNotContain("Brown", json);

        var numeric = Render(SearchBookings(new()
        {
            ["total_from"] = JsonSerializer.SerializeToElement("200"),
        }));
        Assert.Contains("Jones", numeric);
        Assert.Contains("Brown", numeric);
        Assert.DoesNotContain("Smith", numeric);
    }

    [Fact]
    public void Crud_search_applies_string_containment_and_bool_equality()
    {
        var json = Render(SearchBookings(new()
        {
            ["guest"] = JsonSerializer.SerializeToElement("mi"),
        }));
        Assert.Contains("Smith", json);
        Assert.DoesNotContain("Jones", json);

        var paid = Render(SearchBookings(new()
        {
            ["paid"] = JsonSerializer.SerializeToElement(false),
        }));
        Assert.Contains("Jones", paid);
        Assert.DoesNotContain("Smith", paid);
        Assert.DoesNotContain("Brown", paid);
    }

    [Fact]
    public void Crud_search_ignores_blank_bounds_and_empty_selections()
    {
        var json = Render(SearchBookings(new()
        {
            ["created_from"] = JsonSerializer.SerializeToElement(""),
            ["channel"] = JsonSerializer.SerializeToElement(Array.Empty<string>()),
            ["guest"] = JsonSerializer.SerializeToElement(""),
        }));
        Assert.Contains("\"totalElements\":3", json);
    }

    // ── Listing aggregates + row grouping (mirrors Java's AggregatesSyncTest) ────

    private static UIIncrementDto SearchSales(Dictionary<string, object?> state)
    {
        state.TryAdd("searchText", JsonSerializer.SerializeToElement(""));
        return Handler().Handle(new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(Sales).FullName,
            ComponentState = state,
        });
    }

    [Fact]
    public void Crud_columns_carry_their_aggregate_and_the_crud_its_group_by_column()
    {
        var json = Render(Handler().Handle(new RunActionRqDto
        {
            Route = "/sales", ServerSideType = typeof(Sales).FullName,
        }));

        Assert.Contains("\"groupBy\":\"region\"", json);
        Assert.Contains("\"id\":\"amount\"", json);
        Assert.Contains("\"aggregate\":\"sum\"", json);
        Assert.Contains("\"aggregate\":\"count\"", json);
        // non-aggregated columns stay null
        Assert.Contains("\"aggregate\":null", json);
    }

    [Fact]
    public void Crud_search_totals_cover_the_whole_filtered_set_not_just_the_page()
    {
        var json = Render(SearchSales(new()
        {
            ["page"] = JsonSerializer.SerializeToElement(0),
            ["size"] = JsonSerializer.SerializeToElement(2),
        }));

        // page size 2 but totals cover all four rows; count skips nulls (row 4 has no invoice)
        Assert.Contains("\"totalElements\":4", json);
        Assert.Contains("\"aggregates\":{\"amount\":200,\"invoice\":3}", json);
    }

    [Fact]
    public void Crud_search_groups_carry_count_and_per_group_aggregates_and_rows_come_group_sorted()
    {
        var json = Render(SearchSales(new()
        {
            ["size"] = JsonSerializer.SerializeToElement(10),
        }));

        Assert.Contains(
            "\"groups\":[{\"value\":\"North\",\"count\":2,\"aggregates\":{\"amount\":125,\"invoice\":2}},"
            + "{\"value\":\"South\",\"count\":2,\"aggregates\":{\"amount\":75,\"invoice\":1}}]",
            json);
        // the [GroupBy] column is the implicit primary sort, so groups are contiguous:
        // North (rows 1, 3) travels before South (rows 2, 4)
        Assert.True(json.IndexOf("\"id\":\"1\"") < json.IndexOf("\"id\":\"3\""));
        Assert.True(json.IndexOf("\"id\":\"3\"") < json.IndexOf("\"id\":\"2\""));
        Assert.True(json.IndexOf("\"id\":\"2\"") < json.IndexOf("\"id\":\"4\""));
    }

    [Fact]
    public void Crud_search_filtering_recomputes_the_summaries_over_the_filtered_set_only()
    {
        var json = Render(SearchSales(new()
        {
            ["product"] = JsonSerializer.SerializeToElement("Widget"),
        }));

        Assert.Contains("\"aggregates\":{\"amount\":150,\"invoice\":2}", json);
        Assert.Contains(
            "\"groups\":[{\"value\":\"North\",\"count\":1,\"aggregates\":{\"amount\":100,\"invoice\":1}},"
            + "{\"value\":\"South\",\"count\":1,\"aggregates\":{\"amount\":50,\"invoice\":1}}]",
            json);
    }

    [Fact]
    public void Action_returns_page_banner()
    {
        var rq = new RunActionRqDto { ActionId = "warn", ServerSideType = typeof(SimpleForm).FullName };
        var json = Render(Handler().Handle(rq));
        Assert.Contains("\"theme\":\"WARNING\"", json);
        Assert.Contains("Heads up", json);
    }

    [Fact]
    public void Action_returns_route_navigates()
    {
        var rq = new RunActionRqDto { ActionId = "goHome", ServerSideType = typeof(SimpleForm).FullName };
        var inc = Handler().Handle(rq);
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/things");
    }
}
