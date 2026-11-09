// The C# twin (Mateu.NET): EditInDrawer opens New and row edits in a drawer over the listing;
// Display turns on "Save and next"; a UserFacingException from Save shows inside the drawer.
using Mateu.Uidl;

public class Order
{
    public string Id { get; set; } = "";
    public string Customer { get; set; } = "";
    public double Amount { get; set; }
}

[UI("orders"), Title("Orders — edit in a drawer")]
public class DrawerOrdersCrud : Crud<Order>
{
    static readonly List<Order> Store = Enumerable.Range(0, 50)
        .Select(i => new Order { Id = $"ORD-{1001 + i}", Customer = $"Customer {i}", Amount = 25 + i * 37 % 480 }).ToList();

    public override bool EditInDrawer => true;

    public override CrudDisplay Display => CrudDisplay.Defaults with { SaveAndNext = Toggle.On };

    public override IEnumerable<Order> Fetch(string? search) => Store;

    public override Order? Get(string id) => Store.FirstOrDefault(o => o.Id == id);

    public override void Save(Order order)
    {
        if (order.Amount > 10_000)
            throw new UserFacingException("Over the credit limit", "An order cannot exceed 10,000.");
        var at = Store.FindIndex(o => o.Id == order.Id);
        if (at >= 0) Store[at] = order; else Store.Add(order);
    }
}
