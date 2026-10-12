using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("cleared-fields")]
public class ClearedFieldsForm
{
    public int Nights { get; set; } = 3;
    public int? Rooms { get; set; } = 2;
    public DateOnly? Departure { get; set; } = new(2026, 8, 19);
    public string Note { get; set; } = "kept";

    [Button] public Message Echo() => new($"nights={Nights} rooms={Rooms} departure={Departure} note=[{Note}]");
}

/// <summary>Java's ClearedFieldsHydrationTest in the port: a cleared input clears the property —
/// keeping the initializer made the screen (empty) and the server (the old value) disagree.</summary>
public class ClearedFieldsTests
{
    [Fact]
    public void A_cleared_input_clears_the_property()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(ClearedFieldsForm).Assembly));
        var inc = handler.Handle(new RunActionRqDto
        {
            Route = "cleared-fields",
            ActionId = "echo",
            ServerSideType = typeof(ClearedFieldsForm).FullName,
            ComponentState = new()
            {
                ["nights"] = JsonSerializer.SerializeToElement<object?>(null),
                ["rooms"] = JsonSerializer.SerializeToElement(""),
                ["departure"] = JsonSerializer.SerializeToElement(""),
                ["note"] = JsonSerializer.SerializeToElement(""),
            },
        });
        Assert.Equal("nights=0 rooms= departure= note=[]", inc.Messages.Single().Text);
    }
}
