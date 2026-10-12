using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A definition-only page whose route SEEDS it (<c>state:</c>, <c>fixedParams:</c>) carries the
/// seeds as its state — the .NET mirror of Java's SeededYamlPage and Python's
/// test_definition_only_seeds. The bare layout used to drop them (${state.x} rendered blank).
/// </summary>
public class DefinitionOnlySeedsTests
{
    [Fact]
    public void A_routes_state_and_fixed_params_reach_a_definition_only_page()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-seeds").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + "  - route: greet\n    layout: page.yaml\n    state: {greeting: Hola}\n"
            + "  - route: flavour/beta\n    layout: page.yaml\n    fixedParams: {flavour: beta}\n");
        File.WriteAllText(Path.Combine(dir, "page.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n    - {type: Text, text: 'Greeting: ${state.greeting}'}\n");
        var handler = new SyncHandler(new MateuRegistry(typeof(DefinitionOnlySeedsTests).Assembly), specsDir: dir);

        var greet = handler.Handle(new RunActionRqDto { Route = "/greet" }).Fragments[0];
        var greetState = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(greet.State);
        Assert.Equal("Hola", greetState["greeting"]?.ToString());

        var pinned = handler.Handle(new RunActionRqDto
        {
            Route = "/flavour/beta",
            ComponentState = new Dictionary<string, object?> { ["flavour"] = "alpha" },
        }).Fragments[0];
        var pinnedState = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(pinned.State);
        Assert.Equal("beta", pinnedState["flavour"]?.ToString()); // a pin is not a suggestion
    }
}
