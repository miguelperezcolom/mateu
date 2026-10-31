using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures ──────────────────────────────────────────────────────────────────────────────────

/// <summary>Routes authored IN CODE, the .NET mirror of Java's SuppliedRoutes fixture.</summary>
public class SuppliedRoutesFixture : IRouteEntrySupplier
{
    public IReadOnlyList<RouteEntry> Routes() => new List<RouteEntry>
    {
        // A plain code-authored route backed by a view model.
        RouteEntry.Of("supplied/widget", "Mateu.Tests.SuppliedWidget"),
        // The case an attribute cannot express: a parameter the entry pins.
        new("supplied/pinned", null, "Mateu.Tests.SuppliedWidget",
            new Dictionary<string, object?> { ["mode"] = "compact" }, new Dictionary<string, object?>()),
        // A viewModel-less rich route: a definition plus client-side data, authored in code.
        new("supplied/static", "about.yaml", null,
            new Dictionary<string, object?>(), new Dictionary<string, object?>()),
        // A collider with routes.yaml (tickets/open → RegistryTickets): the authored YAML must win.
        RouteEntry.Of("tickets/open", "Mateu.Tests.SuppliedWidget"),
    };
}

public class SuppliedWidget { public string? Name { get; set; } }

/// <summary>An app whose shell and menu are composed IN CODE via IAppSupplier (mirror of Java's
/// CodeAuthoredApp): a route link, a submenu and a rule link, all built in code — no [MenuItem].</summary>
[App("Code App")]
public class CodeAuthoredApp : IAppSupplier
{
    public AppShell GetApp() => new("Code App", new List<MenuItemDto>
    {
        new("Home", "/codeapp/home", ""),
        new("Reports", "", "")
        {
            Submenus = new List<MenuItemDto> { new("Sales", "/codeapp/reports/sales", "") },
        },
        new("Approve", "", "")
        {
            Rules = new List<RuleDto> { new("", "RunAction", null, null, null, null, "", "approve") },
        },
    })
    {
        HomeRoute = "/codeapp/home",
        Variant = "HAMBURGUER_MENU",
    };
}

