// The C# twin (Mateu.NET): [InlineEditing] on the crud makes every column an in-place editor;
// each committed cell saves its row through Save. [ReadOnly] keeps a column display-only.
using Mateu.Uidl;

public class Item
{
    [ReadOnly] public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int Stock { get; set; }
    public double Price { get; set; }
    public bool Active { get; set; }
}

[UI("stock"), Title("Stock"), InlineEditing]
public class StockCrud : Crud<Item>
{
    static readonly List<Item> Store = Enumerable.Range(0, 50).Select(i => new Item
    {
        Id = $"SKU-{500 + i}", Name = $"Item {i}", Stock = i * 17 % 120, Price = 1.5 + i * 7 % 30, Active = i % 6 != 0,
    }).ToList();

    public override IEnumerable<Item> Fetch(string? search) => Store;

    public override Item? Get(string id) => Store.FirstOrDefault(i => i.Id == id);

    public override void Save(Item item)
    {
        var at = Store.FindIndex(i => i.Id == item.Id);
        if (at >= 0) Store[at] = item;
    }
}
