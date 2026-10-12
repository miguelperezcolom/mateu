using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("server-validation")]
public class ServerValidatedBooking
{
    [Required] public string? Guest { get; set; }

    [Required] public int? Adults { get; set; }

    [Range(1, 10)] public int? Nights { get; set; }

    [Button] public Message Save() => new("saved");
}

/// <summary>Java's ServerSideValidationSyncTest, in the port: a [Button] is advertised
/// validationRequired, so the server re-checks the form's constraints before running it — the
/// browser is not to be trusted, nor the only client — and the client conditions follow Bean
/// Validation's reading: 0 is a value, and an empty optional bounded field passes.</summary>
public class ServerSideValidationTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(ServerValidatedBooking).Assembly));

    private static UIIncrementDto Run(Dictionary<string, object?> state) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "server-validation",
            ActionId = "save",
            ServerSideType = typeof(ServerValidatedBooking).FullName,
            ComponentState = state.ToDictionary(e => e.Key, e => (object?)JsonSerializer.SerializeToElement(e.Value)),
        });

    [Fact]
    public void A_valid_form_runs_the_button()
    {
        var inc = Run(new() { ["guest"] = "Ana", ["adults"] = 0 });
        Assert.Equal("saved", inc.Messages.Single().Text);
    }

    [Fact]
    public void A_broken_constraint_refuses_the_button_with_the_clients_messages()
    {
        var e = Assert.Throws<UserFacingException>(() => Run(new() { ["guest"] = "", ["adults"] = 2, ["nights"] = 12 }));
        Assert.Equal("There are validation errors", e.Title);
        Assert.Contains("• Guest: Cannot be empty", e.Message);
        Assert.Contains("• Nights: Must be at most 10", e.Message);
        Assert.DoesNotContain("Adults", e.Message);
    }

    [Fact]
    public void The_client_conditions_follow_bean_validation_semantics()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(
            new RunActionRqDto { Route = "server-validation", ConsumedRoute = "server-validation" }));
        var conditions = new List<string>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
                foreach (var p in e.EnumerateObject())
                {
                    if (p.Name is "condition" or "Condition" && p.Value.ValueKind == JsonValueKind.String) conditions.Add(p.Value.GetString()!);
                    Walk(p.Value);
                }
            else if (e.ValueKind == JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(JsonDocument.Parse(json).RootElement);
        Assert.Contains(
            "state['adults'] != null && state['adults'] !== '' && (state['adults'].length === undefined || state['adults'].length > 0)",
            conditions);
        Assert.Contains("state['nights'] == null || state['nights'] === '' || state['nights'] >= 1", conditions);
    }
}
