using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("split-toolbar-page"), Title("Split toolbar")]
public class SplitToolbarView
{
    public static readonly List<string> Calls = [];

    public string Name { get; set; } = "Ada";

    [Toolbar(Group = "save", GroupPrimary = true, ButtonStyle = "primary", Order = 1)]
    public void Save() => Calls.Add("save");

    [Toolbar("Save as draft", Group = "save", Order = 2)]
    public void SaveDraft() => Calls.Add("saveDraft");

    [Toolbar(Group = "export", Order = 3)] public void Csv() => Calls.Add("csv");

    [Toolbar(Group = "export", Order = 4)] public void Pdf() => Calls.Add("pdf");
}

/// <summary>Toolbar groups (Java's @Toolbar(group, groupPrimary)): methods sharing a Group collapse
/// into one entry — a dropdown labelled with the group, or a SPLIT button when a member is the
/// GroupPrimary. The fluent shape is pinned by the button-groups conformance case.</summary>
public class SplitButtonTests
{
    private static UIIncrementDto Run(string actionId = "") =>
        new SyncHandler(new MateuRegistry(typeof(SplitToolbarView).Assembly)).Handle(new RunActionRqDto
        {
            Route = "split-toolbar-page", ConsumedRoute = "split-toolbar-page", ActionId = actionId,
            ServerSideType = typeof(SplitToolbarView).FullName,
            ComponentState = new Dictionary<string, object?> { ["name"] = JsonSerializer.SerializeToElement("Ada") },
        });

    [Fact]
    public void A_group_with_a_primary_is_a_split_button_and_one_without_a_dropdown()
    {
        var server = (ServerSideComponentDto)Run().Fragments![0].Component!;
        var page = (PageMetadataDto)((ClientSideComponentDto)server.Children[0]).Metadata;
        Assert.Equal(2, page.Toolbar.Count);
        var save = page.Toolbar[0];
        Assert.True(save.Split);
        Assert.Equal("save", save.ActionId);
        Assert.Equal("primary", save.ButtonStyle);
        Assert.Equal(["Save as draft"], save.Children!.Select(c => c.Label));
        var export = page.Toolbar[1];
        Assert.False(export.Split);
        Assert.Equal("", export.ActionId);
        Assert.Equal("Export", export.Label);
        Assert.Equal(["csv", "pdf"], export.Children!.Select(c => c.ActionId));
        Assert.Superset(new HashSet<string> { "save", "saveDraft", "csv", "pdf" },
            server.Actions.Select(a => a.Id).ToHashSet());
    }

    [Fact]
    public void Every_member_of_a_group_runs()
    {
        SplitToolbarView.Calls.Clear();
        Run("saveDraft");
        Run("pdf");
        Assert.Equal(["saveDraft", "pdf"], SplitToolbarView.Calls);
    }

    [Fact]
    public void A_fluent_split_button_advertises_both_parts_through_its_tree()
    {
        var split = Button.Split(new Button("Save", "save"), new Button("Save as draft", "saveDraft"));
        Assert.Equal("save", split.ActionId);
        Assert.Equal(["saveDraft"], split.Buttons.Select(b => b.ActionId));
        var group = Button.Group("Export", new Button("CSV", "csv"));
        Assert.Equal("", group.ActionId);
        Assert.Single(group.Buttons);
    }
}
