using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class EvProfile
{
    [Required] public string? Name { get; set; } = "Ada";
    public string? City { get; set; } = "London";
}

[UI("ev-open"), Title("Open")]
public class EvOpenProfileView : AutoEditableView<EvProfile>
{
    public static readonly System.Collections.Concurrent.ConcurrentQueue<string> Persisted = new();

    /// <summary>The view's context: bound from the state, seeded into it.</summary>
    public int ProfileId { get; set; } = 7;

    public override EvProfile Load() => new() { City = "City " + ProfileId };

    public override void Persist(EvProfile entity) => Persisted.Enqueue($"{ProfileId}:{entity.Name}");
}

[UI("ev-readonly"), Title("Read only"), ReadOnly]
public class EvReadOnlyProfileView : EvOpenProfileView;

public class EvSummary
{
    public string? Text { get; set; } = "summary";

    [Button] public Message Refresh() => new("refreshed");
}

public class EvEditor
{
    public string? Text { get; set; }
}

/// <summary>An editable view whose view and editor differ.</summary>
[UI("ev-split")]
public class EvSplitView : EditableView<EvSummary, EvEditor>
{
    public static readonly System.Collections.Concurrent.ConcurrentQueue<string?> Saved = new();
    public override EvSummary View() => new();
    public override EvEditor Editor() => new() { Text = "draft" };
    public override void Save(EvEditor editor) => Saved.Enqueue(editor.Text);
}

[UI("ev-host"), Title("Host")]
public class EvHost
{
    public string? Huesped { get; set; } = "María";

    [Inline] public EvOpenProfileView Profile { get; set; } = new() { ProfileId = 42 };
}

