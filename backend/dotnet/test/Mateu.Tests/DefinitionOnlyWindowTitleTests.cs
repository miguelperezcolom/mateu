using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A definition-only page names the window like any page: its definition's title, else its route
/// humanized — the .NET mirror of Java's DefinitionOnlyWindowTitleSyncTest. It sent the RAW route.
/// </summary>
public class DefinitionOnlyWindowTitleTests
{
    private static SyncHandler Handler()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-title").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + "  - route: about\n    layout: about.yaml\n"
            + "  - route: sign-up\n    layout: form.yaml\n"
            + "  - route: customer\n    layout: customer.yaml\n    state: {name: Ada}\n"
            + "  - route: edit-notes\n    layout: customer.yaml\n");
        File.WriteAllText(Path.Combine(dir, "about.yaml"),
            "layout:\n  type: VerticalLayout\n  content:\n    - {type: Text, text: About this app}\n");
        File.WriteAllText(Path.Combine(dir, "form.yaml"), "type: Form\ntitle: Sign up\ncontent: []\n");
        File.WriteAllText(Path.Combine(dir, "customer.yaml"), "type: Form\ntitle: 'Customer ${state.name}'\ncontent: []\n");
        return new SyncHandler(new MateuRegistry(typeof(DefinitionOnlyWindowTitleTests).Assembly), specsDir: dir);
    }

    private static IEnumerable<object?> Titles(UIIncrementDto increment) =>
        increment.Commands.Where(c => c.Type == "SetWindowTitle").Select(c => c.Data);

    [Fact]
    public void A_definition_with_no_title_is_named_after_its_route() =>
        Assert.Equal(["About"], Titles(Handler().Handle(new RunActionRqDto { Route = "/about" })));

    [Fact]
    public void A_definition_names_the_window_with_its_own_title() =>
        Assert.Equal(["Sign up"], Titles(Handler().Handle(new RunActionRqDto { Route = "/sign-up" })));

    [Fact]
    public void A_title_reading_the_state_is_interpolated_or_falls_back_to_the_route()
    {
        var handler = Handler();
        Assert.Equal(["Customer Ada"], Titles(handler.Handle(new RunActionRqDto { Route = "/customer" })));
        Assert.Equal(["Edit notes"], Titles(handler.Handle(new RunActionRqDto { Route = "/edit-notes" })));
    }
}
