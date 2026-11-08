// The C# twin (Mateu.NET): [Tab("…", Open = true)] (the port has no tab shortcut).
using Mateu.Uidl;

[UI("guest-profile"), Title("Guest profile")]
public class GuestProfileTabs
{
    [Tab("Identity")] public string Name { get; set; } = "Ada Lovelace";
    [Tab("Identity")] public string Nationality { get; set; } = "British";
    [Tab("Contact", Open = true)] public string Email { get; set; } = "ada@example.com";
    [Tab("Contact", Open = true)] public string Phone { get; set; } = "+44 20 0000 0000";
    [Tab("Preferences")] public string Pillow { get; set; } = "Feather";
}
