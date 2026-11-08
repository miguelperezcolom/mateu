// The C# twin (Mateu.NET): the same archetype — SwitcherOptions/Load pick the record, Overview
// draws it and Info is the side panel. (No RecordLabel hook in .NET yet: the switcher is unlabelled.)
using Mateu.Uidl;

[UI("general-overview")]
public class MuseumOverview : GeneralOverview<MuseumOverview.Museum>
{
    public record Museum(
        string Id, string Name, string City, string Status, int Works, string Visitors, IReadOnlyList<string> News);

    static readonly List<Museum> Museums =
    [
        new("met", "The Met", "New York", "Open", 1820, "26,400",
            ["New wing for arms and armour", "Monet loan returned from SMK"]),
        new("smk", "SMK", "Copenhagen", "Open", 640, "9,800", ["Water Lilies on loan until January"]),
        new("cma", "Cleveland Museum of Art", "Cleveland", "Partly closed", 910, "12,010",
            ["Gallery 6 closed for installation", "Open access images updated"]),
    ];

    protected override IReadOnlyList<Option> SwitcherOptions() =>
        Museums.Select(m => new Option(m.Id, m.Name)).ToList();

    protected override Museum? Load(string id) => Museums.FirstOrDefault(m => m.Id == id);

    protected override IComponent Overview(Museum museum) => new VerticalLayout
    {
        Spacing = true,
        Content =
        [
            new EntityHeader
            {
                Title = museum.Name,
                Subtitle = museum.City,
                Badges = [new() { Label = museum.Status, Color = museum.Status == "Open" ? "success" : "warning" }],
                Facts = [new() { Label = "Works", Value = museum.Works.ToString() }],
                MetricLabel = "Visitors this month",
                MetricValue = museum.Visitors,
            },
            new Card { Title = "About", Content = new Text($"{museum.Name} lends and borrows through the network.") },
        ],
    };

    /// <summary>The complementary side panel of the template; Display can switch it off.</summary>
    protected override IComponent? Info(Museum museum) => new Card
    {
        Title = "Recent news",
        Content = new BulletedList { Id = "news", Items = museum.News },
    };
}
