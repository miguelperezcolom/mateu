using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI(""), Title("Simple Form")]
public class SimpleForm
{
    [Required] public string? Name { get; set; }

    [Button] public Message Greet() => new($"Hello {Name}!");
}

[App("Test App")]
public class TestApp
{
    [MenuItem("Things")] public Things Things() => new();
}

public class Thing
{
    public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
}

[UI("things"), Title("Things")]
public class Things : Crud<Thing>
{
    public override IEnumerable<Thing> Fetch(string? search) =>
        [new() { Id = "1", Name = "Alpha" }, new() { Id = "2", Name = "Beta" }];
}

public class SyncHandlerTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(SimpleForm).Assembly));

    private static string Render(UIIncrementDto inc) => JsonSerializer.Serialize(inc, Json);

    [Fact]
    public void InitialLoad_emits_window_title_and_form_with_required_name_field_and_greet_button()
    {
        var inc = Handler().Handle(new RunActionRqDto { Route = "", ConsumedRoute = "_empty" });
        var json = Render(inc);

        // Same wire shape the Java backend emits for SimpleForm.
        Assert.Contains("\"type\":\"SetWindowTitle\"", json);
        Assert.Contains("\"data\":\"Simple Form\"", json);
        Assert.Contains("\"type\":\"ServerSide\"", json);
        Assert.Contains("\"serverSideType\":\"Mateu.Tests.SimpleForm\"", json);
        Assert.Contains("\"type\":\"FormField\"", json);
        Assert.Contains("\"fieldId\":\"name\"", json);
        Assert.Contains("\"dataType\":\"string\"", json);
        Assert.Contains("\"required\":true", json);
        Assert.Contains("\"label\":\"Greet\"", json);
        Assert.Contains("\"actionId\":\"greet\"", json);
    }

    [Fact]
    public void Greet_action_returns_hello_message_built_from_componentState()
    {
        var rq = new RunActionRqDto
        {
            Route = "",
            ActionId = "greet",
            ServerSideType = typeof(SimpleForm).FullName,
            ComponentState = new() { ["name"] = JsonSerializer.SerializeToElement("Mateu") },
        };

        var inc = Handler().Handle(rq);

        var msg = Assert.Single(inc.Messages);
        Assert.Equal("Hello Mateu!", msg.Text);
        Assert.Equal("success", msg.Variant);
        Assert.Empty(inc.Fragments);
    }

    [Fact]
    public void App_shell_emits_menu_from_menuitem_methods()
    {
        var inc = Handler().Handle(new RunActionRqDto { ServerSideType = typeof(TestApp).FullName });
        var json = Render(inc);

        Assert.Contains("\"type\":\"App\"", json);
        Assert.Contains("\"title\":\"Test App\"", json);
        Assert.Contains("\"label\":\"Things\"", json);
        Assert.Contains("\"route\":\"/things\"", json);
    }

    [Fact]
    public void Crud_search_returns_rows_as_data_only_fragment()
    {
        var rq = new RunActionRqDto
        {
            ActionId = "search",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new() { ["searchText"] = JsonSerializer.SerializeToElement("") },
        };

        var inc = Handler().Handle(rq);

        var frag = Assert.Single(inc.Fragments);
        Assert.Equal("crud", frag.TargetComponentId);
        Assert.Null(frag.Component);
        var json = Render(inc);
        Assert.Contains("\"totalElements\":2", json);
        Assert.Contains("Alpha", json);
        Assert.Contains("Beta", json);
    }

    [Fact]
    public void Crud_view_renders_prefilled_readonly_form_with_view_toolbar()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/1",
            ServerSideType = typeof(Things).FullName,
        });
        var json = Render(inc);

        Assert.Contains("\"actionId\":\"cancel-view\"", json);
        Assert.Contains("\"actionId\":\"edit\"", json);
        Assert.Contains("\"initialValue\":\"Alpha\"", json); // prefilled from Get("1")
        Assert.Contains("\"readOnly\":true", json);
    }

    [Fact]
    public void Crud_create_navigates_back_to_list_with_saved_message()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/new",
            ActionId = "create",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new() { ["name"] = JsonSerializer.SerializeToElement("Gamma") },
        });

        var nav = Assert.Single(inc.Commands);
        Assert.Equal("NavigateTo", nav.Type);
        Assert.Equal("/things", nav.Data);
        Assert.Equal("Saved", Assert.Single(inc.Messages).Text);
    }

    [Fact]
    public void Crud_create_with_missing_required_field_returns_validation_error()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/things/new",
            ActionId = "create",
            ServerSideType = typeof(Things).FullName,
            ComponentState = new(), // Name missing
        });

        Assert.Empty(inc.Commands);
        var msg = Assert.Single(inc.Messages);
        Assert.Equal("error", msg.Variant);
        Assert.Contains("Name", msg.Text);
    }
}
