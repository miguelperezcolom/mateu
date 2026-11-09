// The C# twin (Mateu.NET): [Compact] on the class.
using Mateu.Uidl;

[UI("compact-guest"), Title("Guest — compact"), Compact]
public class CompactGuestForm
{
    public string Name { get; set; } = "Ada Lovelace";
    public string Email { get; set; } = "ada@example.com";
    public DateOnly Arrival { get; set; } = new(2026, 12, 20);
    public string Room { get; set; } = "214";
}
