// The C# twin (Mateu.NET): IHomeRouteSupplier on the [App] class (else the first menu leaf).
using Mateu.Uidl;

[App("Concierge", Variant = "MENU_ON_TOP")]
public class ConciergeApp : IHomeRouteSupplier
{
    [MenuItem("Rooms")] public RoomsPage Rooms() => new();
    [MenuItem("Guests")] public GuestsPage Guests() => new();

    public string HomeRoute() => "guests";
}
