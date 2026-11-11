using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>An action returning a <see cref="Uri"/> navigates, alone or inside a list — mirrors Java's
/// returned URI (issue #1167: <c>List.of(message, URI)</c> showed the message and never navigated).</summary>
[UI("uri-results")]
[Title("Uri results")]
public class UriResultsView : IComponentTreeSupplier
{
    public IComponent Component() => new Text("Uri results");

    [Action] public Uri Go() => new("/docs", UriKind.Relative);
    [Action] public object[] TellAndGo() => [new Message("Saved"), new Uri("/docs", UriKind.Relative)];
    [Action] public Uri Away() => new("https://example.com/help");
}

public class UriResultsTests
{
    private static UIIncrementDto Run(string actionId) =>
        new SyncHandler(new MateuRegistry(typeof(UriResultsView).Assembly)).Handle(new RunActionRqDto
        {
            Route = "uri-results",
            ActionId = actionId,
            ServerSideType = typeof(UriResultsView).FullName,
            InitiatorComponentId = "cmp-1",
        });

    private static List<object?> Navigations(UIIncrementDto inc) =>
        inc.Commands.Where(c => c.Type == "NavigateTo").Select(c => c.Data).ToList();

    [Fact]
    public void A_returned_uri_navigates() =>
        Assert.Equal(["/docs"], Navigations(Run("go")));

    [Fact]
    public void A_uri_inside_a_returned_list_navigates_and_the_message_shows()
    {
        var inc = Run("tellAndGo");
        Assert.Equal(["/docs"], Navigations(inc));
        Assert.Single(inc.Messages);
    }

    [Fact]
    public void An_absolute_uri_navigates_as_written() =>
        Assert.Equal(["https://example.com/help"], Navigations(Run("away")));
}
