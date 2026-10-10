using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class FileReservation
{
    [GroupBy] public string? File { get; set; }
    public string? Guest { get; set; }
}

public class FileFilters { }

// A custom listing over grouped rows: it computes no groups itself (the engine synthesizes them)
// and declares a group header action that does not apply to EXP-2.
[UI("grouped-files"), Title("Files")]
public class GroupedFiles : Listing<FileFilters, FileReservation>, IGroupActionVisibility
{
    public static readonly List<string> Cancelled = [];

    public override ListingData<FileReservation> Search(SearchRequest request) => ListingData.From<FileReservation>(
    [
        new() { File = "EXP-1", Guest = "Ana" },
        new() { File = "EXP-2", Guest = "Bo" },
        new() { File = "EXP-1", Guest = "Cy" },
    ]);

    [GroupAction("Cancel file")]
    public Message CancelFile(string groupValue)
    {
        Cancelled.Add(groupValue);
        return new Message($"Cancelled {groupValue}");
    }

    public bool GroupActionVisible(string actionId, string groupValue) => groupValue != "EXP-2";
}

// A listing that computes its own groups (a database GROUP BY): they win over the synthesized ones.
[UI("own-groups"), Title("Own groups")]
public class OwnGroupsFiles : Listing<FileFilters, FileReservation>
{
    public override ListingData<FileReservation> Search(SearchRequest request) =>
        new ListingData<FileReservation>([new() { File = "EXP-9", Guest = "Di" }], 40)
        {
            Groups = [new GroupSummary("EXP-9", 40, new Dictionary<string, object?> { ["guest"] = 40 })],
        };
}

/// <summary>[GroupAction] buttons on group header rows + group summaries synthesized for custom
/// listings (Java's @GroupAction, GroupActionVisibility and ListingData.withSynthesizedGroups).</summary>
[Collection("ActionSecurity")]
public class GroupActionTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(GroupedFiles).Assembly));

    private static JsonNode Search(string route, Type type) =>
        JsonSerializer.SerializeToNode(Handler().Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ActionId = "search", ServerSideType = type.FullName,
        }).Fragments[0].Data, Json)!["crud"]!;

    [Fact]
    public void Group_actions_travel_on_the_listing_metadata_and_are_advertised()
    {
        var json = JsonSerializer.Serialize(Handler().Handle(new RunActionRqDto { Route = "grouped-files" }), Json);
        Assert.Contains("\"groupBy\":\"file\"", json);
        Assert.Contains("\"groupActions\":[{\"label\":\"Cancel file\",\"actionId\":\"cancelFile\"", json);
        Assert.Contains("\"id\":\"action-on-row-cancelFile\"", json);
    }

    [Fact]
    public void A_custom_listing_gets_synthesized_groups_with_the_vetoed_actions_hidden()
    {
        var groups = Search("grouped-files", typeof(GroupedFiles))["groups"]!.AsArray();
        Assert.Equal(2, groups.Count);
        Assert.Equal("EXP-1", (string?)groups[0]!["value"]);
        Assert.Equal(2, (long)groups[0]!["count"]!);
        Assert.Null(groups[0]!["hiddenActions"]);
        Assert.Equal("EXP-2", (string?)groups[1]!["value"]);
        Assert.Equal(["cancelFile"], groups[1]!["hiddenActions"]!.AsArray().Select(n => (string?)n));
    }

    [Fact]
    public void Groups_the_listing_computed_itself_win()
    {
        var crud = Search("own-groups", typeof(OwnGroupsFiles));
        var group = Assert.Single(crud["groups"]!.AsArray());
        Assert.Equal("EXP-9", (string?)group!["value"]);
        Assert.Equal(40, (long)group["count"]!);
        Assert.Equal(40, (int)group["aggregates"]!["guest"]!);
    }

    private static UIIncrementDto Click(string group) => Handler().Handle(new RunActionRqDto
    {
        Route = "grouped-files", ConsumedRoute = "grouped-files", ActionId = "action-on-row-cancelFile",
        ServerSideType = typeof(GroupedFiles).FullName,
        Parameters = new() { ["_groupValue"] = group },
    });

    [Fact]
    public void A_group_action_runs_with_the_clicked_group_value()
    {
        Assert.Equal("Cancelled EXP-1", Assert.Single(Click("EXP-1").Messages).Text);
        Assert.Contains("EXP-1", GroupedFiles.Cancelled);
    }

    [Fact]
    public void A_vetoed_group_action_is_refused_even_when_named_on_the_wire()
    {
        Assert.Throws<MateuForbiddenException>(() => Click("EXP-2"));
        Assert.DoesNotContain("EXP-2", GroupedFiles.Cancelled);
    }

    [Fact]
    public void Only_group_action_methods_are_reachable()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "grouped-files", ActionId = "action-on-row-groupActionVisible",
            ServerSideType = typeof(GroupedFiles).FullName,
        });
        Assert.Equal("error", Assert.Single(inc.Messages).Variant);
    }
}
