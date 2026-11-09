// The C# twin (Mateu.NET): the same archetype — Tasks() fills the canvas, Detail() docks under it
// and a bar click opens a side drawer with TaskDetail(task).
using Mateu.Uidl;

[UI("gantt-page"), Title("Exhibition schedule")]
public class ExhibitionSchedule : GanttPage
{
    protected override IReadOnlyList<GanttTask> Tasks() =>
    [
        new() { Id = "t1", Title = "Research & loans", Start = new(2026, 9, 1), End = new(2026, 10, 15), Progress = 100 },
        new() { Id = "t2", Title = "Catalogue", Start = new(2026, 10, 1), End = new(2026, 11, 30), Progress = 70 },
        new() { Id = "t3", Title = "Gallery build", Start = new(2026, 11, 15), End = new(2026, 12, 20), Progress = 30, Color = "#2c6e8f" },
        new() { Id = "t4", Title = "Installation", Start = new(2026, 12, 15), End = new(2027, 1, 10), Progress = 0, Color = "#7b3f8c" },
    ];

    protected override IComponent? Detail() =>
        new Text("Impressions of light · opens 12 January 2027 · click a bar for its details.");

    protected override IComponent TaskDetail(GanttTask task) =>
        new Text($"{task.Title}: {task.Start:yyyy-MM-dd} → {task.End:yyyy-MM-dd} · {Math.Round(task.Progress)}% done");
}
