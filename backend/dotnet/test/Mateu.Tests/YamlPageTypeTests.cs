using Mateu.Core;
using Mateu.Dtos;
using Xunit;

namespace Mateu.Tests;

/// <summary>The view model of page-type-bound.yaml / page-type-unbound.yaml: no [UI] route, so the
/// routes fall back to the YAML definition. By shape it is a <c>form</c> page.</summary>
public class PageTypePlainView
{
    public string? Name { get; set; } = "World";
}

/// <summary><c>pageType:</c> on a YAML page definition — the .NET mirror of Java's
/// YamlPageTypeSyncTest: a declared type wins over inference; an absent or unknown one leaves it.</summary>
public class YamlPageTypeTests
{
    private static ComponentDto Render(string route)
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(PageTypePlainView).Assembly));
        var increment = handler.Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        return increment.Fragments![0].Component!;
    }

    [Fact]
    public void A_definition_only_page_carries_its_declared_type()
    {
        var page = Assert.IsType<ServerSideComponentDto>(Render("page-type-landing"));
        Assert.Equal("landing", page.PageType);
        Assert.Single(page.Children);
    }

    [Fact]
    public void A_declared_type_wins_over_the_view_models_inferred_shape()
    {
        var page = Assert.IsType<ServerSideComponentDto>(Render("page-type-bound"));
        Assert.Equal(typeof(PageTypePlainView).FullName, page.ServerSideType);
        Assert.Equal("dashboard", page.PageType);
    }

    [Fact]
    public void An_absent_type_is_inferred()
    {
        var page = Assert.IsType<ServerSideComponentDto>(Render("page-type-unbound"));
        Assert.Equal("form", page.PageType);
    }

    [Fact]
    public void A_static_page_without_a_type_keeps_its_bare_shape()
    {
        Assert.IsNotType<ServerSideComponentDto>(Render("about"));
    }

    [Fact]
    public void The_declared_type_is_matched_without_case_and_a_typo_is_ignored()
    {
        Assert.Equal("process", YamlComponentBuilder.PageTypeOf(new Dictionary<object, object> { ["pageType"] = "Process" }));
        Assert.Null(YamlComponentBuilder.PageTypeOf(new Dictionary<object, object> { ["pageType"] = "banana" }));
        Assert.Null(YamlComponentBuilder.PageTypeOf(new Dictionary<object, object> { ["layout"] = "x" }));
    }
}
