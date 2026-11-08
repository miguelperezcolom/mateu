// The C# twin (Mateu.NET): [Money] is the money stereotype; [PlainText] keeps it read-only.
using Mateu.Uidl;

[UI("invoice"), Title("Invoice")]
public class InvoiceTotals
{
    [Money] public decimal Subtotal { get; set; } = 12450.5m;

    [Money, PlainText] public double CreditLimit { get; set; } = 250000;

    [Button] public Message Show() => new($"Subtotal (as the server sees it): {Subtotal}");
}
