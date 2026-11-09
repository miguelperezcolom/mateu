using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>Routed tabs beyond the conformance corpus (routed-tabs-*): the edges of Java's
/// RouteChains / FeatureFlagGate the corpus does not exercise — a hidden default tab, a negated
/// flag, the YAML keys.</summary>
public class RoutedTabsTests
{
    private sealed class AuditOff : IFeatureFlags
    {
        public bool? IsEnabled(string flag) => flag == "audit" ? false : null;
    }

    private static readonly Dictionary<string, object?> None = new();

    private static string EmptyDir()
    {
        var dir = Path.Combine(Path.GetTempPath(), "mateu-rt-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        return dir;
    }

    [Fact]
    public void A_hidden_default_tab_falls_back_to_the_first_visible_one()
    {
        var routes = new RouteRegistry(EmptyDir(),
        [
            new RouteEntry("partners/:id", null, "x.Master", None, None,
                Children:
                [
                    RouteEntry.Of("orders", "x.Orders"),
                    RouteEntry.Of("notes", "x.Notes") with { Show = "audit" },
                ]) { DefaultChild = "notes" },
        ]);
        using var _ = RoutedTabs.Begin("/partners/3", [new AuditOff()], routes, new MateuRegistry(typeof(RoutedTabsTests).Assembly));
        Assert.Equal("/partners/3/orders", RoutedTabs.DefaultChildPath(routes, "/partners/3"));
        Assert.Equal(["/partners/3/orders"], RoutedTabs.VisibleChildrenOf(routes, "/partners/3").Select(c => c.Path));
    }

    [Fact]
    public void A_negated_flag_shows_while_the_flag_is_off_and_an_unknown_flag_is_on()
    {
        var routes = new RouteRegistry(EmptyDir());
        using var _ = RoutedTabs.Begin(null, [new AuditOff()], routes, new MateuRegistry(typeof(RoutedTabsTests).Assembly));
        Assert.True(RoutedTabs.Shows("!audit"));
        Assert.False(RoutedTabs.Shows("audit"));
        Assert.True(RoutedTabs.Shows("anything-else"));
        Assert.True(RoutedTabs.Shows(""));
    }

    [Fact]
    public void An_inline_orchestrator_with_no_route_fails_where_the_cause_is()
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(Wire.RtInlineTrap).Assembly));
        var error = Assert.ThrowsAny<Exception>(() => handler.Handle(new Mateu.Dtos.RunActionRqDto
        {
            Route = "/conformance/rt/trap",
            ServerSideType = typeof(Wire.RtInlineTrap).FullName,
        }));
        Assert.Contains("no route of its own", error.ToString());
    }

    private sealed class BadContextHost
    {
        public string? Id { get; set; } = "7";
        [Subresource(Context = ["vcnId=nope"])] public Wire.RtSubnets? Subnets { get; set; }
    }

    [Fact]
    public void A_subresource_context_naming_a_missing_host_property_is_a_configuration_error()
    {
        var p = typeof(BadContextHost).GetProperty(nameof(BadContextHost.Subnets))!;
        var error = Assert.Throws<InvalidOperationException>(() => ReflectionMapper.SubresourceContext(p, new BadContextHost()));
        Assert.Contains("nope", error.Message);
    }

    [Fact]
    public void Routes_yaml_carries_default_child_and_show()
    {
        var dir = EmptyDir();
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: customers/:customerId
                viewModel: x.Master
                defaultChild: notes
                children:
                  - route: orders
                    viewModel: x.Orders
                  - route: notes
                    viewModel: x.Notes
                    show: '!audit'
            """);
        var routes = new RouteRegistry(dir);
        Assert.Equal("notes", routes.Match("customers/7")!.Entry.DefaultChild);
        Assert.Equal("!audit", routes.Match("customers/7/notes")!.Entry.Show);
        using var _ = RoutedTabs.Begin("/customers/7", [new AuditOff()], routes, new MateuRegistry(typeof(RoutedTabsTests).Assembly));
        Assert.Equal("/customers/7/notes", RoutedTabs.DefaultChildPath(routes, "/customers/7"));
    }
}