/// <summary>A code-authored shell on a NON-ROOT mount whose entries are spelled with the mount
/// (/mountedcodeapp/home), under their group (/mountedcodeapp/reports/sales in
/// /mountedcodeapp/reports) or mount-relative (/settings) — each must be routed once.</summary>
[UI("mountedcodeapp"), App("Mounted code app")]
public class MountedCodeApp : IAppSupplier
{
    public AppShell GetApp() => new("Mounted code app", new List<MenuItemDto>
    {
        new("Home", "/mountedcodeapp/home", ""),
        new("Reports", "/mountedcodeapp/reports", "")
        {
            Submenus = new List<MenuItemDto> { new("Sales", "/mountedcodeapp/reports/sales", "") },
        },
        new("Settings", "/settings", ""),
    })
    {
        HomeRoute = "/mountedcodeapp/home",
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────────────────────

/// <summary>
/// Authoring routes and apps IN CODE — the .NET mirror of Java's RouteEntrySupplierSyncTest +
/// AppSupplierSyncTest. IRouteEntrySupplier is the programmatic half of the authored route table
/// (routes.yaml still wins on a collision); IAppSupplier/IMenuSupplier compose the app shell + menu
/// in code, overriding the static attributes.
/// </summary>
public class CodeAuthoringTests
{
    private static readonly string SpecsDir = Path.Combine(AppContext.BaseDirectory, "specs", "ui");

    private static RouteRegistry Supplied() =>
        new(SpecsDir, RouteRegistry.Flatten(new SuppliedRoutesFixture().Routes()));

    [Fact]
    public void A_code_supplied_route_resolves_to_its_view_model()
    {
        var match = Supplied().Match("supplied/widget");
        Assert.NotNull(match);
        Assert.Equal("Mateu.Tests.SuppliedWidget", match!.Entry.ViewModel);
    }

    [Fact]
    public void A_code_supplied_route_pins_parameters_attributes_cannot_express()
    {
        var match = Supplied().Match("supplied/pinned");
        Assert.Equal("compact", match!.Entry.FixedParams["mode"]);
    }

    [Fact]
    public void A_code_supplied_route_can_have_no_view_model()
    {
        var match = Supplied().Match("supplied/static");
        Assert.Equal("about.yaml", match!.Entry.Definition);
        Assert.Null(match.Entry.ViewModel);
    }

    [Fact]
    public void Routes_yaml_wins_over_the_code_supplier()
    {
        // routes.yaml maps tickets/open to RegistryTickets; the supplier's collider loses.
        var match = Supplied().Match("tickets/open");
        Assert.Equal("Mateu.Tests.RegistryTickets", match!.Entry.ViewModel);
    }

    private static AppMetadataDto App() =>
        (AppMetadataDto)new ReflectionMapper().MapApp(typeof(CodeAuthoredApp)).Metadata;

    [Fact]
    public void An_app_and_its_menu_composed_in_code_reach_the_wire()
    {
        var app = App();
        Assert.Equal("Code App", app.Title);
        Assert.Contains(app.Menu, m => m.Label == "Home");
        Assert.Contains(app.Menu, m => m.Label == "Reports");
        Assert.Contains(app.Menu, m => m.Label == "Approve");
    }

    [Fact]
    public void A_code_composed_submenu_nests_its_children()
    {
        var reports = App().Menu.First(m => m.Label == "Reports");
        Assert.Contains(reports.Submenus, m => m.Label == "Sales");
    }

    [Fact]
    public void Absolute_and_mount_relative_entries_are_routed_once_under_the_mount()
    {
        var menu = ((AppMetadataDto)new ReflectionMapper().MapApp(typeof(MountedCodeApp)).Metadata).Menu;
        var home = menu.First(m => m.Label == "Home");
        Assert.Equal("/mountedcodeapp/home", home.Route);
        Assert.Equal("/home", home.Path);
        var reports = menu.First(m => m.Label == "Reports");
        Assert.Equal("/mountedcodeapp/reports", reports.Route);
        Assert.Equal("/mountedcodeapp/reports/sales", reports.Submenus.Single().Route);
        Assert.Equal("/mountedcodeapp/settings", menu.First(m => m.Label == "Settings").Route);
    }

    [Fact]
    public void An_entry_named_like_its_group_goes_below_it()
    {
        // a users CRUD in a "users" section: a child that shares the name, not the group itself
        Assert.Equal("/users/users", ReflectionMapper.Relative("", "/users", "/users"));
        Assert.Equal("/users/roles", ReflectionMapper.Relative("", "/users", "/roles"));
        Assert.Equal("/users/roles", ReflectionMapper.Relative("", "/users", "/users/roles"));
    }

    [Fact]
    public void A_code_composed_rule_leaf_carries_its_rules_instead_of_a_route()
    {
        var approve = App().Menu.First(m => m.Label == "Approve");
        Assert.NotEmpty(approve.Rules);
    }
}

/// <summary>A [MenuItem] app naming its landing route with IHomeRouteSupplier (Java's
/// HomeRouteSupplier), the shape of the .NET starter's Shell.</summary>
[App("Landing App")]
public class LandingApp : IHomeRouteSupplier
{
    [MenuItem("Welcome")] public LandingWelcome Welcome() => new();
    [MenuItem("Orders")] public LandingOrders Orders() => new();

    public string HomeRoute() => "welcome";
}

/// <summary>The same app without the supplier.</summary>
[App("Landing App")]
public class LandingAppWithoutHome
{
    [MenuItem("Welcome")] public LandingWelcome Welcome() => new();
    [MenuItem("Orders")] public LandingOrders Orders() => new();
}

public class LandingWelcome { public string? Name { get; set; } }

public class LandingOrders { public string? Name { get; set; } }

/// <summary>An IHomeRouteSupplier names the route a [MenuItem] app opens on: the wire carries it as
/// the home route, with the view model of the menu entry it leads to — without it the app opens on
/// its first menu item.</summary>
public class HomeRouteSupplierTests
{
    private static AppMetadataDto Map(Type app) =>
        (AppMetadataDto)new ReflectionMapper().MapApp(app).Metadata;

    [Fact]
    public void A_supplied_home_route_and_its_view_model_reach_the_wire()
    {
        var app = Map(typeof(LandingApp));
        Assert.Equal("welcome", app.HomeRoute);
        Assert.Equal(typeof(LandingWelcome).FullName, app.HomeServerSideType);
    }

    [Fact]
    public void Without_a_supplier_a_menu_item_app_lands_on_its_first_menu_item()
    {
        // the documented default (Java's AppMapper.withFirstMenuItemAsHome) — it used to be the
        // "_no_home_route" sentinel, an empty page on every renderer but Redwood
        var app = Map(typeof(LandingAppWithoutHome));
        Assert.Equal(app.Menu[0].Route, app.HomeRoute);
        Assert.NotEqual("_no_home_route", app.HomeRoute);
        Assert.Equal(app.Menu[0].ServerSideType, app.HomeServerSideType);
    }
}

/// <summary>A view the mount-absolute route test reaches through an existing app's mount.</summary>
[UI("mounted-probe")]
public class MountedProbe { public string? Name { get; set; } }

/// <summary>An app mounted under a sub-path accepts routes WITH its mount, as Java does (there the
/// mount is stripped): a notification / global-search hit or a deep link names
/// "/conformance/app-in-code/mounted-probe", and the port answered "Route not found".</summary>
public class MountAbsoluteRouteTests
{
    [Fact]
    public void A_route_carrying_an_apps_mount_resolves_like_the_mount_relative_one()
    {
        var registry = new MateuRegistry(typeof(MountedProbe).Assembly);
        Assert.Equal(typeof(MountedProbe), registry.Resolve(null, "/conformance/app-in-code/mounted-probe"));
        Assert.Equal(typeof(MountedProbe), registry.ResolveByPrefix("/conformance/app-in-code/mounted-probe/7")?.Type);
        Assert.Null(registry.Resolve(null, "/not-a-mount/mounted-probe"));
    }
}
