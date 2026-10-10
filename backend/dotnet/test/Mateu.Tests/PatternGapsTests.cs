using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The Redwood pattern gaps on the .NET port, mirroring Java's WizardTransactionalSyncTest,
// CrudDisplaySyncTest, PageSlotsSyncTest and PageAffordancesSyncTest.

// ── Wizard: drafts, skip, early completion, cancelable before-step hook, WizardDisplay ─────────

[UI("pg-draft-wizard"), Title("Onboarding")]
public class PgDraftWizard : Wizard, IDraftable
{
    public static readonly List<string> Drafts = [];
    public static int? ResumeOn;

    [Step(1)] public string Email { get; set; } = "";
    [Step(2)] public string Newsletter { get; set; } = "no";
    [Step(3)] public string Notes { get; set; } = "";
    [Step(4), PlainText] public string Result { get; set; } = "pending";

    public override string? CompletionActionLabel => "Finish now";
    public override int? CompletionAvailableFromStep => 2;
    public override Message Complete() => new("done");

    public override void OnNext(int from, int to)
    {
        if (to == 4) Result = "finished by " + Email;
    }

    public override bool StepSkippable(int step) => step == 2;

    public override object? BeforeStepNavigate(int from, int to) =>
        from == 1 && Email.EndsWith("@blocked.test")
            ? new Message("That domain is not allowed", MessageVariant.Error)
            : null;

    public object? SaveDraft()
    {
        Drafts.Add(Email);
        return null;
    }

    public object? CloseDraft() => "/home";

    public int? ResumeStep() => ResumeOn;
}

[UI("pg-locked-wizard"), Title("Locked")]
public class PgLockedWizard : PgDraftWizard
{
    public override WizardDisplay Display =>
        WizardDisplay.Defaults with { SaveDraft = Toggle.Disabled, SaveAndClose = Toggle.Off, Skip = Toggle.Off };
}

// ── Crud: CrudDisplay, Save and next, drawer error banner ───────────────────────────────────

public class PgRoom
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

public abstract class PgRoomsBase : Crud<PgRoom>
{
    public static readonly List<PgRoom> Rooms = [];

    public override IEnumerable<PgRoom> Fetch(string? search) => Rooms;

    public override void Save(PgRoom entity)
    {
        if (entity.Name.Contains("boom")) throw new InvalidOperationException("Room names cannot explode");
        var i = Rooms.FindIndex(r => r.Id == entity.Id);
        if (i >= 0) Rooms[i] = entity;
        else Rooms.Add(entity);
    }
}

[UI("pg-rooms-drawer"), Title("Rooms")]
public class PgRoomsCrud : PgRoomsBase
{
    public override bool EditInDrawer => true;
    public override CrudDisplay Display => CrudDisplay.Defaults with { SaveAndNext = Toggle.On };
}

[UI("pg-rooms-locked"), Title("Rooms (locked)")]
public class PgLockedRoomsCrud : PgRoomsBase
{
    public override CrudDisplay Display =>
        CrudDisplay.Defaults with { Create = Toggle.Disabled, Delete = Toggle.Off };
}

// ── Page slots: GeneralOverview info, foldout summary, docked panels, pre-search, hero tone ──

[UI("pg-overview-with-info"), Title("Customers")]
public class PgCustomerOverview : GeneralOverview<string>
{
    protected override IReadOnlyList<Option> SwitcherOptions() => [new("c1", "Ada"), new("c2", "Grace")];
    protected override string? Load(string id) => id;
    protected override IComponent Overview(string row) => new Text("main-" + row);
    protected override IComponent? Info(string row) => new Text("info-" + row);
}

[UI("pg-overview-info-promoted"), Title("Customers")]
public class PgPromotedOverview : PgCustomerOverview
{
    protected override GeneralOverviewDisplay Display =>
        GeneralOverviewDisplay.Defaults with { PromoteInfoSlot = Toggle.On };
}

[UI("pg-foldout-with-summary"), Title("Booking")]
public class PgBookingFoldout : Foldout
{
    public IComponent Overview { get; set; } = new Text("overview");

    [Panel(Title = "Payments", Open = false)]
    public IComponent Payments { get; set; } = new Text("payments");

