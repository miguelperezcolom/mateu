// The C# twin (Mateu.NET): an editable quota row and clickable "sold" cells; both actions get
// _rowId, _columnId and _value.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("ticket-quota")]
public class TicketQuota : IComponentTreeSupplier
{
    static readonly DateOnly From = new(2026, 11, 9);
    static readonly int[] Sold = [120, 95, 140, 180, 210, 260, 240];

    /// <summary>day (ISO date) → quota: the editable state.</summary>
    public Dictionary<string, int> Quota { get; set; } = new();

    public IComponent Component()
    {
        var days = Enumerable.Range(0, Sold.Length).Select(i => From.AddDays(i)).ToList();
        int QuotaOf(DateOnly d) => Quota.GetValueOrDefault(d.ToString("yyyy-MM-dd"), 250);
        return new MatrixGrid
        {
            RowHeaderLabel = "Timed entry · 10:00",
            Columns = days.Select(d => new MatrixColumn(d.ToString("yyyy-MM-dd"), d.Day.ToString()) { Group = "November" }).ToList(),
            Sections =
            [
                new MatrixSection
                {
                    Id = "tickets", Title = "Tickets",
                    Rows =
                    [
                        new MatrixRow("quota", "Quota") { Editable = true, Cells = days.Select(d => MatrixCell.Of(QuotaOf(d))).ToList() },
                        new MatrixRow("sold", "Sold") { Cells = Sold.Select(s => new MatrixCell(s.ToString()) { Link = true }).ToList() },
                        new MatrixRow("left", "Left") { Emphasis = true, Cells = days.Select((d, i) => MatrixCell.Of(QuotaOf(d) - Sold[i])).ToList() },
                    ],
                },
            ],
            EditActionId = "quotaEdited",
            CellActionId = "cellClicked",
        };
    }

    static string? P(RunActionRqDto rq, string key) =>
        rq.Parameters.TryGetValue(key, out var v) && v is JsonElement e ? e.ToString() : null;

    [Action]
    public Message QuotaEdited(RunActionRqDto rq)
    {
        Quota[P(rq, "_columnId")!] = int.Parse(P(rq, "_value")!);
        return new Message($"Quota for {P(rq, "_columnId")} is now {P(rq, "_value")}");
    }

    [Action]
    public Message CellClicked(RunActionRqDto rq) => new($"{P(rq, "_value")} tickets sold on {P(rq, "_columnId")}");
}
