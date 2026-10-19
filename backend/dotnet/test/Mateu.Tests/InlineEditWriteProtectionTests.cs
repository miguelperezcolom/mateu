using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class Nm11Part
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    [ReadOnly] public string Code { get; set; } = "";
    public int Units { get; set; }
}

public abstract class Nm11PartsBase : Crud<Nm11Part>
{
    public static readonly Dictionary<string, Nm11Part> Store = new();
    public override IEnumerable<Nm11Part> Fetch(string? search) => Store.Values;
    public override Nm11Part? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(Nm11Part entity) => Store[entity.Id] = entity;
}

[UI("nm11-inline-parts"), Title("Parts"), InlineEditing]
public class Nm11InlineParts : Nm11PartsBase;

[UI("nm11-plain-parts"), Title("Parts")]
public class Nm11PlainParts : Nm11PartsBase;

[UI("nm11-frozen-parts"), Title("Parts"), InlineEditing]
public class Nm11FrozenParts : Nm11PartsBase
{
    public override bool CanEdit => false;
}

/// <summary>NM11: update-row (inline editing) is a write path like save, so it gets save's
/// protection — read-only fields keep the stored values, an id with no stored row is refused (never
/// inserted), a row carrying only some columns keeps the other fields — and it is offered only by a
/// crud that edits inline and lets the user edit. Mirrors Java's InlineEditWriteProtectionSyncTest.</summary>
[Collection("ProcessWideState")]
public class InlineEditWriteProtectionTests
{
    static SyncHandler Handler() => new(new MateuRegistry(typeof(Nm11Part).Assembly));

    static UIIncrementDto UpdateRow<TCrud>(object row) => Handler().Handle(new RunActionRqDto
    {
        ActionId = "update-row",
        ServerSideType = typeof(TCrud).FullName,
        Parameters = new() { ["_editedRow"] = JsonSerializer.SerializeToElement(row) },
    });

    static void Seed()
    {
        Nm11PartsBase.Store.Clear();
        Nm11PartsBase.Store["p1"] = new Nm11Part { Id = "p1", Name = "Bolt", Code = "B-01", Units = 10 };
    }

    [Fact]
    public void A_read_only_field_keeps_the_stored_value()
    {
        Seed();
        UpdateRow<Nm11InlineParts>(new { id = "p1", name = "Bolt M8", code = "HACKED", units = 12 });
        Assert.Equal("Bolt M8", Nm11PartsBase.Store["p1"].Name);
        Assert.Equal(12, Nm11PartsBase.Store["p1"].Units);
        Assert.Equal("B-01", Nm11PartsBase.Store["p1"].Code);
    }

    [Fact]
    public void An_id_with_no_stored_row_is_refused_never_inserted()
    {
        Seed();
        var inc = UpdateRow<Nm11InlineParts>(new { id = "p-new", name = "Injected" });
        Assert.False(Nm11PartsBase.Store.ContainsKey("p-new"));
        Assert.Equal("error", Assert.Single(inc.Messages).Variant);
    }

    [Fact]
    public void A_row_carrying_only_some_columns_keeps_the_other_fields()
    {
        Seed();
        UpdateRow<Nm11InlineParts>(new { id = "p1", units = 99 });
        Assert.Equal(99, Nm11PartsBase.Store["p1"].Units);
        Assert.Equal("Bolt", Nm11PartsBase.Store["p1"].Name);
        Assert.Equal("B-01", Nm11PartsBase.Store["p1"].Code);
    }

    [Fact]
    public void A_crud_that_does_not_edit_inline_or_does_not_let_the_user_edit_refuses_it()
    {
        Seed();
        Assert.ThrowsAny<MateuForbiddenException>(() => UpdateRow<Nm11PlainParts>(new { id = "p1", name = "X" }));
        Assert.ThrowsAny<MateuForbiddenException>(() => UpdateRow<Nm11FrozenParts>(new { id = "p1", name = "X" }));
        Assert.Equal("Bolt", Nm11PartsBase.Store["p1"].Name);
    }
}
