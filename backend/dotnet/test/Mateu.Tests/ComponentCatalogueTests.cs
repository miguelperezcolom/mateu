using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>Business components declared in code. They yield a composition only inside a test flow
/// that switched them on (an AsyncLocal), so the scan every handler of this assembly runs finds
/// nothing elsewhere.</summary>
public class TestBusinessComponents
{
    public static readonly AsyncLocal<bool> Enabled = new();

    [BusinessComponent("StaticBadge")]
    public static IComponent? Badge => Enabled.Value ? new Text("static badge") : null;

    [BusinessComponent("InstanceCard")]
    public IComponent? Card() => Enabled.Value ? new Card { Content = new Text("instance card") } : null;
}

public class TestComponentSupplier : IComponentCatalogSupplier
{
    public IReadOnlyList<ComponentEntry> BusinessComponents() => TestBusinessComponents.Enabled.Value
        ? [new ComponentEntry("Greeting", new Text("from the supplier")), new ComponentEntry("Extra", new Text("extra"))]
        : [];
}

[UI("component-refs"), Title("Component refs")]
public class ComponentRefsView : IComponentTreeSupplier
{
    public IComponent Component() => new VerticalLayout
    {
        Content = [new ComponentRef("Greeting"), new ComponentRef("Nope")],
    };

    public void Wave() { }
}

public class ComponentCatalogueTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Dir = Path.Combine(AppContext.BaseDirectory, "catalogue-specs");

    [Fact]
    public void The_authored_file_holds_named_compositions()
    {
        var catalog = ComponentRegistry.AuthoredFrom(Dir);
        // an entry with no component is ignored
        Assert.Equal(["AgencySelector", "Greeting"], catalog.Components.Select(c => c.Name));
        Assert.IsType<FormField>(catalog.Get("AgencySelector")!.Component);
    }

    [Fact]
    public void Code_declarations_and_suppliers_form_the_derived_half_and_authored_wins()
    {
        TestBusinessComponents.Enabled.Value = true;
        var derived = ComponentRegistry.DerivedFrom([typeof(TestBusinessComponents), typeof(TestComponentSupplier)]);
        Assert.Equal(["Extra", "Greeting", "InstanceCard", "StaticBadge"], derived.Components.Select(c => c.Name).Order());
        // the suppliers come last
        Assert.Equal(["Greeting", "Extra"], derived.Components.Skip(2).Select(c => c.Name));

        var registry = new ComponentRegistry(new MateuRegistry(typeof(ComponentRefsView).Assembly), Dir);
        var merged = registry.Catalog;
        Assert.IsType<VerticalLayout>(merged.Get("Greeting")!.Component); // authored replaced the supplier's
        Assert.NotNull(merged.Get("Extra"));
        Assert.NotNull(merged.Get("StaticBadge"));
        TestBusinessComponents.Enabled.Value = false;
        Assert.Empty(ComponentRegistry.DerivedFrom([typeof(TestBusinessComponents), typeof(TestComponentSupplier)]).Components);
    }

    private static SyncHandler Handler(ComponentCatalog catalog) =>
        new(new MateuRegistry(typeof(ComponentRefsView).Assembly), components: new ComponentRegistry(catalog));

    [Fact]
    public void A_reference_is_substituted_by_its_composition_and_its_actions_advertised()
    {
        var json = JsonSerializer.Serialize(Handler(ComponentRegistry.AuthoredFrom(Dir))
            .Handle(new RunActionRqDto { Route = "component-refs" }), Json);
        Assert.Contains("\"text\":\"Hello from YAML\"", json);
        Assert.Contains("\"actionId\":\"wave\"", json);
        Assert.Contains("\"id\":\"wave\"", json);
        // an unknown name is a visible placeholder, never an error; no reference reaches the wire
        Assert.Contains("Unknown business component: Nope", json);
        Assert.DoesNotContain("\"type\":\"ComponentRef\"", json);
    }

    [Fact]
    public void A_reference_cycle_ends_in_the_placeholder()
    {
        var cyclic = new ComponentCatalog([new ComponentEntry("Greeting", new ComponentRef("Greeting"))]);
        var json = JsonSerializer.Serialize(Handler(cyclic).Handle(new RunActionRqDto { Route = "component-refs" }), Json);
        Assert.Contains("Unknown business component: Greeting", json);
    }

    [Fact]
    public void The_app_carries_the_mapped_catalogue()
    {
        var json = JsonSerializer.Serialize(Handler(ComponentRegistry.AuthoredFrom(Dir)).Handle(new RunActionRqDto
        {
            ServerSideType = typeof(Wire.ContextApp).FullName,
        }), Json);
        Assert.Contains("\"components\":[{\"name\":\"AgencySelector\",\"component\":{", json);
        Assert.Contains("\"fieldId\":\"agency\"", json);
        Assert.Contains("\"name\":\"Greeting\"", json);
    }

    [Fact]
    public void A_yaml_layout_can_reference_a_business_component()
    {
        var parsed = YamlComponentBuilder.Parse("type: ComponentRef\nref: AgencySelector");
        Assert.Equal(new ComponentRef("AgencySelector"), parsed);
    }
}
