// The C# twin (Mateu.NET): the same archetype — the first component property without [Panel] is
// the pinned key information, every [Panel] property a tab.
using Mateu.Uidl;

[UI("item-overview"), Title("Water Lilies")]
public class ArtworkOverview : ItemOverview
{
    public Markdown KeyInfo { get; } = new()
    {
        MarkdownText = """
            ### Water Lilies
            - **Artist:** Claude Monet
            - **Date:** 1906
            - **Medium:** Oil on canvas
            - **Size:** 89.9 × 94.1 cm
            - **Location:** On loan to SMK
            """,
    };

    [Panel(Title = "Description")]
    public Markdown Description { get; } = new()
    {
        MarkdownText = "One of some 250 paintings of the lily pond at Giverny. The horizon has gone: only water,"
            + " reflected sky and the flowers remain.",
    };

    [Panel(Title = "Visitors")]
    public Chart Visitors { get; } = new()
    {
        ChartType = "line",
        ChartData = new ChartData
        {
            Labels = ["Jun", "Jul", "Aug", "Sep", "Oct"],
            Datasets = [new ChartDataset { Label = "Visitors (k)", Data = [31, 42, 47, 29, 24] }],
        },
    };

    [Panel(Title = "Provenance")]
    public Markdown Provenance { get; } = new()
    {
        MarkdownText = """
            | Year | Owner |
            |---|---|
            | 1906 | The artist |
            | 1926 | Durand-Ruel, Paris |
            | 1955 | Acquired by the museum |
            """,
    };

    protected override string PanelWidth => "18rem";
}
