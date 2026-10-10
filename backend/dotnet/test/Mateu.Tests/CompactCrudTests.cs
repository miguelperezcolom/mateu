using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class CompactRoom
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("dense-rooms"), Title("Dense rooms"), Compact]
public class DenseRooms : Crud<CompactRoom>
{
    public override IEnumerable<CompactRoom> Fetch(string? search) => [new() { Id = "1", Name = "Room 1" }];
    public override void Save(CompactRoom entity) { }
}

[UI("airy-rooms"), Title("Airy rooms")]
public class AiryRooms : Crud<CompactRoom>
{
    public override IEnumerable<CompactRoom> Fetch(string? search) => [new() { Id = "1", Name = "Room 1" }];
    public override void Save(CompactRoom entity) { }
}

/// <summary>[Compact] on a crud: its listing asks for dense rows (CrudMetadataDto.Compact) and its
/// page carries the high-density preset with the --mateu-compact:1 marker — mirrors Java's
/// CompactCrudSyncTest.</summary>
public class CompactCrudTests
{
    private static string Render(Type crud, string route) => JsonSerializer.Serialize(
        new SyncHandler(new MateuRegistry(typeof(DenseRooms).Assembly))
            .Handle(new RunActionRqDto { Route = route, ServerSideType = crud.FullName }));

    [Fact]
    public void A_compact_crud_asks_for_dense_rows_and_carries_the_marker()
    {
        var json = Render(typeof(DenseRooms), "/dense-rooms");
        Assert.Contains("\"Compact\":true", json);
        Assert.Contains("--mateu-compact:1", json);
    }

    [Fact]
    public void A_crud_without_compact_stays_airy()
    {
        var json = Render(typeof(AiryRooms), "/airy-rooms");
        Assert.DoesNotContain("\"Compact\":true", json);
        Assert.DoesNotContain("--mateu-compact:1", json);
    }
}
