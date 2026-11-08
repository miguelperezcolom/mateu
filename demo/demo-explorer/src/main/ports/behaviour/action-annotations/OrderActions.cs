// The C# twin (Mateu.NET): [Toolbar] / [Button] methods; [Shortcut] binds a key; the method name
// (camelCased) is the action id.
using Mateu.Uidl;

[UI("order-actions"), Title("Order 1042")]
public class OrderActions
{
    public string Customer { get; set; } = "Acme";

    [Toolbar] public Message Refresh() => new("Refreshed from the toolbar");

    [Toolbar("Ship order")] public Message Ship() => new("Shipped");

    [Button] public Message PrintInvoice() => new("Invoice printed (a form button)");

    [Button, Shortcut("ctrl+alt+r")] public Message Recalculate() => new("Recalculated");
}
