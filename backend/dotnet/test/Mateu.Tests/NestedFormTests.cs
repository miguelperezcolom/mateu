using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Nested data objects in a form (Java's @Inline / nested sub-forms) ─────────────────────────

public class NestedVendor
{
    public string? Name { get; set; } = "Acme";
    [Text] public string? Note { get; set; } = "Preferred";
    [OnRowSelected("Pick")] public List<NestedContact> Contacts { get; set; } = [new() { Who = "Ada" }];

    [Toolbar, Action, Shortcut("ctrl+alt+g")]
    public Message Greet() => new($"Hi {Name}");

    [Button]
    public Message Call() => new($"Calling {Name}");

    [Button]
    public object Rename()
    {
        Name = "Renamed";
        return this;
    }

    public Message Pick(NestedContact contact) => new($"Picked {contact.Who}");

    // public but no action: never reachable from the wire
    public Message Secret() => new("leaked");
}

public class NestedContact
{
    public string? Who { get; set; }
}

public class NestedShipping
{
    public string? City { get; set; } = "Palma";

    [Toolbar]
    public Message Track() => new($"Tracking {City}");
}

[UI("nested-test-island"), Title("Island")]
public class NestedTestIsland
{
    public string? Code { get; set; } = "X";
}

[UI("nested-form-test"), Title("Nested")]
public class NestedFormHost
{
    [Section("Main")] public string? Reference { get; set; } = "R-1";
    [Section("Vendor"), Inline] public NestedVendor Vendor { get; set; } = new();
    [Section("Shipping")] public NestedShipping Shipping { get; set; } = new();
    [Section("Island"), Inline] public NestedTestIsland Island { get; set; } = new();
}

public class NestedGuest
{
    [System.ComponentModel.DataAnnotations.Required] public string? Name { get; set; }

    [Button]
    public Message Confirm() => new($"Confirmed {Name}");
}

public class NestedNote
{
    [System.ComponentModel.DataAnnotations.Required] public string? Text { get; set; }
}

[UI("nested-constraints-test"), Title("Constraints")]
public class NestedConstraintsHost
{
    [System.ComponentModel.DataAnnotations.Required] public string? Code { get; set; } = "C-1";
    [Inline] public NestedGuest? Guest { get; set; }
    public NestedNote Note { get; set; } = new();

    [Button]
    public Message Save() => new("Saved");
}

public class NestedFormTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(NestedFormHost).Assembly));

    private static JsonNode Node(UIIncrementDto inc) => JsonNode.Parse(JsonSerializer.Serialize(inc, Json))!;

    private static JsonNode Load() => Node(Handler().Handle(new RunActionRqDto { Route = "nested-form-test" }));

    private static UIIncrementDto Run(string actionId, Dictionary<string, object?>? state = null) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "nested-form-test",
            ServerSideType = typeof(NestedFormHost).FullName,
            ActionId = actionId,
            ComponentState = state ?? [],
        });

    private static Dictionary<string, object?> State(string json) =>
        JsonSerializer.Deserialize<Dictionary<string, object?>>(json)!;

    private static IEnumerable<JsonObject> All(JsonNode? node)
    {
        switch (node)
        {
            case JsonObject o:
                yield return o;
                foreach (var (_, v) in o)
                    foreach (var x in All(v)) yield return x;
                break;
            case JsonArray a:
                foreach (var item in a)
                    foreach (var x in All(item)) yield return x;
                break;
        }
    }

    private static string? Str(JsonNode? n) => n?.GetValue<string>();

    [Fact]
    public void Nested_fields_carry_prefixed_ids()
    {
        var root = Load();
        var ids = All(root).Select(o => Str(o["fieldId"])).Where(i => i is not null).ToList();
        Assert.Contains("vendor-name", ids);
        Assert.Contains("vendor-contacts", ids);
        Assert.Contains("shipping-city", ids);
        Assert.DoesNotContain("name", ids);
        // a [Text] of a nested object reads the flattened key in bracket form
        Assert.Contains(All(root), o => Str(o["type"]) == "Text" && Str(o["text"]) == "${state['vendor-note']}");
        // a nested [OnRowSelected] grid runs the nested object's method
        var grid = All(root).First(o => Str(o["fieldId"]) == "vendor-contacts");
        Assert.Equal("nested-form-action-vendor-pick", Str(grid["onItemSelectionActionId"]));
    }

    [Fact]
    public void Nested_state_rides_nested_in_initial_data_and_flattened_in_the_fragment_state()
    {
        var fragment = Load()["fragments"]![0]!;
        var initial = fragment["component"]!["initialData"]!;
        Assert.Equal("Acme", Str(initial["vendor"]!["name"]));
        Assert.Null(initial["vendor-name"]);
        var state = fragment["state"]!;
        Assert.Equal("Acme", Str(state["vendor"]!["name"]));
        Assert.Equal("Acme", Str(state["vendor-name"]));
        Assert.Equal("Palma", Str(state["shipping-city"]));
    }

    [Fact]
    public void The_nested_toolbar_action_and_its_shortcut_are_advertised_first()
    {
        var actions = Load()["fragments"]![0]!["component"]!["actions"]!.AsArray();
        var greet = actions[0]!;
        Assert.Equal("nested-form-action-vendor-greet", Str(greet["id"]));
        Assert.Equal("ctrl+alt+g", Str(greet["shortcut"]));
        Assert.False(greet["validationRequired"]!.GetValue<bool>());
        var call = actions.First(a => Str(a!["id"]) == "nested-form-action-vendor-call")!;
        Assert.True(call["validationRequired"]!.GetValue<bool>());
        // the sub-form's toolbar method too, and the nested grid's row click
        Assert.Contains(actions, a => Str(a!["id"]) == "nested-form-action-shipping-track");
        Assert.Contains(actions, a => Str(a!["id"]) == "nested-form-action-vendor-pick");
    }

    [Fact]
    public void A_second_request_rehydrates_the_nested_object_flattened_keys_winning()
    {
        var inc = Run("nested-form-action-vendor-greet",
            State("""{"vendor":{"name":"Old"},"vendor-name":"Globex","shipping":{"city":"Inca"}}"""));
        Assert.Equal("Hi Globex", inc.Messages.Single().Text);
        // the nested map alone also binds
        var mapOnly = Run("nested-form-action-shipping-track", State("""{"shipping":{"city":"Inca"}}"""));
        Assert.Equal("Tracking Inca", mapOnly.Messages.Single().Text);
    }

    [Fact]
    public void Nested_button_actions_run_on_the_nested_object()
    {
        Assert.Equal("Calling Acme", Run("nested-form-action-vendor-call").Messages.Single().Text);
        // returning the nested object re-renders the view with the edited value
        var renamed = Node(Run("nested-form-action-vendor-rename"));
        Assert.Equal("Renamed", Str(renamed["fragments"]![0]!["state"]!["vendor-name"]));
    }

    [Fact]
    public void A_nested_object_without_inline_is_a_sub_form()
    {
        var root = Load();
        var page = All(root).First(o => Str(o["type"]) == "Page" && Str(o["title"]) == "Shipping");
        Assert.Equal(1, page["level"]!.GetValue<int>());
        Assert.Equal("nested-form-action-shipping-track", Str(page["toolbar"]![0]!["actionId"]));
        // the inline one renders its toolbar on the section title row, as a small button
        var button = All(root).First(o => Str(o["type"]) == "Button" && Str(o["actionId"]) == "nested-form-action-vendor-greet");
        Assert.Equal("small", Str(button["size"]));
        Assert.Equal("ctrl+alt+g", Str(button["shortcut"]));
    }

    [Theory]
    [InlineData("nested-form-action-vendor")]
    [InlineData("nested-form-action-vendor-")]
    [InlineData("nested-form-action--greet")]
    [InlineData("nested-form-action-nope-greet")]
    [InlineData("nested-form-action-reference-greet")]
    [InlineData("nested-form-action-vendor-secret")]
    [InlineData("nested-form-action-vendor-toString")]
    [InlineData("nested-form-action-island-code")]
    public void A_malformed_or_unknown_nested_action_is_refused(string actionId)
    {
        Assert.Throws<MateuForbiddenException>(() => Run(actionId));
    }

    private static UIIncrementDto RunConstraints(string actionId, string state) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "nested-constraints-test",
            ServerSideType = typeof(NestedConstraintsHost).FullName,
            ActionId = actionId,
            ComponentState = State(state),
        });

    [Fact]
    public void An_inline_nested_objects_constraints_are_the_pages()
    {
        var root = Node(Handler().Handle(new RunActionRqDto { Route = "nested-constraints-test" }));
        var validations = root["fragments"]![0]!["component"]!["validations"]!.AsArray();
        var ids = validations.Select(v => Str(v!["fieldId"])).ToList();
        // the host's own, then the inline object's under its prefixed id; the sub-form is not descended
        Assert.Equal(["code", "guest-name"], ids);
        Assert.Contains("state['guest-name']", Str(validations[1]!["condition"]));

        // the server re-checks them before the host's validated button...
        var host = Assert.Throws<UserFacingException>(() => RunConstraints("save", """{"code":"C-1"}"""));
        Assert.Contains("• Name: Cannot be empty", host.Message);
        Assert.DoesNotContain("Text", host.Message);
        // ...and before the nested object's own validated button
        var nested = Assert.Throws<UserFacingException>(() =>
            RunConstraints("nested-form-action-guest-confirm", """{"code":"C-1"}"""));
        Assert.Contains("• Name: Cannot be empty", nested.Message);
        // filled in through the flattened key, it passes
        Assert.Equal("Confirmed Ada",
            RunConstraints("nested-form-action-guest-confirm", """{"code":"C-1","guest-name":"Ada"}""").Messages.Single().Text);
        Assert.Equal("Saved", RunConstraints("save", """{"code":"C-1","guest-name":"Ada"}""").Messages.Single().Text);
    }

    [Fact]
    public void An_inline_routed_view_is_still_an_island()
    {
        var root = Load();
        var island = All(root).First(o => Str(o["type"]) == "ServerSide" && Str(o["route"])?.StartsWith("/nested-test-island") == true);
        Assert.Contains("_inline=1", Str(island["route"]));
        var ids = All(root).Select(o => Str(o["fieldId"])).ToList();
        Assert.DoesNotContain("island-code", ids);
    }
}
