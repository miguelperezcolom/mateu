using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public enum EnumLabelDeparture { EXTEND_ONE_NIGHT, CHECK_OUT, [Label("No-show")] NoShow, ROOM1 }

[UI("enum-labels"), Title("Enum labels")]
public class EnumLabelView
{
    public EnumLabelDeparture Departure { get; set; } = EnumLabelDeparture.CHECK_OUT;
}

/// <summary>Enum options are called by the member's [Label], else by its name humanized exactly like
/// Java (FieldMetadataExtractor.enumLabel) — never the raw constant.</summary>
public class EnumLabelTests
{
    [Fact]
    public void An_enum_member_is_called_by_its_label_or_its_name_humanized()
    {
        var json = JsonSerializer.Serialize(
            new SyncHandler(new MateuRegistry(typeof(EnumLabelView).Assembly))
                .Handle(new RunActionRqDto { ServerSideType = typeof(EnumLabelView).FullName }));

        Assert.Contains("\"Label\":\"Extend one night\"", json);
        Assert.Contains("\"Label\":\"Check out\"", json);
        Assert.Contains("\"Label\":\"No-show\"", json);
        Assert.Contains("\"Label\":\"Room 1\"", json);
        Assert.DoesNotContain("\"Label\":\"CHECK_OUT\"", json);
    }

    [Fact]
    public void An_enum_column_carries_its_value_labels_while_rows_keep_the_raw_value()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(EnumLabelStays).Assembly));
        var load = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto
        {
            Route = "/enum-label-stays", ServerSideType = typeof(EnumLabelStays).FullName,
        }));
        Assert.Contains("\"ValueLabels\":{", load);
        Assert.Contains("\"EXTEND_ONE_NIGHT\":\"Extend one night\"", load);
        Assert.Contains("\"NoShow\":\"No-show\"", load);

        var search = JsonSerializer.Serialize(handler.Handle(new RunActionRqDto
        {
            Route = "/enum-label-stays", ActionId = "search",
            ServerSideType = typeof(EnumLabelStays).FullName, InitiatorComponentId = "ux_list",
        }));
        Assert.Contains("CHECK_OUT", search);
    }
}

public class EnumLabelStay
{
    public string Id { get; set; } = "";
    public string Guest { get; set; } = "";
    public EnumLabelDeparture Departure { get; set; }
}

[UI("enum-label-stays"), Title("Stays")]
public class EnumLabelStays : Crud<EnumLabelStay>
{
    public override IEnumerable<EnumLabelStay> Fetch(string? search) =>
        [new() { Id = "1", Guest = "Ada", Departure = EnumLabelDeparture.CHECK_OUT }];

    public override void Save(EnumLabelStay entity) { }
}
