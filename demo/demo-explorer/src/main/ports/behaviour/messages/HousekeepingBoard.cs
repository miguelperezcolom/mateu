// The C# twin (Mateu.NET): Message with a variant (Error stays), Message.Undoable(text, actionId,
// parameters) and an [Action] undo target that reads them from the request.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("housekeeping"), Title("Housekeeping")]
public class HousekeepingBoard
{
    public static string Room214 = "Dirty";

    [Button] public Message Success() => new("Room 118 inspected");

    [Button] public Message Error() => new("The minibar sensor of 214 is offline", MessageVariant.Error);

    [Button]
    public Message MarkClean()
    {
        Room214 = "Clean";
        return Message.Undoable("Room 214 marked clean", "restore",
            new Dictionary<string, object?> { ["status"] = "Dirty" });
    }

    [Action]
    public Message Restore(RunActionRqDto rq)
    {
        Room214 = ((JsonElement)rq.Parameters["status"]!).GetString()!;
        return new Message("Room 214 is " + Room214 + " again");
    }
}
