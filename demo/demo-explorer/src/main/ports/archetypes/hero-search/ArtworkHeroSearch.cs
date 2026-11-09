// The C# twin (Mateu.NET): HeroSearch<T> is a Crud<T> under a hero — the facets come from the
// row's own properties (no separate Filters type) and Fetch only applies the search text.
using Mateu.Uidl;

[UI("hero-search")]
public class ArtworkHeroSearch : HeroSearch<ArtworkHeroSearch.Artwork>
{
    public class Artwork
    {
        public string Title { get; set; } = "";
        public string Artist { get; set; } = "";
        public string Classification { get; set; } = "";
        public int Year { get; set; }
    }

    static readonly List<Artwork> Artworks =
    [
        new() { Title = "The Harvesters", Artist = "Pieter Bruegel", Classification = "Painting", Year = 1565 },
        new() { Title = "Water Lilies", Artist = "Claude Monet", Classification = "Painting", Year = 1906 },
        new() { Title = "The Great Wave", Artist = "Katsushika Hokusai", Classification = "Print", Year = 1831 },
        new() { Title = "Bust of a Woman", Artist = "Pablo Picasso", Classification = "Sculpture", Year = 1931 },
        new() { Title = "Self-Portrait", Artist = "Vincent van Gogh", Classification = "Painting", Year = 1887 },
        new() { Title = "Melencolia I", Artist = "Albrecht Dürer", Classification = "Print", Year = 1514 },
    ];

    public override string? HeroTitle() => "Find an artwork";

    public override string? HeroSubtitle() =>
        "Try “monet”, “print” or a year — then narrow it with the classification facet";

    // Java's HeroSearch is read-only; here it is a Crud, so the write affordances are switched off.
    public override bool CanView => false;
    public override bool CanEdit => false;
    public override bool CanCreate => false;
    public override bool CanDelete => false;

    public override IEnumerable<Artwork> Fetch(string? search) =>
        Artworks.Where(a => $"{a.Title} {a.Artist} {a.Classification} {a.Year}"
            .Contains(search ?? "", StringComparison.OrdinalIgnoreCase));
}
