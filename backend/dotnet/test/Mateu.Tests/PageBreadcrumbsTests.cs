using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Stubs ─────────────────────────────────────────────────────────────────────────────────────

[UI("crumbs-supplied"), Title("Supplied"), Breadcrumb("Declared", "/declared")]
public class CrumbsSupplied : IBreadcrumbsSupplier
{
    public string? Name { get; set; }

    public IReadOnlyList<Breadcrumb>? Breadcrumbs() => [new("Home", "/"), new("Customers", "/customers")];
}

[UI("crumbs-off-but-declared"), Title("Both"), NoBreadcrumbs, Breadcrumb("Home", "/")]
public class CrumbsOffButDeclared
{
    public string? Name { get; set; }
}

[UI("crumbs-plain"), Title("Plain")]
public class CrumbsPlain
{
    public string? Name { get; set; }
}

/// <summary>A host page whose action opens a plain page in a drawer through EmbeddedView.</summary>
[UI("crumbs-host"), Title("Host")]
public class CrumbsHost
{
    [Action]
    public Drawer OpenPage() => new() { Id = "d", HeaderTitle = "Details", Content = new EmbeddedView(new CrumbsPlain()) };
}

[App("Crumbs master", BackLink = BackLink.Parent)]
public class CrumbsBackLinkMaster
{
    public string? Id { get; set; }
}

[App("Crumbs plain master")]
public class CrumbsPlainMaster
{
    public string? Id { get; set; }
}

public class CrumbsTab
{
    public string? Note { get; set; } = "tab";
}

// ── Tests ─────────────────────────────────────────────────────────────────────

/// <summary>The page-level breadcrumb members (PageMetadataDto.Breadcrumbs / NoBreadcrumbs): a
/// trail the page declares, [NoBreadcrumbs] on a page, an embedded view's page, and a page under a
/// back-link app through a routes.yaml chain. (Mirror of Java's NoBreadcrumbsSyncTest,
/// EmbeddedViewBreadcrumbsSyncTest and RoutedTabsChromeSyncTest; the conformance cases
/// page-no-breadcrumbs, page-breadcrumbs and page-back-link-chain pin the wire.)</summary>
public class PageBreadcrumbsTests
{
    private static SyncHandler Handler(string? specsDir = null) =>
        new(new MateuRegistry(typeof(PageBreadcrumbsTests).Assembly), specsDir: specsDir);

    private static IEnumerable<PageMetadataDto> Pages(ComponentDto? node)
    {
        switch (node)
        {
            case ClientSideComponentDto client:
                if (client.Metadata is PageMetadataDto page) yield return page;
                if (client.Metadata is DrawerMetadataDto { Content: { } content })
                    foreach (var p in Pages(content)) yield return p;
                foreach (var child in client.Children)
                    foreach (var p in Pages(child)) yield return p;
                break;
            case ServerSideComponentDto server:
                foreach (var child in server.Children)
                    foreach (var p in Pages(child)) yield return p;
                break;
        }
    }

    private static List<PageMetadataDto> PagesOf(UIIncrementDto increment) =>
        increment.Fragments.SelectMany(f => Pages(f.Component)).ToList();

    private static PageMetadataDto PageAt(string route) =>
        PagesOf(Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route })).First();

    [Fact]
    public void A_supplier_wins_over_the_declared_attributes()
    {
        var page = PageAt("crumbs-supplied");
        Assert.Equal(
            [new BreadcrumbDto("Home", "/"), new BreadcrumbDto("Customers", "/customers")],
            page.Breadcrumbs);
        Assert.Null(page.NoBreadcrumbs);
    }

    [Fact]
    public void No_breadcrumbs_turns_the_automatic_trail_off_and_a_declared_one_still_travels()
    {
        var page = PageAt("crumbs-off-but-declared");
        Assert.True(page.NoBreadcrumbs);
        Assert.Equal([new BreadcrumbDto("Home", "/")], page.Breadcrumbs);
    }

    [Fact]
    public void A_page_declaring_nothing_leaves_both_members_out()
    {
        var page = PageAt("crumbs-plain");
        Assert.Null(page.Breadcrumbs);
        Assert.Null(page.NoBreadcrumbs);
        var json = System.Text.Json.JsonSerializer.Serialize<ComponentMetadataDto>(page);
        Assert.DoesNotContain("oBreadcrumbs", json);
        Assert.DoesNotContain("readcrumbs\"", json);
    }

    [Fact]
    public void An_embedded_views_page_carries_no_trail_of_its_own()
    {
        var increment = Handler().Handle(new RunActionRqDto
        {
            Route = "/crumbs-host", ActionId = "openPage",
            ServerSideType = typeof(CrumbsHost).FullName, InitiatorComponentId = "cmp-1",
        });
        var pages = PagesOf(increment);
        Assert.NotEmpty(pages);
        Assert.All(pages, p => Assert.True(p.NoBreadcrumbs));
    }

    [Fact]
    public void Pages_under_a_back_link_app_of_their_routes_yaml_chain_carry_no_trail()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-crumbs-").FullName;
        try
        {
            File.WriteAllText(Path.Combine(dir, "routes.yaml"), $"""
                routes:
                  - route: crumbs-bl/:id
                    viewModel: {typeof(CrumbsBackLinkMaster).FullName}
                    children:
                      - route: tab
                        viewModel: {typeof(CrumbsTab).FullName}
                  - route: crumbs-plain-master/:id
                    viewModel: {typeof(CrumbsPlainMaster).FullName}
                    children:
                      - route: tab
                        viewModel: {typeof(CrumbsTab).FullName}
                """);
            var handler = Handler(dir);
            var under = PagesOf(handler.Handle(new RunActionRqDto
            {
                Route = "/crumbs-bl/7/tab", ConsumedRoute = "/crumbs-bl/7", ServerSideType = typeof(CrumbsTab).FullName,
            }));
            Assert.NotEmpty(under);
            Assert.All(under, p => Assert.True(p.NoBreadcrumbs));
            Assert.True(handler.InsideBackLinkApp("/crumbs-bl/7/tab"));
            // past the child: the tab's own business (a record, /new) is still under the master
            Assert.True(handler.InsideBackLinkApp("/crumbs-bl/7/tab/new"));
            // the master itself is the chain's leaf, not under itself
            Assert.False(handler.InsideBackLinkApp("/crumbs-bl/7"));

            var plain = PagesOf(handler.Handle(new RunActionRqDto
            {
                Route = "/crumbs-plain-master/7/tab", ConsumedRoute = "/crumbs-plain-master/7",
                ServerSideType = typeof(CrumbsTab).FullName,
            }));
            Assert.NotEmpty(plain);
            Assert.All(plain, p => Assert.Null(p.NoBreadcrumbs));
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }
}
