// The C# twin (Mateu.NET): the same archetype — a grid view and a Gantt view with a toolbar
// switcher, plus the end and bottom DockedPanels the toolbar toggles.
using Mateu.Uidl;

[UI("data-management")]
public class LoanPlan : DataManagement
{
    record Loan(string Id, string Artwork, string Borrower, DateOnly Out, DateOnly Back, int Progress);

    static readonly List<Loan> Loans =
    [
        new("l1", "Water Lilies", "SMK", new(2026, 9, 1), new(2027, 1, 15), 60),
        new("l2", "The Great Wave", "British Museum", new(2026, 10, 10), new(2027, 3, 30), 25),
        new("l3", "Melencolia I", "Albertina", new(2026, 11, 1), new(2027, 2, 10), 10),
        new("l4", "Self-Portrait", "Van Gogh Museum", new(2026, 12, 1), new(2027, 6, 1), 0),
    ];

    protected override string GridLabel => "Table";
    protected override string GanttLabel => "Timeline";

    // No fluent Grid component in Mateu.Uidl yet: the table view is a Markdown table.
    protected override IComponent GridView() => new Markdown
    {
        MarkdownText = "| Artwork | Borrower | Leaves | Returns |\n|---|---|---|---|\n"
            + string.Concat(Loans.Select(l => $"| {l.Artwork} | {l.Borrower} | {l.Out:yyyy-MM-dd} | {l.Back:yyyy-MM-dd} |\n")),
    };

    protected override IComponent GanttView() => new Gantt
    {
        Tasks = Loans.Select(l => new GanttTask
        {
            Id = l.Id, Title = $"{l.Artwork} → {l.Borrower}", Start = l.Out, End = l.Back, Progress = l.Progress,
        }).ToList(),
    };

    protected override DockedPanel? EndPanel() =>
        new("summary", "Summary", new Text("4 loans out · 2 return before March."), "18rem", true);

    protected override DockedPanel? BottomPanel() =>
        new("log", "Activity", new Text("09:12 Ana extended “Water Lilies” to 15 January."), "8rem", false);
}
