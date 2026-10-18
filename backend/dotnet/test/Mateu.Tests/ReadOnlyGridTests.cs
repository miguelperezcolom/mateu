using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class ReadOnlyOrderLine
{
    public string Product { get; set; } = "";
    public int Quantity { get; set; }
}

[UI("ro-grid-class"), ReadOnly]
public class ReadOnlyOrderView
{
    public string Customer { get; set; } = "Ada";
    public List<ReadOnlyOrderLine> Lines { get; set; } = [new() { Product = "Tea", Quantity = 2 }];
}

[UI("ro-grid-all")]
public class AllReadOnlyOrderView
{
    [ReadOnly] public string Customer { get; set; } = "Ada";
    [ReadOnly] public List<ReadOnlyOrderLine> Lines { get; set; } = [new() { Product = "Tea", Quantity = 2 }];
}

/// <summary>A view whose fields are all read-only keeps its list of rows a GRID, read-only, and
/// its fields their labels (Java took such a view for a page of components and rendered the grid
/// as its rows' text).</summary>
public class ReadOnlyGridTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static List<JsonElement> Fields(string route)
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(ReadOnlyOrderView).Assembly))
            .Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        var found = new List<JsonElement>();
        Collect(JsonSerializer.SerializeToElement(inc, Json), found);
        return found;
    }

    private static void Collect(JsonElement node, List<JsonElement> found)
    {
        if (node.ValueKind == JsonValueKind.Object)
        {
            if (node.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String && t.GetString() == "FormField")
                found.Add(node);
            foreach (var p in node.EnumerateObject()) Collect(p.Value, found);
        }
        else if (node.ValueKind == JsonValueKind.Array)
        {
            foreach (var e in node.EnumerateArray()) Collect(e, found);
        }
    }

    private static JsonElement Field(List<JsonElement> fields, string id) =>
        fields.First(f => f.TryGetProperty("fieldId", out var v) && v.GetString() == id);

    [Theory]
    [InlineData("ro-grid-class")]
    [InlineData("ro-grid-all")]
    public void A_read_only_grid_on_an_all_read_only_view_is_a_grid(string route)
    {
        var fields = Fields(route);
        var lines = Field(fields, "lines");
        Assert.Equal("grid", lines.GetProperty("stereotype").GetString());
        Assert.Equal("Customer", Field(fields, "customer").GetProperty("label").GetString());
    }

    /// <summary>A whole-view [ReadOnly]. (On a PROPERTY the port's [ReadOnly] only keeps an
    /// [InlineEditing] column display-only — see ReadOnlyAttribute.)</summary>
    [Fact]
    public void A_class_level_read_only_view_marks_its_grid_and_fields_read_only()
    {
        var fields = Fields("ro-grid-class");
        Assert.True(Field(fields, "lines").GetProperty("readOnly").GetBoolean());
        Assert.True(Field(fields, "customer").GetProperty("readOnly").GetBoolean());
    }
}
