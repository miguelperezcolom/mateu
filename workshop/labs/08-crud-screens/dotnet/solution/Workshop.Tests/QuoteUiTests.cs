using Mateu.AspNetCore.Testing;
using Xunit;

namespace Workshop.Tests;

/// <summary>Workshop, lab 03: the screens you added in lab 01, tested the way a user uses them —
/// no browser, no server. The harness reads the very answer every renderer draws, so a passing
/// test holds on Vaadin, Redwood, the phone and the desktop app alike.</summary>
public class QuoteUiTests
{
    [Fact]
    public void The_menu_has_a_quote_entry()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        Assert.Contains("Quote", mateu.Open("/").Menu);
    }

    [Fact]
    public void Calculate_fills_in_the_total()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        var quote = mateu.Open("/quote");
        quote.Field("quantity").Set(3);
        quote.Field("unitPrice").Set(10.0);
        quote.Field("discount").Set(10);
        quote.Button("Calculate").Press();

        Assert.Equal(27.0, quote.Field("total").Value!.GetValue<double>());
        Assert.True(quote.Field("total").ReadOnly);
        Assert.Contains("27", quote.LastMessage.Text);
    }

    [Fact]
    public void The_stock_is_a_column_of_the_listing()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        Assert.Contains("stock", mateu.Open("/products").Listing().Columns);
    }

    [Fact]
    public void A_negative_stock_is_rejected()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        var form = mateu.Open("/products").Button("New").Press();
        form.Field("id").Set("P-200");
        form.Field("name").Set("Scale");
        form.Field("price").Set(25.0);
        form.Field("stock").Set(-1);
        form.Field("status").Set(ProductStatus.Available);
        form.Button("Save").Press();

        Assert.True(form.LastMessage.IsError);
        Assert.Null(new Products().Get("P-200"));
    }
}
