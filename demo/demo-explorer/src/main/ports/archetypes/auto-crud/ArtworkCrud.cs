// The C# twin (Mateu.NET): Crud<T> is the AutoCrud — Fetch/Save/Delete are the store; EditInDrawer
// and Display (On/Off/Disabled toggles) are the same two options.
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("auto-crud"), Title("Artworks")]
public class ArtworkCrud : Crud<ArtworkCrud.Artwork>
{
    public enum Classification { Painting, Sculpture, Print }

    public class Artwork
    {
        public string Id { get; set; } = "";
        [Required] public string Title { get; set; } = "";
        public string Artist { get; set; } = "";
        public Classification Classification { get; set; }
        public int Year { get; set; }

        public override string ToString() => Title;
    }

    static readonly List<Artwork> Artworks =
    [
        new() { Id = "a1", Title = "Water Lilies", Artist = "Claude Monet", Classification = Classification.Painting, Year = 1906 },
        new() { Id = "a2", Title = "The Great Wave", Artist = "Katsushika Hokusai", Classification = Classification.Print, Year = 1831 },
        new() { Id = "a3", Title = "The Thinker", Artist = "Auguste Rodin", Classification = Classification.Sculpture, Year = 1904 },
        new() { Id = "a4", Title = "Melencolia I", Artist = "Albrecht Dürer", Classification = Classification.Print, Year = 1514 },
    ];

    public override bool EditInDrawer => true;

    public override CrudDisplay Display =>
        CrudDisplay.Defaults with { SaveAndNext = Toggle.On, Delete = Toggle.Off };

    // Java's default store search matches toString(); here Fetch applies the search text itself
    public override IEnumerable<Artwork> Fetch(string? search) =>
        Artworks.Where(a => a.Title.Contains(search ?? "", StringComparison.OrdinalIgnoreCase));

    public override void Save(Artwork artwork)
    {
        if (string.IsNullOrWhiteSpace(artwork.Id))
        {
            artwork.Id = Guid.NewGuid().ToString()[..8];
            Artworks.Add(artwork);
        }
        else Artworks[Artworks.FindIndex(a => a.Id == artwork.Id)] = artwork;
    }

    public override void Delete(string id) => Artworks.RemoveAll(a => a.Id == id);
}
