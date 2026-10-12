using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>A FRESH deep link (consumedRoute "_empty", no type) to a menu route of the root app
/// renders the APP SHELL opening on that route — header and menu around the screen — instead of
/// the screen alone (Java parity). Exercised on whatever root app the test assembly registers.</summary>
public class MenuDeepLinkTests
{
    private static readonly MateuRegistry Registry = new(typeof(MenuDeepLinkTests).Assembly);

    private static (string Route, string Type) FirstLocalLeaf()
    {
        var app = (AppMetadataDto)new ReflectionMapper().MapApp(Registry.AppType!).Metadata;
        var leaf = app.Menu.First(m => m.Submenus.Count == 0 && !m.Remote && m.Rules.Count == 0
                                       && !string.IsNullOrEmpty(m.Route?.Trim('/'))
                                       && !string.IsNullOrEmpty(m.ServerSideType));
        return (leaf.Route!, leaf.ServerSideType!);
    }

    private static AppMetadataDto? DeepLink(string route)
    {
        var increment = new SyncHandler(Registry).Handle(new RunActionRqDto { Route = route, ConsumedRoute = "_empty" });
        return increment.Fragments.FirstOrDefault()?.Component is ClientSideComponentDto { Metadata: AppMetadataDto app }
            ? app
            : null;
    }

    [Fact]
    public void A_fresh_deep_link_to_a_menu_route_opens_the_shell_on_that_route()
    {
        var leaf = FirstLocalLeaf();
        var app = DeepLink(leaf.Route);
        Assert.NotNull(app);
        Assert.Equal(leaf.Route, app!.HomeRoute);
        Assert.Equal(leaf.Type, app.HomeServerSideType);
    }

    [Fact]
    public void A_fresh_deep_link_under_a_menu_route_opens_the_shell_too()
    {
        var leaf = FirstLocalLeaf();
        var route = leaf.Route.TrimEnd('/') + "/some-id";
        var app = DeepLink(route);
        Assert.NotNull(app);
        Assert.Equal(route, app!.HomeRoute);
        Assert.Equal(leaf.Type, app.HomeServerSideType);
    }

    [Fact]
    public void A_content_load_of_a_menu_route_is_not_the_shell()
    {
        var leaf = FirstLocalLeaf();
        var increment = new SyncHandler(Registry).Handle(new RunActionRqDto { Route = leaf.Route, ConsumedRoute = "" });
        Assert.False(increment.Fragments.FirstOrDefault()?.Component is ClientSideComponentDto { Metadata: AppMetadataDto });
    }
}
