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

    static UIIncrementDto UpdateCell<TCrud>(object row, string editedField) => Handler().Handle(new RunActionRqDto
    {
        ActionId = "update-row",
        ServerSideType = typeof(TCrud).FullName,
        Parameters = new()
        {
            ["_editedRow"] = JsonSerializer.SerializeToElement(row),
            ["_editedField"] = JsonSerializer.SerializeToElement(editedField),
        },
    });

    /// <summary>3.0-beta.68: a recycled grid cell sent a row carrying ANOTHER row's values. A
    /// request naming the edited cell writes only that cell (Java's
    /// aRowNamingItsEditedCellWritesOnlyThatCell).</summary>
    [Fact]
    public void A_row_naming_its_edited_cell_writes_only_that_cell()
    {
        Seed();
        UpdateCell<Nm11InlineParts>(new { id = "p1", name = "Bolt M8", units = 999 }, "name");
        Assert.Equal("Bolt M8", Nm11PartsBase.Store["p1"].Name);
        Assert.Equal(10, Nm11PartsBase.Store["p1"].Units);
    }

    [Fact]
    public void A_named_edited_cell_that_is_not_in_the_row_is_refused()
    {
        Seed();
        var inc = UpdateCell<Nm11InlineParts>(new { id = "p1", units = 999 }, "name");
        Assert.Equal(10, Nm11PartsBase.Store["p1"].Units);
        Assert.Contains("the edited cell is not in the edited row", Assert.Single(inc.Messages).Text);
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

public class InlineVolume
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    [Label("ISBN"), EditableOnlyWhenCreating] public string Isbn { get; set; } = "";
    [Version] public int Revision { get; set; }
}

[UI("inline-volumes"), Title("Volumes"), InlineEditing]
public class InlineVolumes : Crud<InlineVolume>
{
    public override IEnumerable<InlineVolume> Fetch(string? search) =>
        [new InlineVolume { Id = "v1", Title = "Earthsea", Isbn = "978-0-553-26250-9" }];
}

/// <summary>An [InlineEditing] listing edits stored records in place: an [EditableOnlyWhenCreating]
/// cell accepted typing the update-row save then dropped (the edit was silently lost). Such a
/// column — and the [Version] — is plain text; the other data columns stay editors. Mirrors Java's
/// InlineEditingLockedColumnsSyncTest.</summary>
public class InlineEditingLockedColumnsTests
{
    [Fact]
    public void Create_only_and_version_columns_are_not_inline_editors()
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(InlineVolume).Assembly))
            .Handle(new RunActionRqDto { Route = "inline-volumes", ConsumedRoute = "inline-volumes" });
        var columns = new Dictionary<string, JsonElement>();
        void Walk(JsonElement e)
        {
            if (e.ValueKind == JsonValueKind.Object)
            {
                if (e.TryGetProperty("type", out var t) && t.ValueKind == JsonValueKind.String
                    && t.GetString() == "GridColumn" && e.TryGetProperty("id", out var id))
                    columns[id.GetString()!] = e;
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in e.EnumerateArray()) Walk(item);
            }
        }
        Walk(JsonSerializer.SerializeToElement(inc, SyncHandlerTests.JsonOptions));

        Assert.True(columns["title"].GetProperty("editable").GetBoolean());
        Assert.False(columns["isbn"].GetProperty("editable").GetBoolean());
        Assert.False(columns["revision"].GetProperty("editable").GetBoolean());
    }
}
