using Mateu.Uidl;

namespace MateuStarter;

/// <summary>The home page, a <see cref="Welcome"/>: a hero with a title and an intro,
/// <see cref="Button"/> properties as its calls to action and [Panel] properties as tiles below.
/// A button runs the method named by its action id; returning a route ("/products") navigates.</summary>
[UI("home")]
public class Home : Welcome
{
    protected override string? HeroTitle => "My app";
    protected override string? HeroSubtitle => "Every screen here is declared in C#; Mateu renders it.";

    public Button BrowseProducts { get; } = new("Browse products", "browse") { Primary = true };

    [Panel(Title = "Products")]
    public Text ProductsTile { get; } = new("Search, create, edit and delete products: a whole CRUD derived from one class.");

    [Panel(Title = "Your next screen")]
    public Text Next { get; } = new("Write a class for it and add a [MenuItem] method returning it to Shell.");

    public string Browse() => "/products";
}
