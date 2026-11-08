// The C# twin (Mateu.NET): the same archetype — typed facets from the Filters class (a text, an
// ISet<enum> multi-select, a DateRange) and PreSearchContent until the first search.
using Mateu.Uidl;

[UI("smart-search-page")]
public class LoanFinder : SmartSearchPage<LoanFinder.Filters, LoanFinder.Loan>
{
    public enum Classification { Painting, Sculpture, Print, Photograph }

    public class Filters
    {
        public string? Borrower { get; set; }
        public ISet<Classification>? Classifications { get; set; }
        public DateRange? Returns { get; set; }
    }

    public class Loan
    {
        public string Id { get; set; } = "";
        public string Artwork { get; set; } = "";
        public Classification Classification { get; set; }
        public string Borrower { get; set; } = "";
        public DateOnly Returns { get; set; }
    }

    static readonly List<Loan> Loans =
    [
        new() { Id = "L-101", Artwork = "Water Lilies", Classification = Classification.Painting, Borrower = "SMK Copenhagen", Returns = new(2027, 1, 15) },
        new() { Id = "L-102", Artwork = "The Thinker (cast)", Classification = Classification.Sculpture, Borrower = "Cleveland Museum", Returns = new(2026, 12, 2) },
        new() { Id = "L-103", Artwork = "The Great Wave", Classification = Classification.Print, Borrower = "British Museum", Returns = new(2027, 3, 30) },
        new() { Id = "L-104", Artwork = "Migrant Mother", Classification = Classification.Photograph, Borrower = "MoMA", Returns = new(2026, 11, 20) },
        new() { Id = "L-105", Artwork = "Self-Portrait", Classification = Classification.Painting, Borrower = "Van Gogh Museum", Returns = new(2027, 6, 1) },
        new() { Id = "L-106", Artwork = "Melencolia I", Classification = Classification.Print, Borrower = "Albertina", Returns = new(2027, 2, 10) },
    ];

    public override string? PageSubtitle() =>
        "Outgoing loans — search by artwork, borrower, classification or return date";

    public override IComponent? PreSearchContent() => new EmptyState
    {
        Icon = "🔎", Title = "Search to get started",
        Description = "Press Enter on an empty box to list every loan.",
    };

    public override ListingData<Loan> Search(SearchRequest request)
    {
        var f = request.Filters<Filters>();
        return ListingData.From(Loans
            .Where(l => $"{l.Artwork} {l.Borrower}".Contains(request.SearchText, StringComparison.OrdinalIgnoreCase))
            .Where(l => string.IsNullOrWhiteSpace(f?.Borrower)
                        || l.Borrower.Contains(f.Borrower, StringComparison.OrdinalIgnoreCase))
            .Where(l => f?.Classifications is not { Count: > 0 } || f.Classifications.Contains(l.Classification))
            .Where(l => f?.Returns is null || f.Returns.IsEmpty || f.Returns.Contains(l.Returns)));
    }
}
