using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>Every button the port draws is an action its component ADVERTISES. The web client only
/// sends an action some component on the page claims — anything else bubbles out unclaimed and is
/// lost — and this port answers the CRUD form's, the wizard's and a page FAB's actions in place
/// (there is no mediator above them, as in Java). Found walking the demo in the Vaadin renderer:
/// Save, Edit, Cancel, Next, Back and the FAB did nothing.</summary>
public class AdvertisedActionsTests
{
    private static readonly MateuRegistry Registry = new(typeof(AdvertisedActionsTests).Assembly);

    private static ServerSideComponentDto Component(string route, Type type) =>
        Assert.IsType<ServerSideComponentDto>(new SyncHandler(Registry).Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = "", ServerSideType = type.FullName!,
        }).Fragments[0].Component);

    private static IEnumerable<string> ToolbarIds(ServerSideComponentDto component) =>
        ((PageMetadataDto)((ClientSideComponentDto)component.Children[0]).Metadata).Toolbar.Select(b => b.ActionId);

    private static Dictionary<string, bool> Advertised(ServerSideComponentDto component) =>
        component.Actions.GroupBy(a => a.Id).ToDictionary(g => g.Key, g => g.First().ValidationRequired);

    [Theory]
    [InlineData("sec-crud/new")]
    [InlineData("sec-crud/s1")]
    [InlineData("sec-crud/s1/edit")]
    public void Every_crud_form_button_is_advertised(string route)
    {
        var component = Component(route, typeof(SecCrud));
        Assert.Subset(Advertised(component).Keys.ToHashSet(), ToolbarIds(component).ToHashSet());
    }

    [Fact]
    public void Saving_validates_and_editing_does_not()
    {
        Assert.True(Advertised(Component("sec-crud/new", typeof(SecCrud)))["create"]);
        Assert.False(Advertised(Component("sec-crud/s1", typeof(SecCrud)))["edit"]);
    }

    [Theory]
    [InlineData("navigable-books/b1", typeof(NavigableBooks))]
    [InlineData("editable-books/b1/edit", typeof(EditableBooks))]
    [InlineData("creatable-books/new", typeof(CreatableBooks))]
    public void Every_capability_form_button_is_advertised(string route, Type type)
    {
        var component = Component(route, type);
        Assert.Subset(Advertised(component).Keys.ToHashSet(), ToolbarIds(component).ToHashSet());
    }

    [Fact]
    public void The_wizard_advertises_next_and_back()
    {
        var advertised = Advertised(Component("rail-signup", typeof(RailSignup)));
        Assert.True(advertised["next"]);
        Assert.False(advertised["back"]);
    }

    [Theory]
    [InlineData("/sec-crud", "new", "/sec-crud/new")]
    [InlineData("/sec-crud/s1", "new", "/sec-crud/new")]
    [InlineData("/sec-crud/s1", "edit", "/sec-crud/s1/edit")]
    [InlineData("/sec-crud/s1", "cancel-view", "/sec-crud")]
    [InlineData("/sec-crud/new", "cancel-new", "/sec-crud")]
    [InlineData("/sec-crud/s1/edit", "cancel-edit", "/sec-crud/s1")]
    public void The_crud_toolbar_actions_move_between_the_crud_routes(string route, string action, string target)
    {
        // answered "Action not found" until they were advertised and the browser started sending them
        var increment = new SyncHandler(Registry).Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ServerSideType = typeof(SecCrud).FullName!, ActionId = action,
        });
        Assert.DoesNotContain(increment.Messages, m => m.Variant == "error");
        Assert.Equal(target, increment.Commands.Single(c => c.Type == "NavigateTo").Data);
    }

    [Theory]
    [InlineData(typeof(TeamCalendar), "previousCalendarMonth,goCalendarToday,nextCalendarMonth")]
    [InlineData(typeof(ScheduleBoard), "switchToGrid,switchToGantt")]
    [InlineData(typeof(HotelDirectory), "selectCollectionItem,filterCollection")]
    [InlineData(typeof(RequisitionOverview), "switchRecord")]
    [InlineData(typeof(MyTasks), "openTodoItem")]
    public void Archetype_toolbars_are_advertised(Type type, string ids)
    {
        // the sync handler answers these built-in ids, but no method of that name is the VIEW's own,
        // so the tree harvester left them out and the toolbars were dead in the web client
        var route = type.GetCustomAttributes(typeof(Mateu.Uidl.UIAttribute), false)
            .Cast<Mateu.Uidl.UIAttribute>().First().Route;
        var advertised = Component(route, type).Actions.Select(a => a.Id).ToHashSet();
        Assert.Subset(advertised, ids.Split(',').ToHashSet());
    }

    [Fact]
    public void A_page_fab_is_advertised_without_validation()
    {
        Assert.False(Advertised(Component("featured", typeof(Featured)))["add"]);
    }

    [Fact]
    public void A_button_shortcut_rides_on_its_advertised_action()
    {
        // the web client scans the component's ACTIONS for shortcuts: on the button only, Ctrl+S
        // did nothing
        Assert.Equal("ctrl+s", Component("featured", typeof(Featured)).Actions.Single(a => a.Id == "save").Shortcut);
    }
}
