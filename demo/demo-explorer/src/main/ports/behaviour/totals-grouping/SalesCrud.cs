// The C# twin (Mateu.NET): [GroupBy] groups the rows, [Aggregate] adds subtotals and totals,
// computed over the whole filtered result.
using Mateu.Uidl;

public class Sale
{
    public string Id { get; set; } = "";
    [GroupBy] public string Region { get; set; } = "";
    public string Product { get; set; } = "";
    [Aggregate(AggregateFunction.Sum)] public int Units { get; set; }
    [Aggregate(AggregateFunction.Sum)] public double Amount { get; set; }
}

[UI("sales"), Title("Sales by region")]
public class SalesCrud : Crud<Sale>
{
    static readonly string[] Regions = ["North", "South", "East", "West"];
    static readonly string[] Products = ["Chairs", "Tables", "Lamps", "Shelves", "Desks"];

    static readonly List<Sale> Store = Enumerable.Range(0, 50).Select(i => new Sale
    {
        Id = $"S-{101 + i}",
        Region = Regions[i * 3 % 4],
        Product = Products[i % 5],
        Units = 1 + i * 7 % 12,
        Amount = (1 + i * 7 % 12) * (20.0 + i * 13 % 90),
    }).ToList();

    public override IEnumerable<Sale> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Store
            : Store.Where(s => $"{s.Id} {s.Region} {s.Product}".Contains(search, StringComparison.OrdinalIgnoreCase));

    public override Sale? Get(string id) => Store.FirstOrDefault(s => s.Id == id);
}
