using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("gate-no-create-parts"), Title("Parts")]
public class GateNoCreateParts : Nm11PartsBase
{
    public override bool CanCreate => false;
}

[UI("gate-no-edit-parts"), Title("Parts")]
public class GateNoEditParts : Nm11PartsBase
{
    public override bool CanEdit => false;
}

[UI("gate-no-next-parts"), Title("Parts")]
public class GateNoNextParts : Nm11PartsBase
{
    public override bool EditInDrawer => true;
    public override CrudDisplay Display => new(SaveAndNext: Toggle.Disabled);
}

/// <summary>The ways INTO a write are gated like the write itself (Java's CrudWriteGate): a crud
/// that may not create refuses New and the /new route — it used to open the creation form and only
/// refuse the save —, one that may not edit refuses Edit and /{id}/edit, and a Disabled "Save and
/// next" cannot be forced.</summary>
[Collection("ProcessWideState")]
public class CrudWriteGateTests
{
    static SyncHandler Handler() => new(new MateuRegistry(typeof(Nm11Part).Assembly));

    static UIIncrementDto Run<TCrud>(string route, string? actionId) => Handler().Handle(new RunActionRqDto
    {
        Route = route, ConsumedRoute = route, ActionId = actionId, ServerSideType = typeof(TCrud).FullName,
        ComponentState = new() { ["id"] = "p1", ["name"] = "X" },
    });

    static void Seed()
    {
        Nm11PartsBase.Store.Clear();
        Nm11PartsBase.Store["p1"] = new Nm11Part { Id = "p1", Name = "Bolt", Code = "B-01", Units = 10 };
    }

    [Fact]
    public void A_crud_that_may_not_create_refuses_the_way_into_the_creation_form()
    {
        Seed();
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoCreateParts>("gate-no-create-parts", "new"));
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoCreateParts>("gate-no-create-parts/new", ""));
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoCreateParts>("gate-no-create-parts", "create"));
        // the rest of the crud still works
        Run<GateNoCreateParts>("gate-no-create-parts", "");
        Run<GateNoCreateParts>("gate-no-create-parts/p1/edit", "");
    }

    [Fact]
    public void A_crud_that_may_not_edit_refuses_the_way_into_the_editor()
    {
        Seed();
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoEditParts>("gate-no-edit-parts/p1", "edit"));
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoEditParts>("gate-no-edit-parts/p1/edit", ""));
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoEditParts>("gate-no-edit-parts/p1/edit", "save"));
        Run<GateNoEditParts>("gate-no-edit-parts/p1", "");
        Assert.Equal("Bolt", Nm11PartsBase.Store["p1"].Name);
    }

    [Fact]
    public void A_disabled_save_and_next_is_refused_if_forced()
    {
        Seed();
        Assert.ThrowsAny<MateuForbiddenException>(() => Run<GateNoNextParts>("gate-no-next-parts/p1/edit", "save-and-next"));
        Assert.Equal("Bolt", Nm11PartsBase.Store["p1"].Name);
    }
}
