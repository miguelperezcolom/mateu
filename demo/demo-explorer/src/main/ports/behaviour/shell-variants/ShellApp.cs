// The C# twin (Mateu.NET): [App(title, Variant = "…")]; menu entries are [MenuItem] methods,
// a Group nests them. Variant "" = auto.
using Mateu.Uidl;

[App("Menu on the left", Variant = "MENU_ON_LEFT")]
public class ShellApp
{
    [MenuItem("Rooms")] public RoomsPage Rooms() => new();
    [MenuItem("Guests")] public GuestsPage Guests() => new();
    [MenuItem("Occupancy", Group = "Reports")] public RoomsPage Occupancy() => new();
    [MenuItem("Arrivals", Group = "Reports")] public GuestsPage Arrivals() => new();
}
