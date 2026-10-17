using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class StoredNote
{
    public string Id { get; set; } = "";
    public string Text { get; set; } = "";
}

/// <summary>A crud that only says how to READ: its writes must not "succeed" silently.</summary>
[UI("notes-readonly-store"), Title("Notes")]
public class FetchOnlyNotes : Crud<StoredNote>
{
    public override IEnumerable<StoredNote> Fetch(string? search) => [new() { Id = "n1", Text = "Hello" }];
}

/// <summary>B3: Crud&lt;T&gt;.Save/Delete used to be empty virtual methods, so a crud that only
/// implemented Fetch rendered New/Edit/Delete, said "Saved" and discarded every write (Java's
/// AutoCrud.store() is abstract). The defaults now refuse with a user-facing error naming the
/// override to write.</summary>
public class CrudWritesTests
{
    private static UIIncrementDto Run(string route, string actionId, Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(typeof(FetchOnlyNotes).Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = "/notes-readonly-store",
            ServerSideType = typeof(FetchOnlyNotes).FullName,
            ActionId = actionId,
            InitiatorComponentId = "c1",
            Parameters = new(),
            ComponentState = state ?? new(),
        });

    [Fact]
    public void The_default_save_refuses_with_a_user_facing_error_naming_the_override()
    {
        var failure = Assert.Throws<UserFacingException>(() => new FetchOnlyNotes().Save(new StoredNote()));
        Assert.Equal("Not implemented", failure.Title);
        Assert.Contains("override Save", failure.Message);
        Assert.Contains(nameof(FetchOnlyNotes), failure.Message);
    }

    [Fact]
    public void The_default_delete_refuses_with_a_user_facing_error_naming_the_override()
    {
        var failure = Assert.Throws<UserFacingException>(() => new FetchOnlyNotes().Delete("n1"));
        Assert.Contains("override Delete", failure.Message);
    }

    [Fact]
    public void Saving_through_the_crud_reports_the_error_instead_of_saved()
    {
        var error = Record.Exception(() => Run("/notes-readonly-store/n1/edit", "save",
            new() { ["id"] = JsonSerializer.SerializeToElement("n1"), ["text"] = JsonSerializer.SerializeToElement("Bye") }));

        Assert.NotNull(error);
        var shown = ErrorBoundary.Describe(error!, false).Message;
        Assert.Equal("Not implemented", shown.Title);
        Assert.Contains("override Save", shown.Text);
    }

    [Fact]
    public void Deleting_selected_rows_reports_the_error_instead_of_deleted()
    {
        var error = Record.Exception(() => Run("/notes-readonly-store", "delete", new()
        {
            ["crud_selected_items"] = JsonSerializer.SerializeToElement(new[] { new { id = "n1" } }),
        }));

        Assert.NotNull(error);
        var shown = ErrorBoundary.Describe(error!, false).Message;
        Assert.Contains("override Delete", shown.Text);
    }
}
