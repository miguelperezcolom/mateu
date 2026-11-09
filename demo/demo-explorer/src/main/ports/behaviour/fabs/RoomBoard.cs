// The C# twin (Mateu.NET): [Fab(icon, label, order)] on a page method.
using Mateu.Uidl;

[UI("rooms"), Title("Rooms to clean")]
public class RoomBoard
{
    public string Next { get; set; } = "214";

    [Fab("vaadin:plus", "Report an incident", 0)]
    public Message ReportIncident() => new($"Incident reported for room {Next}", MessageVariant.Warning);

    [Fab("vaadin:check", "Mark clean", 1)]
    public Message MarkClean() => new($"Room {Next} marked clean");
}
