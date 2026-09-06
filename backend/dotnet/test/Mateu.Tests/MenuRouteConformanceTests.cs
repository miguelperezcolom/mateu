using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A menu leaf that points at a route which resolves to nothing is a bug — the safety a typed-class
/// menu reference used to give (the class had to exist). <see cref="MenuRouteConformance"/> finds
/// those so a CI/conformance check can fail on them instead of the app deriving a dead link
/// silently. The .NET mirror of Java's MenuRouteConformanceTest and Python's
/// test_menu_route_conformance.
/// </summary>
public class MenuRouteConformanceTests
{
    private static readonly RouteTable Known = new(new List<RouteEntry>
    {
        RouteEntry.Of("products", "X"),
        RouteEntry.Of("orders/:id", "Y"),
    });

    private static MenuItemDto Leaf(string label, string route) => new(label, route, "");

    [Fact]
    public void A_leaf_pointing_at_a_known_route_is_fine()
    {
        var dangling = MenuRouteConformance.DanglingRoutes(
            new List<MenuItemDto> { Leaf("Products", "products") }, Known);
        Assert.Empty(dangling);
    }

    [Fact]
    public void A_leaf_pointing_at_a_nonexistent_route_is_flagged()
    {
        var menu = new List<MenuItemDto> { Leaf("Products", "products"), Leaf("Ghost", "does-not-exist") };
        Assert.Equal(new[] { "does-not-exist" }, MenuRouteConformance.DanglingRoutes(menu, Known));
    }

    [Fact]
    public void Parameterised_routes_resolve()
    {
        Assert.Empty(MenuRouteConformance.DanglingRoutes(
            new List<MenuItemDto> { Leaf("Order", "orders/42") }, Known));
    }

    [Fact]
    public void Rule_separator_remote_external_and_placeholder_leaves_are_skipped()
    {
        var rule = Leaf("Ping", "whatever") with
        {
            Rules = new[] { new RuleDto("", "", null, null, null, null, "", "x") },
        };
        var separator = new MenuItemDto("", "", "") { Separator = true };
        var remote = new MenuItemDto("Remote", "remote/x", "") { Remote = true };
        var external = Leaf("Docs", "https://mateu.io/docs");
        var placeholder = new MenuItemDto("Section", "", "");

        Assert.Empty(MenuRouteConformance.DanglingRoutes(
            new List<MenuItemDto> { rule, separator, remote, external, placeholder }, Known));
    }

    [Fact]
    public void Recurses_into_submenus()
    {
        var group = new MenuItemDto("Group", "", "")
        {
            Submenus = new List<MenuItemDto> { Leaf("Products", "products"), Leaf("Ghost", "nope") },
        };
        Assert.Equal(new[] { "nope" },
            MenuRouteConformance.DanglingRoutes(new List<MenuItemDto> { group }, Known));
    }
}
