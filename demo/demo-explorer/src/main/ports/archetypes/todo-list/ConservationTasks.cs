// The C# twin (Mateu.NET): the same archetype — GroupOf buckets the cards, a click runs ActionOn
// (a Message here; a route string would navigate).
using Mateu.Uidl;

[UI("todo-list")]
public class ConservationTasks : TodoList<ConservationTasks.Task>
{
    public record Task(string Id, string Title, string Object, string Bucket, string Due, string Priority);

    static readonly List<Task> Tasks =
    [
        new("T-1", "Check the humidity log — gallery 4", "Room 4", "Today", "overdue", "high"),
        new("T-2", "Condition report before the loan", "Water Lilies", "Today", "today", "high"),
        new("T-3", "Re-frame the Dürer print", "Melencolia I", "This week", "in 2 days", ""),
        new("T-4", "Clean the bronze casts", "Sculpture hall", "This week", "in 4 days", "medium"),
        new("T-5", "Order archival boxes", "Photography store", "Later", "in 3 weeks", "low"),
    ];

    protected override IEnumerable<Task> Rows() => Tasks;
    protected override string? IdOf(Task task) => task.Id;
    protected override string TitleOf(Task task) => task.Title;
    protected override string? CaptionOf(Task task) => task.Object;

    protected override IReadOnlyList<Chip> BadgesOf(Task task) =>
        task.Priority is ""
            ? [new() { Label = task.Due }]
            : [new() { Label = task.Due }, new() { Label = task.Priority }];

    protected override string GroupOf(Task task) => task.Bucket;
    protected override IReadOnlyList<string> GroupOrder() => ["Today", "This week", "Later"];

    protected override object? ActionOn(Task task) => new Message($"Opening “{task.Title}”", MessageVariant.Success);
}
