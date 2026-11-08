using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;
using Xunit.Abstractions;

namespace Mateu.Tests;

/// <summary>A <c>type: AppShell</c> definition bound to a mount's root route is served as the
/// mount's APP — the data-driven twin of an [App] class — exactly as the Java reference serves it:
/// the Java fixtures (backend/shared/core/src/test/resources/mount-home/&lt;case&gt;/specs/ui) through
/// the .NET sync handler, held to the Java goldens of AppShellFlowSyncTest, YamlAppShellHeaderSyncTest
/// and YamlCardMenusSyncTest.</summary>
public class YamlAppShellTests(ITestOutputHelper output)
{
    private static string Case(string name) =>
        Path.Combine(YamlGoldenHarness.RepoRoot(), "backend/shared/core/src/test/resources/mount-home", name, "specs/ui");

    /// <summary>The handler over a fixture's specs, with no [UI] class at all (the shell is the app).</summary>
    private static SyncHandler Handler(string @case) =>
        new(new MateuRegistry(typeof(Mateu.Uidl.Form).Assembly), specsDir: Case(@case));

    private static UIIncrementDto LoadShell(string @case, Func<Identity?>? identity = null)
    {
        var handler = identity is null
            ? Handler(@case)
            : new SyncHandler(new MateuRegistry(typeof(Mateu.Uidl.Form).Assembly), identity: identity, specsDir: Case(@case));
        return handler.Handle(new RunActionRqDto { Route = "/", ConsumedRoute = "_empty", ActionId = "" });
    }

    private static JsonNode Actual(UIIncrementDto increment)
    {
        var json = JsonSerializer.Serialize(increment, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        var node = JsonNode.Parse(json)!;
        // the shell's own id: Java generates one per response (a uuid, dropped as generated), the
        // port answers with its stable app id like for every app — an id nobody addresses the shell by
        var component = node["fragments"]![0]!["component"]!.AsObject();
        if ((string?)component["id"] == "ux_main_app") component.Remove("id");
        return YamlGoldenHarness.Normalised(new JsonObject
        {
            ["commands"] = node["commands"]?.DeepClone(),
            ["component"] = node["fragments"]![0]!["component"]!.DeepClone(),
        });
    }

    public static TheoryData<string, string> Goldens => new()
    {
        { "shell-flows", "app-shell" },
        { "shell-extras", "app-shell-extras" },
        { "card-menus", "app-shell-card-menus" },
    };

    [Theory, MemberData(nameof(Goldens))]
    public void The_yaml_shell_matches_the_java_golden(string @case, string golden)
    {
        var diffs = YamlGoldenHarness.Diffs(YamlGoldenHarness.Expected(golden), Actual(LoadShell(@case)));
        foreach (var d in diffs.Take(60)) output.WriteLine(d);
        Assert.True(diffs.Count == 0, $"'{@case}' diverges from {golden}.golden.json:\n  " + string.Join("\n  ", diffs.Take(40)));
    }

    private static AppMetadataDto AppOf(UIIncrementDto increment) =>
        Assert.IsType<AppMetadataDto>(Assert.IsType<ClientSideComponentDto>(increment.Fragments![0].Component).Metadata);

    [Fact]
    public void A_shell_without_a_home_route_lands_on_the_mounts_home_or_its_first_menu_item()
    {
        // mount-home/shell: the mount declares `home: dashboard`, the shell no homeRoute (its first
        // menu item is orders)
        Assert.Equal("dashboard", AppOf(LoadShell("shell")).HomeRoute);
        // a shell's own homeRoute wins over the mount's home
        Assert.Equal("orders", AppOf(LoadShell("shell-own-home")).HomeRoute);
    }

    [Fact]
    public void A_remote_menu_entry_is_a_federated_option()
    {
        var app = AppOf(LoadShell("remote-shell"));
        var remote = Assert.Single(app.Menu, m => m.Remote);
        Assert.Equal("Workflow", remote.Label);
        Assert.Equal("http://console.example/_workflow", remote.BaseUrl);
        Assert.Equal("/_workflow", remote.Path);
        Assert.Equal("overview", app.HomeRoute);
    }

    [Fact]
    public void Shell_extras_of_the_e2_patterns_reach_the_wire()
    {
        var app = AppOf(LoadShell("e2-shell"));
        output.WriteLine(JsonSerializer.Serialize(app, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
        // f9 → the absolute route; a code-only quick launch is kept, labelled after its route
        Assert.Equal(["f9", null], app.Shortcuts.Select(s => s.Key));
        Assert.Equal(["/guests", "/home"], app.Shortcuts.Select(s => s.Route));
        Assert.Equal(["GST", "HOME"], app.Shortcuts.Select(s => s.Code));
        Assert.Equal("Home", app.Shortcuts[1].Label);
        var value = Assert.Single(app.HeaderValues);
        Assert.Equal(("businessDate", "Business date", "12 Oct 2026"), (value.Id, value.Label, value.Value));
        Assert.True(app.LiveUpdates);
        Assert.Equal(new IdleSessionDto(900, 90, "/logout", "_keep-alive"), app.IdleSession);
    }

    [Fact]
    public void A_menu_item_or_action_with_access_is_gone_for_a_caller_without_it()
    {
        var dir = Path.Combine(Path.GetTempPath(), "mateu-shell-access-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        try
        {
            File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
                type: Routes
                routes:
                  - route: ""
                    definition: shell.yaml
                """);
            File.WriteAllText(Path.Combine(dir, "shell.yaml"), """
                type: AppShell
                title: Back office
                actions:
                  - id: purge
                    access: {roles: [admin]}
                    steps:
                      - {type: Navigate, route: purge}
                menu:
                  - {type: RouteLink, label: Home, route: home}
                  - {type: RouteLink, label: Audit, route: audit, access: {roles: [admin]}}
                """);
            UIIncrementDto Load(params string[] roles) =>
                new SyncHandler(new MateuRegistry(typeof(Mateu.Uidl.Form).Assembly),
                        identity: () => roles.Length == 0 ? null : new Identity(Roles: roles), specsDir: dir)
                    .Handle(new RunActionRqDto { Route = "/", ConsumedRoute = "_empty", ActionId = "" });

            var anonymous = AppOf(Load());
            Assert.Equal(["Home"], anonymous.Menu.Select(m => m.Label));
            Assert.Null(anonymous.Actions);
            var admin = AppOf(Load("admin"));
            Assert.Equal(["Home", "Audit"], admin.Menu.Select(m => m.Label));
            Assert.Equal(["purge"], admin.Actions!.Select(a => a.Id));
            // no homeRoute: the first navigable menu item as written
            Assert.Equal("home", admin.HomeRoute);
            // a flat menu of leaves with no declared variant: TABS (the AUTO heuristic)
            Assert.Equal("TABS", admin.Variant);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }
}
