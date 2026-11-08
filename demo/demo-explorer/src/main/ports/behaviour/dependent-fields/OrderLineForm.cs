// The C# twin (Mateu.NET): [Trigger(OnValueChange)] + IOptionsSupplier reading the current state.
using Mateu.Uidl;

[UI("order-line"), Title("Order line")]
[Trigger(TriggerType.OnValueChange, "countryChanged", PropertyName = "country")]
[Trigger(TriggerType.OnValueChange, "recalculate", PropertyName = "quantity")]
[Trigger(TriggerType.OnValueChange, "recalculate", PropertyName = "unitPrice")]
public class OrderLineForm : IOptionsSupplier
{
    static readonly Dictionary<string, string[]> Cities = new()
    {
        ["Spain"] = ["Madrid", "Palma", "Seville"],
        ["France"] = ["Paris", "Lyon", "Nice"],
        ["Italy"] = ["Rome", "Milan", "Naples"],
    };

    public string Country { get; set; } = "Spain";
    public string? City { get; set; }
    public int Quantity { get; set; } = 1;
    public double UnitPrice { get; set; } = 10;
    [ReadOnly] public double Total { get; set; } = 10;

    public IReadOnlyList<Option> Options(string fieldName) => fieldName switch
    {
        "country" => Cities.Keys.Select(c => new Option(c, c)).ToList(),
        "city" => Cities.GetValueOrDefault(Country, []).Select(c => new Option(c, c)).ToList(),
        _ => [],
    };

    public OrderLineForm CountryChanged()
    {
        if (City != null && !Cities.GetValueOrDefault(Country, []).Contains(City)) City = null;
        return this;
    }

    public OrderLineForm Recalculate()
    {
        Total = Quantity * UnitPrice;
        return this;
    }
}
