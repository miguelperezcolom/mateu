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
}

[App("Test App")]
public class TestApp
{
    [MenuItem("Things")] public Things Things() => new();

    [AppContext("Hotel")]
    public IReadOnlyList<OptionDto> Hotel() => [new("1", "Hotel 1"), new("2", "Hotel 2")];
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
        Assert.Equal("crud", frag.TargetComponentId);
        Assert.Null(frag.Component);
        var json = Render(inc);
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Alpha", json);
        Assert.Contains("Beta", json);
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

        // Field stereotypes.
        Assert.Contains("\"stereotype\":\"password\"", json);
        Assert.Contains("\"stereotype\":\"textarea\"", json);
        Assert.Contains("\"multiline\":true", json);
        Assert.Contains("\"dataType\":\"money\"", json);
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
}
