// The C# twin (Mateu.NET): a StatusList, a Ledger and a ProcessMonitor as a component tree.
// A row's action and the process's fix button run the methods of those names (PascalCase).
using Mateu.Uidl;

[UI("incidents"), Title("Incidents")]
public class Incidents : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Spacing = true,
        Content =
        [
            new StatusList
            {
                Items =
                [
                    new StatusItem
                    {
                        Id = "305", Icon = "🔧", Title = "Room 305 — air conditioning", Description = "Reported 08:40",
                        Status = "Open", StatusColor = "error", ActionLabel = "Assign", ActionId = "assign",
                    },
                    new StatusItem
                    {
                        Id = "118", Icon = "💧", Title = "Room 118 — leaking tap", Description = "Plumber on the way",
                        Status = "In progress", StatusColor = "warning",
                    },
                ],
            },
            new Ledger
            {
                Currency = "€", TotalLabel = "Balance due",
                Lines =
                [
                    new LedgerLine { Concept = "Room 102 — 3 nights", Amount = 1140 },
                    new LedgerLine { Concept = "Breakfast", Included = true, IncludedLabel = "Included" },
                    new LedgerLine { Concept = "Deposit", Amount = -250 },
                ],
            },
            new ProcessMonitor
            {
                Items =
                [
                    new ProcessItem
                    {
                        Id = "export", Name = "Invoice export", Systems = ["PMS", "ERP"], Ok = 88, Errors = 4,
                        Status = "error", ActionLabel = "Retry", ActionId = "retryExport",
                    },
                ],
            },
        ],
    };

    public Message Assign() => new("Assigned to maintenance");

    public Message RetryExport() => new("Invoice export re-queued: 4 invoices");
}
