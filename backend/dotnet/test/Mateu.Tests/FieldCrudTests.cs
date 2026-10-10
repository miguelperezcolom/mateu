using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class RoomRow
{
    [Required] public string? Name { get; set; }
    public int Beds { get; set; } = 2;
}

[UI("field-crud"), Title("Rooms")]
public class RoomsForm
{
    public List<RoomRow> Rooms { get; set; } = [new() { Name = "101" }, new() { Name = "102" }];

    [InlineEditing] public List<RoomRow> Quick { get; set; } = [];

    [Multiline] public string? Notes { get; set; }
}

[UI("one-column"), Title("One column"), FormLayout(Columns = 1)]
public class OneColumnForm
{
    [Multiline] public string? Notes { get; set; }
    [Text(Size = "xl", Container = "h2")] public string? Welcome { get; set; } = "Hi";
}

/// <summary>The grid-field crud (Java's FieldCrudActionRunner + crudfieldhandlers): list
/// properties advertise their row-editing actions and the server answers them on the form state.</summary>
public class FieldCrudTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(RoomsForm).Assembly));

    private static JsonElement El(string json) => JsonDocument.Parse(json).RootElement.Clone();

    private static readonly string Rows =
        "[{\"name\":\"101\",\"beds\":2,\"_rowNumber\":\"r1\"},{\"name\":\"102\",\"beds\":2,\"_rowNumber\":\"r2\"}]";

    private static UIIncrementDto Run(string actionId, Dictionary<string, object?>? state = null,
        Dictionary<string, object?>? parameters = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "field-crud", ConsumedRoute = "field-crud", ActionId = actionId,
            ServerSideType = typeof(RoomsForm).FullName, InitiatorComponentId = "host",
            ComponentState = state ?? new() { ["rooms"] = El(Rows) },
            Parameters = parameters ?? new(),
        });

    private static JsonNode StateOf(UIIncrementDto inc, int fragment = 0) =>
        JsonSerializer.SerializeToNode(inc.Fragments[fragment].State, Json)!;

    [Fact]
    public void List_properties_advertise_their_row_editing_actions()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "field-crud" }), Json);
        foreach (var suffix in new[] { "_create", "_create-and-stay", "_add", "_select", "_selected", "_prev", "_next", "_save", "_remove", "_move-up", "_move-down", "_cancel" })
            Assert.Contains($"\"id\":\"rooms{suffix}\"", json);
        // the persisting actions validate the row's constrained fields only
        Assert.Contains("\"id\":\"rooms_create\",\"validationRequired\":true", json);
        Assert.Contains("\"fieldsToValidate\":\"name\"", json);
        // an editable, non-inline grid gets the Edit column; the inline one does not
        Assert.Contains("\"actionId\":\"rooms_select\"", json);
        Assert.DoesNotContain("\"actionId\":\"quick_select\"", json);
    }

    [Fact]
    public void Add_opens_an_empty_row_editor_in_the_grid_container()
    {
        var inc = Run("rooms_add");
        Assert.Equal(2, inc.Fragments.Count);
        Assert.Equal(true, (bool?)StateOf(inc)["_show_detail"]!["rooms"]);
        var form = inc.Fragments[1];
        Assert.Equal("rooms-container", form.TargetComponentId);
        Assert.Equal("rooms-container", form.ContainerId);
        var json = JsonSerializer.Serialize(form.Component, Json);
        Assert.Contains("\"title\":\"New room\"", json);
        Assert.Contains("\"actionId\":\"rooms_create\"", json);
        Assert.Contains("\"actionId\":\"rooms_create-and-stay\"", json);
        Assert.Contains("\"fieldId\":\"name\"", json);
    }

    [Fact]
    public void Add_on_an_inline_grid_appends_an_empty_row_in_place()
    {
        var inc = Run("quick_add", new() { ["quick"] = El("[]") });
        Assert.Single(inc.Fragments);
        var rows = StateOf(inc)["quick"]!.AsArray();
        var row = Assert.Single(rows);
        Assert.Equal(2, (int)row!["beds"]!);
        Assert.NotNull((string?)row["_rowNumber"]);
    }

    [Fact]
    public void Create_appends_the_editor_values_and_closes_the_editor()
    {
        var inc = Run("rooms_create", parameters: new() { ["initiatorState"] = El("{\"name\":\"103\",\"beds\":3}") });
        var state = StateOf(inc);
        var rows = state["rooms"]!.AsArray();
        Assert.Equal(3, rows.Count);
        Assert.Equal("103", (string?)rows[2]!["name"]);
        Assert.Equal(3, (int)rows[2]!["beds"]!);
        Assert.False((bool)state["_show_detail"]!["rooms"]!);
        // and-stay keeps the editor open with a fresh row
        var stay = Run("rooms_create-and-stay", parameters: new() { ["initiatorState"] = El("{\"name\":\"104\"}") });
        Assert.Equal(2, stay.Fragments.Count);
        Assert.True((bool)StateOf(stay)["_show_detail"]!["rooms"]!);
    }

    [Fact]
    public void Select_opens_the_row_editor_with_its_position_and_save_writes_it_back()
    {
        var select = Run("rooms_select", parameters: new() { ["_rowNumber"] = "r2" });
        var form = select.Fragments[1];
        var data = JsonSerializer.SerializeToNode(form.State, Json)!;
        Assert.Equal("102", (string?)data["name"]);
        Assert.Equal("2/2", (string?)data["_position"]);
        var json = JsonSerializer.Serialize(form.Component, Json);
        Assert.Contains("\"title\":\"Edit room\"", json);
        Assert.Contains("\"actionId\":\"rooms_prev\"", json);
        Assert.Contains("\"actionId\":\"rooms_save\"", json);

        var saved = Run("rooms_save", parameters: new()
        {
            ["initiatorState"] = El("{\"name\":\"102B\",\"beds\":4,\"_rowNumber\":\"r2\"}"),
        });
        var rows = StateOf(saved)["rooms"]!.AsArray();
        Assert.Equal("102B", (string?)rows[1]!["name"]);
        Assert.Equal(4, (int)rows[1]!["beds"]!);
    }

    [Fact]
    public void Prev_and_next_move_the_editor_and_stop_at_the_ends()
    {
        var next = Run("rooms_next", parameters: new() { ["initiatorState"] = El("{\"_rowNumber\":\"r1\"}") });
        var fragment = Assert.Single(next.Fragments);
        Assert.Equal("rooms-container", fragment.TargetComponentId);
        Assert.Equal("102", (string?)JsonSerializer.SerializeToNode(fragment.State, Json)!["name"]);

        var past = Run("rooms_next", parameters: new() { ["initiatorState"] = El("{\"_rowNumber\":\"r2\"}") });
        Assert.Equal("No more items", Assert.Single(past.Messages).Text);
        var before = Run("rooms_prev", parameters: new() { ["initiatorState"] = El("{\"_rowNumber\":\"r1\"}") });
        Assert.Equal("error", Assert.Single(before.Messages).Variant);
    }

    [Fact]
    public void Remove_and_move_act_on_the_selected_rows()
    {
        var state = new Dictionary<string, object?>
        {
            ["rooms"] = El(Rows),
            ["rooms_selected_items"] = El("[{\"name\":\"102\",\"beds\":2,\"_rowNumber\":\"r2\"}]"),
        };
        var removed = StateOf(Run("rooms_remove", state))["rooms"]!.AsArray();
        Assert.Equal("101", (string?)Assert.Single(removed)!["name"]);

        var moved = StateOf(Run("rooms_move-up", state))["rooms"]!.AsArray();
        Assert.Equal(["102", "101"], moved.Select(r => (string?)r!["name"]));
        var down = StateOf(Run("rooms_move-down", state))["rooms"]!.AsArray();
        Assert.Equal(["101", "102"], down.Select(r => (string?)r!["name"]));
    }

    [Fact]
    public void Cancel_closes_the_editor()
    {
        var state = StateOf(Run("rooms_cancel"));
        Assert.False((bool)state["_show_detail"]!["rooms"]!);
        Assert.False((bool)state["_editing"]!["rooms"]!);
    }

    [Fact]
    public void Wide_widgets_span_the_full_row_of_a_multi_column_section_only()
    {
        var two = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "field-crud" }), Json);
        Assert.Contains("\"fieldId\":\"notes\",\"dataType\":\"string\",\"label\":\"Notes\",\"stereotype\":\"textarea\"", two);
        Assert.Matches("\"fieldId\":\"notes\"[^}]*\"colspan\":2", two);
        Assert.Matches("\"fieldId\":\"rooms\"[^}]*\"colspan\":2", two);

        var one = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "one-column" }), Json);
        Assert.Matches("\"fieldId\":\"notes\"[^}]*\"colspan\":1", one);
    }

    [Fact]
    public void A_Text_field_renders_its_value_as_a_sized_text_block()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "one-column" }), Json);
        Assert.Contains("\"type\":\"Text\",\"text\":\"${state.welcome}\",\"size\":\"xl\",\"noMargins\":false,\"container\":\"h2\"", json);
        Assert.DoesNotContain("\"fieldId\":\"welcome\"", json);
    }
}
