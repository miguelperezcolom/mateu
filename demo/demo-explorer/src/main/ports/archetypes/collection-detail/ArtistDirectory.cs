// The C# twin (Mateu.NET): the same archetype — Rows(search) feeds the card list, Detail(row) the
// right pane; selecting and searching re-render in place.
using Mateu.Uidl;

[UI("collection-detail")]
public class ArtistDirectory : CollectionDetail<ArtistDirectory.Artist>
{
    public record Artist(string Id, string Name, string Nationality, string Lived, int Works, string Bio);

    static readonly List<Artist> Artists =
    [
        new("monet", "Claude Monet", "French", "1840–1926", 14,
            "Founder of Impressionism; painted the water lilies of Giverny for thirty years."),
        new("hokusai", "Katsushika Hokusai", "Japanese", "1760–1849", 9,
            "Ukiyo-e master, best known for the Thirty-six Views of Mount Fuji."),
        new("kahlo", "Frida Kahlo", "Mexican", "1907–1954", 3,
            "Self-portraits that mix Mexican folk art with surrealism."),
        new("durer", "Albrecht Dürer", "German", "1471–1528", 22,
            "Painter and printmaker of the Northern Renaissance."),
    ];

    protected override IEnumerable<Artist> Rows(string? search) =>
        Artists.Where(a => $"{a.Name} {a.Nationality}".Contains(search ?? "", StringComparison.OrdinalIgnoreCase));

    protected override string? IdOf(Artist artist) => artist.Id;
    protected override string TitleOf(Artist artist) => artist.Name;
    protected override string? CaptionOf(Artist artist) => $"{artist.Nationality} · {artist.Lived}";
    protected override IReadOnlyList<Chip> BadgesOf(Artist artist) => [new() { Label = $"{artist.Works} works" }];
    protected override string ListLabel(int count) => $"{count} artists";

    protected override IComponent Detail(Artist artist) => new Card
    {
        Style = "flex: 1;",
        Content = new VerticalLayout
        {
            Spacing = true,
            Content =
            [
                new EntityHeader
                {
                    Title = artist.Name,
                    Subtitle = $"{artist.Nationality} artist",
                    Facts =
                    [
                        new() { Label = "Lived", Value = artist.Lived },
                        new() { Label = "Works in the collection", Value = artist.Works.ToString() },
                    ],
                },
                new Text(artist.Bio),
            ],
        },
    };
}
