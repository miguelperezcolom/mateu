using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>[App(BackLink = Parent)] (Java's @App(backLink = PARENT)), the YAML shell's
/// <c>backLink:</c>/<c>pageTitle:</c> and a [RemoteMenu]'s <c>shellLabel</c>/<c>routePrefix</c>
/// (the conformance case app-back-link and the YAML golden app-shell-back-link pin the wire).</summary>
public class BackLinkTests
{
    private static SyncHandler Handler(string? specsDir = null) =>
        new(new MateuRegistry(typeof(BackLinkTests).Assembly), specsDir: specsDir);

    private static AppMetadataDto AppOf(UIIncrementDto increment) =>
        Assert.IsType<AppMetadataDto>(Assert.IsType<ClientSideComponentDto>(increment.Fragments![0].Component).Metadata);

    [Fact]
    public void The_link_walks_up_past_routes_that_resolve_to_nothing_and_humanizes_an_untitled_parent()
    {
        var app = AppOf(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(BackLinkDeepApp).FullName }));
        // /backlink-tests/sales-orders/7/detail → /backlink-tests/sales-orders/7 resolves to nothing →
        // /backlink-tests/sales-orders (no [Title]): its segment, humanized
        Assert.True(app.NoBreadcrumbs);
        Assert.Equal("/backlink-tests/sales-orders", app.BackRoute);
        Assert.Equal("Sales orders", app.BackLabel);
    }

    [Fact]
    public void An_app_with_nothing_above_it_drops_the_trail_and_draws_no_link()
    {
        var app = AppOf(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(BackLinkTopApp).FullName }));
        Assert.True(app.NoBreadcrumbs);
        Assert.Null(app.BackRoute);
        Assert.Null(app.BackLabel);
    }

    [Fact]
    public void A_code_shell_decides_its_own_back_link()
    {
        var app = AppOf(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(BackLinkCodeShellApp).FullName }));
        Assert.True(app.NoBreadcrumbs);
        Assert.Equal("/backlink-tests/sales-orders", app.BackRoute);
        // and the default stays the trail
        var plain = AppOf(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(BackLinkPlainApp).FullName }));
        Assert.False(plain.NoBreadcrumbs);
        Assert.Null(plain.BackRoute);
    }

    [Fact]
    public void A_remote_menu_with_a_path_claims_its_route_prefix_and_its_declared_label()
    {
        var app = AppOf(Handler().Handle(new RunActionRqDto { ServerSideType = typeof(BackLinkPlainApp).FullName }));
        var named = Assert.Single(app.Menu, m => m.Remote && m.BaseUrl == "https://wf.example.com");
        Assert.Equal("Workflow", named.Label);
        Assert.True(named.ShellLabel);
        Assert.Equal("/workflow", named.Path);
        Assert.Equal("/workflow", named.RoutePrefix);
        // a section without a path claims no prefix; one the shell does not name takes its path's
        var unnamed = Assert.Single(app.Menu, m => m.Remote && m.BaseUrl == "https://forms.example.com");
        Assert.False(unnamed.ShellLabel);
        Assert.Equal("Forms", unnamed.Label);
        Assert.Equal("/forms", unnamed.RoutePrefix);
        var bare = Assert.Single(app.Menu, m => m.Remote && m.BaseUrl == "https://bare.example.com");
        Assert.Null(bare.RoutePrefix);
    }

    [Fact]
    public void A_yaml_mount_is_presented_by_its_shell_and_its_page_title_names_it_when_it_has_no_title()
    {
        var dir = Path.Combine(Path.GetTempPath(), "mateu-backlink-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(dir);
        try
        {
            File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
                type: Routes
                routes:
                  - route: ""
                    layout: shell.yaml
                """);
            File.WriteAllText(Path.Combine(dir, "shell.yaml"), """
                type: AppShell
                pageTitle: Acme records
                logo: /logo.png
                accentColor: "#00796b"
                backLink: PARENT
                menu:
                  - {type: RouteLink, label: Home, route: home}
                """);
            var handler = new SyncHandler(new MateuRegistry(typeof(Mateu.Uidl.Form).Assembly), specsDir: dir);
            var app = AppOf(handler.Handle(new RunActionRqDto { Route = "/", ConsumedRoute = "_empty", ActionId = "" }));
            Assert.True(app.NoBreadcrumbs);
            Assert.Null(app.BackRoute);
            var manifest = JsonNode.Parse(MobileManifest.Json(null, null, handler.MountShell("")))!;
            Assert.Equal("Acme records", (string?)manifest["name"]);
            Assert.Equal("/logo.png", (string?)manifest["icon"]);
            Assert.Equal("#00796b", (string?)manifest["themeColor"]);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }
}

[UI("backlink-tests/sales-orders")]
public class BackLinkOrders
{
    public string? Name { get; set; }
}

[UI("backlink-tests/sales-orders/7/detail"), App("Order", BackLink = BackLink.Parent)]
public class BackLinkDeepApp
{
    [MenuItem("Overview")] public void Overview() { }
}

[UI("backlink-top"), App("Top", BackLink = BackLink.Parent)]
public class BackLinkTopApp
{
    [MenuItem("Overview")] public void Overview() { }
}

[UI("backlink-tests/sales-orders/code"), App("Code shell")]
public class BackLinkCodeShellApp : IAppSupplier
{
    public AppShell GetApp() => new("Code shell", [new MenuItemDto("Overview", "/overview", "")])
    {
        BackLink = BackLink.Parent,
    };
}

[UI("backlink-tests/plain"), App("Plain")]
[RemoteMenu("Workflow", "https://wf.example.com", Path = "/workflow")]
[RemoteMenu("", "https://forms.example.com", Path = "forms")]
[RemoteMenu("Bare", "https://bare.example.com")]
public class BackLinkPlainApp
{
    [MenuItem("Overview")] public void Overview() { }
}
