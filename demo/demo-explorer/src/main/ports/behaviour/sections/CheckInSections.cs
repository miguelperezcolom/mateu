// The C# twin (Mateu.NET): [Section] with PropertyList / Frameless (the port has no Columns/Sticky).
using Mateu.Uidl;

[UI("check-in"), Title("Check-in")]
public class CheckInSections
{
    [Section("Guest")] public string FirstName { get; set; } = "Ada";
    [Section("Guest")] public string LastName { get; set; } = "Lovelace";
    [Section("Guest")] public string Email { get; set; } = "ada@example.com";

    [Section("Document", PropertyList = true)] public string DocumentType { get; set; } = "Passport";
    [Section("Document", PropertyList = true)] public string DocumentNumber { get; set; } = "X1234567";

    [Section("Notes")] public string? Notes { get; set; }
}
