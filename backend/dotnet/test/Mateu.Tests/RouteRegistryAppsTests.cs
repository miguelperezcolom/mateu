using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A deployment can ship a 100%-DSL app — a <c>type: UI</c> mount declared in <c>specs/ui/**</c> with
/// NO C# class — and it is announced by <see cref="RouteRegistry.Apps"/> exactly like a class-based
/// <c>[Ui]</c> app. Two producers, one table (authored — the DSL mount — wins on a base-path
/// collision), the same rule the routes and sources use. The .NET mirror of Java's
/// RouteRegistryAppsTest and Python's test_route_registry_apps.
/// </summary>
public class RouteRegistryAppsTests
{
    private static RouteRegistry DslMountRegistry() =>
        new(Path.Combine(AppContext.BaseDirectory, "specs", "dsl-mount"));

    [Fact]
    public void A_class_less_dsl_mount_is_announced_as_an_app()
    {
        var apps = DslMountRegistry().Apps();

        var backOffice = apps.Single(a => a.Route == "back-office");
        Assert.True(backOffice.IsDsl()); // no C# class backs it
        Assert.Null(backOffice.ClassName);
        Assert.Equal("back-office-shell.yaml", backOffice.Definition);
    }

    [Fact]
    public void A_dsl_mount_wins_over_a_class_at_the_same_base_path()
    {
        var derived = new[] { new RouteRegistry.AppRef("back-office", "Some.Legacy.BackOffice", null) };

        var apps = DslMountRegistry().Apps(derived);

        var backOffice = apps.Single(a => a.Route == "back-office");
        Assert.True(backOffice.IsDsl()); // authored wins — the class is replaced
        Assert.Null(backOffice.ClassName);
    }

    [Fact]
    public void A_derived_class_with_no_dsl_mount_survives_the_union()
    {
        var derived = new[] { new RouteRegistry.AppRef("shop", "Demo.Shop", null) };

        var apps = DslMountRegistry().Apps(derived);

        var shop = apps.Single(a => a.Route == "shop");
        Assert.False(shop.IsDsl());
        Assert.Equal("Demo.Shop", shop.ClassName);
    }

    // ── key-level merge of the seeded scopes (mirrors Java's seedsOverrideAtTheKeyLevelNotByDeepMerge) ──

    [Fact]
    public void Seeds_override_at_the_key_level_not_by_deep_merge()
    {
        // The four scopes merge by KEY, not deeply: a client value for a key wins over the route's
        // seed for that same key OUTRIGHT — nested maps are not merged.
        var entry = new RouteEntry(
            "reports", null, "X",
            new Dictionary<string, object?>(), new Dictionary<string, object?>(),
            State: new Dictionary<string, object?> { ["prefs"] = new Dictionary<string, object?> { ["a"] = 1 } });

        var fromRequest = new Dictionary<string, object?>
        {
            ["prefs"] = new Dictionary<string, object?> { ["b"] = 2 },
        };
        var resolved = entry.ResolveParams(fromRequest);

        // the client's `prefs` wins whole — NOT {a:1, b:2}
        var prefs = Assert.IsAssignableFrom<IReadOnlyDictionary<string, object?>>(resolved["prefs"]);
        Assert.Equal(2, prefs["b"]);
        Assert.False(prefs.ContainsKey("a"));
    }
}
