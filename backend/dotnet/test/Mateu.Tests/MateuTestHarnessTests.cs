using System.ComponentModel.DataAnnotations;
using Mateu.AspNetCore.Testing;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public enum HarnessStatus { Available, OutOfStock }

public class HarnessProduct
{
    [Required, EditableOnlyWhenCreating] public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
    public double Price { get; set; }
    public HarnessStatus Status { get; set; }

    public override string ToString() => string.IsNullOrWhiteSpace(Name) ? "New product" : Name;
}

/// <summary>The crud the harness drives: a static store, like the starter's.</summary>
[UI("harness-products"), Title("Products")]
public class HarnessProducts : Crud<HarnessProduct>
{
    internal static readonly List<HarnessProduct> Store = [];

    internal static void Reset()
    {
        Store.Clear();
        Store.Add(new() { Id = "P-001", Name = "Espresso machine", Price = 249, Status = HarnessStatus.Available });
        Store.Add(new() { Id = "P-002", Name = "Coffee grinder", Price = 89.5, Status = HarnessStatus.Available });
        Store.Add(new() { Id = "P-003", Name = "Milk frother", Price = 39.9, Status = HarnessStatus.OutOfStock });
    }

    public override IEnumerable<HarnessProduct> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search) ? Store : Store.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase));

    public override HarnessProduct? Get(string id) => Store.FirstOrDefault(p => p.Id == id);

    public override void Save(HarnessProduct product)
    {
        Store.RemoveAll(p => p.Id == product.Id);
        Store.Add(product);
    }

    public override void Delete(string id) => Store.RemoveAll(p => p.Id == id);
}

/// <summary>A plain form: an action with a message, an access rule.</summary>
[UI("harness-greeting"), Title("Greeting")]
public class HarnessGreeting
{
    [Required] public string Name { get; set; } = "";

    [EyesOnly(Roles = ["admin"])] public string Note { get; set; } = "only admins";

    [Button]
    public Message Greet() => Message.Success("Hello " + Name + "!");
}

[Collection(nameof(ProcessWideStateCollection))]
public class MateuTestHarnessTests : IDisposable
{
    private readonly MateuTest _mateu;

    public MateuTestHarnessTests()
    {
        HarnessProducts.Reset();
        _mateu = MateuTest.Start(typeof(HarnessProducts).Assembly);
    }

    public void Dispose() => _mateu.Dispose();

    [Fact]
    public void A_listing_shows_its_first_page()
    {
        var listing = _mateu.Open("/harness-products").Listing();
        Assert.Equal(3, listing.Total);
        Assert.Equal("Espresso machine", listing.Row(0)["name"]);
    }

    [Fact]
    public void A_listing_searches()
    {
        var screen = _mateu.Open("/harness-products");
        screen.Listing().Search("grinder");
        Assert.Equal(["Coffee grinder"], screen.Listing().Rows.Select(r => r["name"]));
    }

    [Fact]
    public void A_crud_creates_a_record()
    {
        var screen = _mateu.Open("/harness-products").Button("New").Press();
        screen.Field("id").Set("P-009");
        screen.Field("Name").Set("Tamper");
        screen.Field("price").Set(19.5);
        screen.Field("status").Set(HarnessStatus.Available);
        screen.Button("Save").Press();
        Assert.Equal("Tamper", HarnessProducts.Store.Single(p => p.Id == "P-009").Name);
    }

    [Fact]
    public void A_row_opens_its_record()
    {
        var screen = _mateu.Open("/harness-products");
        screen.Listing().Row("Milk frother").Open();
        Assert.Equal("Milk frother", screen.Field("name").Text);
    }

    [Fact]
    public void A_form_action_shows_a_message()
    {
        var screen = _mateu.Open("/harness-greeting");
        screen.Field("name").Set("Ada");
        screen.Button("Greet").Press();
        Assert.Equal("Hello Ada!", screen.LastMessage.Text);
    }

    [Fact]
    public void Access_rules_follow_the_user()
    {
        Assert.False(_mateu.Open("/harness-greeting").HasField("note"));
        Assert.True(_mateu.Open("/harness-greeting", MateuTest.User("ada", "admin")).HasField("note"));
    }

    [Fact]
    public void A_missing_element_says_what_there_is()
    {
        var screen = _mateu.Open("/harness-greeting");
        var error = Assert.Throws<MateuTestException>(() => screen.Field("nope"));
        Assert.Contains("name", error.Message);
    }
}
