using Mateu.AspNetCore.Testing;
using Xunit;

namespace Workshop.Tests;

/// <summary>Workshop, lab 08: each screen of the Products CRUD shows its own fields — the creation
/// form, the detail and the editor.</summary>
public class ProductScreensUiTests
{
    [Fact]
    public void New_has_no_added_on_and_starts_as_available()
    {
        using var mateu = MateuTest.Start(typeof(Products).Assembly);
        var form = mateu.Open("/products").Button("New").Press();
        Assert.False(form.HasField("addedOn"));
        Assert.False(form.Field("id").ReadOnly);
        Assert.Equal("Available", form.Field("status").Value!.ToString());
    }

    [Fact]
    public void The_store_fills_in_what_new_does_not_show()
    {
        using var mateu = MateuTest.Start(typeof(Products).Assembly);
        var form = mateu.Open("/products").Button("New").Press();
        form.Field("id").Set("P-300");
        form.Field("name").Set("Tamper");
        form.Field("price").Set(19.5);
        form.Button("Save").Press();

        var products = new Products();
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), products.Get("P-300")!.AddedOn);
        products.Delete("P-300");
    }

    [Fact]
    public void The_detail_shows_added_on_and_the_editor_keeps_it_read_only()
    {
        using var mateu = MateuTest.Start(typeof(Products).Assembly);
        Assert.True(mateu.Open("/products/P-003").HasField("addedOn"));

        var editor = mateu.Open("/products/P-003/edit");
        Assert.True(editor.Field("id").ReadOnly);
        Assert.True(editor.Field("addedOn").ReadOnly);
        Assert.False(editor.Field("name").ReadOnly);
    }
}
