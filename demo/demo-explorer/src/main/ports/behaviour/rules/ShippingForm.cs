// The C# twin (Mateu.NET): [Hidden("expr")] and an IRuleSupplier for the rest.
// .NET's [Disabled] takes no expression — a conditional disable is a Rule.Disable.
using Mateu.Uidl;

[UI("shipping"), Title("Shipping")]
public class ShippingForm : IRuleSupplier
{
    public bool Company { get; set; }

    [Hidden("!state.company")] public string? CompanyName { get; set; }

    [Hidden("!state.company")] public string? VatNumber { get; set; }

    public bool GiftWrap { get; set; }

    public string? GiftMessage { get; set; }

    public IReadOnlyList<Rule> Rules() =>
    [
        Rule.Disable("giftMessage", "!state.giftWrap"),
        new("true", "SetDataValue", "vatNumber", "required", null, "!!state.company"),
    ];
}
