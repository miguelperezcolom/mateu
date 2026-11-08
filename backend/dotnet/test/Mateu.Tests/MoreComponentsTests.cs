using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The last wire component types that used to be Java-only (BoardLayout … Workflow). The
/// full wire is pinned by the more-components conformance case; these pin the defaults, the ids and
/// the edge cases of Java's mappers.</summary>
public class MoreComponentsTests
{
    private static string Json(IComponent c) =>
        JsonSerializer.Serialize<ComponentDto>(ComponentMapper.Map(c), new JsonSerializerOptions(JsonSerializerDefaults.Web));

    [Fact]
    public void Every_ported_type_maps_to_its_java_wire_type()
    {
        IComponent[] all =
        [
            new BoardLayout(), new BoardLayoutRow(), new BoardLayoutItem(), new CarouselLayout(), new Chat("/sse"),
            new Container(), new ContextMenu(), new CookieConsent(), new DirectoryMenu(), new FormEditor("{}"),
            new FormItem(), new FormSubSection("t"), new FullWidth(), new Grid(), new GridColumn { Id = "c" },
            new GridGroupColumn("g"), new MasterDetailLayout(new Text("m")), new MenuBar(), new MessageInput("send"),
            new MessageList(), new NotFound(), new Scroller(), new VirtualList(), new Workflow("<bpmn/>"),
        ];
        string[] types =
        [
            "BoardLayout", "BoardLayoutRow", "BoardLayoutItem", "CarouselLayout", "Chat", "Container", "ContextMenu",
            "CookieConsent", "Directory", "FormEditor", "FormItem", "FormSubSection", "FullWidth", "Grid", "GridColumn",
            "GridGroupColumn", "MasterDetailLayout", "MenuBar", "MessageInput", "MessageList", "NotFound", "Scroller",
            "VirtualList", "Workflow",
        ];
        for (var i = 0; i < all.Length; i++)
            Assert.Contains($"\"metadata\":{{\"type\":\"{types[i]}\"", Json(all[i]));
    }

    [Fact]
    public void A_single_child_slot_without_content_is_an_empty_div()
    {
        foreach (IComponent c in new IComponent[] { new Container(), new FullWidth(), new Scroller() })
        {
            var child = Assert.IsType<ClientSideComponentDto>(Assert.Single(ComponentMapper.Map(c).Children));
            Assert.IsType<DivMetadataDto>(child.Metadata);
        }
    }

    [Fact]
    public void The_ids_follow_javas_mappers()
    {
        Assert.Equal("messageList", ComponentMapper.Map(new MessageList()).Id);
        Assert.Equal("messageInput", ComponentMapper.Map(new MessageInput("send")).Id);
        Assert.Equal("fieldId", ComponentMapper.Map(new Chat("/sse")).Id);
        Assert.Null(ComponentMapper.Map(new Container()).Id);
        Assert.NotEqual(ComponentMapper.Map(new MenuBar()).Id, ComponentMapper.Map(new MenuBar()).Id); // random, as Java's
        Assert.Equal("bar", ComponentMapper.Map(new MenuBar { Id = "bar" }).Id);
    }

    [Fact]
    public void A_menu_entry_without_a_path_goes_to_its_label_camel_cased()
    {
        var meta = Assert.IsType<ContextMenuMetadataDto>(ComponentMapper.Map(new ContextMenu
        {
            Menu = [new MenuOption("Sales orders"), MenuOption.Divider(),
                new MenuOption("More") { Submenu = [new MenuOption("Help") { Path = "/help" }] }],
        }).Metadata);
        Assert.Equal("salesOrders", meta.Menu[0].Path);
        Assert.True(meta.Menu[1].Separator);
        Assert.Equal("", meta.Menu[1].Path);
        Assert.Equal("/help", meta.Menu[2].Submenus[0].Path);
        Assert.All(meta.Menu, m => Assert.True(m.Visible));
    }

    [Theory]
    [InlineData("Sales orders", "salesOrders")]
    [InlineData("OrderLines", "orderLines")]
    [InlineData("v2 Report", "v2Report")]
    [InlineData("a", "a")]
    public void Camel_case_is_javas_humanizer(string label, string expected) =>
        Assert.Equal(expected, MoreComponentMapper.JavaCamelCase(label));

    [Fact]
    public void A_grid_column_aligns_and_sizes_like_javas()
    {
        GridColumnComponentMetadataDto Col(GridColumn c) =>
            Assert.IsType<GridColumnComponentMetadataDto>(ComponentMapper.Map(c).Metadata);
        Assert.Equal("end", Col(new GridColumn { Id = "n", DataType = "number" }).Align);
        Assert.Equal("end", Col(new GridColumn { Id = "m", Stereotype = "money" }).Align);
        Assert.Equal("center", Col(new GridColumn { Id = "b", DataType = "bool" }).Align);
        Assert.Null(Col(new GridColumn { Id = "s" }).Align);
        Assert.True(Col(new GridColumn { Id = "s" }).AutoWidth);
        Assert.False(Col(new GridColumn { Id = "s", Width = "9rem" }).AutoWidth);
        Assert.Null(Col(new GridColumn { Id = "s", Line = 1 }).Line);
        Assert.Equal(2, Col(new GridColumn { Id = "s", Line = 2 }).Line);
    }

    [Fact]
    public void A_grid_sends_its_page_only_when_it_has_rows()
    {
        Assert.Null(Assert.IsType<GridMetadataDto>(ComponentMapper.Map(new Grid()).Metadata).Page);
        var page = Assert.IsType<GridMetadataDto>(ComponentMapper.Map(new Grid { Rows = [new { a = 1 }, new { a = 2 }] }).Metadata).Page!;
        Assert.Equal(2, page.TotalElements);
        Assert.Equal(40, Assert.IsType<GridMetadataDto>(ComponentMapper.Map(new Grid { Rows = [], TotalElements = 40 }).Metadata).Page!.TotalElements);
    }

    [Fact]
    public void A_virtual_lists_items_travel_without_the_component_discriminator()
    {
        var json = Json(new VirtualList { Content = [new Text("Row")] });
        Assert.Contains("\"page\":{\"content\":[{\"metadata\":{\"type\":\"Text\"", json);
        Assert.Contains("\"totalElements\":1", json);
    }

    [Fact]
    public void A_message_inputs_action_and_the_actions_inside_containers_are_collected()
    {
        var ids = ComponentMapper.CollectActionIds(new BoardLayout
        {
            Rows = [new BoardLayoutRow { Content = [new BoardLayoutItem { Content = new MessageInput("send") }] }],
        }).ToList();
        Assert.Contains("send", ids);
        Assert.Contains("open", ComponentMapper.CollectActionIds(new Scroller { Content = new Button("Open", "open") }));
    }

    [Fact]
    public void Yaml_builds_them_by_their_wire_type_including_directory()
    {
        var c = YamlComponentBuilder.Parse("""
            type: VerticalLayout
            content:
              - type: Directory
                menu:
                  - label: Sales
                    path: /sales
              - type: CookieConsent
                message: We use cookies
                position: Bottom
              - type: NotFound
                title: Not here
            """);
        var layout = Assert.IsType<VerticalLayout>(c);
        Assert.Equal("/sales", Assert.IsType<DirectoryMenu>(layout.Content[0]).Menu[0].Path);
        Assert.Equal(CookieConsentPosition.Bottom, Assert.IsType<CookieConsent>(layout.Content[1]).Position);
        Assert.Equal("Not here", Assert.IsType<NotFound>(layout.Content[2]).Title);
    }
}
