// The C# twin (Mateu.NET): an action returns UICommandDto.DispatchEvent; [SubscribeTo] runs an
// action of the subscriber with the payload as parameters — Source/From give the scope.
using Mateu.Dtos;
using Mateu.Uidl;

[UI("madrid-warehouse"), Emits("madrid")]
public class MadridWarehouse
{
    [Button]
    public UICommandDto StockChanged() =>
        UICommandDto.DispatchEvent("stock-changed", new { warehouse = "Madrid" });
}

// DOCUMENT (default): hears stock-changed from anybody.
[UI("stock-board"), SubscribeTo("stock-changed", "OnStockChanged")]
public class StockBoard
{
    [ReadOnly] public int ChangesHeard { get; set; }

    public void OnStockChanged() => ChangesHeard++;
}

// COMPONENT: only from the emitter named "madrid".
[UI("madrid-listener"), SubscribeTo("stock-changed", "Heard", Source = SubscriptionSource.Component, From = "madrid")]
public class MadridListener
{
    [ReadOnly] public int Times { get; set; }

    public void Heard() => Times++;
}
