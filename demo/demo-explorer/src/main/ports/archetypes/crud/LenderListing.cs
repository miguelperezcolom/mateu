// The C# twin (Mateu.NET): IListing<T> plus the capabilities it declares — search, view, create
// and delete, no IEditable, so no Edit button and no route for one.
using Mateu.Uidl;

[UI("crud"), Title("Lending institutions")]
public class LenderListing :
    IListing<LenderListing.Lender>, ISearchable,
    INavigable<LenderListing.Lender, string>, ICreatable<LenderListing.Lender, string>, IDeletable<string>
{
    public class Lender
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string City { get; set; } = "";
        public int ActiveLoans { get; set; }
    }

    static readonly List<Lender> Lenders =
    [
        new() { Id = "smk", Name = "SMK — Statens Museum for Kunst", City = "Copenhagen", ActiveLoans = 3 },
        new() { Id = "orsay", Name = "Musée d'Orsay", City = "Paris", ActiveLoans = 2 },
        new() { Id = "bm", Name = "British Museum", City = "London", ActiveLoans = 1 },
    ];

    public ListingData<Lender> Search(SearchRequest request) =>
        ListingData.From(Lenders.Where(l =>
            $"{l.Name} {l.City}".Contains(request.SearchText, StringComparison.OrdinalIgnoreCase)));

    public Lender View(string id) => Lenders.First(l => l.Id == id);

    public Lender CreationForm() => new();

    public string Create(Lender form)
    {
        form.Id = new string(form.Name.ToLowerInvariant().Where(char.IsAsciiLetterLower).ToArray());
        Lenders.Add(form);
        return form.Id;
    }

    public void DeleteAllById(IReadOnlyList<string> selectedIds) =>
        Lenders.RemoveAll(l => selectedIds.Contains(l.Id));
}