    protected override IComponent? PanelSummary(string panelPropertyName) =>
        panelPropertyName == nameof(Payments) ? new Text("€120 due") { Id = "payments-summary" } : null;
}

[UI("pg-data-management-docked"), Title("Shipments")]
public class PgShipments : DataManagement
{
    protected override IComponent GridView() => new Text("grid");
    protected override IComponent GanttView() => new Text("gantt");
    protected override DockedPanel? EndPanel() => new("details", "Details", new Text("details-body"), Open: true);
    protected override DockedPanel? BottomPanel() => new("log", "Log", new Text("log-body"));
}

public class PgNoFilters;

public record PgHit(string Id, string Name);

[UI("pg-smart-search-presearch"), Title("Find a guest")]
public class PgGuestSearch : SmartSearchPage<PgNoFilters, PgHit>
{
    public override ListingData<PgHit> Search(SearchRequest request) => ListingData.Of(new PgHit("1", "Ada"));
    public override IComponent? PreSearchContent() => new Text("Recently viewed: Ada, Grace") { Id = "recent" };
}

[UI("pg-welcome-toned")]
public class PgTonedWelcome : Welcome
{
    protected override string? HeroTitle => "Hello";
    protected override HeroTone HeroTone => HeroTone.Pine;
}

[UI("pg-welcome-banner-toned"), Title("Inbox")]
[WelcomeBanner(Subtitle = "3 new", Tone = HeroTone.Plum)]
public class PgTonedBannerPage
{
    public string Note { get; set; } = "";
}

[UI("pg-welcome-untoned")]
public class PgPlainWelcome : Welcome
{
    protected override string? HeroTitle => "Hello";
}

// ── Affordances: record switcher, section affordances, Announce ─────────────────────────────

[UI("pg-switcher-page"), Title("Customer")]
public class PgCustomerPage : IRecordSwitcherSupplier
{
    public string Customer { get; set; } = "c1";
    public string Name { get; set; } = "Ada";

    public RecordSwitcher? Switcher() =>
        new([new Option("c1", "Ada"), new Option("c2", "Grace")], Customer, SwitcherType.Object,
            Label: "Customer", Searchable: true);

    public object? SwitchTo(string? value)
    {
        Customer = value ?? "c1";
        Name = value == "c2" ? "Grace" : "Ada";
        return null;
    }
}

[UI("pg-section-affordances"), Title("Booking")]
public class PgBookingPage
{
    [Section("Guests", AddAction = nameof(AddGuest), EditAction = nameof(EditGuests))]
    public string LeadGuest { get; set; } = "Ada";

    [Section("Payments", ViewMoreAction = nameof(AllPayments))]
    public string LastPayment { get; set; } = "€120";

    public FlowStep AddGuest() => new Announce("Guest added");

    public void EditGuests() { }

    public void AllPayments() { }
}

