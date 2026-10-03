using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures: the H1 probes (an actionId off the wire must reach ONLY a declared action) ─────

[UI("sec-probe"), Title("Security probe")]
public class SecProbeView
{
    public static volatile int HelperCalls;
    public static volatile int ButtonCalls;
    public static volatile int GatedCalls;
    public static volatile int AudienceCalls;
    public static volatile int RowClickCalls;

    public string? Name { get; set; }

    [OnRowSelected("pickRow")] public List<SecProbeRow> Rows { get; set; } = [];

    [Button] public Message Go()
    {
        ButtonCalls++;
        return new Message("went");
    }

    // A public helper that is NOT an action (no marker, not advertised anywhere).
    public Message Helper()
    {
        HelperCalls++;
        return new Message("helper ran");
    }

    [Button, DisabledUnless(Roles = ["manager"])] public Message Approve()
    {
        GatedCalls++;
        return new Message("approved");
    }

    [Button, Audience("staff")] public Message Audit()
    {
        AudienceCalls++;
        return new Message("audited");
    }

    // Advertised by [OnRowSelected] on Rows (no marker on the method itself).
    public Message PickRow(SecProbeRow row)
    {
        RowClickCalls++;
        return new Message("picked " + row.Code);
    }
}

public class SecProbeRow
{
    public string Code { get; set; } = "";
}

/// <summary>Mass-assignment probe: the wire must not write fields the caller cannot see/edit.</summary>
[UI("sec-bind"), Title("Bind probe")]
public class SecBindView
{
    public string? Name { get; set; }
    [EyesOnly(Roles = ["staff"])] public string Secret { get; set; } = "server-secret";
    [ReadOnlyUnless(Roles = ["manager"])] public decimal Discount { get; set; } = 5m;

    [Button] public Message Show() => new($"{Name}|{Secret}|{Discount}");
}

/// <summary>A whole view hidden by class-level [EyesOnly].</summary>
[UI("sec-staff-only"), Title("Staff only"), EyesOnly(Roles = ["staff"])]
public class SecStaffOnlyView
{
    public static volatile int Calls;

    public string? Name { get; set; }

    [Button] public Message Go()
    {
        Calls++;
        return new Message("staff went");
    }
}

/// <summary>A framework archetype: its public base methods (Component) are not actions.</summary>
[UI("sec-dashboard"), Title("Sec dashboard")]
public class SecDashboard : Dashboard
{
    public MetricCard Revenue { get; set; } = new() { Title = "Revenue", Value = "1", ActionId = "drill" };

    // Advertised by the composed tree (the metric card's drill-in) — no marker needed.
    public Message Drill() => new("drilled");
}

[UI("sec-crud"), Title("Sec crud")]
public class SecCrud : Crud<StockItem>
{
    public static volatile int DeleteCalls;
    public static volatile int SaveCalls;
    public static volatile int HelperCalls;
    public static volatile int BulkCalls;

    public override IEnumerable<StockItem> Fetch(string? search) => [new StockItem { Id = "s1", Name = "Bolts" }];

    public override void Delete(string id) => DeleteCalls++;

    public override void Save(StockItem entity) => SaveCalls++;

    public Message Helper()
    {
        HelperCalls++;
        return new Message("crud helper ran");
    }

    [ListToolbarButton(rowsSelectedRequired: false)]
    public Message Bulk()
    {
        BulkCalls++;
        return new Message("bulk ran");
    }
}

[UI("sec-cap"), Title("Sec cap")]
public class SecCapListing : IListing<CapBook>
{
    public static volatile int PurgeCalls;
    public static volatile int BulkCalls;

    public ListingData<CapBook> Search(SearchRequest request) => ListingData.From(CapBooks.All());

    public Message Purge()
    {
        PurgeCalls++;
        return new Message("purged");
    }

    [ListToolbarButton(rowsSelectedRequired: false)]
    public Message Bulk()
    {
        BulkCalls++;
        return new Message("cap bulk ran");
    }
}

