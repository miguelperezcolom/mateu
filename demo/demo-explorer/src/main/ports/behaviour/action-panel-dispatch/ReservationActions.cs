// The C# twin (Mateu.NET): the ActionPanel component in a component tree; items dispatch their
// ActionId (with Parameters) to the view's [Action] methods.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("reservation-actions"), Title("Reservation ABC123")]
public class ReservationActions : IComponentTreeSupplier
{
    public IComponent Component() => new ActionPanel
    {
        Label = "I want to…",
        Shortcut = "ctrl+i",
        Categories =
        [
            new ActionPanelCategory("Stay")
            {
                Actions =
                [
                    new ActionPanelItem("Change dates", "act") { Parameters = new Dictionary<string, object?> { ["what"] = "change dates" } },
                    new ActionPanelItem("Upgrade room", "act") { Parameters = new Dictionary<string, object?> { ["what"] = "upgrade the room" }, Populated = true },
                ],
            },
            new ActionPanelCategory("Billing")
            {
                Actions = [new ActionPanelItem("Open folios", "act") { Count = 3, Parameters = new Dictionary<string, object?> { ["what"] = "open the folios" } }],
            },
        ],
    };

    [Action]
    public Message Act(RunActionRqDto rq) => new($"You chose to {((JsonElement)rq.Parameters["what"]!).GetString()}");
}
