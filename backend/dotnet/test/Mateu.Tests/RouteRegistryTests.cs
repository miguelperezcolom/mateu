using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

// ── Stubs referenced by specs/ui/routes.yaml ──────────────────────────────────────────────────

public class RegistryTickets { public string? Status { get; set; } }

public class RegistryBooks { }

public class RegistryFilms { }

public class RegistryOrderDetail { }

public class RegistryNewOrder { }

/// <summary>
/// The mount's route registry (<c>specs/ui/routes.yaml</c>) — the .NET mirror of Java's
/// RouteRegistryTest + RouteParamPrecedenceTest + DefinitionFromRegistryTest, and of Python's
/// test_route_registry.
///
/// <para>The precedence must match the Java server, both web renderers and the Python port exactly,
/// or the same route would behave differently depending on which backend and which renderer serve
/// it:</para>
///
/// <para><c>fixed &gt; client state &gt; path &gt; defaults</c></para>
/// </summary>
public class RouteRegistryTests
{
    private static readonly string SpecsDir = Path.Combine(
        AppContext.BaseDirectory, "specs", "ui");

    private static RouteRegistry Registry() => new(SpecsDir);

    // ── the table ────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void The_authored_table_is_read_from_the_yaml_next_to_the_definitions()
    {
        var routes = Registry().Authored().Routes.Select(r => r.Route).ToList();
        Assert.Contains("tickets", routes);
        Assert.Contains("about", routes);
    }

    [Fact]
    public void Two_routes_share_one_screen_and_are_told_apart_by_a_pinned_parameter()
    {
        var registry = Registry();
        Assert.Equal("Mateu.Tests.RegistryTickets", registry.Match("tickets/open")!.Entry.ViewModel);
        Assert.Equal("Mateu.Tests.RegistryTickets", registry.Match("tickets/closed")!.Entry.ViewModel);
        Assert.Equal("open", registry.Match("tickets/open")!.Params(null)["status"]);
        Assert.Equal("closed", registry.Match("tickets/closed")!.Params(null)["status"]);
    }

    [Fact]
    public void A_pinned_parameter_is_not_overridable_by_the_request()
    {
        // The security-relevant case: widening the pinned scope via the request must not work.
        var incoming = new Dictionary<string, object?> { ["status"] = "all" };
        Assert.Equal("open", Registry().Match("tickets/open")!.Params(incoming)["status"]);
    }

    [Fact]
    public void A_seeded_parameter_is_overridable_by_the_request()
    {
        var match = Registry().Match("tickets")!;
        Assert.Equal("all", match.Params(null)["status"]);
        Assert.Equal(1, Convert.ToInt32(match.Params(null)["page"]));

        var incoming = new Dictionary<string, object?> { ["status"] = "closed" };
        Assert.Equal("closed", match.Params(incoming)["status"]);
        Assert.Equal(1, Convert.ToInt32(match.Params(incoming)["page"]));
    }

    [Fact]
    public void A_path_parameter_reaches_the_params()
    {
        Assert.Equal("42", Registry().Match("orders/42")!.Params(null)["id"]);
    }

    [Fact]
    public void A_static_route_is_not_swallowed_by_its_parameterised_sibling()
    {
        // orders/:id is declared BEFORE orders/new in the fixture on purpose: matching must not
        // depend on declaration order.
        Assert.Equal("Mateu.Tests.RegistryNewOrder", Registry().Match("orders/new")!.Entry.ViewModel);
        Assert.Equal("Mateu.Tests.RegistryOrderDetail", Registry().Match("orders/42")!.Entry.ViewModel);
    }

    [Fact]
    public void A_route_can_have_a_definition_and_no_view_model()
    {
        var entry = Registry().Match("about")!.Entry;
        Assert.Equal("about.yaml", entry.Definition);
        Assert.Null(entry.ViewModel);
    }

    [Fact]
    public void A_path_that_matches_nothing_resolves_to_nothing()
    {
        Assert.Null(Registry().Match("customers"));
    }

    [Fact]
    public void Leading_and_trailing_slashes_carry_no_meaning()
    {
        Assert.NotNull(Registry().Match("/tickets/open"));
        Assert.NotNull(Registry().Match("tickets/open/"));
    }

    [Fact]
    public void A_missing_routes_yaml_is_an_empty_table_rather_than_a_failure()
    {
        Assert.Empty(new RouteRegistry(Path.Combine(SpecsDir, "does-not-exist")).Authored().Routes);
    }

    // ── the merge ────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void An_authored_entry_replaces_the_derived_one_for_the_same_route()
    {
        var derived = new RouteTable(new List<RouteEntry> { RouteEntry.Of("tickets", "Generated.Other") });
        var merged = Registry().Authored().MergedOver(derived);
        Assert.Equal("Mateu.Tests.RegistryTickets", merged.Match("tickets")!.Entry.ViewModel);
    }

    [Fact]
    public void Derived_entries_the_yaml_does_not_mention_survive_the_merge()
    {
        var derived = new RouteTable(new List<RouteEntry> { RouteEntry.Of("customers", "Generated.Customers") });
        var merged = Registry().Authored().MergedOver(derived);
        Assert.Equal("Generated.Customers", merged.Match("customers")!.Entry.ViewModel);
    }

    // ── the definition ───────────────────────────────────────────────────────────────────────

    [Fact]
    public void One_definition_serves_two_routes_each_binding_its_own_view_model()
    {
        // The case the <route>.yaml convention cannot express, and the reason a shared definition
        // must declare no modelView of its own.
        var loader = new YamlSpecLoader(SpecsDir, Registry());
        Assert.Equal("Mateu.Tests.RegistryBooks", loader.LoadSpec("catalog/books")!.ModelView);
        Assert.Equal("Mateu.Tests.RegistryFilms", loader.LoadSpec("catalog/films")!.ModelView);
        Assert.NotNull(loader.LoadSpec("catalog/books")!.Layout);
    }

    [Fact]
    public void A_definition_only_route_has_a_layout_and_no_model_view()
    {
        var spec = new YamlSpecLoader(SpecsDir, Registry()).LoadSpec("about")!;
        Assert.NotNull(spec.Layout);
        Assert.Null(spec.ModelView);
    }
}
