using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class TrashNote
{
    public string Id { get; set; } = "";
    public string Text { get; set; } = "";
}

/// <summary>A crud that can bring deleted notes back (IRestorable): Delete is undoable.</summary>
[UI("undo-notes"), Title("Notes")]
public class UndoNotes : Crud<TrashNote>, IRestorable<string>
{
    internal static readonly List<TrashNote> Notes = [];
    internal static readonly List<TrashNote> Trash = [];

    public override IEnumerable<TrashNote> Fetch(string? search) => Notes;

    public override void Delete(string id)
    {
        Trash.AddRange(Notes.Where(n => n.Id == id));
        Notes.RemoveAll(n => n.Id == id);
    }

    public void RestoreAllById(IReadOnlyList<string> deletedIds)
    {
        Notes.AddRange(Trash.Where(n => deletedIds.Contains(n.Id)));
        Trash.RemoveAll(n => deletedIds.Contains(n.Id));
    }
}

/// <summary>The same crud without IRestorable: Delete keeps its confirmation.</summary>
[UI("plain-undo-notes"), Title("Notes")]
public class PlainUndoNotes : Crud<TrashNote>
{
    public override IEnumerable<TrashNote> Fetch(string? search) => UndoNotes.Notes;
    public override void Delete(string id) => UndoNotes.Notes.RemoveAll(n => n.Id == id);
}

/// <summary>W-V-DELETE-FEEDBACK (Java UndoDeleteSyncTest, Python test_undo_delete.py).</summary>
[Collection(ProcessWideStateCollection.Name)]
public class UndoDeleteTests
{
    public UndoDeleteTests()
    {
        UndoNotes.Notes.Clear();
        UndoNotes.Trash.Clear();
        UndoNotes.Notes.AddRange([new() { Id = "n1", Text = "Buy milk" }, new() { Id = "n2", Text = "Call Ana" },
            new() { Id = "n3", Text = "Pay rent" }]);
    }

    private static UIIncrementDto Run(Type crud, string route, string actionId,
        Dictionary<string, object?>? state = null, Dictionary<string, object?>? parameters = null) =>
        new SyncHandler(new MateuRegistry(typeof(UndoNotes).Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = route,
            ServerSideType = crud.FullName,
            ActionId = actionId,
            InitiatorComponentId = "c1",
            Parameters = parameters ?? new(),
            ComponentState = state ?? new(),
        });

    private static Dictionary<string, object?> Selecting(params string[] ids) => new()
    {
        ["crud_selected_items"] = JsonSerializer.SerializeToElement(ids.Select(id => new { id })),
    };

    private static List<ActionDto> Actions(UIIncrementDto increment) =>
        ((ServerSideComponentDto)increment.Fragments[0].Component!).Actions.ToList();

    [Fact]
    public void A_restorable_crud_deletes_without_asking_and_offers_undo()
    {
        var actions = Actions(Run(typeof(UndoNotes), "/undo-notes", ""));
        Assert.False(actions.Single(a => a.Id == "delete").ConfirmationRequired);
        Assert.Contains(actions, a => a.Id == IRestorable<string>.RestoreAction);

        var answer = Run(typeof(UndoNotes), "/undo-notes", "delete", Selecting("n1", "n3"));
        Assert.Equal(["n2"], UndoNotes.Notes.Select(n => n.Id));
        var message = Assert.Single(answer.Messages);
        Assert.Equal("2 records deleted", message.Text);
        Assert.Equal(IRestorable<string>.RestoreAction, message.UndoActionId);
        Assert.Equal(["n1", "n3"], (IEnumerable<string>)message.UndoParameters![IRestorable<string>.RestoreIds]!);
    }

    [Fact]
    public void Undo_restores_the_rows_and_the_listing_searches_again()
    {
        Run(typeof(UndoNotes), "/undo-notes", "delete", Selecting("n2"));
        var undo = Run(typeof(UndoNotes), "/undo-notes", IRestorable<string>.RestoreAction,
            parameters: new() { [IRestorable<string>.RestoreIds] = JsonSerializer.SerializeToElement(new[] { "n2" }) });
        Assert.Contains(UndoNotes.Notes, n => n.Id == "n2");
        Assert.Equal("1 record restored", Assert.Single(undo.Messages).Text);
        Assert.NotEmpty(undo.Fragments);
    }

    [Fact]
    public void A_crud_without_restorable_keeps_the_confirmation_and_refuses_restore()
    {
        var actions = Actions(Run(typeof(PlainUndoNotes), "/plain-undo-notes", ""));
        Assert.True(actions.Single(a => a.Id == "delete").ConfirmationRequired);
        Assert.DoesNotContain(actions, a => a.Id == IRestorable<string>.RestoreAction);
        var answer = Run(typeof(PlainUndoNotes), "/plain-undo-notes", "delete", Selecting("n1"));
        Assert.Equal("Deleted", Assert.Single(answer.Messages).Text);
        Assert.Throws<MateuForbiddenException>(() => Run(typeof(PlainUndoNotes), "/plain-undo-notes",
            IRestorable<string>.RestoreAction,
            parameters: new() { [IRestorable<string>.RestoreIds] = JsonSerializer.SerializeToElement(new[] { "n1" }) }));
    }
}
