// The C# twin (Mateu.NET): [MenuGroup(…, Display = "cards")] makes a folder a card panel; a "/" in
// a group nests a folder (a card with actions). (Rule leaves are Java-only.)
using Mateu.Uidl;

[App("Front office", Variant = "MENU_ON_TOP")]
[MenuGroup("Quick access", Display = MenuDisplay.Cards)]
[MenuGroup("Quick access/Billing", Description = "Two destinations, shown as the card's actions")]
public class FrontOfficeApp
{
    [MenuItem("Rooms")] public RoomsPage Rooms() => new();

    [MenuItem("Room plan", Group = "Quick access", Description = "Who is in which room")]
    public RoomsPage RoomPlan() => new();

    [MenuItem("Guest list", Group = "Quick access", Description = "Today's arrivals and departures")]
    public GuestsPage GuestList() => new();

    [MenuItem("Folios", Group = "Quick access/Billing")] public RoomsPage Folios() => new();
    [MenuItem("Invoices", Group = "Quick access/Billing")] public GuestsPage Invoices() => new();
}
