using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Stubs ─────────────────────────────────────────────────────────────────────────────────────

[UI("peer-middle"), Title("Record 2")]
public class PeerMiddle : IPeerNavigationSupplier
{
    public string? Name { get; set; } = "Two";

    public PeerNav? Peers() => new("Record 1", "/records/1", "Record 3", "/records/3");
}

[UI("peer-first"), Title("Record 1")]
public class PeerFirst : IPeerNavigationSupplier
{
    public string? Name { get; set; } = "One";

    public PeerNav? Peers() => new(null, null, "Record 2", "/records/2");
}

[UI("peer-none"), Title("Lonely")]
public class PeerNone
{
    public string? Name { get; set; } = "alone";
}

[UI("stamped"), Title("Stamped")]
public class Stamped
{
    public string? Name { get; set; } = "Widget";

    [Timestamp("Last updated")]
    public string UpdatedAt { get; set; } = "2026-07-20 12:00";
}

[UI("unstamped"), Title("No stamp")]
public class Unstamped
{
    public string? Name { get; set; } = "Widget";
}

/// <summary>A page implementing IPeerNavigationSupplier carries the previous/next peer-object
/// arrows on the wire as PageMetadataDto.PeerNav; a null route disables a side, and a page with no
/// supplier leaves PeerNav null. (Mirror of Java's PeerNavigationSyncTest.)</summary>
public class PeerNavTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(PeerMiddle).Assembly));

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

    private static PeerNavDto? PeerNavOf(string route)
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        foreach (var fragment in increment.Fragments)
            if (FindPage(fragment.Component) is { } page)
                return page.PeerNav;
        throw new InvalidOperationException("no page metadata for " + route);
    }

    [Fact]
    public void A_record_with_both_neighbours_carries_both_arrows()
    {
        var peerNav = PeerNavOf("peer-middle");
        Assert.NotNull(peerNav);
        Assert.Equal("Record 1", peerNav!.PrevLabel);
        Assert.Equal("/records/1", peerNav.PrevRoute);
        Assert.Equal("Record 3", peerNav.NextLabel);
        Assert.Equal("/records/3", peerNav.NextRoute);
    }

    [Fact]
    public void The_first_record_disables_the_previous_arrow_with_a_null_route()
    {
        var peerNav = PeerNavOf("peer-first");
        Assert.NotNull(peerNav);
        Assert.Null(peerNav!.PrevRoute);
        Assert.Equal("/records/2", peerNav.NextRoute);
    }

    [Fact]
    public void A_page_that_supplies_no_peers_leaves_peer_nav_null()
    {
        Assert.Null(PeerNavOf("peer-none"));
    }

    [Fact]
    public void Peer_nav_travels_in_the_serialized_wire()
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = "peer-middle", ConsumedRoute = "peer-middle" });
        var json = JsonSerializer.Serialize(increment, Json);
        Assert.Contains("/records/1", json);
        Assert.Contains("/records/3", json);
    }

    private static PageMetadataDto Page(string route)
    {
        var increment = Handler().Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        foreach (var fragment in increment.Fragments)
            if (FindPage(fragment.Component) is { } page)
                return page;
        throw new InvalidOperationException("no page metadata for " + route);
    }

    [Fact]
    public void The_timestamp_field_travels_with_its_label_prefix()
    {
        Assert.Equal("Last updated 2026-07-20 12:00", Page("stamped").Timestamp);
    }

    [Fact]
    public void A_page_without_a_timestamp_field_leaves_it_null()
    {
        Assert.Null(Page("unstamped").Timestamp);
    }
}
