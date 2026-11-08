// The C# twin (Mateu.NET): the board is the view's component tree; where each card lives is a
// public property (the view's state), and a move runs the method named by MoveActionId.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("conservation-board")]
public class ConservationBoard : IComponentTreeSupplier
{
    record Task(string Id, string Title, string Artwork, string Priority);

    static readonly Task[] Tasks =
    [
        new("t1", "Reframe", "The Starry Night", "high"),
        new("t2", "Clean varnish", "Girl with a Pearl Earring", "normal"),
        new("t3", "Condition report", "The Night Watch", "normal"),
        new("t4", "Humidity check", "Water Lilies", "low"),
    ];

    /// <summary>card id → column id: the state of the board.</summary>
    public Dictionary<string, string> ColumnOf { get; set; } =
        new() { ["t1"] = "todo", ["t2"] = "todo", ["t3"] = "doing", ["t4"] = "done" };

    public IComponent Component() => new Kanban
    {
        MoveActionId = "moveTask",
        Columns = [Column("todo", "To do", "#64748b"), Column("doing", "In progress", "#2563eb"), Column("done", "Done", "#16a34a")],
    };

    KanbanColumn Column(string id, string title, string color) => new()
    {
        Id = id, Title = title, Color = color,
        Cards = Tasks.Where(t => ColumnOf.GetValueOrDefault(t.Id) == id)
            .Select(t => new KanbanCard { Id = t.Id, Title = t.Title, Description = t.Artwork, Badge = t.Priority })
            .ToList(),
    };

    [Action]
    public Message MoveTask(RunActionRqDto rq)
    {
        string? P(string key) => rq.Parameters.TryGetValue(key, out var v) && v is JsonElement e ? e.GetString() : null;
        ColumnOf[P("_cardId")!] = P("_toColumnId")!;
        return new Message($"{P("_cardId")} → {P("_toColumnId")}");
    }
}
