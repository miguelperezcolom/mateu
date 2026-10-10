using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// A <c>type: UI</c> mount names its home page (<c>home: dashboard</c>): the mount ROOT renders that
/// route when no root route is authored; an authored root always wins; a home naming no route is
/// ignored (warned about once) and the old behaviour stays. The .NET mirror of Java's
/// MountHomeSyncTest and Python's test_mount_home. (This port has no <c>type: AppShell</c>
/// definitions, so the shell <c>homeRoute</c> default does not apply here.)
/// </summary>
public class MountHomeTests
{
    private static string Specs(string home, bool authoredRoot = false)
    {
        var dir = Directory.CreateTempSubdirectory("mount-home-").FullName;
        File.WriteAllText(Path.Combine(dir, "app.ui.yaml"),
            $"type: UI\nbasePath: /\nhome: {home}\nroutes:\n  - routes.yaml\n");
        File.WriteAllText(Path.Combine(dir, "routes.yaml"),
            "routes:\n"
            + (authoredRoot ? "  - route: \"\"\n    definition: welcome.yaml\n" : "")
            + "  - route: dashboard\n    definition: dashboard.yaml\n    fixedParams:\n      tab: kpis\n"
            + "  - route: orders\n    definition: orders.yaml\n");
        foreach (var (file, text) in new[]
                 {
                     ("dashboard.yaml", "Mount home dashboard"),
                     ("orders.yaml", "Mount home orders"),
                     ("welcome.yaml", "Authored root"),
                 })
            File.WriteAllText(Path.Combine(dir, file),
                $"layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: \"{text}\"\n");
        return dir;
    }

    [Fact]
    public void The_mount_root_resolves_to_the_home_entry()
    {
        var root = new RouteRegistry(Specs("/dashboard")).Match("")!;
        Assert.Equal("dashboard.yaml", root.Entry.Definition);
        Assert.Equal("kpis", root.Params(null)["tab"]);
    }

    [Fact]
    public void The_home_page_renders_at_the_root()
    {
        var spec = new YamlSpecLoader(Specs("dashboard")).LoadSpec("");
        Assert.NotNull(spec);
        Assert.Contains("Mount home dashboard",
            System.Text.Json.JsonSerializer.Serialize(
                ComponentMapper.Map(spec!.Layout!),
                new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web)));
    }

    [Fact]
    public void An_authored_root_route_wins_over_the_home()
    {
        var registry = new RouteRegistry(Specs("dashboard", authoredRoot: true));
        Assert.Equal("welcome.yaml", registry.Match("")!.Entry.Definition);
        Assert.Equal("dashboard.yaml", registry.Match("dashboard")!.Entry.Definition);
    }

    [Fact]
    public void An_unknown_home_is_ignored()
    {
        var registry = new RouteRegistry(Specs("nowhere"));
        Assert.Null(registry.Match(""));
        Assert.Equal("orders.yaml", registry.Match("orders")!.Entry.Definition);
    }
}
