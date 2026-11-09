using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("autosave-settings"), Title("Settings"), AutoSave(DebounceMillis = 500)]
public class AutoSaveSettings
{
    public static readonly System.Collections.Concurrent.ConcurrentQueue<string?> Saved = new();

    public string? Theme { get; set; } = "light";

    /// <summary>No action marker: [AutoSave] is what makes it an action of the page.</summary>
    public void Save() => Saved.Enqueue(Theme);
}

[AttributeUsage(AttributeTargets.Class)]
[AutoSave(Action = "persistDraft", DebounceMillis = 0)]
public sealed class DraftEditorAttribute : Attribute;

[UI("autosave-draft"), DraftEditor]
public class AutoSaveDraft
{
    public string? Body { get; set; }

    public Message PersistDraft() => new("draft kept");
}

[UI("autosave-none")]
public class NoAutoSave
{
    public string? Name { get; set; }
}

/// <summary>[AutoSave] (Java's <c>@AutoSave</c>): the page carries the debounced AutoSave trigger,
/// its action is advertised and runs like any action.</summary>
public class AutoSaveTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(AutoSaveTests).Assembly));

    private static JsonObject Component(string route) =>
        JsonSerializer.SerializeToNode(Handler.Handle(new RunActionRqDto { Route = route }), Json)!
            ["fragments"]![0]!["component"]!.AsObject();

    [Fact]
    public void The_page_carries_the_auto_save_trigger_and_advertises_its_action()
    {
        var component = Component("autosave-settings");
        var trigger = Assert.Single(component["triggers"]!.AsArray(), t => (string?)t!["type"] == "AutoSave")!;
        Assert.Equal("save", (string?)trigger["actionId"]);
        Assert.Equal(500, (int)trigger["debounceMillis"]!);
        Assert.Contains(component["actions"]!.AsArray(), a => (string?)a!["id"] == "save");
    }

    [Fact]
    public void A_composed_attribute_names_its_action_and_a_zero_debounce_travels()
    {
        var trigger = Assert.Single(Component("autosave-draft")["triggers"]!.AsArray(), t => (string?)t!["type"] == "AutoSave")!;
        Assert.Equal("persistDraft", (string?)trigger["actionId"]);
        Assert.Equal(0, (int)trigger["debounceMillis"]!);
    }

    [Fact]
    public void A_page_without_it_has_no_auto_save_trigger()
    {
        Assert.DoesNotContain(Component("autosave-none")["triggers"]!.AsArray(), t => (string?)t!["type"] == "AutoSave");
    }

    [Fact]
    public void The_auto_save_action_runs_with_the_typed_state()
    {
        var marker = Guid.NewGuid().ToString();
        Handler.Handle(new RunActionRqDto
        {
            Route = "autosave-settings", ActionId = "save", ServerSideType = typeof(AutoSaveSettings).FullName,
            ComponentState = new() { ["theme"] = JsonSerializer.SerializeToElement(marker) },
        });
        Assert.Contains(marker, AutoSaveSettings.Saved);
    }
}
