// The C# twin (Mateu.NET): a component-tree view returning a Map; a marker click runs the
// method named by MarkerActionId, with the marker id in _markerId.
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

[UI("museum-map")]
public class MuseumMap : IComponentTreeSupplier
{
    static readonly MapMarker[] Museums =
    [
        new() { Id = "louvre", Latitude = 48.8606, Longitude = 2.3376, Label = "Louvre", Description = "35,000 works on display" },
        new() { Id = "orsay", Latitude = 48.8600, Longitude = 2.3266, Label = "Musée d'Orsay", Description = "Impressionism", Color = "#2563eb" },
        new() { Id = "pompidou", Latitude = 48.8607, Longitude = 2.3522, Label = "Centre Pompidou", Description = "Modern art", Color = "#dc2626" },
    ];

    public IComponent Component() => new Map
    {
        Markers = Museums,
        MarkerActionId = "museumClicked",
        Style = "height: 22rem; width: 100%;",
    };

    [Action]
    public Message MuseumClicked(RunActionRqDto rq)
    {
        var id = rq.Parameters.TryGetValue("_markerId", out var v) && v is JsonElement e ? e.GetString() : null;
        var museum = Museums.First(m => m.Id == id);
        return new Message($"{museum.Label} — {museum.Description}");
    }
}
