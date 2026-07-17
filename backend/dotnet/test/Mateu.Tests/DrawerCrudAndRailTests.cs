using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("drawer-contacts"), Title("Contacts")]
public class DrawerContacts : Crud<Thing>
{
    public static readonly List<Thing> Stored =
        [new() { Id = "1", Name = "Alpha" }, new() { Id = "2", Name = "Beta" }];

    public override bool EditInDrawer => true;

    public override IEnumerable<Thing> Fetch(string? search) => Stored;

    public override void Save(Thing entity)
    {
        if (string.IsNullOrEmpty(entity.Id)) entity.Id = Guid.NewGuid().ToString();
        Stored.RemoveAll(t => t.Id == entity.Id);
        Stored.Add(entity);
    }
}

[UI("rail-signup"), Title("Signup")]
[WizardProgress("rail")]
public class RailSignup : Wizard
{
    [Step(1)] public string? Email { get; set; }
    [Step(2)] public string? Plan { get; set; }

    public override Message Complete() => new("done");
}

/// <summary>EditInDrawer (the Redwood "Create and Edit - Drawer" template) and the wizard RAIL
/// progress style, mirroring Java's EditInDrawerSyncTest / WizardProgressStyleSyncTest.</summary>
public class DrawerCrudAndRailTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(DrawerContacts).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    [Fact]
    public void New_opens_the_creation_form_in_a_drawer_over_the_listing()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/drawer-contacts", ActionId = "new",
            ServerSideType = typeof(DrawerContacts).FullName, InitiatorComponentId = "ux_list",
        });
        var fragment = Assert.Single(inc.Fragments);
        Assert.Equal("Add", fragment.Action);
        Assert.Contains("\"type\":\"Drawer\"", Render(inc));
        Assert.Empty(inc.Commands.Where(c => c.Type == "NavigateTo"));
    }

    [Fact]
    public void Row_view_opens_the_edit_drawer_with_the_entity_loaded()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/drawer-contacts", ActionId = "view",
            ServerSideType = typeof(DrawerContacts).FullName, InitiatorComponentId = "ux_list",
            Parameters = new Dictionary<string, object?> { ["id"] = JsonDocument.Parse("\"2\"").RootElement },
        });
        var json = Render(inc);
        Assert.Contains("\"type\":\"Drawer\"", json);
        Assert.Contains("Beta", json);
    }

    [Fact]
    public void Create_persists_closes_the_drawer_emitting_the_saved_event_and_reruns_the_search()
    {
        var before = DrawerContacts.Stored.Count;
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/drawer-contacts/new", ActionId = "create",
            ServerSideType = typeof(DrawerContacts).FullName, InitiatorComponentId = "ux_list",
            ComponentState = new Dictionary<string, object?>
                { ["name"] = JsonDocument.Parse("\"Gamma\"").RootElement },
        });
        Assert.Equal(before + 1, DrawerContacts.Stored.Count);
        Assert.Empty(inc.Commands.Where(c => c.Type == "NavigateTo"));
        var close = Assert.Single(inc.Commands.Where(c => c.Type == "CloseModal"));
        Assert.Contains(SyncHandler.SavedInDrawerEvent, Render(inc));
        Assert.Equal("ux_list", close.TargetComponentId);
        Assert.Single(inc.Commands.Where(c => c.Type == "RunAction"));
        Assert.Equal("Saved", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Cancel_just_closes_the_drawer()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/drawer-contacts", ActionId = "cancel-new",
            ServerSideType = typeof(DrawerContacts).FullName, InitiatorComponentId = "ux_list",
        });
        Assert.Single(inc.Commands.Where(c => c.Type == "CloseModal"));
        Assert.Empty(inc.Fragments);
    }

    [Fact]
    public void Rail_wizard_emits_the_vertical_step_list_and_the_counter()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/rail-signup", ServerSideType = typeof(RailSignup).FullName,
            InitiatorComponentId = "ux_main",
        });
        var json = Render(inc);
        Assert.Contains("\"type\":\"ProgressSteps\"", json);
        Assert.Contains("\"vertical\":true", json);
        Assert.Contains("1 | 2", json);
        Assert.DoesNotContain("\"type\":\"ProgressBar\"", json);
    }
}
