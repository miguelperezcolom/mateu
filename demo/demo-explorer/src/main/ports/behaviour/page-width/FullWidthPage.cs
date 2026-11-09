// The C# twin (Mateu.NET): [PageWidth(…)] and [PageTemplate(…)] (or IPageWidthSupplier).
using Mateu.Uidl;

[UI("full-width"), Title("Full width"), PageWidth(PageWidthStyle.FullWidth)]
public class FullWidthPage
{
    public string Name { get; set; } = "Ada Lovelace";
}

[UI("collection-typed"), Title("Typed as a collection"), PageTemplate(PageType.Collection)]
public class CollectionTypedPage
{
    public string Name { get; set; } = "Ada Lovelace";
}
