using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class CoercedProduct
{
    [System.ComponentModel.DataAnnotations.Required] public string Id { get; set; } = "";
    [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue)] public double Price { get; set; }
    [System.ComponentModel.DataAnnotations.Range(1.5, 10)] public double Units { get; set; }
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

    [Fact]
    public void Range_bounds_are_written_invariantly_and_open_bounds_are_not_sent()
    {
        // on a decimal-comma server [Range(0, double.MaxValue)] became "<= 1,7976931348623157E+308",
        // not an expression: the client refused every Save of the .NET starter's products
        var before = System.Globalization.CultureInfo.CurrentCulture;
        System.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo("es-ES");
        try
        {
            var component = Assert.IsType<ServerSideComponentDto>(new SyncHandler(new MateuRegistry(typeof(StateCoercionTests).Assembly))
                .Handle(new RunActionRqDto { Route = "/coerced-products/new", ConsumedRoute = "", ServerSideType = typeof(CoercedProducts).FullName! })
                .Fragments[0].Component);
            var conditions = component.Validations.Select(v => v.Condition).ToList();
            Assert.Contains("state['price'] >= 0", conditions);
            Assert.DoesNotContain(conditions, c => c.StartsWith("state['price'] <="));
            Assert.Contains("state['units'] >= 1.5", conditions);
            Assert.Contains("state['units'] <= 10", conditions);
        }
        finally
        {
            System.Globalization.CultureInfo.CurrentCulture = before;
        }
    }
}