public class PatternGapsTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(PgDraftWizard).Assembly));

    private static JsonElement Val(string json) => JsonDocument.Parse(json).RootElement.Clone();

    public PatternGapsTests()
    {
        PgDraftWizard.Drafts.Clear();
        PgDraftWizard.ResumeOn = null;
        PgRoomsBase.Rooms.Clear();
        PgRoomsBase.Rooms.AddRange([
            new PgRoom { Id = "r1", Name = "Ocean view" },
            new PgRoom { Id = "r2", Name = "Garden" },
            new PgRoom { Id = "r3", Name = "Attic" },
        ]);
    }

    private static UIIncrementDto Run(string route, Type type, string? actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ActionId = actionId, ServerSideType = type.FullName,
            InitiatorComponentId = "ux_main",
            ComponentState = state ?? [], Parameters = parameters ?? [],
        });

    private static JsonNode Wire(object value) => JsonNode.Parse(JsonSerializer.Serialize(value, Json))!;

    /// <summary>Every JSON object of the serialized wire, depth first.</summary>
    private static IEnumerable<JsonObject> Objects(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                    foreach (var x in Objects(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var v in a)
                    foreach (var x in Objects(v)) yield return x;
                break;
        }
    }

    private static List<JsonObject> Buttons(object value) =>
        Objects(Wire(value)).Where(o => (string?)o["type"] == "Button").ToList();

    private static JsonObject? Button(object value, string actionId) =>
        Buttons(value).FirstOrDefault(b => (string?)b["actionId"] == actionId);

    private static List<string?> Texts(object value) =>
        Objects(Wire(value)).Where(o => (string?)o["type"] == "Text").Select(o => (string?)o["text"]).ToList();

    private static IDictionary<string, object?> State(UIIncrementDto inc) =>
        (IDictionary<string, object?>)inc.Fragments[0].State!;

    /// <summary>The component with this id (a ClientSide node: its id sits beside its metadata).</summary>
    private static JsonObject ById(object value, string id) =>
        Objects(Wire(value)).First(o => (string?)o["id"] == id && o["metadata"] is not null);

    private static List<string?> SlotsOf(JsonObject component) =>
        component["children"]!.AsArray().Select(c => (string?)c!["slot"]).ToList();

    // ── Wizard ────────────────────────────────────────────────────────────────────────────

    private static Dictionary<string, object?> WizardState(int step, string email) =>
        new() { ["__step"] = Val(step.ToString()), ["email"] = email };

    [Fact]
    public void A_draftable_wizard_offers_save_and_save_and_close()
    {
        var inc = Run("/pg-draft-wizard", typeof(PgDraftWizard), null);
        Assert.Equal("Save", (string?)Button(inc, "saveDraft")?["label"]);
        Assert.NotNull(Button(inc, "saveAndClose"));
        var actions = ((ServerSideComponentDto)inc.Fragments[0].Component!).Actions;
        Assert.Contains(actions, a => a.Id == "saveDraft" && !a.ValidationRequired);
    }

    [Fact]
    public void Saving_a_draft_does_not_validate_and_keeps_the_step()
    {
        var inc = Run("/pg-draft-wizard", typeof(PgDraftWizard), "saveDraft", WizardState(1, ""));
        Assert.Equal([""], PgDraftWizard.Drafts);
        Assert.Contains(inc.Messages, m => m.Text == "Draft saved");
        Assert.Empty(inc.Fragments);
    }

    [Fact]
    public void Save_and_close_saves_then_leaves_the_flow()
    {
        var inc = Run("/pg-draft-wizard", typeof(PgDraftWizard), "saveAndClose", WizardState(1, "ada@x.test"));
        Assert.Equal(["ada@x.test"], PgDraftWizard.Drafts);
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/home");
        Assert.Contains(inc.Commands, c => c.Type == "MarkAsClean");
    }

    [Fact]
    public void A_draftable_wizard_resumes_on_the_step_the_user_left()
    {
        PgDraftWizard.ResumeOn = 3;
        var inc = Run("/pg-draft-wizard", typeof(PgDraftWizard), null);
        Assert.Equal(3, State(inc)["__step"]);
    }

    [Fact]
    public void Skip_is_offered_only_on_skippable_steps_and_moves_on_without_requiring_anything()
    {
        Assert.Null(Button(Run("/pg-draft-wizard", typeof(PgDraftWizard), null), "skip"));

        var second = Run("/pg-draft-wizard", typeof(PgDraftWizard), "next", WizardState(1, "ada@x.test"));
        Assert.Equal(2, State(second)["__step"]);
        Assert.NotNull(Button(second, "skip"));

        var third = Run("/pg-draft-wizard", typeof(PgDraftWizard), "skip", WizardState(2, "ada@x.test"));
        Assert.Equal(3, State(third)["__step"]);
    }

    [Fact]
    public void A_completion_is_offered_early_from_its_available_from_step()
    {
        Assert.Null(Button(Run("/pg-draft-wizard", typeof(PgDraftWizard), null), "complete"));

        var second = Run("/pg-draft-wizard", typeof(PgDraftWizard), "next", WizardState(1, "ada@x.test"));
        // beside Next, not instead of it
        Assert.Equal("Finish now", (string?)Button(second, "complete")?["label"]);
        Assert.NotNull(Button(second, "next"));

        var finished = Run("/pg-draft-wizard", typeof(PgDraftWizard), "complete", WizardState(2, "ada@x.test"));
        Assert.Equal(4, State(finished)["__step"]);
        Assert.Equal("finished by ada@x.test", State(finished)["result"]);
    }

    [Fact]
    public void Before_step_navigate_cancels_the_move_with_its_answer()
    {
        var inc = Run("/pg-draft-wizard", typeof(PgDraftWizard), "next", WizardState(1, "eve@blocked.test"));
        Assert.Contains(inc.Messages, m => m.Text == "That domain is not allowed" && m.Variant == "error");
        // no re-render: the wizard stays where it was
        Assert.Empty(inc.Fragments);
    }

    [Fact]
    public void Display_toggles_hide_or_disable_the_affordances()
    {
        var first = Run("/pg-locked-wizard", typeof(PgLockedWizard), null);
        Assert.True((bool?)Button(first, "saveDraft")?["disabled"]);
        Assert.Null(Button(first, "saveAndClose"));

        var second = Run("/pg-locked-wizard", typeof(PgLockedWizard), "next", WizardState(1, "ada@x.test"));
        Assert.Null(Button(second, "skip"));
        // a disabled affordance cannot be forced from the client either
        Run("/pg-locked-wizard", typeof(PgLockedWizard), "saveDraft", WizardState(2, "ada@x.test"));
        Assert.Empty(PgDraftWizard.Drafts);
    }

    // ── Crud ──────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void Create_disabled_and_delete_off_shape_the_listing_toolbar()
    {
        var inc = Run("/pg-rooms-locked", typeof(PgLockedRoomsCrud), null);
        Assert.True((bool?)Button(inc, "new")?["disabled"]);
        Assert.Null(Button(inc, "delete"));
        // and the wire cannot force them
        var forced = Run("/pg-rooms-locked", typeof(PgLockedRoomsCrud), "delete");
        Assert.Contains(forced.Messages, m => m.Variant == "error");
    }

    [Fact]
    public void The_edit_drawer_offers_save_and_next()
    {
        var inc = Run("/pg-rooms-drawer", typeof(PgRoomsCrud), "edit",
            parameters: new() { ["id"] = "r1" });
        Assert.Contains("\"type\":\"Drawer\"", JsonSerializer.Serialize(inc, Json));
        Assert.Equal("Save and next", (string?)Button(inc, "save-and-next")?["label"]);
    }

    [Fact]
    public void Save_and_next_saves_and_re_sends_the_drawer_for_the_next_row()
    {
        var inc = Run("/pg-rooms-drawer/r1/edit", typeof(PgRoomsCrud), "save-and-next",
            new() { ["id"] = "r1", ["name"] = "Sea" });
        Assert.Equal("Sea", PgRoomsBase.Rooms[0].Name);
        var drawer = (DrawerMetadataDto)((ClientSideComponentDto)Assert.Single(inc.Fragments).Component!).Metadata;
        Assert.Equal("crud-edit-drawer", drawer.Id);
        Assert.Equal("r2", ((IDictionary<string, object?>)drawer.InitialData!)["id"]);
        // the drawer stays (no close) and the listing refreshes through the saved event
        Assert.DoesNotContain(inc.Commands, c => c.Type == "CloseModal");
        Assert.Contains(inc.Commands, c => c.Type == "DispatchEvent");
        Assert.Contains(inc.Commands, c => c.Type == "MarkAsClean");
    }

    [Fact]
    public void Save_and_next_on_the_last_row_closes_the_drawer()
    {
        var inc = Run("/pg-rooms-drawer/r3/edit", typeof(PgRoomsCrud), "save-and-next",
            new() { ["id"] = "r3", ["name"] = "Loft" });
        Assert.Empty(inc.Fragments);
        Assert.Contains(inc.Commands, c => c.Type == "CloseModal");
    }

    [Fact]
    public void A_failed_save_in_the_drawer_shows_an_error_banner_keeping_what_was_typed()
    {
        var inc = Run("/pg-rooms-drawer/r2/edit", typeof(PgRoomsCrud), "create",
            new() { ["id"] = "r2", ["name"] = "boom room" });
        var drawer = (DrawerMetadataDto)((ClientSideComponentDto)Assert.Single(inc.Fragments).Component!).Metadata;
        var notice = Objects(Wire(drawer)).First(o => (string?)o["type"] == "Notice");
        Assert.Equal("Room names cannot explode", (string?)notice["text"]);
        Assert.Equal("danger", (string?)notice["theme"]);
        Assert.Equal("boom room", ((IDictionary<string, object?>)drawer.InitialData!)["name"]);
        // and it is announced, since nothing takes focus
        var announce = Assert.Single(inc.Commands, c => c.Type == "Announce");
        Assert.Equal(new AnnouncementDto("Room names cannot explode", true), announce.Data);
    }

    // ── Page slots ────────────────────────────────────────────────────────────────────────

    [Fact]
    public void The_info_slot_sits_beside_the_overview_on_the_one_responsive_grid()
    {
        var grid = ById(Run("/pg-overview-with-info", typeof(PgCustomerOverview), null), "general-overview");
        Assert.Equal("\"main info\"", (string?)grid["metadata"]!["gridTemplateAreas"]);
        Assert.Equal("1fr 20rem", (string?)grid["metadata"]!["gridTemplateColumns"]);
        Assert.Equal(["main", "info"], SlotsOf(grid));
    }

    [Fact]
    public void Promote_info_slot_puts_the_info_first_so_it_stacks_on_top()
    {
        var grid = ById(Run("/pg-overview-info-promoted", typeof(PgPromotedOverview), null), "general-overview");
        Assert.Equal(["info", "main"], SlotsOf(grid));
    }

    [Fact]
    public void A_folded_panel_carries_its_summary_as_a_slotted_child()
    {
        var inc = Run("/pg-foldout-with-summary", typeof(PgBookingFoldout), null);
        var foldout = Objects(Wire(inc)).First(o => (string?)o["metadata"]?["type"] == "FoldoutLayout");
        Assert.Contains("summary-0", SlotsOf(foldout));
        Assert.Contains("panel-0", SlotsOf(foldout));
        var summary = foldout["children"]!.AsArray().First(c => (string?)c!["slot"] == "summary-0")!;
        Assert.Equal("€120 due", (string?)summary["metadata"]!["text"]);
    }

    [Fact]
    public void An_open_end_panel_reflows_the_content_and_each_panel_gets_a_toggle()
    {
        var inc = Run("/pg-data-management-docked", typeof(PgShipments), null);
        var grid = ById(inc, "data-management-body");
        Assert.Equal("1fr 22rem", (string?)grid["metadata"]!["gridTemplateColumns"]);
        Assert.Contains("details-body", Texts(inc));
        Assert.DoesNotContain("log-body", Texts(inc));
        Assert.NotNull(Button(inc, "toggleEndPanel"));
        Assert.NotNull(Button(inc, "toggleBottomPanel"));
    }

    [Fact]
    public void Toggling_a_panel_flips_it_in_place()
    {
        var inc = Run("/pg-data-management-docked", typeof(PgShipments), "toggleBottomPanel");
        Assert.Contains("log-body", Texts(inc));
        Assert.Contains("details-body", Texts(inc));
        // the open state round-trips through componentState
        Assert.Equal(true, State(inc)["bottomOpen"]);
        var closed = Run("/pg-data-management-docked", typeof(PgShipments), "toggleEndPanel",
            new() { ["bottomOpen"] = Val("true") });
        Assert.DoesNotContain("details-body", Texts(closed));
        Assert.Contains("log-body", Texts(closed));
    }

    [Fact]
    public void Pre_search_content_travels_on_the_listing_until_the_first_search()
    {
        var inc = Run("/pg-smart-search-presearch", typeof(PgGuestSearch), null);
        var crud = Objects(Wire(inc)).First(o => (string?)o["metadata"]?["type"] == "Crud");
        var preSearch = crud["metadata"]!["preSearch"]!.AsArray();
        Assert.Single(preSearch);
        Assert.Equal("Recently viewed: Ada, Grace", (string?)preSearch[0]!["metadata"]!["text"]);
    }

    [Fact]
    public void A_listing_without_pre_search_content_omits_it()
    {
        var crud = new CrudMetadataDto("t", [], []);
        Assert.DoesNotContain("preSearch", JsonSerializer.Serialize(crud, Json));
    }

    [Fact]
    public void The_hero_tone_travels_as_its_hue_name()
    {
        string? ToneOf(UIIncrementDto inc) => (string?)Objects(Wire(inc))
            .First(o => (string?)o["type"] == "HeroSection")["tone"];
        Assert.Equal("pine", ToneOf(Run("/pg-welcome-toned", typeof(PgTonedWelcome), null)));
        Assert.Equal("plum", ToneOf(Run("/pg-welcome-banner-toned", typeof(PgTonedBannerPage), null)));
        // auto = the default look: nothing on the wire
        Assert.Null(ToneOf(Run("/pg-welcome-untoned", typeof(PgPlainWelcome), null)));
    }

    // ── Affordances ───────────────────────────────────────────────────────────────────────

    [Fact]
    public void The_switcher_travels_in_the_page_header()
    {
        var page = Objects(Wire(Run("/pg-switcher-page", typeof(PgCustomerPage), null)))
            .First(o => (string?)o["type"] == "Page");
        var switcher = page["switcher"]!;
        Assert.Equal(["Ada", "Grace"], switcher["options"]!.AsArray().Select(o => (string?)o!["label"]));
        Assert.Equal("c1", (string?)switcher["value"]);
        Assert.Equal("object", (string?)switcher["type"]);
        Assert.Equal("Customer", (string?)switcher["label"]);
        Assert.True((bool?)switcher["searchable"]);
        Assert.Equal(IRecordSwitcherSupplier.ActionId, (string?)switcher["actionId"]);
    }

    [Fact]
    public void A_page_without_a_switcher_omits_it()
    {
        var page = Objects(Wire(Run("/pg-section-affordances", typeof(PgBookingPage), null)))
            .First(o => (string?)o["type"] == "Page");
        Assert.False(page.ContainsKey("switcher"));
    }

    [Fact]
    public void The_page_advertises_the_switch_action()
    {
        var component = (ServerSideComponentDto)Run("/pg-switcher-page", typeof(PgCustomerPage), null)
            .Fragments[0].Component!;
        Assert.Contains(component.Actions, a => a.Id == IRecordSwitcherSupplier.ActionId);
    }

    [Fact]
    public void Picking_an_entry_runs_switch_to_and_re_renders_in_place()
    {
        var inc = Run("/pg-switcher-page", typeof(PgCustomerPage), IRecordSwitcherSupplier.ActionId,
            new() { ["customer"] = "c1", ["name"] = "Ada" },
            new() { [IRecordSwitcherSupplier.ValueParameter] = Val("\"c2\"") });
        Assert.Equal("c2", State(inc)["customer"]);
        Assert.Equal("Grace", State(inc)["name"]);
        var page = Objects(Wire(inc)).First(o => (string?)o["type"] == "Page");
        Assert.Equal("c2", (string?)page["switcher"]!["value"]);
    }

    [Fact]
    public void Section_affordances_become_buttons_dispatching_the_named_actions()
    {
        var inc = Run("/pg-section-affordances", typeof(PgBookingPage), null);
        var buttons = Buttons(inc);
        Assert.Contains(buttons, b => (string?)b["actionId"] == "addGuest" && (string?)b["label"] == "Add");
        Assert.Contains(buttons, b => (string?)b["actionId"] == "editGuests" && (string?)b["label"] == "Edit");
        Assert.Contains(buttons, b => (string?)b["actionId"] == "allPayments" && (string?)b["label"] == "View more");
        Assert.Equal("section-view-more-allPayments",
            (string?)Objects(Wire(inc)).First(o => (string?)o["metadata"]?["actionId"] == "allPayments")["id"]);
        var actions = ((ServerSideComponentDto)inc.Fragments[0].Component!).Actions;
        Assert.Contains(actions, a => a.Id == "addGuest");
    }

    [Fact]
    public void An_announce_command_travels_with_its_text_and_politeness()
    {
        var inc = Run("/pg-section-affordances", typeof(PgBookingPage), "addGuest");
        var announce = Assert.Single(inc.Commands, c => c.Type == "Announce");
        Assert.Equal(new AnnouncementDto("Guest added", false), announce.Data);
        Assert.Equal("ux_main", announce.TargetComponentId);
    }
}
