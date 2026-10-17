using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

#pragma warning disable CS0618, MATEU002, MATEU003 // DashboardLayout / ContentLayout are deprecated but still rendered

/// <summary>A tree supplier whose every container nests an action-referencing component; each
/// referenced id but one has a method behind it.</summary>
[UI("tree-actions"), Title("Tree actions")]
public class TreeActionsView : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content =
        [
            new Scoreboard { Metrics = [new MetricCard { Title = "Sales", Value = "1", ActionId = "openSales" }] },
            new DashboardLayout { Items = [new DashboardPanel { Title = "Empty", Content = new EmptyState { Title = "None", ActionId = "createFirst" } }] },
            new ResponsiveGrid { Content = [new Slotted("main", new Button("Board", "unused") with { ActionId = "noHandler" })] },
            new PlanningBoard
            {
                MoveActionId = "moveBlock", SelectActionId = "selectBlock", ResizeActionId = "resizeBlock",
                OpenActionId = "openBlock", RangeSelectActionId = "selectRange",
            },
            new HorizontalLayout { Content = [new Mateu.Uidl.Map { MarkerActionId = "openMarker" }] },
            new Card { Content = new EntityHeader { Title = "Ana", Facts = [new Fact { Label = "Visits", Value = "3", ActionId = "openVisits" }, new Fact { Label = "Plain" }] } },
            new TabLayout { Tabs = [new TabPanel("Merge", new RecordMerge { MergeActionId = "mergeRecords" })] },
            new ContentLayout
            {
                Main = [new HeroSection { Title = "Hi", Content = [new Button("Go", "heroGo")] }],
                Aside = [new Button("Aside", "asideGo")],
                Footer = [new Button("Footer", "footerGo")],
            },
            new FoldoutLayout
            {
                Overview = new Button("Edit", "overviewButton"),
                Panels = [new FoldoutPanel { Title = "P", Content = new Button("In", "panelGo"), Summary = new Button("Sum", "summaryGo") }],
                Navigation = new FoldoutNavigation { ParentActionId = "toParent", PreviousActionId = "toPrevious", NextActionId = "toNext" },
                OverviewEditActionId = "editOverview",
            },
            new Form
            {
                Title = "Inner",
                Content = [new Button("Inside", "formInside")],
                Toolbar = [new Button("Tool", "formTool") { Primary = true }],
                Buttons = [new Button("Save", "formSave") { Disabled = true }],
                Fabs = [new PageFab { Icon = "vaadin:plus", ActionId = "formFab" }],
                RecordSwitcher = new RecordSwitcher([new Option("1", "One")], "1"),
            },
        ],
    };

    public void OpenSales() { }
    public void CreateFirst() { }
    public void MoveBlock() { }
    public void SelectBlock() { }
    public void ResizeBlock() { }
    public void OpenBlock() { }
    public void SelectRange() { }
    public void OpenMarker() { }
    public void OpenVisits() { }
    public void MergeRecords() { }
    public void HeroGo() { }
    public void AsideGo() { }
    public void FooterGo() { }
    public void OverviewButton() { }
    public void PanelGo() { }
    public void SummaryGo() { }
    public void ToParent() { }
    public void ToPrevious() { }
    public void ToNext() { }
    public void EditOverview() { }
    public void FormInside() { }
    public void FormTool() { }
    public void FormSave() { }
    public void FormFab() { }
    public void SwitchRecord() { }
}

#pragma warning restore CS0618, MATEU002, MATEU003

/// <summary>
/// A view advertises every action its component tree references — through every container a
/// component can sit in — for which it has a method, so the client sends them instead of letting
/// them bubble away unclaimed; an id with no method is not advertised (it may belong to an
/// enclosing island). (Java's TreeActionHarvester.)
/// </summary>
public class TreeActionsTests
{
    private static readonly string[] Handled =
    [
        "openSales", "createFirst", "moveBlock", "selectBlock", "resizeBlock", "openBlock", "selectRange",
        "openMarker", "openVisits", "mergeRecords", "heroGo", "asideGo", "footerGo", "overviewButton",
        "panelGo", "summaryGo", "toParent", "toPrevious", "toNext", "editOverview", "formInside",
        "formTool", "formSave", "formFab", "_switchRecord",
    ];

    [Fact]
    public void Every_container_is_walked_for_the_ids_it_references()
    {
        var ids = ComponentMapper.CollectActionIds(new TreeActionsView().Component()).ToList();
        foreach (var id in Handled) Assert.Contains(id, ids);
        Assert.Contains("noHandler", ids);
        Assert.Equal(ids.Count, ids.Distinct().Count());
    }

    [Fact]
    public void The_view_advertises_the_referenced_ids_it_handles_and_only_those()
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(TreeActionsView).Assembly))
            .Handle(new RunActionRqDto { Route = "tree-actions" });
        var component = JsonSerializer.SerializeToNode(inc, new JsonSerializerOptions(JsonSerializerDefaults.Web))!
            ["fragments"]![0]!["component"]!;
        var advertised = component["actions"]!.AsArray().Select(a => (string?)a!["id"]).ToList();
        foreach (var id in Handled.Where(i => i != "_switchRecord")) Assert.Contains(id, advertised);
        Assert.DoesNotContain("noHandler", advertised);
        var json = component.ToJsonString();
        Assert.Contains("\"buttonStyle\":\"primary\"", json); // a primary toolbar button of the inner form
    }
}
