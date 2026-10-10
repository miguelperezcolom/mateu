using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The matrix grid (rows × date columns, collapsible sections, link and editable cells) in a
/// component-tree view — mirrors the Java MatrixGridSyncTest fixture.</summary>
[UI("matrix")]
[Title("Availability")]
public class MatrixGridView : IComponentTreeSupplier
{
    public IComponent Component() => new MatrixGrid
    {
        Id = "availability",
        RowHeaderLabel = "Room type",
        CellActionId = "openCell",
        EditActionId = "setOverbooking",
        Columns =
        [
            new MatrixColumn("2026-10-10", "Sat 10") { Group = "Oct 2026", Tone = "neutral" },
            new MatrixColumn("2026-10-11", "Sun 11") { Group = "Oct 2026", Tone = "neutral" },
            new MatrixColumn("2026-10-12", "Mon 12"),
        ],
        Sections =
        [
            new MatrixSection
            {
                Title = "Occupancy",
                Rows =
                [
                    new MatrixRow("available", "Available")
                    {
                        Emphasis = true,
                        Cells = [MatrixCell.Of(12), new MatrixCell("-1") { Tone = "danger", Link = true }, MatrixCell.Of(4)],
                    },
                ],
            },
            new MatrixSection
            {
                Id = "controls",
                Title = "Controls",
                Collapsed = true,
                Rows = [new MatrixRow("overbooking", "Overbooking") { Editable = true, Cells = [MatrixCell.Of(2)] }],
            },
        ],
    };

    [Action]
    public Message OpenCell(RunActionRqDto rq)
    {
        string? P(string k) => rq.Parameters.TryGetValue(k, out var v)
            ? v is JsonElement e ? e.GetString() : v?.ToString()
            : null;
        return new Message($"{P("_rowId")}@{P("_columnId")}={P("_value")}");
    }
}

/// <summary>The wire carries one cell per column whatever the row declared, a blank section id gets
/// a stable one, and a cell action receives the cell it came from as parameters.</summary>
public class MatrixGridTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(MatrixGridView).Assembly));

    [Fact]
    public void Grid_travels_with_sections_and_one_cell_per_column()
    {
        var root = JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = typeof(MatrixGridView).FullName }), Json);

        var grid = Assert.Single(Objects(root)
            .Where(o => o.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                        && t.GetString() == "MatrixGrid"));
        Assert.Equal("Room type", grid.GetProperty("rowHeaderLabel").GetString());
        Assert.Equal("openCell", grid.GetProperty("cellActionId").GetString());
        Assert.Equal("setOverbooking", grid.GetProperty("editActionId").GetString());

        var columns = grid.GetProperty("columns").EnumerateArray().ToList();
        Assert.Equal(["2026-10-10", "2026-10-11", "2026-10-12"], columns.Select(c => c.GetProperty("id").GetString()));
        Assert.Equal(["Oct 2026", "Oct 2026", null], columns.Select(c => c.GetProperty("group").GetString()));
        Assert.Equal(["neutral", "neutral", null], columns.Select(c => c.GetProperty("tone").GetString()));

        // a section without id gets a stable one; the collapsed flag travels
        var sections = grid.GetProperty("sections").EnumerateArray().ToList();
        Assert.Equal(["section0", "controls"], sections.Select(s => s.GetProperty("id").GetString()));
        Assert.True(sections[1].GetProperty("collapsed").GetBoolean());

        var available = sections[0].GetProperty("rows")[0];
        Assert.True(available.GetProperty("emphasis").GetBoolean());
        var cells = available.GetProperty("cells").EnumerateArray().ToList();
        Assert.Equal(["12", "-1", "4"], cells.Select(c => c.GetProperty("value").GetString()));
        Assert.Equal([null, "danger", null], cells.Select(c => c.GetProperty("tone").GetString()));
        Assert.Equal([false, true, false], cells.Select(c => c.GetProperty("link").GetBoolean()));

        // the overbooking row declared ONE cell: padded to the three columns
        var overbooking = sections[1].GetProperty("rows")[0];
        Assert.True(overbooking.GetProperty("editable").GetBoolean());
        Assert.Equal(["2", "", ""],
            overbooking.GetProperty("cells").EnumerateArray().Select(c => c.GetProperty("value").GetString()));
    }

    [Fact]
    public void A_cell_action_receives_the_cell_it_came_from()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "matrix",
            ActionId = "openCell",
            ServerSideType = typeof(MatrixGridView).FullName,
            InitiatorComponentId = "cmp-1",
            Parameters = new Dictionary<string, object?>
            {
                ["_rowId"] = JsonSerializer.SerializeToElement("available"),
                ["_columnId"] = JsonSerializer.SerializeToElement("2026-10-11"),
                ["_value"] = JsonSerializer.SerializeToElement("-1"),
            },
        });
        Assert.Equal("available@2026-10-11=-1", Assert.Single(inc.Messages).Text);
    }

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
