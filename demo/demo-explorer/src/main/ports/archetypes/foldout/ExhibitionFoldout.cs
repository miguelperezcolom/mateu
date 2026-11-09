// The C# twin (Mateu.NET): the same archetype — the overview, [Panel] fold-out panels (Open = false
// starts folded, PanelSummary fills the folded strip) and the NavigationHeader.
using Mateu.Uidl;

[UI("foldout"), Title("Impressions of light")]
public class ExhibitionFoldout : Foldout
{
    public Markdown Overview { get; } = new()
    {
        MarkdownText = """
            **Impressions of light**
            Galleries 5–6 · 12 Jan – 30 Apr 2027

            64 works · 11 lenders · curator: A. Lindqvist
            """,
    };

    [Panel(Title = "Works", Subtitle = "By lender")]
    public Chart Works { get; } = new()
    {
        ChartType = "bar",
        ChartData = new ChartData
        {
            Labels = ["Own collection", "SMK", "Musée d'Orsay", "Others"],
            Datasets = [new ChartDataset { Label = "Works", Data = [31, 12, 9, 12] }],
        },
    };

    [Panel(Title = "Budget", Open = false)]
    public Markdown Budget { get; } = new() { MarkdownText = "Spent **€182,000** of €240,000 (76%)." };

    [Panel(Title = "Risks", Open = false)]
    public Markdown Risks { get; } = new() { MarkdownText = "- Courier strike in January\n- Gallery 6 humidity" };

    // .NET hands the panel's PROPERTY name (PascalCase)
    protected override IComponent? PanelSummary(string panelPropertyName) => panelPropertyName switch
    {
        "Budget" => new Text("76% spent"),
        "Risks" => new Text("2 open"),
        _ => null,
    };

    protected override FoldoutNavigation? NavigationHeader => new()
    {
        Title = "Impressions of light",
        ParentLabel = "Exhibitions",
        ParentActionId = "toExhibitions",
        PreviousActionId = "previousExhibition",
        NextActionId = "nextExhibition",
    };

    public Message ToExhibitions() => new("Would go back to the exhibitions list", MessageVariant.Info);
    public Message PreviousExhibition() => new("Previous exhibition: Dutch drawings", MessageVariant.Info);
    public Message NextExhibition() => new("Next exhibition: Hokusai's Fuji", MessageVariant.Info);
}
