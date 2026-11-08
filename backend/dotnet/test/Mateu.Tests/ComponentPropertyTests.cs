using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("component-property-form")]
public class ComponentPropertyForm
{
    public string? Name { get; set; } = "Ada";

    /// <summary>A fluent component held by a property: rendered in the form, never state.</summary>
    public IComponent Chart { get; set; } = new Text("Sales are up") { Style = "color: green;" };

    public Text? Missing { get; set; }
}

/// <summary>A form property typed with a fluent component renders that component in the form (a
/// CustomField around it, as Java's ReflectionFormFieldMapper does for a Component field) and stays
/// out of the state.</summary>
public class ComponentPropertyTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(ComponentPropertyTests).Assembly));

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

    [Fact]
    public void A_component_property_renders_the_component_and_carries_no_state()
    {
        var root = JsonSerializer.SerializeToNode(Handler.Handle(new RunActionRqDto { Route = "component-property-form" }), Json)!;
        var component = root["fragments"]![0]!["component"]!.AsObject();
        var custom = Objects(component).Single(o => (string?)o["metadata"]?["type"] == "CustomField");
        Assert.Equal("Chart", (string?)custom["metadata"]!["label"]);
        Assert.Contains(Objects(custom), o => (string?)o["metadata"]?["text"] == "Sales are up");
        Assert.Equal("color: green;", (string?)custom["style"]);
        Assert.False(component["initialData"]!.AsObject().ContainsKey("chart"));
        Assert.False(component["initialData"]!.AsObject().ContainsKey("missing"));
        Assert.DoesNotContain(Objects(component), o => (string?)o["metadata"]?["fieldId"] is "chart" or "missing");
    }
}
