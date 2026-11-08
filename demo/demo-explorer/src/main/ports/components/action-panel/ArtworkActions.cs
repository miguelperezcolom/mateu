// The C# twin (Mateu.NET): an "I want to…" panel; each item runs the method named by its ActionId.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("artwork-actions")]
public class ArtworkActions : IComponentTreeSupplier
{
    public IComponent Component() => new ActionPanel
    {
        Label = "I want to…",
        Shortcut = "ctrl+i",
        HideUnpopulatedToggle = true,
        Categories =
        [
            new ActionPanelCategory("Loans")
            {
                Actions =
                [
                    new ActionPanelItem("Review open requests", "openLoans")
                        { Parameters = new Dictionary<string, object?> { ["status"] = "open" }, Count = 3, Populated = true },
                    new ActionPanelItem("Print the courier sheet", "print"),
                ],
            },
            new ActionPanelCategory("Conservation")
            {
                Actions = [new ActionPanelItem("Overdue checks", "openChecks") { Count = 27, Populated = true }],
            },
        ],
    };

    [Action]
    public Message OpenLoans(RunActionRqDto rq) =>
        new($"Loans filtered by {(rq.Parameters.TryGetValue("status", out var v) && v is JsonElement e ? e.GetString() : null)}");

    [Action] public Message Print() => new("Sending the courier sheet to the printer…");

    [Action] public Message OpenChecks() => new("27 checks are overdue.");
}
