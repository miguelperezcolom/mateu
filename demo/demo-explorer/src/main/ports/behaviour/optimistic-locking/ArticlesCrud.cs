// The C# twin (Mateu.NET): a [Version] property — every save bumps it; a save carrying an older
// version than the stored one opens the reload / overwrite conflict dialog.
using Mateu.Uidl;

public class Article
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public int Stock { get; set; }
    [Version] public long Version { get; set; } = 1;
}

[UI("articles"), Title("Articles")]
public class ArticlesCrud : Crud<Article>
{
    static readonly List<Article> Store = Enumerable.Range(0, 50)
        .Select(i => new Article { Id = $"A-{1 + i}", Title = $"Article {1 + i}", Stock = i * 9 % 40 }).ToList();

    public override IEnumerable<Article> Fetch(string? search) => Store;

    public override Article? Get(string id) => Store.FirstOrDefault(a => a.Id == id);

    public override void Save(Article article)
    {
        var at = Store.FindIndex(a => a.Id == article.Id);
        if (at >= 0) Store[at] = article;
    }
}
