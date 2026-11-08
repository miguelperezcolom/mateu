// The C# twin (Mateu.NET): the same capability model — IListing alone is a grid, and each
// interface adds one thing (search box, filter bar, clickable rows + detail, New, Delete).
using Mateu.Uidl;

public class Book
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public int Pages { get; set; }
}

public class BookFilters
{
    public string? Author { get; set; }
    public NumberRange? Pages { get; set; }
}

[UI("books"), Title("Books")]
public class Books : IListing<Book>, ISearchable, IFilterable<BookFilters>,
    INavigable<Book, string>, ICreatable<Book, string>, IDeletable<string>
{
    static readonly List<Book> Store = Enumerable.Range(0, 50)
        .Select(i => new Book { Id = $"B-{100 + i}", Title = $"Book {i}", Author = $"Author {i % 10}", Pages = 120 + i * 53 % 900 })
        .ToList();

    public ListingData<Book> Search(SearchRequest request)
    {
        var filters = request.Filters<BookFilters>() ?? new BookFilters();
        return ListingData.From(Store
            .Where(b => $"{b.Title} {b.Author}".Contains(request.SearchText, StringComparison.OrdinalIgnoreCase))
            .Where(b => string.IsNullOrWhiteSpace(filters.Author) || b.Author.Contains(filters.Author, StringComparison.OrdinalIgnoreCase))
            .Where(b => filters.Pages is null || filters.Pages.Contains(b.Pages))
            .ToList());
    }

    public Book View(string id) => Store.First(b => b.Id == id);

    public Book CreationForm() => new();

    public string Create(Book form)
    {
        form.Id = $"B-{100 + Store.Count}";
        Store.Add(form);
        return form.Id;
    }

    public void DeleteAllById(IReadOnlyList<string> selectedIds) => Store.RemoveAll(b => selectedIds.Contains(b.Id));
}