/// <summary>Security regressions for the action pipeline (H1): an actionId coming from the wire
/// can only reach a method that is DECLARED as an action — a marker attribute the mapper
/// advertises, or an id the view itself advertises — and the access gates
/// ([DisabledUnless]/[Audience]/class-level [EyesOnly]) are enforced at invocation, not only at
/// render. The wire cannot write fields hidden ([EyesOnly]) or locked ([ReadOnlyUnless]) for the
/// caller (mass assignment).</summary>
[Collection("ActionSecurity")]
public class ActionSecurityTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static SyncHandler Handler(Identity? identity = null) =>
        new(new MateuRegistry(typeof(SecProbeView).Assembly), null, () => identity);

    private static RunActionRqDto Action(string route, string actionId, Dictionary<string, object?>? state = null,
        Dictionary<string, object?>? appState = null, Dictionary<string, object?>? parameters = null) => new()
    {
        Route = route,
        ConsumedRoute = route,
        ActionId = actionId,
        ComponentState = state ?? new(),
        AppState = appState ?? new(),
        Parameters = parameters ?? new(),
    };

    /// <summary>Not an action at all → answered like an unknown action (error message), never run.</summary>
    private static void AssertNotFound(SyncHandler handler, RunActionRqDto rq)
    {
        var json = JsonSerializer.Serialize(handler.Handle(rq), Json);
        Assert.Contains("\"variant\":\"error\"", json);
        Assert.Contains("Action not found", json);
    }

    /// <summary>An action the caller may not run → MateuForbiddenException (HTTP 403 at the edge).</summary>
    private static void AssertForbidden(SyncHandler handler, RunActionRqDto rq)
    {
        var e = Record.Exception(() => handler.Handle(rq));
        Assert.NotNull(e);
        Assert.Equal("MateuForbiddenException", e!.GetType().Name);
    }

    // ── 1. only declared actions are reachable ──────────────────────────────────

    [Fact]
    public void An_unmarked_public_helper_is_not_an_action()
    {
        var before = SecProbeView.HelperCalls;
        AssertNotFound(Handler(), Action("sec-probe", "helper"));
        Assert.Equal(before, SecProbeView.HelperCalls);
    }

    [Theory]
    [InlineData("getType")]
    [InlineData("toString")]
    [InlineData("getHashCode")]
    [InlineData("equals")]
    public void Object_methods_are_not_actions(string actionId) =>
        AssertNotFound(Handler(), Action("sec-probe", actionId));

    [Fact]
    public void Property_accessors_are_not_actions() =>
        AssertNotFound(Handler(), Action("sec-probe", "get_Name"));

    [Fact]
    public void A_framework_base_class_method_is_not_an_action() =>
        AssertNotFound(Handler(), Action("sec-dashboard", "component"));

    [Fact]
    public void A_component_tree_advertised_method_still_runs() =>
        Assert.Contains("drilled", JsonSerializer.Serialize(Handler().Handle(Action("sec-dashboard", "drill")), Json));

    [Fact]
    public void A_marked_button_still_runs()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(Action("sec-probe", "go")), Json);
        Assert.Contains("went", json);
    }

    [Fact]
    public void An_OnRowSelected_advertised_method_still_runs()
    {
        var rq = Action("sec-probe", "pickRow", parameters: new()
        {
            ["_clickedRow"] = JsonSerializer.SerializeToElement(new { code = "R1" }),
        });
        var json = JsonSerializer.Serialize(Handler().Handle(rq), Json);
        Assert.Contains("picked R1", json);
    }

    // ── 1b. action-on-row-* reaches only [ListToolbarButton] methods ────────────

    [Theory]
    [InlineData("action-on-row-delete")]
    [InlineData("action-on-row-save")]
    [InlineData("action-on-row-helper")]
    [InlineData("action-on-row-getType")]
    public void Crud_row_actions_only_reach_ListToolbarButton_methods(string actionId)
    {
        var (d, s, h) = (SecCrud.DeleteCalls, SecCrud.SaveCalls, SecCrud.HelperCalls);
        AssertNotFound(Handler(), Action("sec-crud", actionId));
        Assert.Equal(d, SecCrud.DeleteCalls);
        Assert.Equal(s, SecCrud.SaveCalls);
        Assert.Equal(h, SecCrud.HelperCalls);
    }

    [Fact]
    public void A_crud_ListToolbarButton_still_runs()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(Action("sec-crud", "action-on-row-bulk")), Json);
        Assert.Contains("bulk ran", json);
    }

    [Theory]
    [InlineData("action-on-row-purge")]
    [InlineData("action-on-row-search")]
    [InlineData("action-on-row-getType")]
    public void Capability_row_actions_only_reach_ListToolbarButton_methods(string actionId)
    {
        var before = SecCapListing.PurgeCalls;
        AssertNotFound(Handler(), Action("sec-cap", actionId));
        Assert.Equal(before, SecCapListing.PurgeCalls);
    }

    [Fact]
    public void A_capability_ListToolbarButton_still_runs()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(Action("sec-cap", "action-on-row-bulk")), Json);
        Assert.Contains("cap bulk ran", json);
    }

    // ── 2. access gates are enforced at invocation ──────────────────────────────

    [Fact]
    public void A_DisabledUnless_action_is_forbidden_without_the_role()
    {
        var before = SecProbeView.GatedCalls;
        AssertForbidden(Handler(), Action("sec-probe", "approve"));
        AssertForbidden(Handler(new Identity(Roles: ["staff"])), Action("sec-probe", "approve"));
        Assert.Equal(before, SecProbeView.GatedCalls);
    }

    [Fact]
    public void A_DisabledUnless_action_runs_with_the_role()
    {
        var json = JsonSerializer.Serialize(
            Handler(new Identity(Roles: ["manager"])).Handle(Action("sec-probe", "approve")), Json);
        Assert.Contains("approved", json);
    }

    [Fact]
    public void An_Audience_action_is_forbidden_for_another_audience()
    {
        var before = SecProbeView.AudienceCalls;
        AssertForbidden(Handler(), Action("sec-probe", "audit", appState: new() { ["audience"] = "cliente" }));
        Assert.Equal(before, SecProbeView.AudienceCalls);
        // No projection active → visible → runs; the matching audience → runs.
        Assert.Contains("audited", JsonSerializer.Serialize(Handler().Handle(Action("sec-probe", "audit")), Json));
        Assert.Contains("audited", JsonSerializer.Serialize(Handler().Handle(
            Action("sec-probe", "audit", appState: new() { ["audience"] = "staff" })), Json));
    }

    [Fact]
    public void A_class_level_EyesOnly_view_is_forbidden_without_the_role()
    {
        var before = SecStaffOnlyView.Calls;
        AssertForbidden(Handler(), Action("sec-staff-only", "go"));
        AssertForbidden(Handler(), new RunActionRqDto { Route = "sec-staff-only", ConsumedRoute = "sec-staff-only" });
        Assert.Equal(before, SecStaffOnlyView.Calls);

        var json = JsonSerializer.Serialize(
            Handler(new Identity(Roles: ["staff"])).Handle(Action("sec-staff-only", "go")), Json);
        Assert.Contains("staff went", json);
    }

    // ── 3. mass assignment ──────────────────────────────────────────────────────

    private static readonly Dictionary<string, object?> TamperedState = new()
    {
        ["name"] = JsonSerializer.SerializeToElement("Ann"),
        ["secret"] = JsonSerializer.SerializeToElement("hacked"),
        ["discount"] = JsonSerializer.SerializeToElement(99),
    };

    [Fact]
    public void Wire_state_cannot_write_EyesOnly_or_ReadOnlyUnless_fields_without_the_role()
    {
        var json = JsonSerializer.Serialize(
            Handler().Handle(Action("sec-bind", "show", new(TamperedState))), Json);
        Assert.Contains("Ann|server-secret|5", json);
        Assert.DoesNotContain("hacked", json);
    }

    [Fact]
    public void Wire_state_writes_gated_fields_for_an_authorized_caller()
    {
        var json = JsonSerializer.Serialize(
            Handler(new Identity(Roles: ["staff", "manager"])).Handle(Action("sec-bind", "show", new(TamperedState))),
            Json);
        Assert.Contains("Ann|hacked|99", json);
    }
}
