// The C# twin (Mateu.NET): [App(…, Chromeless = true)] (implies CommandCenter) + IGlobalSearchSupplier.
using Mateu.Uidl;

[App("Kiosk", Chromeless = true)]
public class KioskApp : IGlobalSearchSupplier
{
    [MenuItem("Rooms")] public RoomsPage Rooms() => new();
    [MenuItem("Guests")] public GuestsPage Guests() => new();

    public IReadOnlyList<GlobalSearchResult> GlobalSearch(string searchText) =>
        new[] { new GlobalSearchResult("Ada Lovelace", "Room 214", "/guests", "Guests") }
            .Where(r => r.Label.Contains(searchText ?? "", StringComparison.OrdinalIgnoreCase))
            .ToList();
}
