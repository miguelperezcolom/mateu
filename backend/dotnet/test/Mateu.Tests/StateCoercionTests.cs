using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class CoercedProduct
{
    [System.ComponentModel.DataAnnotations.Required] public string Id { get; set; } = "";
    public double Price { get; set; }
    public int Units { get; set; }
    public bool Active { get; set; }
}

[UI("coerced-products"), Title("Coerced products")]
public class CoercedProducts : Crud<CoercedProduct>
{
    public static CoercedProduct? LastSaved;

    public override IEnumerable<CoercedProduct> Fetch(string? search) => [new() { Id = "p1", Price = 1 }];

    public override void Save(CoercedProduct entity) => LastSaved = entity;

    public override void Delete(string id) { }
}

/// <summary>The web number field's value is a STRING ("77"). Found walking the .NET starter in the
/// Vaadin renderer: editing a product's price and saving silently kept the old price, because the
/// binder read it with GetDouble and swallowed the failure.</summary>
public class StateCoercionTests
{
    private static JsonElement Json(string raw) => JsonDocument.Parse(raw).RootElement;

    [Fact]
    public void Numbers_and_booleans_typed_as_text_still_bind()
    {
        new SyncHandler(new MateuRegistry(typeof(StateCoercionTests).Assembly)).Handle(new RunActionRqDto
        {
            Route = "/coerced-products/p1/edit", ConsumedRoute = "", ActionId = "create",
            ServerSideType = typeof(CoercedProducts).FullName!,
            ComponentState = new Dictionary<string, object?>
            {
                ["id"] = Json("\"p1\""), ["price"] = Json("\"77.5\""), ["units"] = Json("\"3\""), ["active"] = Json("\"true\""),
            },
        });
        Assert.NotNull(CoercedProducts.LastSaved);
        Assert.Equal(77.5, CoercedProducts.LastSaved!.Price);
        Assert.Equal(3, CoercedProducts.LastSaved.Units);
        Assert.True(CoercedProducts.LastSaved.Active);
    }

    [Theory]
    [InlineData("/coerced-products/new", true)]
    [InlineData("/coerced-products/p1/edit", true)]
    [InlineData("/coerced-products/p1", false)]
    public void The_entity_form_carries_its_client_validations_while_editable(string route, bool expected)
    {
        // without them a required field only failed on the server ("Please fill: Id"), no field marked
        var component = Assert.IsType<ServerSideComponentDto>(new SyncHandler(new MateuRegistry(typeof(StateCoercionTests).Assembly))
            .Handle(new RunActionRqDto { Route = route, ConsumedRoute = "", ServerSideType = typeof(CoercedProducts).FullName! })
            .Fragments[0].Component);
        Assert.Equal(expected, component.Validations.Count > 0);
    }
}
