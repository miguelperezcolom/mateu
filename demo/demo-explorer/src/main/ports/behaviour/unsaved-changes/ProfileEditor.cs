// The C# twin (Mateu.NET): [ConfirmOnNavigationIfDirty]; an action settles the guard by
// returning the MarkClean / MarkDirty flow steps.
using Mateu.Uidl;

[UI("profile"), Title("Profile"), ConfirmOnNavigationIfDirty]
public class ProfileEditor
{
    public string? Name { get; set; } = "Ada Lovelace";
    public string? Email { get; set; } = "ada@example.com";

    [Button] public FlowStep Save() => new MarkClean();

    [Button] public FlowStep MarkDirty() => new MarkDirty();
}
