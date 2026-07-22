using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures: the C# mirror of Java's AutoPageSyncTest ────────────────────────────────────────

[UI("inferred-dashboard"), Title("Ops"), AutoPage]
public class InferredOps
{
    public MetricCard Revenue { get; } = new() { Title = "Revenue", Value = "1.2", Unit = "M€" };
    public MetricCard Occupancy { get; } = new() { Title = "Occupancy", Value = "87%" };

    [Panel(Title = "Monthly sales")]
    public Text Sales { get; } = new("sales chart placeholder");
}

[UI("plain-metrics"), Title("Ops, uninferred")]
public class PlainOps
{
    public MetricCard Revenue { get; } = new() { Title = "Revenue", Value = "1.2" };
    public string? Note { get; set; } = "still a plain form";
}

[UI("inferred-welcome"), Title("Front desk"), AutoPage]
public class InferredHome
{
    public Button Start { get; } = new("Start check-in", "startCheckin");
    public Button Explore { get; } = new("Explore rooms", "exploreRooms");

    [Panel(Title = "Today")]
    public Text Today { get; } = new("42 arrivals expected");
}

[UI("form-with-button"), Title("Not a landing"), AutoPage]
public class FormWithButton
{
    public Button Submit { get; } = new("Submit", "submit");
    public string? Name { get; set; } // a data property: a form that happens to have a button
}

/// <summary>Page-level inference ([AutoPage]): a plain class with MetricCard properties composes
/// the Dashboard archetype; a class with only Button properties and panel components composes the
/// Welcome landing (hero title from [Title]); one data property keeps the class a form, and
/// without the attribute nothing changes.</summary>
public class AutoPageTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(InferredOps).Assembly));

    private static ServerSideComponentDto Server(string route)
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        foreach (var fragment in increment.Fragments)
            if (fragment.Component is ServerSideComponentDto server)
                return server;
        throw new InvalidOperationException("no server side component for " + route);
    }

    private static IEnumerable<ClientSideComponentDto> Walk(ComponentDto node)
    {
        if (node is ServerSideComponentDto server)
        {
            foreach (var child in server.Children ?? [])
                foreach (var found in Walk(child)) yield return found;
            yield break;
        }
        if (node is not ClientSideComponentDto client) yield break;
        yield return client;
        foreach (var child in client.Children ?? [])
            foreach (var found in Walk(child)) yield return found;
    }

    private static List<ClientSideComponentDto> OfType<T>(string route) where T : ComponentMetadataDto =>
        Walk(Server(route)).Where(c => c.Metadata is T).ToList();

    [Fact]
    public void Auto_page_class_with_metric_cards_composes_the_dashboard_archetype()
    {
        Assert.NotEmpty(OfType<DashboardLayoutMetadataDto>("inferred-dashboard"));

        var scoreboard = Assert.Single(OfType<ScoreboardMetadataDto>("inferred-dashboard"));
        var titles = scoreboard.Children!
            .Cast<ClientSideComponentDto>()
            .Select(c => ((MetricCardMetadataDto)c.Metadata).Title)
            .ToList();
        Assert.Equal(["Revenue", "Occupancy"], titles);

        var panel = Assert.Single(OfType<DashboardPanelMetadataDto>("inferred-dashboard"));
        Assert.Equal("Monthly sales", ((DashboardPanelMetadataDto)panel.Metadata).Title);

        var server = Server("inferred-dashboard");
        Assert.Equal(typeof(InferredOps).FullName, server.ServerSideType);
        Assert.Equal("dashboard", server.PageType);
    }

    [Fact]
    public void Auto_page_class_with_only_buttons_and_panels_composes_the_welcome_landing()
    {
        var hero = Assert.Single(OfType<HeroSectionMetadataDto>("inferred-welcome"));
        var heroMeta = (HeroSectionMetadataDto)hero.Metadata;
        Assert.Equal("Front desk", heroMeta.Title);
        Assert.True(heroMeta.Centered);

        var ctas = hero.Children!
            .Cast<ClientSideComponentDto>()
            .Where(c => c.Metadata is ButtonMetadataDto)
            .Select(c => (ButtonMetadataDto)c.Metadata)
            .ToList();
        Assert.Equal(["Start check-in", "Explore rooms"], ctas.Select(c => c.Label).ToList());
        Assert.Equal("startCheckin", ctas[0].ActionId);

        var tile = Assert.Single(OfType<DashboardPanelMetadataDto>("inferred-welcome"));
        Assert.Equal("Today", ((DashboardPanelMetadataDto)tile.Metadata).Title);

        Assert.Equal("landing", Server("inferred-welcome").PageType);
    }

    [Fact]
    public void A_data_property_keeps_an_auto_page_class_with_buttons_as_a_plain_form()
    {
        Assert.Empty(OfType<HeroSectionMetadataDto>("form-with-button"));
        Assert.Equal("form", Server("form-with-button").PageType);
    }

    [Fact]
    public void Without_auto_page_the_same_shape_keeps_rendering_as_a_plain_form()
    {
        Assert.Empty(OfType<DashboardLayoutMetadataDto>("plain-metrics"));
        Assert.Empty(OfType<ScoreboardMetadataDto>("plain-metrics"));
    }
}
