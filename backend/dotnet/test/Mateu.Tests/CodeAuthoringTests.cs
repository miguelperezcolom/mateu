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
    public void A_code_composed_rule_leaf_carries_its_rules_instead_of_a_route()
    {
        var approve = App().Menu.First(m => m.Label == "Approve");
        Assert.NotEmpty(approve.Rules);
    }
}