/// <summary>Editable views (Java's EditableView / AutoEditableView): the view page offers Edit, the
/// edit page Cancel + Save; save persists, lands on /view with MarkAsClean; a read-only view refuses
/// edit/save/the edit route (403); save re-checks the constraints. (Mirrors Java's
/// EditableViewGatesSyncTest and the EditableView behaviour.)</summary>
public class EditableViewTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(EditableViewTests).Assembly));

    private static JsonElement J(object? v) => JsonSerializer.SerializeToElement(v);

    private static UIIncrementDto Run<T>(string route, string actionId, Dictionary<string, object?>? state = null) =>
        Handler.Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ActionId = actionId, ServerSideType = typeof(T).FullName,
            InitiatorComponentId = "ev_app", ComponentState = state ?? new(),
        });

    private static JsonObject Component(UIIncrementDto inc) =>
        JsonSerializer.SerializeToNode(inc, Json)!["fragments"]![0]!["component"]!.AsObject();

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

    private static JsonNode Page(JsonObject component) =>
        Objects(component).Single(o => (string?)o["metadata"]?["type"] == "Page")["metadata"]!;

    private static List<string?> Toolbar(JsonObject component) =>
        Page(component)["toolbar"]!.AsArray().Select(b => (string?)b!["actionId"]).ToList();

    [Fact]
    public void The_view_page_shows_the_read_only_model_with_an_edit_button()
    {
        var component = Component(Handler.Handle(new RunActionRqDto { Route = "ev-open" }));
        Assert.Equal(typeof(EvOpenProfileView).FullName, (string?)component["serverSideType"]);
        Assert.Equal(["edit"], Toolbar(component));
        Assert.Equal(["edit", "save", "cancel-edit"], component["actions"]!.AsArray().Select(a => (string?)a!["id"]));
        Assert.Equal("City 7", (string?)component["initialData"]!["city"]);
        Assert.Equal(7, (int)component["initialData"]!["profileId"]!);
        Assert.Equal("detail", (string?)component["pageType"]);
        Assert.Contains(Objects(component), o => (string?)o["metadata"]?["type"] == "FormField"
                                                && (bool?)o["metadata"]?["readOnly"] == true);
    }

    [Fact]
    public void The_edit_route_shows_the_editor_with_cancel_and_save()
    {
        var component = Component(Handler.Handle(new RunActionRqDto
            { Route = "/ev-open/edit", ConsumedRoute = "/ev-open" }));
        Assert.Equal(["cancel-edit", "save"], Toolbar(component));
        Assert.Equal("form", (string?)component["pageType"]);
        Assert.True((bool)component["confirmOnNavigationIfDirty"]!);
        Assert.NotEmpty(component["validations"]!.AsArray());
    }

    [Fact]
    public void Edit_navigates_to_the_edit_route()
    {
        var inc = Run<EvOpenProfileView>("ev-open", "edit");
        Assert.Contains(inc.Commands, c => c.Type == "NavigateTo" && (string?)c.Data == "/ev-open/edit");
    }

    [Fact]
    public void An_editable_view_still_saves_and_lands_on_view_with_mark_as_clean()
    {
        var marker = Guid.NewGuid().ToString();
        var inc = Run<EvOpenProfileView>("ev-open/edit", "save", new() { ["name"] = J(marker), ["profileId"] = J(9) });
        Assert.Contains($"9:{marker}", EvOpenProfileView.Persisted);
        Assert.Equal(["MarkAsClean", "NavigateTo"], inc.Commands.Select(c => c.Type));
        Assert.Equal("/ev-open/view", (string?)inc.Commands[1].Data);
        Assert.Equal("Saved successfully", Assert.Single(inc.Messages).Text);

        var cancelled = Run<EvOpenProfileView>("ev-open/edit", "cancel-edit");
        Assert.Equal(["MarkAsClean", "NavigateTo"], cancelled.Commands.Select(c => c.Type));
        Assert.Empty(cancelled.Messages);
    }

    [Fact]
    public void Save_re_checks_the_constraints_the_client_validates()
    {
        var marker = Guid.NewGuid().ToString();
        var refused = Assert.Throws<UserFacingException>(() =>
            Run<EvOpenProfileView>("ev-open/edit", "save", new() { ["name"] = J(""), ["city"] = J(marker) }));
        Assert.Equal(ReflectionMapper.ValidationTitle, refused.Title);
        Assert.DoesNotContain(EvOpenProfileView.Persisted, p => p.Contains(marker));
    }

    [Fact]
    public void A_read_only_view_refuses_a_forced_edit_save_and_edit_route()
    {
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<EvReadOnlyProfileView>("ev-readonly", "edit"));
        Assert.ThrowsAny<MateuForbiddenException>(() =>
            Run<EvReadOnlyProfileView>("ev-readonly/edit", "save", new() { ["name"] = J("Eva") }));
        Assert.ThrowsAny<MateuForbiddenException>(() => Handler.Handle(new RunActionRqDto
            { Route = "/ev-readonly/edit", ConsumedRoute = "/ev-readonly" }));
    }

    [Fact]
    public void A_read_only_view_still_renders_its_view_without_edit()
    {
        var component = Component(Run<EvReadOnlyProfileView>("ev-readonly", ""));
        Assert.Empty(Toolbar(component));
        Assert.Equal(["cancel-edit"], component["actions"]!.AsArray().Select(a => (string?)a!["id"]));
    }

    [Fact]
    public void A_view_and_editor_of_different_types_flip_and_save_the_editor()
    {
        var view = Component(Run<EvSplitView>("ev-split", ""));
        Assert.Equal("summary", (string?)view["initialData"]!["text"]);
        var editor = Component(Run<EvSplitView>("ev-split/edit", ""));
        Assert.Equal("draft", (string?)editor["initialData"]!["text"]);
        var marker = Guid.NewGuid().ToString();
        Run<EvSplitView>("ev-split/edit", "save", new() { ["text"] = J(marker) });
        Assert.Contains(marker, EvSplitView.Saved);
        // the view model's own [Button] runs on it
        Assert.Equal("refreshed", Assert.Single(Run<EvSplitView>("ev-split", "refresh").Messages).Text);
    }

    [Fact]
    public void Embedded_as_an_inline_island_it_flips_in_place()
    {
        var host = JsonSerializer.SerializeToNode(Handler.Handle(new RunActionRqDto { Route = "ev-host" }), Json);
        var island = Objects(host).Single(o => (string?)o["type"] == "ServerSide"
                                               && (string?)o["serverSideType"] == typeof(EvOpenProfileView).FullName);
        Assert.Equal(["edit", "save", "cancel-edit"], island["actions"]!.AsArray().Select(a => (string?)a!["id"]));
        Assert.Equal(42, (int)island["initialData"]!["profileId"]!);

        var state = new Dictionary<string, object?>
        {
            ["_embeddedMediator"] = J(true), ["_inline"] = J(true), ["profileId"] = J(42),
        };
        var load = Run<EvOpenProfileView>("/ev-open?_embeddedMediator=1&_inline=1", "", state);
        Assert.Empty(load.Commands); // an island never retitles the window
        Assert.Equal(1, (int)Page(Component(load))["level"]!);

        var edit = Run<EvOpenProfileView>("ev-open", "edit", state);
        Assert.Empty(edit.Commands);
        Assert.Equal(["cancel-edit", "save"], Toolbar(Component(edit)));
        Assert.Equal("ev_app", Assert.Single(edit.Fragments).TargetComponentId);

        var marker = Guid.NewGuid().ToString();
        var saved = Run<EvOpenProfileView>("ev-open", "save", new(state) { ["name"] = J(marker) });
        Assert.Contains($"42:{marker}", EvOpenProfileView.Persisted);
        Assert.Equal(["MarkAsClean"], saved.Commands.Select(c => c.Type));
        Assert.Equal(["edit"], Toolbar(Component(saved)));
        Assert.Equal("Saved successfully", Assert.Single(saved.Messages).Text);
        Assert.True((bool)Component(saved)["initialData"]!["_inline"]!);
    }
}
