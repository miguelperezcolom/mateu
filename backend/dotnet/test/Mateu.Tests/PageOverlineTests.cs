using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Stubs ─────────────────────────────────────────────────────────────────────────────────────

[UI("overlined"), Title("Requisition 4471"), Overline("Requisitions")]
public class Overlined
{
    public string? Name { get; set; } = "Widget";
}

[UI("new-booking"), TitlePlaceholder("New booking…")]
public class NewBooking
{
    public string? Name { get; set; } = "";
}

[UI("plain-header"), Title("Plain")]
public class PlainHeader
{
    public string? Name { get; set; } = "Widget";
}

/// <summary>The two remaining text elements of the Redwood canonical page header: overlineText
/// (the small line ABOVE the title) and pageTitlePlaceholder (what the header shows while the
/// title is still empty). (Mirror of Java's PageOverlineSyncTest. The ports carry only the
/// declarative form — same convention as [Subtitle].)</summary>
public class PageOverlineTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(Overlined).Assembly));

    private static PageMetadataDto? FindPage(ComponentDto? component)
    {
        switch (component)
        {
            case null:
                return null;
            case ClientSideComponentDto { Metadata: PageMetadataDto page }:
                return page;
        }
        var children = component switch
        {
            ClientSideComponentDto c => c.Children,
            ServerSideComponentDto s => s.Children,
            _ => null,
        };
        if (children != null)
            foreach (var child in children)
                if (FindPage(child) is { } found)
                    return found;
        return null;
    }

    private static PageMetadataDto PageOf(string route)
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        foreach (var fragment in increment.Fragments)
            if (FindPage(fragment.Component) is { } page)
                return page;
        throw new InvalidOperationException("no page metadata for " + route);
    }

    [Fact]
    public void The_overline_travels_on_the_wire()
    {
        Assert.Equal("Requisitions", PageOf("overlined").Overline);
    }

    [Fact]
    public void The_overline_does_not_disturb_the_title()
    {
        Assert.Equal("Requisition 4471", PageOf("overlined").Title);
    }

    [Fact]
    public void The_title_placeholder_travels_on_the_wire()
    {
        Assert.Equal("New booking…", PageOf("new-booking").TitlePlaceholder);
    }

    [Fact]
    public void A_page_declaring_neither_leaves_both_null()
    {
        var page = PageOf("plain-header");
        Assert.Null(page.Overline);
        Assert.Null(page.TitlePlaceholder);
    }
}
