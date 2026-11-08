// The C# twin (Mateu.NET): the merge action gets _merged and _choices next to Parameters.
using Mateu.Dtos;
using Mateu.Uidl;

[UI("merge-artists")]
public class MergeArtists : IComponentTreeSupplier
{
    public IComponent Component() => new RecordMerge
    {
        Title = "Artist records A-104 and A-871 look like the same person",
        Records = [new MergeRecord("A-104", "Record A-104", "Created 2014 · 37 works"), new MergeRecord("A-871", "Record A-871", "Created last week · 1 work")],
        Fields =
        [
            MergeField.Of("name", "Name", "Vincent van Gogh", "Vincent Van Gogh"),
            MergeField.Of("birthplace", "Birthplace", "Zundert", "Zundert, Netherlands") with { Chosen = "A-871" },
            MergeField.Of("movement", "Movement", "Post-Impressionism", null),
            MergeField.Of("wiki", "Wikidata id", null, "Q5582") with { Editable = true },
        ],
        MergeActionId = "merge",
        MergeLabel = "Merge into A-104",
        Parameters = new Dictionary<string, object?> { ["survivor"] = "A-104", ["duplicate"] = "A-871" },
    };

    [Action]
    public Message Merge(RunActionRqDto rq) => new($"Merged: {rq.Parameters["_merged"]}");
}
