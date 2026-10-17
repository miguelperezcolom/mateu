using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("toolbar-page"), Title("Toolbar page")]
public class ToolbarPageView
{
    public static readonly List<string> Calls = [];

    [Required] public string? Name { get; set; }

    [Toolbar] public void Publish() => Calls.Add($"publish {Name}");

    [Toolbar, EyesOnly(Roles = ["admin"])] public void Purge() => Calls.Add("purge");
}

/// <summary>[Toolbar] — the C# analogue of Java's @Toolbar (M-A5). The wire shape is pinned by the
/// page-toolbar conformance case; these pin that a toolbar action runs, that the server re-checks
/// the form's constraints before it (like a [Button]), and that an [EyesOnly] one is neither shown
/// nor runnable.</summary>
public class PageToolbarTests
{
    private static UIIncrementDto Run(string actionId = "", Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(typeof(ToolbarPageView).Assembly)).Handle(new RunActionRqDto
        {
            Route = "toolbar-page", ConsumedRoute = "toolbar-page", ActionId = actionId,
            ServerSideType = typeof(ToolbarPageView).FullName,
            ComponentState = (state ?? []).ToDictionary(e => e.Key, e => (object?)JsonSerializer.SerializeToElement(e.Value)),
        });

    [Fact]
    public void The_toolbar_shows_only_what_the_caller_may_run()
    {
        var server = (ServerSideComponentDto)Run().Fragments![0].Component!;
        var page = (PageMetadataDto)((ClientSideComponentDto)server.Children[0]).Metadata;
        Assert.Equal(["publish"], page.Toolbar.Select(b => b.ActionId));
    }

    [Fact]
    public void A_toolbar_action_runs_once_the_form_is_valid()
    {
        ToolbarPageView.Calls.Clear();
        Run("publish", new() { ["name"] = "Ada" });
        Assert.Equal(["publish Ada"], ToolbarPageView.Calls);
    }

    [Fact]
    public void The_server_rechecks_the_constraints_before_a_toolbar_action()
    {
        ToolbarPageView.Calls.Clear();
        Assert.Throws<UserFacingException>(() => Run("publish", new() { ["name"] = "" }));
        Assert.Empty(ToolbarPageView.Calls);
    }

    [Fact]
    public void A_hidden_toolbar_action_is_not_runnable()
    {
        ToolbarPageView.Calls.Clear();
        var e = Record.Exception(() => Run("purge", new() { ["name"] = "Ada" }));
        Assert.Equal("MateuForbiddenException", e?.GetType().Name);
        Assert.Empty(ToolbarPageView.Calls);
    }
}
