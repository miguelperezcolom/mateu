using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Workshop;

/// <summary>Workshop, lab 01: a screen of your own. Properties are the state of the screen, the
/// data annotations its rules, the [Button] method its behaviour. It is reached through its
/// [MenuItem] in <see cref="Shell"/>.</summary>
[UI("quote"), Title("Quote")]
public class Quote
{
    [Range(1, int.MaxValue)] public int Quantity { get; set; } = 1;

    [Range(0, double.MaxValue), Money] public double UnitPrice { get; set; }

    [Range(0, 100)] public int Discount { get; set; }

    [ReadOnly, Money] public double Total { get; set; }

    // An action answers with what the browser should do: returning the view itself sends the
    // changed fields back (a bare Message would change Total on the server only), the Message
    // shows a toast.
    [Button]
    public object[] Calculate()
    {
        Total = Math.Round(Quantity * UnitPrice * (100 - Discount)) / 100.0;
        return [this, new Message($"Total: {Total}")];
    }
}
