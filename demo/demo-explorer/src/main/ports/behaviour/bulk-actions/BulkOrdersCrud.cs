// The C# twin (Mateu.NET): a [ListToolbarButton] method is a bulk action; its List<Order>
// parameter receives the selected rows.
using Mateu.Uidl;

public class Order
{
    public string Id { get; set; } = "";
    public string Customer { get; set; } = "";
    public string Status { get; set; } = "Open";
}

[UI("orders"), Title("Orders — bulk actions")]
public class BulkOrdersCrud : Crud<Order>
{
    static readonly List<Order> Store = Enumerable.Range(0, 50)
        .Select(i => new Order { Id = $"ORD-{1001 + i}", Customer = $"Customer {i}" }).ToList();

    public override IEnumerable<Order> Fetch(string? search) => Store;

    public override Order? Get(string id) => Store.FirstOrDefault(o => o.Id == id);

    [ListToolbarButton, Label("Mark as shipped")]
    public Message MarkAsShipped(List<Order> selection)
    {
        foreach (var o in Store.Where(o => selection.Any(s => s.Id == o.Id))) o.Status = "Shipped";
        return new Message($"{selection.Count} orders marked as shipped");
    }

    [ListToolbarButton(confirmationRequired: true), Label("Cancel orders")]
    public Message CancelOrders(List<Order> selection)
    {
        foreach (var o in Store.Where(o => selection.Any(s => s.Id == o.Id))) o.Status = "Cancelled";
        return new Message($"{selection.Count} orders cancelled");
    }
}
